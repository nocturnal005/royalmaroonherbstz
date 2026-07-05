import express from 'express';
import db from '../config/database.js';
import { validateBody } from '../middleware/validation.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

/**
 * POST /api/cart/validate
 * Validates cart items, checks stock levels, and recalculates totals server-side.
 * Discards all client-provided pricing details.
 */
router.post('/validate', validateBody('cart'), (req, res, next) => {
  try {
    const { items, deliveryRegion } = req.body;

    const validatedItems = [];
    const unavailableItems = [];
    const warnings = [];
    let subtotal = 0;
    let shippingFee = 0;

    // 1. Fetch shipping fee if region is provided
    if (deliveryRegion) {
      const region = db.prepare('SELECT name, shipping_fee FROM shipping_regions WHERE id = ?').get(deliveryRegion);
      if (!region) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'One or more fields are invalid.',
            details: [{ field: 'deliveryRegion', issue: `Region '${deliveryRegion}' is not supported.` }]
          }
        });
      }
      shippingFee = region.shipping_fee;
    }

    // 2. Validate each cart item against database catalog
    const queryProduct = db.prepare('SELECT name, price, stock_quantity, stock_status, is_published FROM products WHERE id = ?');

    for (const item of items) {
      const product = queryProduct.get(item.productId);

      if (!product || !product.is_published) {
        unavailableItems.push(item.productId);
        warnings.push(`Product '${item.productId}' is no longer available.`);
        continue;
      }

      let quantity = item.quantity;

      // Validate stock availability
      if (product.stock_status === 'out_of_stock' || product.stock_quantity <= 0) {
        unavailableItems.push(item.productId);
        warnings.push(`Product '${product.name}' is out of stock.`);
        continue;
      }

      if (product.stock_quantity < quantity) {
        warnings.push(`Low stock for '${product.name}': only ${product.stock_quantity} unit(s) available. Quantity adjusted.`);
        quantity = product.stock_quantity;
      }

      const itemTotal = quantity * product.price;
      subtotal += itemTotal;

      validatedItems.push({
        productId: item.productId,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal,
        stockStatus: product.stock_status,
        availableQuantity: product.stock_quantity
      });
    }

    const estimatedTotal = subtotal + shippingFee;

    const result = {
      validatedItems,
      subtotal,
      shippingFee,
      estimatedTotal,
      unavailableItems,
      warnings
    };

    if (warnings.length > 0) {
      logAuditEvent('CART_VALIDATION_WARNINGS', null, null, { warnings }, req);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
