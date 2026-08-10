import express from 'express';
import productsRouter from './products.js';
import cartRouter from './cart.js';
import shippingRouter from './shipping.js';
import checkoutRouter from './checkout.js';
import ordersRouter from './orders.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';

const router = express.Router();

router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/shipping', shippingRouter);
router.use('/checkout', checkoutRouter);
router.use('/orders', ordersRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);

// Payment and webhook routes are intentionally absent. The previous Selcom and
// Stakaba integrations have been removed; the AzamPay integration will register
// `/payments` (initiate + status) and its callback receiver here.

export default router;
