const { query } = require('../config/db');

/**
 * Get current user's shopping cart
 */
async function getCart(req, res) {
  try {
    const userId = req.user.user_id;

    const cartItems = await query(
      `SELECT 
        ci.cart_item_id,
        ci.user_id,
        ci.product_id,
        ci.variant_id,
        ci.quantity,
        ci.created_at,
        p.product_name,
        p.price,
        p.original_price,
        p.image_url,
        p.stock_quantity as product_stock,
        pv.size,
        pv.color,
        pv.SKU,
        pv.stock_quantity as variant_stock,
        c.category_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    // Calculate subtotal & delivery charges
    let subtotal = 0;
    const items = cartItems.map(item => {
      const price = parseFloat(item.price);
      const availableStock = item.variant_id ? item.variant_stock : item.product_stock;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      return {
        ...item,
        price,
        availableStock,
        isOutOfStock: availableStock <= 0,
        subtotal: itemSubtotal
      };
    });

    // Free delivery on orders over ₹999; otherwise standard delivery charge ₹79
    const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 79;
    const total = subtotal + deliveryCharge;

    return res.status(200).json({
      success: true,
      items,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      summary: {
        subtotal,
        deliveryCharge,
        discount: 0,
        total,
        freeDeliveryThreshold: 999
      }
    });
  } catch (err) {
    console.error('getCart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shopping cart.' });
  }
}

/**
 * Add a product or variant to cart
 */
async function addToCart(req, res) {
  try {
    const userId = req.user.user_id;
    const { product_id, variant_id, quantity = 1 } = req.body;

    const requestedQty = Math.max(1, parseInt(quantity, 10));

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // 1. Verify product exists and is published
    const products = await query('SELECT product_id, product_name, price, stock_quantity, is_published FROM products WHERE product_id = ?', [product_id]);
    if (products.length === 0 || !products[0].is_published) {
      return res.status(404).json({ success: false, message: 'Product is unavailable.' });
    }

    const product = products[0];

    // 2. Verify variant if product has variants
    let availableStock = product.stock_quantity;
    let validVariantId = null;

    if (variant_id) {
      const variants = await query(
        'SELECT variant_id, size, stock_quantity FROM product_variants WHERE variant_id = ? AND product_id = ?',
        [variant_id, product_id]
      );
      if (variants.length === 0) {
        return res.status(400).json({ success: false, message: 'Selected product variant was not found.' });
      }
      validVariantId = variants[0].variant_id;
      availableStock = variants[0].stock_quantity;
    } else {
      // Check if product requires variant selection
      const productVariants = await query('SELECT variant_id FROM product_variants WHERE product_id = ? LIMIT 1', [product_id]);
      if (productVariants.length > 0) {
        // Auto-assign first available variant or prompt user
        validVariantId = productVariants[0].variant_id;
      }
    }

    if (availableStock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
    }

    // 3. Check if already in cart
    const existing = await query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
      [userId, product_id, validVariantId, validVariantId]
    );

    if (existing.length > 0) {
      const currentQty = existing[0].quantity;
      const newQty = currentQty + requestedQty;

      if (newQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum available stock is ${availableStock} units.`
        });
      }

      await query(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cart_item_id = ?',
        [newQty, existing[0].cart_item_id]
      );
    } else {
      if (requestedQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${availableStock} units).`
        });
      }

      await query(
        'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
        [userId, product_id, validVariantId, requestedQty]
      );
    }

    return res.status(200).json({
      success: true,
      message: `Added "${product.product_name}" to your cart.`
    });
  } catch (err) {
    console.error('addToCart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
}

/**
 * Update quantity of a cart item
 */
async function updateCartQuantity(req, res) {
  try {
    const userId = req.user.user_id;
    const cartItemId = parseInt(req.params.id, 10);
    const { quantity } = req.body;

    const requestedQty = parseInt(quantity, 10);

    const items = await query(
      `SELECT ci.*, p.stock_quantity as product_stock, pv.stock_quantity as variant_stock 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
       WHERE ci.cart_item_id = ? AND ci.user_id = ?`,
      [cartItemId, userId]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const item = items[0];

    // Remove if requested quantity is zero or negative
    if (requestedQty <= 0) {
      await query('DELETE FROM cart_items WHERE cart_item_id = ?', [cartItemId]);
      return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }

    const availableStock = item.variant_id ? item.variant_stock : item.product_stock;

    if (requestedQty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} units available in stock.`
      });
    }

    await query('UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cart_item_id = ?', [
      requestedQty,
      cartItemId
    ]);

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully.'
    });
  } catch (err) {
    console.error('updateCartQuantity error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
}

/**
 * Remove an item from the cart
 */
async function removeFromCart(req, res) {
  try {
    const userId = req.user.user_id;
    const cartItemId = parseInt(req.params.id, 10);

    await query('DELETE FROM cart_items WHERE cart_item_id = ? AND user_id = ?', [cartItemId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (err) {
    console.error('removeFromCart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
}

/**
 * Clear all items in the cart
 */
async function clearCart(req, res) {
  try {
    const userId = req.user.user_id;
    await query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared.'
    });
  } catch (err) {
    console.error('clearCart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
