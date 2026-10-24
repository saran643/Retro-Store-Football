const { query, withTransaction } = require('../config/db');

/**
 * 15.1 Admin Dashboard Overview Statistics
 */
async function getDashboardStats(req, res) {
  try {
    // 1. Total products
    const [totalProductsRes] = await query('SELECT COUNT(*) as count FROM products');
    const totalProducts = totalProductsRes.count;

    // 2. Total registered users
    const [totalUsersRes] = await query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const totalUsers = totalUsersRes.count;

    // 3. Total orders
    const [totalOrdersRes] = await query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = totalOrdersRes.count;

    // 4. Sales total from eligible orders (excluding Cancelled)
    const [revenueRes] = await query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE order_status != "Cancelled"');
    const totalRevenue = parseFloat(revenueRes.total);

    // 5. Pending & Confirmed orders
    const [pendingOrdersRes] = await query('SELECT COUNT(*) as count FROM orders WHERE order_status IN ("Pending", "Confirmed", "Processing")');
    const pendingOrders = pendingOrdersRes.count;

    // 6. Low stock products (total stock < 10)
    const [lowStockRes] = await query('SELECT COUNT(*) as count FROM products WHERE stock_quantity < 10 AND stock_quantity > 0');
    const lowStockCount = lowStockRes.count;

    // 7. Out of stock products
    const [outOfStockRes] = await query('SELECT COUNT(*) as count FROM products WHERE stock_quantity = 0');
    const outOfStockCount = outOfStockRes.count;

    // 8. Recent orders (latest 6)
    const recentOrders = await query(
      `SELECT o.order_id, o.order_number, o.shipping_name, o.total_amount, o.order_status, o.created_at, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       ORDER BY o.created_at DESC
       LIMIT 6`
    );

    // 9. Best selling products / top viewed
    const topProducts = await query(
      `SELECT p.product_id, p.product_name, p.price, p.image_url, p.stock_quantity, c.category_name,
              COALESCE(SUM(oi.quantity), 0) as total_sold
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       GROUP BY p.product_id
       ORDER BY total_sold DESC, p.created_at DESC
       LIMIT 5`
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockCount,
        outOfStockCount,
        recentOrders,
        topProducts
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
  }
}

/**
 * 15.2 Product Management - List products for admin
 */
async function getAdminProducts(req, res) {
  try {
    const { search, category, stockStatus, page = 1, limit = 15 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = ['1=1'];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(p.product_name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (category) {
      conditions.push('p.category_id = ?');
      params.push(parseInt(category, 10));
    }

    if (stockStatus === 'low') {
      conditions.push('p.stock_quantity < 10 AND p.stock_quantity > 0');
    } else if (stockStatus === 'out') {
      conditions.push('p.stock_quantity = 0');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [countResult] = await query(`SELECT COUNT(*) as total FROM products p ${whereClause}`, params);
    const total = countResult.total;

    const products = await query(
      `SELECT 
        p.*,
        c.category_name,
        COUNT(pv.variant_id) as variant_count
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN product_variants pv ON p.product_id = pv.product_id
       ${whereClause}
       GROUP BY p.product_id
       ORDER BY p.product_id DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    );

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (err) {
    console.error('getAdminProducts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin products.' });
  }
}

/**
 * Create a new product with optional variants
 */
async function createProduct(req, res) {
  try {
    const {
      category_id,
      product_name,
      description,
      price,
      original_price,
      image_url,
      stock_quantity = 0,
      is_featured = 0,
      is_published = 1,
      variants = []
    } = req.body;

    if (!category_id || !product_name || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category, product name, description, and price are required.'
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Valid positive price in INR is required.' });
    }

    // Default image if none provided
    const finalImage = image_url || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80';

    const result = await withTransaction(async (conn) => {
      // 1. Insert product
      const [insert] = await conn.execute(
        `INSERT INTO products 
          (category_id, product_name, description, price, original_price, image_url, stock_quantity, is_featured, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parseInt(category_id, 10),
          product_name.trim(),
          description.trim(),
          parsedPrice,
          original_price ? parseFloat(original_price) : null,
          finalImage,
          parseInt(stock_quantity, 10) || 0,
          is_featured ? 1 : 0,
          is_published ? 1 : 0
        ]
      );

      const productId = insert.insertId;

      // 2. Insert primary image in product_images
      await conn.execute(
        'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES (?, ?, ?, 1, 1)',
        [productId, finalImage, product_name.trim()]
      );

      // 3. Insert variants if provided
      let totalVariantStock = 0;
      if (Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (v.size && v.size.trim()) {
            const vStock = parseInt(v.stock_quantity || '0', 10);
            totalVariantStock += vStock;
            const sku = v.SKU || `RS-${productId}-${v.size.trim().toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
            await conn.execute(
              'INSERT INTO product_variants (product_id, size, color, SKU, stock_quantity) VALUES (?, ?, ?, ?, ?)',
              [productId, v.size.trim(), v.color || null, sku, vStock]
            );
          }
        }

        // Synchronize product stock with sum of variants if variants were added
        if (totalVariantStock > 0) {
          await conn.execute('UPDATE products SET stock_quantity = ? WHERE product_id = ?', [
            totalVariantStock,
            productId
          ]);
        }
      }

      return productId;
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product_id: result
    });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
}

/**
 * Update an existing product
 */
async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    const {
      category_id,
      product_name,
      description,
      price,
      original_price,
      image_url,
      stock_quantity,
      is_featured,
      is_published
    } = req.body;

    const existing = await query('SELECT product_id FROM products WHERE product_id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updates = [];
    const params = [];

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(parseInt(category_id, 10));
    }
    if (product_name !== undefined) {
      updates.push('product_name = ?');
      params.push(product_name.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }
    if (price !== undefined) {
      const p = parseFloat(price);
      if (isNaN(p) || p < 0) return res.status(400).json({ success: false, message: 'Invalid price.' });
      updates.push('price = ?');
      params.push(p);
    }
    if (original_price !== undefined) {
      updates.push('original_price = ?');
      params.push(original_price ? parseFloat(original_price) : null);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (stock_quantity !== undefined) {
      updates.push('stock_quantity = ?');
      params.push(Math.max(0, parseInt(stock_quantity, 10)));
    }
    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      params.push(is_featured ? 1 : 0);
    }
    if (is_published !== undefined) {
      updates.push('is_published = ?');
      params.push(is_published ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      params.push(productId);
      await query(`UPDATE products SET ${updates.join(', ')} WHERE product_id = ?`, params);
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

/**
 * Delete a product
 */
async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);

    // Check if product is referenced in order_items
    const orderItems = await query('SELECT order_item_id FROM order_items WHERE product_id = ? LIMIT 1', [productId]);
    if (orderItems.length > 0) {
      // Unpublish rather than hard delete to preserve historical order integrity
      await query('UPDATE products SET is_published = 0, stock_quantity = 0, updated_at = NOW() WHERE product_id = ?', [productId]);
      return res.status(200).json({
        success: true,
        message: 'Product is linked to customer orders and was securely unpublished instead of hard deleted.'
      });
    }

    await query('DELETE FROM products WHERE product_id = ?', [productId]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted permanently.'
    });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
}

/**
 * 15.3 Category Management - List all categories
 */
async function getAdminCategories(req, res) {
  try {
    const categories = await query(
      `SELECT c.*, COUNT(p.product_id) as product_count 
       FROM categories c 
       LEFT JOIN products p ON c.category_id = p.category_id 
       GROUP BY c.category_id 
       ORDER BY c.category_id ASC`
    );

    return res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error('getAdminCategories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load categories.' });
  }
}

/**
 * Create Category
 */
async function createCategory(req, res) {
  try {
    const { category_name, description, image_url } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await query('SELECT category_id FROM categories WHERE category_name = ?', [category_name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }

    const result = await query(
      'INSERT INTO categories (category_name, description, image_url) VALUES (?, ?, ?)',
      [category_name.trim(), description ? description.trim() : null, image_url || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category_id: result.insertId
    });
  } catch (err) {
    console.error('createCategory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
}

/**
 * Update Category
 */
async function updateCategory(req, res) {
  try {
    const categoryId = parseInt(req.params.id, 10);
    const { category_name, description, image_url } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name cannot be empty.' });
    }

    await query(
      'UPDATE categories SET category_name = ?, description = ?, image_url = ? WHERE category_id = ?',
      [category_name.trim(), description ? description.trim() : null, image_url || null, categoryId]
    );

    return res.status(200).json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    console.error('updateCategory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
}

/**
 * Delete Category safely
 */
async function deleteCategory(req, res) {
  try {
    const categoryId = parseInt(req.params.id, 10);

    const products = await query('SELECT product_id FROM products WHERE category_id = ? LIMIT 1', [categoryId]);
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category while products are assigned to it. Please reassign or delete products first.'
      });
    }

    await query('DELETE FROM categories WHERE category_id = ?', [categoryId]);
    return res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
}

/**
 * 15.4 Order Management - List all orders with filters
 */
async function getAdminOrders(req, res) {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = ['1=1'];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(o.order_number LIKE ? OR o.shipping_name LIKE ? OR o.shipping_phone LIKE ? OR u.email LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (status && status !== 'all') {
      conditions.push('o.order_status = ?');
      params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [countResult] = await query(
      `SELECT COUNT(*) as total 
       FROM orders o 
       JOIN users u ON o.user_id = u.user_id 
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    const orders = await query(
      `SELECT 
        o.*,
        u.email as customer_email,
        COUNT(oi.order_item_id) as items_count
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       ${whereClause}
       GROUP BY o.order_id
       ORDER BY o.created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    );

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (err) {
    console.error('getAdminOrders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin orders.' });
  }
}

/**
 * Update order status (with stock restoration if cancelled)
 */
async function updateOrderStatus(req, res) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { order_status, payment_status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (order_status && !validStatuses.includes(order_status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const existing = await query('SELECT order_id, order_status, payment_status FROM orders WHERE order_id = ?', [orderId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const current = existing[0];

    // Transaction for status update & inventory handling
    await withTransaction(async (conn) => {
      // If transitioning to Cancelled from an active status, restore stock
      if (order_status === 'Cancelled' && current.order_status !== 'Cancelled') {
        const [items] = await conn.execute(
          'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?',
          [orderId]
        );

        for (const item of items) {
          if (item.variant_id) {
            await conn.execute(
              'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE variant_id = ?',
              [item.quantity, item.variant_id]
            );
          }
          await conn.execute(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      // If transitioning away from Cancelled, re-deduct
      if (current.order_status === 'Cancelled' && order_status && order_status !== 'Cancelled') {
        const [items] = await conn.execute(
          'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?',
          [orderId]
        );

        for (const item of items) {
          if (item.variant_id) {
            await conn.execute(
              'UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE variant_id = ?',
              [item.quantity, item.variant_id]
            );
          }
          await conn.execute(
            'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE product_id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      const updates = [];
      const params = [];

      if (order_status) {
        updates.push('order_status = ?');
        params.push(order_status);
      }

      if (payment_status) {
        updates.push('payment_status = ?');
        params.push(payment_status);
      }

      updates.push('updated_at = NOW()');
      params.push(orderId);

      await conn.execute(`UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`, params);
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${order_status || current.order_status}".`
    });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}

/**
 * 15.5 User Management - List registered users
 */
async function getAdminUsers(req, res) {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = ['1=1'];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (role && (role === 'user' || role === 'admin')) {
      conditions.push('u.role = ?');
      params.push(role);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [countResult] = await query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, params);
    const total = countResult.total;

    const users = await query(
      `SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.created_at,
        COUNT(o.order_id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM users u
       LEFT JOIN orders o ON u.user_id = o.user_id
       ${whereClause}
       GROUP BY u.user_id
       ORDER BY u.created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    );

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (err) {
    console.error('getAdminUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

/**
 * Toggle user status (active / inactive)
 */
async function toggleUserStatus(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or inactive.' });
    }

    const users = await query('SELECT user_id, role, status FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = users[0];

    // Prevent deactivating the last active administrator
    if (targetUser.role === 'admin' && status === 'inactive') {
      const [adminCount] = await query('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND status = "active"');
      if (adminCount.count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the only active administrator account in the system.'
        });
      }
    }

    await query('UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ?', [status, userId]);

    return res.status(200).json({
      success: true,
      message: `User account is now ${status}.`
    });
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

/**
 * 15.6 Inventory Management - List variant inventory
 */
async function getInventory(req, res) {
  try {
    const { search, lowStockOnly } = req.query;

    const conditions = ['1=1'];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(p.product_name LIKE ? OR pv.SKU LIKE ? OR pv.size LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (lowStockOnly === 'true' || lowStockOnly === '1') {
      conditions.push('pv.stock_quantity < 10');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const inventory = await query(
      `SELECT 
        pv.variant_id,
        pv.product_id,
        p.product_name,
        p.image_url,
        p.price,
        c.category_name,
        pv.size,
        pv.color,
        pv.SKU,
        pv.stock_quantity,
        (pv.stock_quantity = 0) as is_out_of_stock,
        (pv.stock_quantity > 0 AND pv.stock_quantity < 10) as is_low_stock
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.product_id
       JOIN categories c ON p.category_id = c.category_id
       ${whereClause}
       ORDER BY pv.stock_quantity ASC, p.product_name ASC`,
      params
    );

    return res.status(200).json({
      success: true,
      inventory
    });
  } catch (err) {
    console.error('getInventory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inventory.' });
  }
}

/**
 * Update stock of a variant
 */
async function updateVariantStock(req, res) {
  try {
    const variantId = parseInt(req.params.id, 10);
    const { stock_quantity } = req.body;

    const newStock = parseInt(stock_quantity, 10);
    if (isNaN(newStock) || newStock < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid non-negative stock quantity.' });
    }

    const variants = await query('SELECT variant_id, product_id FROM product_variants WHERE variant_id = ?', [variantId]);
    if (variants.length === 0) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    const productId = variants[0].product_id;

    await withTransaction(async (conn) => {
      // 1. Update variant
      await conn.execute('UPDATE product_variants SET stock_quantity = ?, updated_at = NOW() WHERE variant_id = ?', [
        newStock,
        variantId
      ]);

      // 2. Synchronize base product stock as the sum of all its variants
      const [sumRes] = await conn.execute(
        'SELECT COALESCE(SUM(stock_quantity), 0) as total FROM product_variants WHERE product_id = ?',
        [productId]
      );

      await conn.execute('UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE product_id = ?', [
        sumRes[0].total,
        productId
      ]);
    });

    return res.status(200).json({
      success: true,
      message: `Stock updated to ${newStock} units.`
    });
  } catch (err) {
    console.error('updateVariantStock error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update stock.' });
  }
}

/**
 * Upload product image
 */
async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/products/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('uploadProductImage error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
}

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  toggleUserStatus,
  getInventory,
  updateVariantStock,
  uploadProductImage
};
