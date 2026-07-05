import db from '../config/database.js';
import { products } from '../../src/data/products.js';

function seedCatalog() {
  console.log(`Seeding database with ${products.length} products from products.js...`);
  try {
    db.prepare('DELETE FROM product_compliance').run();
    db.prepare('DELETE FROM products').run();

    const insertProduct = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, category, format, concern, price, currency, image, image_alt, short_description, stock_quantity, stock_status, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertCompliance = db.prepare(`
      INSERT OR REPLACE INTO product_compliance (product_id, key_ingredients, full_ingredients, usage_instructions, serving_guidance, warnings, contraindications, allergy_warning, storage_instructions, health_disclaimer, suitable_for, not_suitable_for)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of products) {
      insertProduct.run(
        p.id.toString(),
        p.name,
        p.category,
        p.format,
        p.concern,
        p.price,
        p.currency,
        p.image,
        p.imageAlt,
        p.shortDescription,
        50, // stock_quantity
        'in_stock'
      );

      insertCompliance.run(
        p.id.toString(),
        JSON.stringify(p.keyIngredients.split(',')),
        JSON.stringify(p.fullIngredients),
        p.usageInstructions,
        p.servingGuidance,
        JSON.stringify(p.warnings),
        JSON.stringify(p.contraindications),
        p.allergyWarning,
        p.storageInstructions,
        p.healthDisclaimer,
        JSON.stringify(p.suitableFor),
        JSON.stringify(p.notSuitableFor)
      );
    }

    console.log('✓ Database catalog seeding completed successfully.');
  } catch (err) {
    console.error('✗ Error seeding database catalog:', err.message);
  }
}

seedCatalog();
