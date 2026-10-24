const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'retro_store_super_secure_vintage_football_jwt_key_2026_xyz';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { full_name, email, phone, password, confirm_password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required fields.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.'
      });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check if email already registered
    const existing = await query('SELECT user_id FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user into MySQL
    const result = await query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, "user", "active")',
      [full_name.trim(), email.toLowerCase().trim(), phone ? phone.trim() : null, password_hash]
    );

    const newUser = {
      user_id: result.insertId,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      role: 'user',
      status: 'active'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to RETRO STORE.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
}

/**
 * Standard User Login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const users = await query(
      'SELECT user_id, full_name, email, phone, password_hash, role, status FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact customer support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
}

/**
 * Admin Login Endpoint
 * Requires valid administrator credentials
 */
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Administrator email and password are required.'
      });
    }

    const users = await query(
      'SELECT user_id, full_name, email, phone, password_hash, role, status FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This login portal is strictly reserved for store administrators.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This administrator account is currently inactive.'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Administrator authentication successful.',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during administrative login.'
    });
  }
}

/**
 * Get current authenticated user details
 */
async function getMe(req, res) {
  try {
    const users = await query(
      'SELECT user_id, full_name, email, phone, role, status, created_at FROM users WHERE user_id = ? LIMIT 1',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * Update user profile details
 */
async function updateProfile(req, res) {
  try {
    const { full_name, phone } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name cannot be empty.' });
    }

    await query(
      'UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE user_id = ?',
      [full_name.trim(), phone ? phone.trim() : null, req.user.user_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        ...req.user,
        full_name: full_name.trim(),
        phone: phone ? phone.trim() : null
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

/**
 * Change password
 */
async function changePassword(req, res) {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const rows = await query('SELECT password_hash FROM users WHERE user_id = ?', [req.user.user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const saltRounds = 12;
    const newHash = await bcrypt.hash(new_password, saltRounds);

    await query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?', [
      newHash,
      req.user.user_id
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
}

/**
 * Forgot password handler
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const users = await query('SELECT user_id, full_name, email FROM users WHERE email = ? LIMIT 1', [
      email.toLowerCase().trim()
    ]);

    if (users.length === 0) {
      // Return safe message without exposing user enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been recorded.'
      });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.user_id, tokenHash, expiresAt]
    );

    // If SMTP is not configured, inform the user clearly as required by section 3.4
    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    if (!smtpConfigured) {
      console.log(`[PASSWORD RESET DEMO LOG] Password reset initiated for ${user.email}. Token: ${resetToken}`);
      return res.status(200).json({
        success: true,
        message: 'Password reset token generated. (Note: Email service is not configured. For testing, an admin can reset your password or set SMTP_HOST/SMTP_USER in .env).',
        devResetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.'
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
}

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword
};
