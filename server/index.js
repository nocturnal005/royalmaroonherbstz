import express from 'express';
import dotenv from 'dotenv';
import { configureHelmet, configureCors, generalLimiter, checkoutLimiter, paymentLimiter } from './middleware/security.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { logAuditEvent } from './audit/logger.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Helmet and CORS security middleware
app.use(configureHelmet());
app.use(configureCors());

// Parse HTTP-only cookies
app.use(cookieParser());

// Parse JSON request bodies
app.use(express.json());

// Apply rate limiting
app.use('/api', generalLimiter);
app.use('/api/checkout', checkoutLimiter);
app.use('/api/payments', paymentLimiter);

// Register API routes
app.use('/api', apiRouter);

// Handle 404 for unmatched endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Mount global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Nature's Alchemy Backend API Gateway running on port ${PORT}`);
  logAuditEvent('SERVER_STARTED', null, null, { port: PORT });
});

export default app;
