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

/**
 * Formats an integer TZS amount for display in a WhatsApp message.
 * Tanzanian Shilling transactions carry no cents, so no decimals are shown.
 */
function formatTZS(amount) {
  return `TZS ${amount.toLocaleString('en-US')}`;
}

/**
 * Builds the message the customer sends to the shop's sales line.
 * Kept compact deliberately: the customer can edit this text before sending,
 * so it is a convenience for staff, never the source of truth. Staff confirm
 * against the order reference in the admin panel.
 */
function buildHandoffMessage(order, items, regionName) {
  const lines = [
    'Hello Royal Maroon Herbs, I would like to confirm this order.',
    '',
    `Order: ${order.id}`,
    `Name: ${order.customer_name}`,
    `Delivery: ${regionName}`,
    `Preferred payment: ${order.payment_method.toUpperCase()}`,
    ''
  ];

  const shown = items.slice(0, 15);
  for (const item of shown) {
    lines.push(`- ${item.name} x${item.quantity}`);
  }
  if (items.length > shown.length) {
    lines.push(`- ...and ${items.length - shown.length} more item(s)`);
  }

  lines.push('');
  lines.push(`Total: ${formatTZS(order.total)} (incl. ${formatTZS(order.shipping_fee)} delivery)`);

  return lines.join('\n');
}

/**
 * POST /api/checkout/:sessionId/whatsapp
 *
 * Hands a draft order off to the shop's WhatsApp sales line, where staff
 * confirm it and collect payment manually. This is the interim route to
 * market while Selcom credentials are outstanding; it is additive and does
 * not touch any Selcom write path, so it can be removed by deleting this
 * handler and the client branch that calls it.
 *
 * Idempotent: tapping through twice returns the same link rather than erroring.
 */
router.post('/:sessionId/whatsapp', (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = db.prepare(`
      SELECT s.id, s.order_draft_reference, s.expires_at, r.name AS region_name
      FROM checkout_sessions s
      JOIN shipping_regions r ON r.id = s.delivery_region_id
      WHERE s.id = ?
    `).get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Checkout session could not be found.' }
      });
    }

    const order = db.prepare(`
      SELECT id, customer_name, customer_phone, payment_method, shipping_fee, total,
             order_status, payment_status
      FROM orders WHERE id = ?
    `).get(session.order_draft_reference);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order could not be found for this session.' }
      });
    }

    // Payment already settled, or the order was cancelled: handing off again
    // would invite staff to collect a second time.
    if (['Paid', 'Refunded', 'Cancelled'].includes(order.payment_status)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'This order is no longer awaiting confirmation.'
        }
      });
    }

    // Expiry only blocks the first handoff. Once an order is already with the
    // sales team the session clock is irrelevant - staff own it from there.
    if (order.order_status === 'Draft' && new Date(session.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: {
          code: 'GONE',
          message: 'This checkout session has expired. Please start again.'
        }
      });
    }

    const salesNumber = process.env.WHATSAPP_SALES_NUMBER;
    if (!salesNumber) {
      console.error('[WhatsApp handoff] WHATSAPP_SALES_NUMBER is not set; cannot hand off order ' + order.id);
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'WhatsApp ordering is temporarily unavailable. Please call us to complete your order.'
        }
      });
    }

    const items = db.prepare(
      'SELECT name, quantity, unit_price FROM order_items WHERE order_id = ?'
    ).all(order.id);

    if (order.order_status === 'Draft') {
      db.prepare(`
        UPDATE orders
        SET order_status = 'AwaitingPayment',
            payment_status = 'AwaitingPayment',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(order.id);

      logAuditEvent(
        'WHATSAPP_HANDOFF',
        null,
        order.id,
        { sessionId, total: order.total, phone: order.customer_phone },
        req
      );
    }

    const message = buildHandoffMessage(order, items, session.region_name);
    // wa.me expects digits only - no plus sign, no spaces.
    const dialable = salesNumber.replace(/[^0-9]/g, '');

    res.status(200).json({
      success: true,
      data: {
        orderReference: order.id,
        salesNumber,
        message,
        whatsappUrl: `https://wa.me/${dialable}?text=${encodeURIComponent(message)}`
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
