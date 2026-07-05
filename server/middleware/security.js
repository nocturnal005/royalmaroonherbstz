import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure Helmet security headers.
 */
export function configureHelmet() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"],
        connectSrc: ["'self'"]
      }
    }
  });
}

/**
 * Configure strict CORS validation based on environment configuration.
 * Wildcard origins (*) are strictly disallowed.
 */
export function configureCors() {
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const whitelist = allowedOrigin.split(',').map(o => o.trim());

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or local testing)
      if (!origin) return callback(null, true);
      
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy (unauthorized origin)'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    credentials: true,
    optionsSuccessStatus: 200
  };

  return cors(corsOptions);
}

/**
 * Create a rate limiter middleware for sensitive API routes.
 */
export function createRateLimiter(windowMs, max, message) {
  const isMock = process.env.SELCOM_MODE === 'mock' || process.env.NODE_ENV === 'test';
  return rateLimit({
    windowMs: windowMs || 60000, // default 1 minute
    max: isMock ? 10000 : (max || 100), // limit each IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: message || 'Too many requests from this IP, please try again later.'
      }
    }
  });
}

// Pre-defined rate limiters
export const generalLimiter = createRateLimiter(60000, 100, 'Too many requests. Please slow down.');
export const checkoutLimiter = createRateLimiter(60000, 10, 'Too many checkout attempts. Please try again after 1 minute.');
export const paymentLimiter = createRateLimiter(60000, 5, 'Too many payment requests. Please try again after 1 minute.');
export const loginLimiter = createRateLimiter(60000, 5, 'Too many login attempts. Please try again after 1 minute.');
