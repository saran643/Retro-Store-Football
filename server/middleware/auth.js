const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'retro_store_super_secure_vintage_football_jwt_key_2026_xyz';

/**
 * Verify JWT token middleware
 */
async function verifyToken(req, res, next) {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Verify user still exists in database and is active
    const users = await query(
      'SELECT user_id, full_name, email, phone, role, status FROM users WHERE user_id = ? LIMIT 1',
      [decoded.userId || decoded.user_id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const user = users[0];
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication credentials.'
    });
  }
}

/**
 * Require Administrator role middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.'
    });
  }

  next();
}

/**
 * Optional authentication middleware for routes accessible to both guests and members
 */
async function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const users = await query(
        'SELECT user_id, full_name, email, phone, role, status FROM users WHERE user_id = ? LIMIT 1',
        [decoded.userId || decoded.user_id]
      );
      if (users.length > 0 && users[0].status === 'active') {
        req.user = users[0];
      }
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth
};
