import express from 'express';
import crypto from 'crypto';
import db from '../config/database.js';
import { validateBody } from '../middleware/validation.js';
import { checkIdempotency } from '../middleware/idempotency.js';
import { normalizePhone, validatePhone } from '../utils/phone.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

function generateUuid(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

/**
 * POST /api/checkout/session
 * Validates, recalculates, and creates a checkout session and draft order.
 * Protected by idempotency.
 */
router.post('/session', checkIdempotency, validateBody('checkout'), (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryNotes,
      deliveryRegion,
      paymentMethod,
      items
    } = req.body;

    // 1. Double check and normalize phone number
    if (!validatePhone(customerPhone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'One or more fields are invalid.',
          details: [{ field: 'customerPhone', issue: 'Invalid Tanzanian phone number format.' }]
        }
      });
    }
    const normalizedPhone = normalizePhone(customerPhone);

    // 2. Lookup region details in DB
    const region = db.prepare('SELECT name, shipping_fee, estimated_days FROM shipping_regions WHERE id = ?').get(deliveryRegion);
    if (!region) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'UNPROCESSABLE_ENTITY',
          message: 'One or more fields are invalid.',
          details: [{ field: 'deliveryRegion', issue: 'Specified shipping region is unsupported.' }]
        }
      });
    }

    // 3. Recalculate totals and validate stock quantities
    let subtotal = 0;
    const validatedItems = [];
    const queryProduct = db.prepare('SELECT name, price, stock_quantity, stock_status, is_published FROM products WHERE id = ?');

    for (const item of items) {
      const product = queryProduct.get(item.productId);

      if (!product || !product.is_published) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'One or more products in your cart are no longer available.',
            details: [{ field: 'productId', issue: `Product '${item.productId}' is missing or unpublished.` }]
          }
        });
      }

      if (product.stock_status === 'out_of_stock' || product.stock_quantity <= 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Product '${product.name}' is out of stock.`
          }
        });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Low stock for '${product.name}': only ${product.stock_quantity} available, but ${item.quantity} requested.`
          }
        });
      }

      subtotal += item.quantity * product.price;
      validatedItems.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price
      });
    }

    const shippingFee = region.shipping_fee;
    const total = subtotal + shippingFee;

    const checkoutSessionId = generateUuid('sess');
    const orderDraftReference = generateUuid('ord_2026');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins expiry

    // Run order and session instantiation inside database transaction
    const createTransaction = db.transaction(() => {
      // Create Checkout Session
      db.prepare(`
        INSERT INTO checkout_sessions (id, order_draft_reference, customer_name, customer_phone, customer_email, delivery_notes, delivery_region_id, payment_method, subtotal, shipping_fee, total, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        checkoutSessionId,
        orderDraftReference,
        customerName,
        normalizedPhone,
        customerEmail,
        deliveryNotes,
        deliveryRegion,
        paymentMethod,
        subtotal,
        shippingFee,
        total,
        expiresAt
      );

      // Create Order in Draft state
      db.prepare(`
        INSERT INTO orders (id, checkout_session_id, customer_name, customer_phone, customer_email, delivery_region_id, delivery_notes, shipping_fee, total, payment_method, order_status, payment_status, fulfilment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', 'Draft', 'Pending')
      `).run(
        orderDraftReference,
        checkoutSessionId,
        customerName,
        normalizedPhone,
        customerEmail,
        deliveryRegion,
        deliveryNotes,
        shippingFee,
        total,
        paymentMethod
      );

      // Create Order Items
      const insertOrderItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, name, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const item of validatedItems) {
        insertOrderItem.run(
          orderDraftReference,
          item.productId,
          item.name,
          item.quantity,
          item.unitPrice
        );
      }
    });

    createTransaction();

    logAuditEvent(
      'CHECKOUT_SESSION_CREATED',
      null,
      checkoutSessionId,
      { orderId: orderDraftReference, total, phone: normalizedPhone },
      req
    );

    res.status(201).json({
      success: true,
      data: {
        checkoutSessionId,
        orderDraftReference,
        validatedTotals: {
          subtotal,
          shippingFee,
          estimatedTotal: total
        },
        allowedNextActions: [
          {
            action: 'INITIATE_PAYMENT',
            method: 'POST',
            href: '/api/payments/initiate'
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
