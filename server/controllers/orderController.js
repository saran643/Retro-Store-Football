const { query, withTransaction } = require('../config/db');

/**
 * Generate unique order number format: RETRO-YYYYMMDD-XXXX
 */
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RETRO-${dateStr}-${randomSuffix}`;
}

/**
 * Place a new order with atomic database transaction
 */
async function createOrder(req, res) {
  try {
    const userId = req.user.user_id;
    const {
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pin_code,
      payment_method = 'COD'
    } = req.body;

    // Validate delivery details
    if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_pin_code) {
      return res.status(400).json({
        success: false,
        message: 'All shipping details (Name, Phone, Address, City, State, PIN code) are required.'
      });
    }

    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(shipping_pin_code.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }

    // Execute within MySQL Transaction for atomic consistency and concurrency control
    const orderResult = await withTransaction(async (conn) => {
      // 1. Fetch user's cart items
      const [cartItems] = await conn.execute(
        `SELECT ci.*, p.product_name, p.price, p.stock_quantity as product_stock, p.is_published,
                pv.size, pv.color, pv.stock_quantity as variant_stock
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.product_id
         LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
         WHERE ci.user_id = ?`,
        [userId]
      );

      if (cartItems.length === 0) {
        throw new Error('Your cart is empty. Please add products before checking out.');
      }

      let subtotal = 0;
      const verifiedItems = [];

      // 2. Validate availability and price snapshots with row locking
      for (const item of cartItems) {
        if (!item.is_published) {
          throw new Error(`Product "${item.product_name}" is no longer available.`);
        }

        let availableStock = item.product_stock;
        let variantSnapshot = null;

        if (item.variant_id) {
          // Lock variant row for update to prevent overselling
          const [variantRows] = await conn.execute(
            'SELECT variant_id, size, color, stock_quantity FROM product_variants WHERE variant_id = ? FOR UPDATE',
            [item.variant_id]
          );

          if (variantRows.length === 0) {
            throw new Error(`Variant for "${item.product_name}" no longer exists.`);
          }

          availableStock = variantRows[0].stock_quantity;
          variantSnapshot = `Size: ${variantRows[0].size}${variantRows[0].color ? `, Color: ${variantRows[0].color}` : ''}`;
        } else {
          // Lock product row for update
          const [prodRows] = await conn.execute(
            'SELECT product_id, stock_quantity FROM products WHERE product_id = ? FOR UPDATE',
            [item.product_id]
          );
          availableStock = prodRows[0].stock_quantity;
        }

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.product_name}". Available: ${availableStock}, Requested: ${item.quantity}.`);
        }

        const unitPrice = parseFloat(item.price);
        const itemSubtotal = unitPrice * item.quantity;
        subtotal += itemSubtotal;

        verifiedItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name_snapshot: item.product_name,
          variant_snapshot: variantSnapshot,
          unit_price: unitPrice,
          quantity: item.quantity,
          subtotal: itemSubtotal
        });
      }

      // 3. Calculate delivery charge & final amount
      const deliveryCharge = subtotal >= 999 ? 0.00 : 79.00;
      const discountAmount = 0.00;
      const totalAmount = subtotal + deliveryCharge - discountAmount;
      const orderNumber = generateOrderNumber();

      // 4. Create Order record
      const [orderInsert] = await conn.execute(
        `INSERT INTO orders 
          (order_number, user_id, subtotal, delivery_charge, discount_amount, total_amount, payment_method, payment_status, order_status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pin_code) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'Confirmed', ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          subtotal,
          deliveryCharge,
          discountAmount,
          totalAmount,
          payment_method,
          shipping_name.trim(),
          shipping_phone.trim(),
          shipping_address.trim(),
          shipping_city.trim(),
          shipping_state.trim(),
          shipping_pin_code.trim()
        ]
      );

      const orderId = orderInsert.insertId;

      // 5. Insert order items & reduce stock
      for (const item of verifiedItems) {
        await conn.execute(
          `INSERT INTO order_items 
            (order_id, product_id, variant_id, product_name_snapshot, variant_snapshot, unit_price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.variant_id,
            item.product_name_snapshot,
            item.variant_snapshot,
            item.unit_price,
            item.quantity,
            item.subtotal
          ]
        );

        // Deduct variant stock if variant exists
        if (item.variant_id) {
          await conn.execute(
            'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id = ?',
            [item.quantity, item.variant_id]
          );
        }

        // Deduct base product stock
        await conn.execute(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      // 6. Clear user's cart
      await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      return {
        orderId,
        orderNumber,
        totalAmount,
        subtotal,
        deliveryCharge,
        itemsCount: verifiedItems.length
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Cash on Delivery confirmed.',
      order: orderResult
    });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to place order.'
    });
  }
}

/**
 * Get order history for the authenticated user
 */
async function getMyOrders(req, res) {
  try {
    const userId = req.user.user_id;

    const orders = await query(
      `SELECT 
        o.order_id,
        o.order_number,
        o.subtotal,
        o.delivery_charge,
        o.discount_amount,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.shipping_name,
        o.shipping_city,
        o.created_at,
        COUNT(oi.order_item_id) as total_items
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.order_id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order history.' });
  }
}

/**
 * Get detailed view of a specific order
 */
async function getOrderById(req, res) {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;
    const identifier = req.params.id;

    // Support lookup by numeric ID or order_number (e.g. RETRO-20261024-1234)
    let condition = 'o.order_id = ?';
    let param = identifier;
    if (isNaN(identifier)) {
      condition = 'o.order_number = ?';
      param = identifier;
    }

    const orders = await query(
      `SELECT o.*, u.full_name as customer_name, u.email as customer_email 
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE ${condition}
       LIMIT 1`,
      [param]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Ensure authorization: customer can only access their own order, admin can view any
    if (order.user_id !== userId && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You cannot view this order.' });
    }

    // Fetch order items with snapshot info
    const items = await query(
      `SELECT 
        oi.*,
        p.image_url,
        p.category_id,
        c.category_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.product_id
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE oi.order_id = ?`,
      [order.order_id]
    );

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
