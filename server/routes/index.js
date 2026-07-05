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

const router = express.Router();

router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/shipping', shippingRouter);
router.use('/checkout', checkoutRouter);
router.use('/payments', paymentsRouter);
router.use('/orders', ordersRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/webhooks', webhooksRouter);

export default router;
