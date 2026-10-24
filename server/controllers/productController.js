const { query } = require('../config/db');

/**
 * Get all published products with filtering, searching, sorting, and pagination
 */
async function getProducts(req, res) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      inStock,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = ['p.is_published = 1'];
    const params = [];

    // Search query
    if (search && search.trim()) {
      conditions.push('(p.product_name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Category filter (accepts category_id or category_name)
    if (category) {
      if (!isNaN(category)) {
        conditions.push('p.category_id = ?');
        params.push(parseInt(category, 10));
      } else {
        conditions.push('c.category_name = ?');
        params.push(category.trim());
      }
    }

    // Price range
    if (minPrice && !isNaN(minPrice)) {
      conditions.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      conditions.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    // Featured filter
    if (featured === '1' || featured === 'true') {
      conditions.push('p.is_featured = 1');
    }

    // In-stock filter
    if (inStock === '1' || inStock === 'true') {
      conditions.push('p.stock_quantity > 0');
    }

    // Sorting
    let orderBy = 'p.created_at DESC';
    switch (sort) {
      case 'price-asc':
        orderBy = 'p.price ASC';
        break;
      case 'price-desc':
        orderBy = 'p.price DESC';
        break;
      case 'name-asc':
        orderBy = 'p.product_name ASC';
        break;
      case 'name-desc':
        orderBy = 'p.product_name DESC';
        break;
      case 'featured':
        orderBy = 'p.is_featured DESC, p.created_at DESC';
        break;
      case 'newest':
      default:
        orderBy = 'p.created_at DESC';
        break;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching items
    const countSql = `
      SELECT COUNT(*) as total 
      FROM products p 
      JOIN categories c ON p.category_id = c.category_id 
      ${whereClause}
    `;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // Fetch paginated products
    const dataSql = `
      SELECT 
        p.product_id,
        p.category_id,
        c.category_name,
        p.product_name,
        p.description,
        p.price,
        p.original_price,
        p.image_url,
        p.stock_quantity,
        p.is_featured,
        p.is_published,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${parsedLimit} OFFSET ${offset}
    `;
    const products = await query(dataSql, params);

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
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
}

/**
 * Get single product by ID with variants, gallery images, and reviews
 */
async function getProductById(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    // 1. Fetch product
    const products = await query(
      `SELECT 
        p.*,
        c.category_name,
        c.description as category_description
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = ? AND p.is_published = 1
      LIMIT 1`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found or currently unavailable.' });
    }

    const product = products[0];

    // 2. Fetch variants
    const variants = await query(
      `SELECT variant_id, size, color, SKU, stock_quantity 
       FROM product_variants 
       WHERE product_id = ? 
       ORDER BY variant_id ASC`,
      [productId]
    );

    // 3. Fetch additional gallery images
    const images = await query(
      `SELECT image_id, image_url, alt_text, is_primary, display_order 
       FROM product_images 
       WHERE product_id = ? 
       ORDER BY display_order ASC, image_id ASC`,
      [productId]
    );

    // If images table doesn't have records, include the main product.image_url
    const galleryImages = images.length > 0 
      ? images 
      : [{ image_id: 0, image_url: product.image_url, alt_text: product.product_name, is_primary: 1 }];

    // 4. Fetch reviews
    const reviews = await query(
      `SELECT r.review_id, r.rating, r.review_text, r.created_at, u.full_name as author_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    // 5. Fetch related products from same category
    const related = await query(
      `SELECT p.product_id, p.product_name, p.price, p.original_price, p.image_url, c.category_name
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.category_id = ? AND p.product_id != ? AND p.is_published = 1
       ORDER BY p.is_featured DESC, p.created_at DESC
       LIMIT 4`,
      [product.category_id, productId]
    );

    return res.status(200).json({
      success: true,
      product: {
        ...product,
        variants,
        images: galleryImages,
        reviews,
        related
      }
    });
  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
}

/**
 * Get all categories with product counts
 */
async function getCategories(req, res) {
  try {
    const categories = await query(
      `SELECT 
        c.category_id,
        c.category_name,
        c.description,
        c.image_url,
        COUNT(p.product_id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.category_id = p.category_id AND p.is_published = 1
       GROUP BY c.category_id
       ORDER BY c.category_id ASC`
    );

    return res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
}

/**
 * Get featured products for homepage
 */
async function getFeaturedProducts(req, res) {
  try {
    const limit = parseInt(req.query.limit || '8', 10);
    const products = await query(
      `SELECT p.*, c.category_name
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.is_featured = 1 AND p.is_published = 1
       ORDER BY p.created_at DESC
       LIMIT ${limit}`
    );

    return res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error('getFeaturedProducts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve featured products.' });
  }
}

/**
 * Get affordable budget picks (Under ₹500)
 */
async function getBudgetProducts(req, res) {
  try {
    const limit = parseInt(req.query.limit || '8', 10);
    const products = await query(
      `SELECT p.*, c.category_name
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.price <= 500 AND p.is_published = 1
       ORDER BY p.price ASC
       LIMIT ${limit}`
    );

    return res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error('getBudgetProducts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve budget products.' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  getFeaturedProducts,
  getBudgetProducts
};
