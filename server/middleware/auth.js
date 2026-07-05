import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { logAuditEvent } from '../audit/logger.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required.');
}

/**
 * requireAuth middleware verifies JWT cookie, checks db for active user, and attaches req.user
 */
export function requireAuth(req, res, next) {
  const token = req.cookies ? req.cookies.token : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is missing. Please log in.'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB and check active status
    const user = db.prepare('SELECT id, username, role, is_active FROM admin_users WHERE id = ?').get(decoded.id);

    if (!user || !user.is_active) {
      logAuditEvent('UNAUTHORIZED_ACCESS_ATTEMPT', null, decoded.id, { reason: 'User not found or inactive' }, req);
      res.clearCookie('token');
      res.clearCookie('csrf_token');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account is inactive or does not exist.'
        }
      });
    }

    // Attach user payload
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    logAuditEvent('UNAUTHORIZED_ACCESS_ATTEMPT', null, null, { reason: 'Invalid or expired token', error: error.message }, req);
    res.clearCookie('token');
    res.clearCookie('csrf_token');
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session. Please log in again.'
      }
    });
  }
}

/**
 * requireRole middleware restricts access based on administrative roles
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logAuditEvent('UNAUTHORIZED_ACCESS_ATTEMPT', req.user ? req.user.id : null, null, { 
        reason: 'Insufficient permissions', 
        required: allowedRoles, 
        actual: req.user ? req.user.role : null 
      }, req);
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.'
        }
      });
    }
    next();
  };
}

/**
 * csrfProtection middleware enforces Double-Submit Cookie CSRF validation on state-changing routes
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF checks for safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies ? req.cookies.csrf_token : null;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    logAuditEvent('CSRF_VALIDATION_FAILURE', req.user ? req.user.id : null, null, {
      hasCookie: !!csrfCookie,
      hasHeader: !!csrfHeader,
      match: csrfCookie === csrfHeader
    }, req);

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'CSRF token verification failed.'
      }
    });
  }

  next();
}
