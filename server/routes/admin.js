import express from 'express';
import db from '../config/database.js';
import { requireAuth, requireRole, csrfProtection } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

// Helper to parse JSON fields in compliance records
function parseProductCompliance(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    format: row.format,
    concern: row.concern,
    price: row.price,
    currency: row.currency,
    image: row.image,
    imageAlt: row.image_alt,
    shortDescription: row.short_description,
    stockStatus: row.stock_status,
    stockQuantity: row.stock_quantity,
    isPublished: !!row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    keyIngredients: JSON.parse(row.key_ingredients || '[]'),
    fullIngredients: JSON.parse(row.full_ingredients || '[]'),
    usageInstructions: row.usage_instructions,
    servingGuidance: row.serving_guidance,
    warnings: JSON.parse(row.warnings || '[]'),
    contraindications: JSON.parse(row.contraindications || '[]'),
    allergyWarning: row.allergy_warning,
    storageInstructions: row.storage_instructions,
    healthDisclaimer: row.health_disclaimer,
    suitableFor: JSON.parse(row.suitable_for || '[]'),
    notSuitableFor: JSON.parse(row.not_suitable_for || '[]')
  };
}

// Server-Side Compliance Validator
const COMPLIANCE_FIELDS = [
  { name: 'fullIngredients', type: 'array' },
  { name: 'usageInstructions', type: 'string' },
  { name: 'servingGuidance', type: 'string' },
  { name: 'warnings', type: 'array' },
  { name: 'contraindications', type: 'array' },
  { name: 'allergyWarning', type: 'string' },
  { name: 'storageInstructions', type: 'string' },
  { name: 'healthDisclaimer', type: 'string' },
  { name: 'suitableFor', type: 'array' },
  { name: 'notSuitableFor', type: 'array' }
];

function checkCompliance(body) {
  const errors = [];
  for (const field of COMPLIANCE_FIELDS) {
    const val = body[field.name];
    if (val === undefined || val === null) {
      errors.push({ field: field.name, issue: 'Compliance field is missing.' });
      continue;
    }
    if (field.type === 'string') {
      const strVal = String(val).trim();
      if (strVal === '') {
        errors.push({ field: field.name, issue: 'Compliance field cannot be empty.' });
      } else if (strVal.toLowerCase() !== 'none' && strVal.toLowerCase() !== 'not applicable' && strVal.length < 5) {
        errors.push({ field: field.name, issue: 'Compliance field value must be descriptive or explicitly set to "None" or "Not Applicable".' });
      }
    } else if (field.type === 'array') {
      if (!Array.isArray(val) || val.length === 0) {
        errors.push({ field: field.name, issue: 'Compliance list must contain at least one item.' });
      } else {
        const hasEmpty = val.some(item => typeof item === 'string' && item.trim() === '');
        if (hasEmpty) {
          errors.push({ field: field.name, issue: 'Compliance list items cannot be empty.' });
        }
      }
    }
  }
  return errors;
}

/**
 * GET /api/admin/me
 * Returns current authenticated admin profile and CSRF token.
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: req.user,
    csrfToken: req.cookies ? req.cookies.csrf_token : null
  });
});

/**
 * GET /api/admin/products
 * Retrieves all catalog products (including drafts).
 */
router.get('/products', requireAuth, (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT p.*, c.key_ingredients, c.full_ingredients, c.usage_instructions, c.serving_guidance,
             c.warnings, c.contraindications, c.allergy_warning, c.storage_instructions,
             c.health_disclaimer, c.suitable_for, c.not_suitable_for
      FROM products p
      LEFT JOIN product_compliance c ON p.id = c.product_id
      ORDER BY p.created_at DESC
    `).all();

    const parsed = rows.map(parseProductCompliance);
    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/products
 * Creates a new product.
 */
router.post('/products', requireAuth, requireRole(['owner', 'admin', 'editor']), csrfProtection, validateBody('product'), (req, res, next) => {
  try {
    // If attempting to publish, enforce strict compliance checks server-side
    if (req.body.isPublished === true) {
      const complianceErrors = checkCompliance(req.body);
      if (complianceErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Publishing blocked: One or more compliance fields are missing or empty.',
            details: complianceErrors
          }
        });
      }
    }

    const {
      id, name, category, format, concern, price, currency, image, imageAlt, shortDescription,
      stockQuantity, stockStatus, isPublished, keyIngredients, fullIngredients, usageInstructions,
      servingGuidance, warnings, contraindications, allergyWarning, storageInstructions,
      healthDisclaimer, suitableFor, notSuitableFor
    } = req.body;

    // Check if ID already exists
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `Product with ID '${id}' already exists.`
        }
      });
    }

    const createTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO products (id, name, category, format, concern, price, currency, image, image_alt, short_description, stock_quantity, stock_status, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, name, category, format, concern, price, currency || 'TZS', image, imageAlt, shortDescription,
        stockQuantity || 0, stockStatus, isPublished ? 1 : 0
      );

      db.prepare(`
        INSERT INTO product_compliance (product_id, key_ingredients, full_ingredients, usage_instructions, serving_guidance, warnings, contraindications, allergy_warning, storage_instructions, health_disclaimer, suitable_for, not_suitable_for)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        JSON.stringify(keyIngredients),
        JSON.stringify(fullIngredients),
        usageInstructions,
        servingGuidance,
        JSON.stringify(warnings),
        JSON.stringify(contraindications),
        allergyWarning,
        storageInstructions,
        healthDisclaimer,
        JSON.stringify(suitableFor),
        JSON.stringify(notSuitableFor)
      );
    });

    createTx();

    logAuditEvent('PRODUCT_CREATED', req.user.id, id, { name, isPublished }, req);

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { id, name, isPublished }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/products/:id
 * Updates an existing product.
 */
router.put('/products/:id', requireAuth, requireRole(['owner', 'admin', 'editor']), csrfProtection, validateBody('product'), (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch existing product
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product with ID '${id}' could not be found.`
        }
      });
    }

    if (req.body.isPublished === true) {
      const complianceErrors = checkCompliance(req.body);
      if (complianceErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Publishing blocked: One or more compliance fields are missing or empty.',
            details: complianceErrors
          }
        });
      }
    }

    const {
      name, category, format, concern, price, image, imageAlt, shortDescription,
      stockQuantity, stockStatus, isPublished, keyIngredients, fullIngredients, usageInstructions,
      servingGuidance, warnings, contraindications, allergyWarning, storageInstructions,
      healthDisclaimer, suitableFor, notSuitableFor
    } = req.body;

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE products
        SET name = ?, category = ?, format = ?, concern = ?, price = ?, image = ?, image_alt = ?,
            short_description = ?, stock_quantity = ?, stock_status = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name, category, format, concern, price, image, imageAlt, shortDescription,
        stockQuantity || 0, stockStatus, isPublished ? 1 : 0, id
      );

      db.prepare(`
        UPDATE product_compliance
        SET key_ingredients = ?, full_ingredients = ?, usage_instructions = ?, serving_guidance = ?,
            warnings = ?, contraindications = ?, allergy_warning = ?, storage_instructions = ?,
            health_disclaimer = ?, suitable_for = ?, not_suitable_for = ?
        WHERE product_id = ?
      `).run(
        JSON.stringify(keyIngredients),
        JSON.stringify(fullIngredients),
        usageInstructions,
        servingGuidance,
        JSON.stringify(warnings),
        JSON.stringify(contraindications),
        allergyWarning,
        storageInstructions,
        healthDisclaimer,
        JSON.stringify(suitableFor),
        JSON.stringify(notSuitableFor),
        id
      );
    });

    updateTx();

    logAuditEvent('PRODUCT_UPDATED', req.user.id, id, { name, isPublished }, req);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: { id, name, isPublished }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/products/:id/publish
 * Enforces server-side compliance validation and sets is_published = 1.
 */
router.patch('/products/:id/publish', requireAuth, requireRole(['owner', 'admin', 'editor']), csrfProtection, (req, res, next) => {
  try {
    const { id } = req.params;

    const row = db.prepare(`
      SELECT p.name, c.*
      FROM products p
      LEFT JOIN product_compliance c ON p.id = c.product_id
      WHERE p.id = ?
    `).get(id);

    if (!row) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The product could not be found.'
        }
      });
    }

    // Format fields for compliance checker
    const mapped = {
      fullIngredients: JSON.parse(row.full_ingredients || '[]'),
      usageInstructions: row.usage_instructions,
      servingGuidance: row.serving_guidance,
      warnings: JSON.parse(row.warnings || '[]'),
      contraindications: JSON.parse(row.contraindications || '[]'),
      allergyWarning: row.allergy_warning,
      storageInstructions: row.storage_instructions,
      healthDisclaimer: row.health_disclaimer,
      suitableFor: JSON.parse(row.suitable_for || '[]'),
      notSuitableFor: JSON.parse(row.not_suitable_for || '[]')
    };

    const complianceErrors = checkCompliance(mapped);
    if (complianceErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Publishing blocked: All compliance fields must be present and non-empty.',
          details: complianceErrors
        }
      });
    }

    db.prepare('UPDATE products SET is_published = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    logAuditEvent('PRODUCT_PUBLISHED', req.user.id, id, { name: row.name }, req);

    res.json({
      success: true,
      message: `Product '${row.name}' published successfully.`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/products/:id/unpublish
 * Sets is_published = 0.
 */
router.patch('/products/:id/unpublish', requireAuth, requireRole(['owner', 'admin', 'editor']), csrfProtection, (req, res, next) => {
  try {
    const { id } = req.params;

    const product = db.prepare('SELECT name FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product could not be found.'
        }
      });
    }

    db.prepare('UPDATE products SET is_published = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    logAuditEvent('PRODUCT_UNPUBLISHED', req.user.id, id, { name: product.name }, req);

    res.json({
      success: true,
      message: `Product '${product.name}' reverted to draft.`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/orders
 * Returns list of all orders.
 */
router.get('/orders', requireAuth, (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT id, customer_name, customer_phone, total, order_status, payment_status, fulfilment_status, created_at
      FROM orders
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/orders/:id
 * Returns complete order details.
 */
router.get('/orders/:id', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;

    const order = db.prepare(`
      SELECT o.*, r.name as region_name
      FROM orders o
      LEFT JOIN shipping_regions r ON o.delivery_region_id = r.id
      WHERE o.id = ?
    `).get(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order could not be found.'
        }
      });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
    const payment = db.prepare('SELECT payment_reference, status, customer_message FROM payments WHERE order_id = ?').get(id);

    res.json({
      success: true,
      data: {
        ...order,
        items,
        payment: payment || null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Updates fulfilment status. Payment state is strictly READ-ONLY.
 * Constraints:
 * - Draft orders must not be dispatchable.
 * - Unpaid orders must not be marked as Dispatched or Delivered.
 */
router.patch('/orders/:id/status', requireAuth, requireRole(['owner', 'admin', 'editor']), csrfProtection, (req, res, next) => {
  try {
    const { id } = req.params;
    const { fulfilmentStatus } = req.body;

    const validStatuses = ['FulfilmentPending', 'Dispatched', 'Delivered'];
    if (!validStatuses.includes(fulfilmentStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid fulfilment status. Must be FulfilmentPending, Dispatched, or Delivered.'
        }
      });
    }

    const order = db.prepare('SELECT order_status, payment_status, fulfilment_status FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order could not be found.'
        }
      });
    }

    // Constraint 1: Draft orders must not be dispatchable
    if (order.order_status === 'Draft') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot update fulfilment status for a Draft order.'
        }
      });
    }

    // Constraint 2: Unpaid orders must not be marked as Dispatched or Delivered
    if (order.payment_status !== 'Paid' && ['Dispatched', 'Delivered'].includes(fulfilmentStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot mark unpaid orders as Dispatched or Delivered.'
        }
      });
    }

    // Update fulfilment status in database
    db.prepare('UPDATE orders SET fulfilment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(fulfilmentStatus, id);

    logAuditEvent('ORDER_FULFILMENT_UPDATED', req.user.id, id, { 
      previous: order.fulfilment_status, 
      new: fulfilmentStatus 
    }, req);

    res.json({
      success: true,
      message: `Fulfilment status updated to '${fulfilmentStatus}'.`,
      data: { id, fulfilmentStatus }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/audit-logs
 * Retrieves system audit logs. Requires owner or admin roles.
 */
router.get('/audit-logs', requireAuth, requireRole(['owner', 'admin']), (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const rows = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
