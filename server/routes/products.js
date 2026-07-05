import express from 'express';
import db from '../config/database.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

/**
 * Helper to parse JSON fields in compliance records
 */
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

/**
 * GET /api/products
 * Retrieves all published products.
 */
router.get('/', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT p.*, c.key_ingredients, c.full_ingredients, c.usage_instructions, c.serving_guidance,
             c.warnings, c.contraindications, c.allergy_warning, c.storage_instructions,
             c.health_disclaimer, c.suitable_for, c.not_suitable_for
      FROM products p
      LEFT JOIN product_compliance c ON p.id = c.product_id
      WHERE p.is_published = 1
    `);

    const rows = stmt.all();
    const parsedProducts = rows.map(row => parseProductCompliance(row));

    res.json({
      success: true,
      data: parsedProducts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Retrieves detail information for a single published product.
 */
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT p.*, c.key_ingredients, c.full_ingredients, c.usage_instructions, c.serving_guidance,
             c.warnings, c.contraindications, c.allergy_warning, c.storage_instructions,
             c.health_disclaimer, c.suitable_for, c.not_suitable_for
      FROM products p
      LEFT JOIN product_compliance c ON p.id = c.product_id
      WHERE p.id = ? AND p.is_published = 1
    `);

    const row = stmt.get(id);

    if (!row) {
      logAuditEvent('PRODUCT_NOT_FOUND', null, id, { route: req.originalUrl }, req);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested product could not be found or is not published.'
        }
      });
    }

    res.json({
      success: true,
      data: parseProductCompliance(row)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
