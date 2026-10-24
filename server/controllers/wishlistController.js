const { query } = require('../config/db');

/**
 * Get user's saved wishlist items
 */
async function getWishlist(req, res) {
  try {
    const userId = req.user.user_id;

    const items = await query(
      `SELECT 
        w.wishlist_id,
        w.product_id,
        w.created_at,
        p.product_name,
        p.price,
        p.original_price,
        p.image_url,
        p.stock_quantity,
        c.category_name
       FROM wishlists w
       JOIN products p ON w.product_id = p.product_id
       JOIN categories c ON p.category_id = c.category_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      items
    });
  } catch (err) {
    console.error('getWishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wishlist.' });
  }
}

/**
 * Add product to wishlist
 */
async function addToWishlist(req, res) {
  try {
    const userId = req.user.user_id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // Verify product exists
    const products = await query('SELECT product_id, product_name FROM products WHERE product_id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if already in wishlist
    const existing = await query('SELECT wishlist_id FROM wishlists WHERE user_id = ? AND product_id = ?', [
      userId,
      product_id
    ]);

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Product is already in your wishlist.'
      });
    }

    await query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, product_id]);

    return res.status(201).json({
      success: true,
      message: `Added "${products[0].product_name}" to your wishlist.`
    });
  } catch (err) {
    console.error('addToWishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save to wishlist.' });
  }
}

/**
 * Remove product from wishlist
 */
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.user_id;
    const productId = parseInt(req.params.id, 10);

    await query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.'
    });
  } catch (err) {
    console.error('removeFromWishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
