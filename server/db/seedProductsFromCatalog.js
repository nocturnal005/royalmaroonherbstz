// Sync the backend product catalog from the frontend source of truth
// (src/data/products.js). Safe to run repeatedly, including on a database that
// already has live orders.
//
// Design choices that make it re-runnable and non-destructive:
//   - UPSERT (INSERT ... ON CONFLICT DO UPDATE), never DELETE + re-INSERT, so
//     rows referenced by order_items are never removed and no FK constraint is
//     tripped.
//   - stock_quantity / stock_status are set only when a product is first
//     inserted; on update they are left untouched, so re-running never clobbers
//     real inventory levels an admin or the checkout flow has changed.
//   - Products that were seeded before but are no longer in the catalog are
//     UNPUBLISHED (is_published = 0), not deleted — they may be referenced by
//     historical orders, and hiding them from the storefront is enough.
//   - Everything runs in one transaction and exits non-zero on failure, so a
//     broken seed fails a deploy loudly instead of silently continuing.

import db from '../config/database.js';
import { products } from '../../src/data/products.js';

const upsertProduct = db.prepare(`
  INSERT INTO products (
    id, name, category, format, concern, price, currency, image, image_alt,
    short_description, stock_quantity, stock_status, is_published
  ) VALUES (
    @id, @name, @category, @format, @concern, @price, @currency, @image, @image_alt,
    @short_description, @stock_quantity, @stock_status, 1
  )
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    category = excluded.category,
    format = excluded.format,
    concern = excluded.concern,
    price = excluded.price,
    currency = excluded.currency,
    image = excluded.image,
    image_alt = excluded.image_alt,
    short_description = excluded.short_description,
    is_published = 1,
    updated_at = CURRENT_TIMESTAMP
  -- stock_quantity and stock_status are intentionally omitted here so existing
  -- inventory is preserved across re-runs.
`);

const upsertCompliance = db.prepare(`
  INSERT INTO product_compliance (
    product_id, key_ingredients, full_ingredients, usage_instructions, serving_guidance,
    warnings, contraindications, allergy_warning, storage_instructions, health_disclaimer,
    suitable_for, not_suitable_for
  ) VALUES (
    @product_id, @key_ingredients, @full_ingredients, @usage_instructions, @serving_guidance,
    @warnings, @contraindications, @allergy_warning, @storage_instructions, @health_disclaimer,
    @suitable_for, @not_suitable_for
  )
  ON CONFLICT(product_id) DO UPDATE SET
    key_ingredients = excluded.key_ingredients,
    full_ingredients = excluded.full_ingredients,
    usage_instructions = excluded.usage_instructions,
    serving_guidance = excluded.serving_guidance,
    warnings = excluded.warnings,
    contraindications = excluded.contraindications,
    allergy_warning = excluded.allergy_warning,
    storage_instructions = excluded.storage_instructions,
    health_disclaimer = excluded.health_disclaimer,
    suitable_for = excluded.suitable_for,
    not_suitable_for = excluded.not_suitable_for
`);

const productExists = db.prepare('SELECT 1 FROM products WHERE id = ?');

function seedCatalog() {
  console.log(`Syncing ${products.length} catalog products into the database...`);

  const catalogIds = products.map((p) => String(p.id));

  const sync = db.transaction(() => {
    let inserted = 0;
    let updated = 0;

    for (const p of products) {
      const id = String(p.id);
      const existed = !!productExists.get(id);

      upsertProduct.run({
        id,
        name: p.name,
        category: p.category,
        format: p.format,
        concern: p.concern,
        price: p.price,
        currency: p.currency,
        image: p.image,
        image_alt: p.imageAlt,
        short_description: p.shortDescription,
        stock_quantity: 50, // applied only on first insert
        stock_status: 'in_stock' // applied only on first insert
      });

      upsertCompliance.run({
        product_id: id,
        key_ingredients: JSON.stringify(p.keyIngredients.split(',').map((s) => s.trim())),
        full_ingredients: JSON.stringify(p.fullIngredients),
        usage_instructions: p.usageInstructions,
        serving_guidance: p.servingGuidance,
        warnings: JSON.stringify(p.warnings),
        contraindications: JSON.stringify(p.contraindications),
        allergy_warning: p.allergyWarning,
        storage_instructions: p.storageInstructions,
        health_disclaimer: p.healthDisclaimer,
        suitable_for: JSON.stringify(p.suitableFor),
        not_suitable_for: JSON.stringify(p.notSuitableFor)
      });

      if (existed) updated++;
      else inserted++;
    }

    // De-list products that are published but no longer in the catalog.
    let unpublished = 0;
    if (catalogIds.length > 0) {
      const placeholders = catalogIds.map(() => '?').join(',');
      unpublished = db.prepare(
        `UPDATE products SET is_published = 0, updated_at = CURRENT_TIMESTAMP
         WHERE is_published = 1 AND id NOT IN (${placeholders})`
      ).run(...catalogIds).changes;
    }

    return { inserted, updated, unpublished };
  });

  const { inserted, updated, unpublished } = sync();
  console.log(`✓ Catalog sync complete: ${inserted} inserted, ${updated} updated, ${unpublished} de-listed (unpublished, not deleted).`);
}

try {
  seedCatalog();
} catch (err) {
  console.error('✗ Catalog sync failed:', err.message);
  process.exit(1);
}
