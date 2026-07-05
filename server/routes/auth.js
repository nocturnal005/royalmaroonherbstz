import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { validateBody } from '../middleware/validation.js';
import { requireAuth, csrfProtection } from '../middleware/auth.js';
import { logAuditEvent } from '../audit/logger.js';
import { loginLimiter } from '../middleware/security.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required.');
}

/**
 * POST /api/auth/login
 * Performs administrator authentication, updates last login, and sets secure JWT & CSRF cookies.
 */
router.post('/login', loginLimiter, validateBody('admin'), (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Fetch admin user
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

    if (!user || !user.is_active) {
      logAuditEvent('ADMIN_LOGIN_FAILED', null, null, { username, reason: 'User not found or inactive' }, req);
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid username or password.'
        }
      });
    }

    // Verify hashed password
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      logAuditEvent('ADMIN_LOGIN_FAILED', null, user.id, { username, reason: 'Incorrect password' }, req);
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid username or password.'
        }
      });
    }

    // Update last login timestamp
    db.prepare('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Generate JWT and CSRF tokens
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    const csrfToken = crypto.randomBytes(24).toString('hex');

    // Set secure HTTP-only cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200000 // 2 hours
    });

    res.cookie('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200000 // 2 hours
    });

    logAuditEvent('ADMIN_LOGIN_SUCCESS', user.id, user.id, { username, role: user.role }, req);

    res.json({
      success: true,
      data: {
        username: user.username,
        role: user.role,
        csrfToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Clears JWT and CSRF cookies, ending the admin session.
 * Requires auth and CSRF protection.
 */
router.post('/logout', requireAuth, csrfProtection, (req, res) => {
  logAuditEvent('ADMIN_LOGOUT', req.user.id, req.user.id, { username: req.user.username }, req);
  
  res.clearCookie('token');
  res.clearCookie('csrf_token');

  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
