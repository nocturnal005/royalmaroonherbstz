import express from 'express';
import productsRouter from './products.js';
import cartRouter from './cart.js';
import shippingRouter from './shipping.js';
import checkoutRouter from './checkout.js';
import paymentsRouter from './payments.js';
import ordersRouter from './orders.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';
import webhooksRouter from './webhooks.js';
import stakabaPaymentsRouter from './stakabaPayments.js';
import stakabaWebhookRouter from './stakabaWebhook.js';

const router = express.Router();

router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/shipping', shippingRouter);
router.use('/checkout', checkoutRouter);
// Stakaba payment routes are registered before the legacy Selcom `/payments`
// router so `/payments/stakaba/*` is matched by the Stakaba router.
router.use('/payments/stakaba', stakabaPaymentsRouter);
router.use('/payments', paymentsRouter);
router.use('/orders', ordersRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/webhooks/stakaba', stakabaWebhookRouter);
router.use('/webhooks', webhooksRouter);

export default router;
