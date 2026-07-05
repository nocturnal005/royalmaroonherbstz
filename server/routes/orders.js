import express from 'express';
import db from '../config/database.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

/**
 * GET /api/orders/:id
 * Retrieves detail and status representation for an order (Public tracking).
 */
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch order header
    const order = db.prepare(`
      SELECT id, customer_name, customer_phone, customer_email, delivery_region_id, delivery_notes, shipping_fee, total, payment_method, order_status, payment_status, fulfilment_status, created_at, updated_at
      FROM orders
      WHERE id = ?
    `).get(id);

    if (!order) {
      logAuditEvent('ORDER_TRACKING_NOT_FOUND', null, id, { route: req.originalUrl }, req);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested order could not be found.'
        }
      });
    }

    // Fetch order items
    const items = db.prepare(`
      SELECT product_id, name, quantity, unit_price
      FROM order_items
      WHERE order_id = ?
    `).all(id);

    // Format output
    const formattedOrder = {
      orderId: order.id,
      customer: {
        name: order.customer_name,
        phone: order.customer_phone,
        email: order.customer_email
      },
      deliveryRegion: order.delivery_region_id,
      deliveryNotes: order.delivery_notes,
      shippingFee: order.shipping_fee,
      total: order.total,
      paymentMethod: order.payment_method,
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      fulfilmentStatus: order.fulfilment_status,
      items: items.map(item => ({
        productId: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unit_price
      })),
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    res.json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    next(error);
  }
});

export default router;
