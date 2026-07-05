import express from 'express';
import db from '../config/database.js';
import { validateBody } from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/shipping/estimate
 * Lookups shipping fees and estimated timelines for a region from the database.
 */
router.post('/estimate', validateBody('shipping'), (req, res, next) => {
  try {
    const { deliveryRegion } = req.body;

    const region = db.prepare(`
      SELECT name, shipping_fee, estimated_days
      FROM shipping_regions
      WHERE id = ?
    `).get(deliveryRegion);

    if (!region) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Region '${deliveryRegion}' could not be found.`
        }
      });
    }

    res.json({
      success: true,
      data: {
        deliveryRegion,
        regionName: region.name,
        shippingFee: region.shipping_fee,
        estimatedDays: region.estimated_days
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
