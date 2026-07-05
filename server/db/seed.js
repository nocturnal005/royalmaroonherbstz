import db from '../config/database.js';

const productsToSeed = [
  {
    id: "calmness-tincture",
    name: "Calmness Tincture",
    category: "Relaxation & Evening Rituals",
    format: "tinctures",
    concern: "sleep",
    price: 80000,
    currency: "TZS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQB1sIc8Oy4L46MKEdwQYbAi0B9BumtX_bVzlGMwiZ_SK6rlW8QV7DJrEr1gglsguS71FYlotHXy--FVmAEKv2sRbpa5zS_xPAHZFBPC13mD4M0Z3COUAuz8Iuu0UBHLrKdShYQnzWMyOtMBN0DSchLwOtGCBOKJ7SkXuuYbg9cUgy3Eefb98XKrSroNUWfsoHZQ9QP5ar6ryvhIiQs1cpaTY0kaS9caOSQFfzbnXNg1AXFfyABMW9Z6S5I38w3sYZmJGUND1gWKsr",
    image_alt: "Amber glass dropper bottle of Calmness Tincture placed on a rough stone slab with dried chamomile.",
    short_description: "Handcrafted botanical extract designed for a relaxation ritual, quiet moments, and rest.",
    stock_quantity: 30,
    stock_status: "in_stock",
    is_published: 1,
    key_ingredients: ["Passionflower", "Lemon Balm", "Ashwagandha Root", "Valerian"],
    full_ingredients: [
      "Organic Passionflower Extract",
      "Organic Lemon Balm Extract",
      "Ashwagandha Root Extract",
      "Fresh Valerian Root Extract",
      "Organic Cane Alcohol",
      "Pure Spring Water"
    ],
    usage_instructions: "Shake well before use. Add 20-30 drops to water, tea, or juice.",
    serving_guidance: "Take 1-2 times daily, ideally in the evening or before bedtime.",
    warnings: [
      "Do not exceed recommended serving size.",
      "Keep out of reach of children.",
      "Consult a healthcare professional if you experience drowsiness."
    ],
    contraindications: [
      "Do not use when driving or operating heavy machinery.",
      "Not for use with sedatives or alcohol."
    ],
    allergy_warning: "Processed in a facility that also processes tree nuts.",
    storage_instructions: "Store in a cool, dry place away from direct sunlight.",
    health_disclaimer: "This herbal product is for general wellness only and is not intended to diagnose, treat, cure, or prevent any disease.",
    suitable_for: [
      "Adults looking to enhance their relaxation rituals",
      "Vegetarians and vegans"
    ],
    not_suitable_for: [
      "Pregnant or nursing mothers",
      "Children under 18 years of age",
      "Individuals taking prescription sedatives or anxiety medication"
    ]
  },
  {
    id: "winter-harvest-infusion",
    name: "Winter Harvest Infusion",
    category: "Seasonal Wellness Blend",
    format: "teas",
    concern: "immunity",
    price: 70000,
    currency: "TZS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARyZDpLVK16j794UBeOzmL_bf27o9sIJgQzPxFr71FzDdBldXsIwEp5fFT7uu5rKQiGmpQtipXaotiRGatJ1c2P_0uHHcVfmIOwkqC8WIjWyw9GTn57bmP9C4vhfZ0myhwjQWgonwO4nMql8gbv9nUFj59xxbCTtFnu5-5ZeNXbi9_S7FMoreyufxJccJEEhINB5GrkCwRFs6feCn2NvynNHWLVGU3qyrULjAZM0HvP4EX7LUoOnRZ_nvBBtZu93XEvOBdzk3J1rwH",
    image_alt: "Premium botanical tea canister featuring echinacea drawings on a dark wood background.",
    short_description: "A comforting winter botanical blend designed to provide everyday wellness during seasonal changes.",
    stock_quantity: 50,
    stock_status: "in_stock",
    is_published: 1,
    key_ingredients: ["Elderberry", "Rosehips", "Echinacea", "Ginger Root"],
    full_ingredients: [
      "Organic Elderberries",
      "Organic Rosehips",
      "Organic Echinacea Purpurea Herb",
      "Organic Ginger Root",
      "Organic Orange Peel"
    ],
    usage_instructions: "Steep 1-2 teaspoons in freshly boiled water for 10-15 minutes. Strain and enjoy.",
    serving_guidance: "Enjoy 1-3 cups daily, especially during cooler seasons.",
    warnings: [
      "Consult a healthcare professional before use if taking immunosuppressants.",
      "Consult a qualified healthcare professional before use if you are managing a health condition or taking medication."
    ],
    contraindications: [
      "Not recommended for individuals with progressive systemic diseases or autoimmune conditions."
    ],
    allergy_warning: "Free from major allergens. Blended on shared equipment that processes floral herbs.",
    storage_instructions: "Store in an airtight container in a cool, dark, dry place.",
    health_disclaimer: "This herbal product is for general wellness only and is not intended to diagnose, treat, cure, or prevent any disease.",
    suitable_for: [
      "Adults seeking seasonal wellness rituals",
      "Vegan and gluten-free diets"
    ],
    not_suitable_for: [
      "Individuals with autoimmune disorders (e.g. lupus, rheumatoid arthritis) without medical advice",
      "Infants under 12 months"
    ]
  },
  {
    id: "digestive-blend",
    name: "Digestive Blend",
    category: "Digestive Comfort Blend",
    format: "tinctures",
    concern: "digestion",
    price: 90000,
    currency: "TZS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJvISpfWaO-4CtHsj5yEBzgsO0BYJQvQ3XkcLMOHB_ZMAxXHAV9f1RabIBJ5HNPaX-pjFfJrJz8NVhFunvcTsaa5TRLOpuz9UYzIDY5JON94l1x4gPbTFlW5LXRCxqrlF-luctLpJvo7_hBU_HrhIVSS4O7RPbEqirswGlrvWiOUoFUqWJuqpe5riJE4KgGt4tVlENwDmS2Dr2ecqS17Kty2_b4DufmFpwcdrpbrcgETfTK3PDEjJgI05Acl9bb5aG638y0KWR9NHF",
    image_alt: "Minimalist apothecary bottle alongside vintage mortar with fennel seeds.",
    short_description: "Traditional bitter botanical extracts crafted for after-meal botanical rituals.",
    stock_quantity: 15,
    stock_status: "in_stock",
    is_published: 1,
    key_ingredients: ["Gentian Root", "Peppermint Leaf", "Fennel Seed", "Artichoke Leaf"],
    full_ingredients: [
      "Gentian Root Extract",
      "Organic Peppermint Leaf Extract",
      "Organic Fennel Seed Extract",
      "Artichoke Leaf Extract",
      "Organic Cane Alcohol",
      "Pure Spring Water"
    ],
    usage_instructions: "Add 10-15 drops to a small amount of water. Take 15 minutes before meals.",
    serving_guidance: "Use 2-3 times daily before major meals.",
    warnings: [
      "Avoid if you have active stomach ulcers or gallbladder obstruction.",
      "Keep out of reach of children."
    ],
    contraindications: [
      "Contraindicated in cases of bile duct obstruction, acute gallbladder inflammation, or severe gastrointestinal conditions."
    ],
    allergy_warning: "Contains fennel seed; avoid if allergic to plants in the carrot (Apiaceae) family.",
    storage_instructions: "Store upright in a cool, dry place.",
    health_disclaimer: "This herbal product is for general wellness only and is not intended to diagnose, treat, cure, or prevent any disease.",
    suitable_for: [
      "Adults seeking digestive comfort after meals",
      "Vegetarians and vegans"
    ],
    not_suitable_for: [
      "Individuals with gallstones, bile duct blockages, or active peptic ulcers",
      "Pregnant women"
    ]
  },
  {
    id: "botanical-balm",
    name: "Botanical Balm",
    category: "Soothing Topical Balm",
    format: "balms",
    concern: "stress",
    price: 60000,
    currency: "TZS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAziNRTWTy72HqzYokMvwng7s__onaNumvM5gaiFqOjvUFGCH_ijsg3ohwC0odCz7RKFpmqDLANiIBgT4r8yJ6RgvlpHbszl20erFXLAfE-Oqu6b2jtLSXvwUIXPnlUiKvxp_-oG3BItZI0S3-s5twcIaS3vaZFlghXH5Dibch4_oGc6V39gfFXeuGjSHHUwuTcQaiG_t74J6BsTz5rT7CXhqUuQjeNjUfgccnEWP56NmxTaL91u-w89_oC_0Zy1XhtUw1PIoHxU_Pc",
    image_alt: "Open aluminum tin container displaying soft green herbal balm with a wooden spatula.",
    short_description: "A comforting botanical balm for massage and daily skin care, featuring calendula and lavender.",
    stock_quantity: 40,
    stock_status: "in_stock",
    is_published: 1,
    key_ingredients: ["Calendula Oil", "Beeswax", "Comfrey", "Lavender Oil"],
    full_ingredients: [
      "Organic Calendula Flower Infused Olive Oil",
      "Pure Unrefined Beeswax",
      "Organic Comfrey Leaf Extract",
      "Organic Lavender Essential Oil",
      "Organic Rosemary Leaf Extract"
    ],
    usage_instructions: "Apply a small amount to clean skin and massage gently until absorbed.",
    serving_guidance: "For external topical use only. Apply 2-3 times daily or as needed for skincare.",
    warnings: [
      "For external use only.",
      "Do not apply to open wounds, broken skin, or sensitive mucous membranes.",
      "Discontinue use if redness or irritation develops."
    ],
    contraindications: [
      "Do not ingest.",
      "Avoid contact with eyes."
    ],
    allergy_warning: "Contains beeswax. Do not use if allergic to bee products or lavender.",
    storage_instructions: "Store below 25°C in a dry place. Keep tin tightly closed.",
    health_disclaimer: "This cosmetic herbal balm is for general wellness and external skincare only. It is not intended to diagnose, treat, cure, or prevent any disease or pain.",
    suitable_for: [
      "Adults and children over 6 years under supervision",
      "General topical massage and skin care"
    ],
    not_suitable_for: [
      "Infants",
      "Applying to open sores or deep puncture wounds",
      "Individuals with hypersensitivity to bee products"
    ]
  },
  {
    id: "forest-elixir",
    name: "Forest Elixir",
    category: "Spiritual & Mental Clarity",
    format: "tinctures",
    concern: "stress",
    price: 110000,
    currency: "TZS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUn4YLxQ5-4uKSAs_cCIW3snCwTtxi7RVpcoThDZFkySdbMR9jIZszEQrEK4cLn4lR23wRg9p0RVSrp7pl08g6RM7jz4pIOTzv03cOgzEJTDw35uAL6Teb0CmGhmxQhVOMLVwQ5X3eyYSWi-ZFpk3H7439F-qvcK2cQ30xT59niARxGkj0KCU8G2ttDjbizrkgie82CbrkziUag4CoLzm8dcvs0AdKPc9IeX7d9NyZTPzW0gxOKPva7U1paceezpnshqy_IsaacquX",
    image_alt: "Three amber glass apothecary bottles arranged on dark green velvet cloth with eucalyptus.",
    short_description: "Artisanal forest extracts that promote natural clarity and a sense of grounding.",
    stock_quantity: 20,
    stock_status: "in_stock",
    is_published: 1,
    key_ingredients: ["Wildflower Extract", "Forest Honey", "Distilled Essence"],
    full_ingredients: [
      "Wildcrafted Pine Needle Essence",
      "Oak Bark Extract",
      "Organic Nettle Leaf Extract",
      "Raw Wild Forest Honey",
      "Organic Cane Alcohol",
      "Pure Spring Water"
    ],
    usage_instructions: "Take 15-20 drops directly under the tongue or in water.",
    serving_guidance: "Take once daily in the morning for grounding rituals.",
    warnings: [
      "Contains honey; do not give to infants.",
      "Consult a physician before use if taking prescription medications."
    ],
    contraindications: [
      "Do not use if pregnant or lactating due to wild harvested bark components."
    ],
    allergy_warning: "Contains raw forest honey and pine products. Avoid if allergic to bee products or conifers.",
    storage_instructions: "Store in a cool, dark cabinet.",
    health_disclaimer: "This herbal product is for general wellness only and is not intended to diagnose, treat, cure, or prevent any disease.",
    suitable_for: [
      "Adults looking to enhance mindfulness and morning grounding rituals"
    ],
    not_suitable_for: [
      "Infants under 12 months",
      "Pregnant or breastfeeding women"
    ]
  },
  {
    id: "root-vitality-salts",
    name: "Root Vitality Salts",
    category: "Grounding Ritual Bath",
    format: "balms",
    concern: "stress",
    price: 75000,
    currency: "TZS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4ZK1la5veXKlx5LVP9UmPLEJ543abyZEcdBs1u5UlpQ6gSWOhemqQX46P9zqNVzJQqy2E5Te7C5KVWJoAnwL39SVQ6KxFujd-lqjBjlwhY781CN0h1_m1iff86uM9aLjeAkOM2sT1clzW8GqrQ-enSsZhroovKLlRO14_oIHkGj7sTXgjUTBQy3Vm9blubK8EJkaYoYd_f4caVy5rl7-vk8IbGtn6C7nOHL2zhbCDlIrsIjIx1rdALh-qtQOroBc5nzYGenO7uvbJ",
    image_alt: "Amber glass jar of Root Vitality Salts sitting on a bed of dry moss and river stones.",
    short_description: "Relaxing mineral bath salts to ground and restore vitality after exertion.",
    stock_quantity: 25,
    stock_status: "in_stock",
    is_published: 1,
    key_ingredients: ["Epsom Salts", "Himalayan Sea Salt", "Dried Rosemary", "Juniper Berry Oil"],
    full_ingredients: [
      "Magnesium Sulfate (Epsom Salt)",
      "Sodium Chloride (Pink Himalayan Salt)",
      "Organic Dried Rosemary Leaves",
      "Organic Juniper Berry Essential Oil",
      "Organic Cedarwood Essential Oil"
    ],
    usage_instructions: "Dissolve 1/2 cup into warm running bathwater. Soak for 20 minutes.",
    serving_guidance: "For external bath use only. Use 2-3 times per week or as desired.",
    warnings: [
      "For external bath use only.",
      "Avoid contact with eyes.",
      "If skin irritation occurs, discontinue use immediately."
    ],
    contraindications: [
      "Do not use on infected or severely broken skin.",
      "Consult a doctor before use if you have diabetes or kidney conditions."
    ],
    allergy_warning: "Contains juniper berry oil. Test on a small patch of skin first if sensitive.",
    storage_instructions: "Keep bag tightly sealed in a dry environment to prevent clumping.",
    health_disclaimer: "These mineral bath salts are for general wellness and external self-care only. They are not intended to diagnose, treat, cure, or prevent any disease.",
    suitable_for: [
      "Adults looking to unwind after physical activity or exertion"
    ],
    not_suitable_for: [
      "Individuals with open skin infections",
      "Infants or small children"
    ]
  }
];

const shippingRegionsToSeed = [
  { id: "dar", name: "Dar es Salaam", shipping_fee: 5000, estimated_days: "1-2 Business Days" },
  { id: "arusha", name: "Arusha", shipping_fee: 10000, estimated_days: "2-3 Business Days" },
  { id: "mwanza", name: "Mwanza", shipping_fee: 12000, estimated_days: "3-4 Business Days" },
  { id: "dodoma", name: "Dodoma", shipping_fee: 9000, estimated_days: "2-3 Business Days" },
  { id: "mbeya", name: "Mbeya", shipping_fee: 12000, estimated_days: "3-4 Business Days" },
  { id: "morogoro", name: "Morogoro", shipping_fee: 8000, estimated_days: "2 Business Days" },
  { id: "tanga", name: "Tanga", shipping_fee: 8000, estimated_days: "2 Business Days" },
  { id: "zanzibar", name: "Zanzibar", shipping_fee: 15000, estimated_days: "3-5 Business Days" },
  { id: "kilimanjaro", name: "Kilimanjaro (Moshi)", shipping_fee: 10000, estimated_days: "2-3 Business Days" }
];

function runSeed() {
  console.log('Seeding SQLite database...');

  try {
    // 1. Admin user seeding is removed for Stage 8.
    // Admin user creation and secure password hashing will be handled in Stage 9.
    console.log('✓ Admin user table is empty (placeholder only).');

    // 2. Seed shipping regions
    const insertRegion = db.prepare(`
      INSERT OR REPLACE INTO shipping_regions (id, name, shipping_fee, estimated_days)
      VALUES (?, ?, ?, ?)
    `);

    for (const reg of shippingRegionsToSeed) {
      insertRegion.run(reg.id, reg.name, reg.shipping_fee, reg.estimated_days);
    }
    console.log(`✓ Seeded ${shippingRegionsToSeed.length} shipping regions.`);

    // 3. Seed products and compliance details
    const insertProduct = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, category, format, concern, price, currency, image, image_alt, short_description, stock_quantity, stock_status, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertCompliance = db.prepare(`
      INSERT OR REPLACE INTO product_compliance (product_id, key_ingredients, full_ingredients, usage_instructions, serving_guidance, warnings, contraindications, allergy_warning, storage_instructions, health_disclaimer, suitable_for, not_suitable_for)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of productsToSeed) {
      // Compliance check before publishing
      const complianceComplete = 
        p.key_ingredients?.length > 0 &&
        p.full_ingredients?.length > 0 &&
        p.usage_instructions &&
        p.serving_guidance &&
        p.warnings?.length > 0 &&
        p.contraindications?.length > 0 &&
        p.allergy_warning &&
        p.storage_instructions &&
        p.health_disclaimer &&
        p.suitable_for?.length > 0 &&
        p.not_suitable_for?.length > 0;

      const isPublished = (p.is_published && complianceComplete) ? 1 : 0;

      insertProduct.run(
        p.id,
        p.name,
        p.category,
        p.format,
        p.concern,
        p.price,
        p.currency,
        p.image,
        p.image_alt,
        p.short_description,
        p.stock_quantity,
        p.stock_status,
        isPublished
      );

      insertCompliance.run(
        p.id,
        JSON.stringify(p.key_ingredients),
        JSON.stringify(p.full_ingredients),
        p.usage_instructions,
        p.serving_guidance,
        JSON.stringify(p.warnings),
        JSON.stringify(p.contraindications),
        p.allergy_warning,
        p.storage_instructions,
        p.health_disclaimer,
        JSON.stringify(p.suitable_for),
        JSON.stringify(p.not_suitable_for)
      );
    }
    console.log(`✓ Seeded ${productsToSeed.length} products with compliance fields.`);

    // Log audit event
    const stmt = db.prepare(`
      INSERT INTO audit_logs (action, details)
      VALUES (?, ?)
    `);
    stmt.run('DATABASE_SEED_RUN', JSON.stringify({ status: 'success', timestamp: new Date().toISOString() }));
    console.log('✓ Seeding complete.');
  } catch (error) {
    console.error('✗ Seeding database failed:', error);
    process.exit(1);
  }
}

runSeed();
