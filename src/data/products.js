const disclaimer = "This product is for general wellness only and is not intended to diagnose, treat, cure, or prevent any disease.";
const standardWarnings = [
  "Follow the serving guidance on the product label.",
  "Keep out of reach of children.",
  "Consult a qualified healthcare professional before use if pregnant, breastfeeding, taking medication, or managing a health condition."
];

const formatDefaults = {
  powders: {
    usageInstructions: "Mix a small serving into warm water, juice, smoothies, porridge, or food as preferred.",
    servingGuidance: "Start with a small serving and adjust according to the product label.",
    storageInstructions: "Store sealed in a cool, dry place away from direct sunlight.",
    price: 25000
  },
  teas: {
    usageInstructions: "Infuse in hot water, then strain before drinking. Adjust strength to taste.",
    servingGuidance: "Enjoy as part of a daily tea ritual, following the product label.",
    storageInstructions: "Keep the pouch tightly closed in a cool, dry cupboard.",
    price: 22000
  },
  seeds: {
    usageInstructions: "Use whole, crushed, or steeped according to the product label and your preferred recipe.",
    servingGuidance: "Use in small culinary or tea servings unless otherwise directed on the label.",
    storageInstructions: "Store sealed in a cool, dry place.",
    price: 18000
  },
  capsules: {
    usageInstructions: "Take with water according to the serving directions on the bottle.",
    servingGuidance: "Use consistently as directed on the label.",
    storageInstructions: "Store the bottle tightly closed in a cool, dry place.",
    price: 35000
  },
  oils: {
    usageInstructions: "Apply a small amount externally or use as directed on the product label.",
    servingGuidance: "For external self-care use unless the product label states otherwise.",
    storageInstructions: "Store tightly closed away from heat and direct sunlight.",
    price: 30000
  },
  "body-care": {
    usageInstructions: "Use externally according to the product label.",
    servingGuidance: "Patch test before first use and avoid contact with eyes.",
    storageInstructions: "Keep closed and store in a cool, dry place.",
    price: 28000
  },
  rubb: {
    usageInstructions: "Massage a small amount onto the affected area and allow it to absorb; wash hands after use.",
    servingGuidance: "For external use on unbroken skin, following the product label.",
    storageInstructions: "Store tightly closed at room temperature, away from heat and direct sunlight.",
    price: 20000
  },
  honey: {
    usageInstructions: "Take a small spoonful on its own or stir into warm water, tea, or food.",
    servingGuidance: "Enjoy a small daily serving as directed on the product label.",
    storageInstructions: "Store sealed at room temperature; natural crystallisation is normal.",
    price: 95000
  },
  salts: {
    usageInstructions: "Use in cooking and seasoning, or dissolve into a warm bath as preferred.",
    servingGuidance: "Season to taste; for bath use, add to warm water and stir to dissolve.",
    storageInstructions: "Keep sealed in a cool, dry place away from moisture.",
    price: 25000
  },
  soaps: {
    usageInstructions: "Lather onto damp skin, then rinse thoroughly with clean water.",
    servingGuidance: "For external cleansing use; avoid contact with the eyes.",
    storageInstructions: "Keep dry between uses and store away from standing water.",
    price: 10000
  }
};

// Per-product retail prices (TZS) from the owner's price sheets:
// - "Product name and pricing.docx" (2026-07-11)
// - updated price list provided in chat on 2026-07-17 (supersedes earlier
//   figures for the products it lists, e.g. Bladderwrack now 34,000 and
//   Moringa Leaves now 15,000)
// - "new product list and prices.docx" (2026-07-17) for the newest additions
// Keys are the normalized product name (lowercase, single-spaced). Products
// not listed here keep the flat per-format placeholder price in `formatDefaults`.
// The 2026-07-17 chat list shows Tongkat Ali Capsules twice (70,000 and
// 68,000); the higher figure is used, matching how earlier duplicate
// listings were resolved.
const PRICE_OVERRIDES = {
  "stinging nettle powder": 30000,
  "sting nettle powder": 30000,
  "baobab pulp": 30000,
  "baobab powder": 30000,
  "bladderwrack powder": 34000,
  "wild crafted bladderwrack": 34000,
  "fenugreek and halim seeds": 20000,
  "fenugreek & halim seeds": 20000,
  "neem powder": 30000,
  "cancer bush": 68000,
  "senna pods": 17000,
  "soursop leaves": 10000,
  "guava leaves": 10000,
  "guava leaves powder": 15000,
  "tongkat ali powder": 68000,
  "tonkat ali": 68000,
  "tongkat ali capsules": 70000,
  "shilajit powder": 98000,
  "shilajit": 98000,
  "shilajit capsules": 79000,
  "wheat grass powder": 20000,
  "gotu kola powder": 40000,
  "liquorice powder": 17000,
  "licorice powder": 17000,
  "turmeric powder": 15000,
  "turmeric mix": 20000,
  "turmeric mix capsules": 20000,
  "sea moss powder": 40000,
  "black maca powder": 34000,
  "lemongrass": 20000,
  "fenugreek powder": 68000,
  "ashwagandha capsules": 70000,
  "bitter melon capsules": 68000,
  "bitter melon vegan capsules": 68000,
  "black castor oil": 30000,
  "beard oil": 40000,
  "black seed oil": 45000,
  "moringa leaves": 15000,
  "moringa capsules": 50000,
  "moringa oil cold pressed": 30000,
  "mango leaves powder": 30000,
  "cinnamon powder": 20000,
  "stinging nettle, avocado and pumpkin seed powder": 68000,
  "nettle, avocado and pumpkin seed vegan capsules": 68000,
  "stinging nettle capsules": 68000,
  "nutmeg": 8000,
  "osu": 68000,
  "osu powder": 68000,
  "osu capsules": 68000,
  "holi basil": 68000,
  "holy basil capsules": 68000,
  "dandelion": 68000,
  "dandelion capsules": 68000,
  "oregano": 68000,
  "oregano capsules": 68000,
  "beetroot capsules": 50000,
  "catuaba bark": 68000,
  "wormwood": 34000,
  "sarsaparilla powder": 68000,
  "flax seed": 10000,
  "chia seeds": 10000,
  "nishati": 70000,
  "ginkgo biloba capsule": 68000,
  "jimerito honey": 512000,
  // "new product list and prices.docx" (2026-07-17)
  "king of the forest": 20000,
  "aswagandha ksm-66": 98000,
  "tamarind powder": 17000,
  "black seed": 15000,
  "jamaica guaco": 20000,
  "cordyceps powder": 34000,
  "medina": 10000,
  "horny goat weed": 10000,
  "guinea hen weed": 34000,
  "lion's mane mushrooms": 50000,
  "7 mushroom blend": 68000,
  "damiana leaves": 34000,
  "sangre de grado": 40000,
  "shilajit honey": 95000,
  "snuff powder": 17000,
  "black seed soap": 10000,
  "ashwagandha drops": 98000,
  "traditional chinese herbal formula (back tension)": 10000,
  "traditional chinese herbal formula (joint stiffness)": 20000,
  // Owner additions provided in chat (2026-07-18), photos in "D:\TZ added products"
  "fennel capsules": 30000,
  "raw cocoa butter": 45000,
  // Recategorisation (2026-07-18): these items moved out of "powders" but had no
  // explicit price, so they kept the powders placeholder (25,000). Pin that value
  // so correcting their category doesn't also change the price shown to customers.
  "acai berry": 25000,
  "clove, wormwood & black walnut": 25000,
  "testosterone booster": 25000,
  "sea moss": 25000,
  "coconut": 25000,
  "chaney root": 25000,
  "wild crafted purple sea moss": 25000,
  "spanish needle": 25000,
  "moringa setenopetala seed": 25000,
  // "Moringa Seed" turned out to be a 60-capsule bottle (photo ZOZ_2221);
  // keep its previously shown price when it moves into the Capsules section.
  "moringa seed capsules": 25000
};

const normalizeName = (name) => name.toLowerCase().replace(/\s+/g, " ").trim();

const catalog = [
  ["Stinging Nettle Powder", "Herbal Powders", "powders", "daily-wellness", "stinging-nettle-powder.jpg", "A finely milled green nettle powder for simple teas, smoothies, and everyday botanical routines.", "Stinging nettle leaf powder"],
  ["Wild Crafted Sea Moss", "Sea Botanicals", "teas", "daily-wellness", "wild-crafted-sea-moss.jpg", "Whole dried sea moss for soaking, rinsing, and preparing into gels, drinks, or kitchen blends.", "Wild crafted sea moss"],
  ["Baobab Pulp", "Fruit Powders", "powders", "seasonal", "baobab-pulp.jpg", "Tangy baobab pulp with a bright fruit character, ideal for juices, smoothies, and breakfast bowls.", "Baobab fruit pulp"],
  ["Bladderwrack Powder", "Sea Botanicals", "powders", "daily-wellness", "bladderwrack-powder-001.jpg", "A marine botanical powder with a naturally briny profile for careful use in smoothies or water.", "Bladderwrack powder"],
  ["Fenugreek and Halim Seeds", "Seeds & Botanicals", "seeds", "daily-wellness", "fenugreek-halim-seeds.jpg", "A seed blend pairing fenugreek with halim seeds for traditional kitchen and tea preparations.", "Fenugreek seeds, halim seeds"],
  ["Cinnamon Leaves", "Dried Leaves & Teas", "teas", "digestive", "cinnamon-leaves.jpg", "Aromatic dried cinnamon leaves for warm infusions with a soft spice note.", "Cinnamon leaves"],
  ["Papaya Leaf", "Dried Leaves & Teas", "teas", "digestive", "papaya-leaf.jpg", "Dried papaya leaf prepared for herbal infusions and traditional botanical routines.", "Papaya leaf"],
  ["Neem Powder", "Herbal Powders", "powders", "daily-wellness", "neem-powder.jpg", "A bold, earthy neem powder for experienced herbal users who prefer straightforward single-ingredient botanicals.", "Neem leaf powder"],
  ["Cancer Bush", "Dried Leaves & Teas", "teas", "daily-wellness", "cancer-bush.jpg", "A traditional dried botanical sold under its common product name, prepared for careful tea use.", "Cancer bush herb"],
  ["Senna Pods", "Seeds & Botanicals", "teas", "digestive", "senna-pods.jpg", "Whole senna pods for occasional herbal tea preparation, clearly suited to experienced users.", "Senna pods"],
  ["Cerasee", "Dried Leaves & Teas", "teas", "daily-wellness", "cerasee.jpg", "A characterful bitter herb traditionally prepared as a cleansing-style tea.", "Cerasee herb"],
  ["Soursop Leaves", "Dried Leaves & Teas", "teas", "daily-wellness", "soursop-leaves.jpg", "Dried soursop leaves with a mellow herbal aroma for slow-steeped infusions.", "Soursop leaves"],
  ["Guava Leaves", "Dried Leaves & Teas", "teas", "digestive", "guava-leaves.jpg", "Dried guava leaves for a smooth, gently tannic herbal tea.", "Guava leaves"],
  ["Neem Leaves", "Dried Leaves & Teas", "teas", "daily-wellness", "neem-leaves.jpg", "Whole dried neem leaves for traditional bitter infusions and external herbal preparations.", "Neem leaves"],
  ["Tongkat Ali Powder", "Herbal Powders", "powders", "active", "tongkat-ali-powder.jpg", "A concentrated botanical powder with a strong, bitter taste for targeted daily routines.", "Tongkat ali root powder"],
  ["Pimento Seeds", "Seeds & Botanicals", "seeds", "digestive", "pimento-seeds.jpg", "Whole pimento seeds with warm spice notes for teas, cooking, and botanical blends.", "Pimento seeds"],
  ["Wormwood", "Dried Leaves & Teas", "teas", "digestive", "wormwood.jpg", "A very bitter traditional herb for carefully measured infusions.", "Wormwood herb"],
  ["Halim Seeds", "Seeds & Botanicals", "seeds", "daily-wellness", "halim-seeds.jpg", "Small, nutrient-dense halim seeds for soaking, drinks, and traditional recipes.", "Halim seeds"],
  ["Shilajit Powder", "Mineral & Resin Powders", "powders", "active", "shilajit-powder.jpg", "A mineral-rich shilajit powder for customers who prefer loose-format preparations.", "Shilajit powder"],
  ["Wheat Grass Powder", "Green Powders", "powders", "daily-wellness", "wheat-grass-powder.jpg", "A clean green powder for smoothies, juices, and morning wellness blends.", "Wheat grass powder"],
  ["Gotu Kola Powder", "Herbal Powders", "powders", "daily-wellness", "gotu-kola-powder.jpg", "Finely ground gotu kola for teas, smoothies, or simple botanical blends.", "Gotu kola powder"],
  ["Liquorice Powder", "Root Powders", "powders", "digestive", "liquorice-powder.jpg", "Naturally sweet liquorice root powder for warm drinks and herbal blends.", "Liquorice root powder"],
  ["Cinnamon Bark", "Dried Roots & Barks", "teas", "digestive", "cinnamon-bark.jpg", "Fragrant cinnamon bark for simmering into warming teas and kitchen infusions.", "Cinnamon bark"],
  ["Turmeric Powder", "Spice Powders", "powders", "active", "turmeric-powder.jpg", "A golden turmeric powder for cooking, warm drinks, and daily wellness blends.", "Turmeric powder"],
  ["Turmeric Mix", "Spice Powders", "powders", "active", "turmeric-mix.jpg", "A ready-to-use turmeric blend with black pepper for drinks and recipes.", "Turmeric powder, black pepper", 1.27],
  ["Black Pepper", "Seeds & Botanicals", "seeds", "digestive", "black-pepper.jpg", "Whole black peppercorns for food, teas, and pairing with turmeric blends.", "Black peppercorns"],
  ["Cloves", "Seeds & Botanicals", "seeds", "digestive", "cloves.jpg", "Whole cloves with a deep warming aroma for teas, cooking, and spice blends.", "Cloves"],
  ["King of the Forest", "Dried Leaves & Teas", "teas", "daily-wellness", "king-of-the-forest.jpg", "A traditional dried herb sold under its common product name for tea preparation.", "King of the Forest herb"],
  ["Catuaba Bark", "Dried Roots & Barks", "teas", "active", "catuaba-bark.jpg", "Cut catuaba bark for slow-simmered teas and traditional botanical routines.", "Catuaba bark"],
  ["Moringa Powder", "Green Powders", "powders", "daily-wellness", "moringa-powder.jpg", "A versatile moringa leaf powder for smoothies, soups, sauces, and everyday green blends.", "Moringa leaf powder"],
  // The old "sea-moss-powder*.jpg" files were actually photos of a
  // Bladderwrack Powder pouch (mislabeled), so this card showed the wrong
  // product. Those files have been deleted; use the real Sea Moss Powder
  // 500g shot. The Bladderwrack listing keeps its own photo.
  ["Sea Moss Powder", "Sea Botanicals", "powders", "daily-wellness", "ZOZ_2050.JPG", "A convenient powdered sea moss format for blending into drinks and foods.", "Sea moss powder"],
  ["Black Maca Powder", "Root Powders", "powders", "active", "black-maca-powder-original.jpg", "A rich, malty black maca powder for smoothies, oats, and warm drinks.", "Black maca root powder", 1.08],
  ["Senna Powder", "Herbal Powders", "powders", "digestive", "senna-powder.jpg", "A powdered senna format for occasional, careful use as directed on the label.", "Senna leaf powder"],
  ["Lemongrass", "Dried Leaves & Teas", "teas", "digestive", "lemongrass.jpg", "Bright dried lemongrass for refreshing hot or iced herbal tea.", "Lemongrass"],
  ["Spanish Sarsaparilla", "Dried Roots & Barks", "teas", "active", "spanish-sarsaparilla.jpg", "A traditional root botanical with an earthy aroma for slow-simmered infusions.", "Spanish sarsaparilla root"],
  ["Cayenne Powder", "Spice Powders", "powders", "digestive", "cayenne-powder.jpg", "A hot cayenne powder for customers who want bold heat in drinks or recipes.", "Cayenne pepper powder"],
  ["Fenugreek Powder", "Seed Powders", "powders", "daily-wellness", "fenugreek-powder.jpg", "Ground fenugreek with a warm, nutty bitterness for food and botanical blends.", "Fenugreek seed powder"],
  ["Halim Capsules", "Capsules", "capsules", "daily-wellness", "halim-capsules.jpg", "Halim in a convenient capsule format for customers who prefer measured servings.", "Halim seed capsules", 1.21],
  ["Shilajit Capsules", "Capsules", "capsules", "active", "shilajit-capsules.jpg", "Shilajit capsules packaged for simple daily use without mixing powders.", "Shilajit capsules"],
  ["Moringa Capsules", "Capsules", "capsules", "daily-wellness", "moringa-capsules.jpg", "Moringa leaf in an easy capsule format for everyday green nutrition routines.", "Moringa leaf capsules"],
  ["Dandelion Capsules", "Capsules", "capsules", "digestive", "dandelion-capsules.jpg", "Dandelion capsules for customers who prefer a straightforward supplement format.", "Dandelion capsules"],
  ["Holy Basil Capsules", "Capsules", "capsules", "daily-wellness", "holy-basil-capsules.jpg", "Holy basil capsules for a calm, convenient daily botanical routine.", "Holy basil capsules"],
  ["Stinging Nettle Powder", "Herbal Powders", "powders", "daily-wellness", "stinging-nettle-powder.jpg", "A finely milled green nettle powder for simple teas, smoothies, and everyday botanical routines.", "Stinging nettle leaf powder"],
  ["Wild Crafted Sea Moss", "Sea Botanicals", "teas", "daily-wellness", "wild-crafted-sea-moss.jpg", "Whole dried sea moss for soaking, rinsing, and preparing into gels, drinks, or kitchen blends.", "Wild crafted sea moss"],
  ["Baobab Pulp", "Fruit Powders", "powders", "seasonal", "baobab-pulp.jpg", "Tangy baobab pulp with a bright fruit character, ideal for juices, smoothies, and breakfast bowls.", "Baobab fruit pulp"],
  ["Bladderwrack Powder", "Sea Botanicals", "powders", "daily-wellness", "bladderwrack-powder-001.jpg", "A marine botanical powder with a naturally briny profile for careful use in smoothies or water.", "Bladderwrack powder"],
  ["Fenugreek and Halim Seeds", "Seeds & Botanicals", "seeds", "daily-wellness", "fenugreek-halim-seeds.jpg", "A seed blend pairing fenugreek with halim seeds for traditional kitchen and tea preparations.", "Fenugreek seeds, halim seeds"],
  ["Cinnamon Leaves", "Dried Leaves & Teas", "teas", "digestive", "cinnamon-leaves.jpg", "Aromatic dried cinnamon leaves for warm infusions with a soft spice note.", "Cinnamon leaves"],
  ["Papaya Leaf", "Dried Leaves & Teas", "teas", "digestive", "papaya-leaf.jpg", "Dried papaya leaf prepared for herbal infusions and traditional botanical routines.", "Papaya leaf"],
  ["Neem Powder", "Herbal Powders", "powders", "daily-wellness", "neem-powder.jpg", "A bold, earthy neem powder for experienced herbal users who prefer straightforward single-ingredient botanicals.", "Neem leaf powder"],
  ["Cancer Bush", "Dried Leaves & Teas", "teas", "daily-wellness", "cancer-bush.jpg", "A traditional dried botanical sold under its common product name, prepared for careful tea use.", "Cancer bush herb"],
  ["Senna Pods", "Seeds & Botanicals", "teas", "digestive", "senna-pods.jpg", "Whole senna pods for occasional herbal tea preparation, clearly suited to experienced users.", "Senna pods"],
  ["Cerasee", "Dried Leaves & Teas", "teas", "daily-wellness", "cerasee.jpg", "A characterful bitter herb traditionally prepared as a cleansing-style tea.", "Cerasee herb"],
  ["Soursop Leaves", "Dried Leaves & Teas", "teas", "daily-wellness", "soursop-leaves.jpg", "Dried soursop leaves with a mellow herbal aroma for slow-steeped infusions.", "Soursop leaves"],
  ["Guava Leaves", "Dried Leaves & Teas", "teas", "digestive", "guava-leaves.jpg", "Dried guava leaves for a smooth, gently tannic herbal tea.", "Guava leaves"],
  ["Neem Leaves", "Dried Leaves & Teas", "teas", "daily-wellness", "neem-leaves.jpg", "Whole dried neem leaves for traditional bitter infusions and external herbal preparations.", "Neem leaves"],
  ["Tongkat Ali Powder", "Herbal Powders", "powders", "active", "tongkat-ali-powder.jpg", "A concentrated botanical powder with a strong, bitter taste for targeted daily routines.", "Tongkat ali root powder"],
  ["Pimento Seeds", "Seeds & Botanicals", "seeds", "digestive", "pimento-seeds.jpg", "Whole pimento seeds with warm spice notes for teas, cooking, and botanical blends.", "Pimento seeds"],
  ["Wormwood", "Dried Leaves & Teas", "teas", "digestive", "wormwood.jpg", "A very bitter traditional herb for carefully measured infusions.", "Wormwood herb"],
  ["Halim Seeds", "Seeds & Botanicals", "seeds", "daily-wellness", "halim-seeds.jpg", "Small, nutrient-dense halim seeds for soaking, drinks, and traditional recipes.", "Halim seeds"],
  ["Shilajit Powder", "Mineral & Resin Powders", "powders", "active", "shilajit-powder.jpg", "A mineral-rich shilajit powder for customers who prefer loose-format preparations.", "Shilajit powder"],
  ["Wheat Grass Powder", "Green Powders", "powders", "daily-wellness", "wheat-grass-powder.jpg", "A clean green powder for smoothies, juices, and morning wellness blends.", "Wheat grass powder"],
  ["Gotu Kola Powder", "Herbal Powders", "powders", "daily-wellness", "gotu-kola-powder.jpg", "Finely ground gotu kola for teas, smoothies, or simple botanical blends.", "Gotu kola powder"],
  ["Liquorice Powder", "Root Powders", "powders", "digestive", "liquorice-powder.jpg", "Naturally sweet liquorice root powder for warm drinks and herbal blends.", "Liquorice root powder"],
  ["Cinnamon Bark", "Dried Roots & Barks", "teas", "digestive", "cinnamon-bark.jpg", "Fragrant cinnamon bark for simmering into warming teas and kitchen infusions.", "Cinnamon bark"],
  ["Turmeric Powder", "Spice Powders", "powders", "active", "turmeric-powder.jpg", "A golden turmeric powder for cooking, warm drinks, and daily wellness blends.", "Turmeric powder"],
  ["Turmeric Mix", "Spice Powders", "powders", "active", "turmeric-mix.jpg", "A ready-to-use turmeric blend with black pepper for drinks and recipes.", "Turmeric powder, black pepper", 1.27],
  ["Black Pepper", "Seeds & Botanicals", "seeds", "digestive", "black-pepper.jpg", "Whole black peppercorns for food, teas, and pairing with turmeric blends.", "Black peppercorns"],
  ["Cloves", "Seeds & Botanicals", "seeds", "digestive", "cloves.jpg", "Whole cloves with a deep warming aroma for teas, cooking, and spice blends.", "Cloves"],
  ["King of the Forest", "Dried Leaves & Teas", "teas", "daily-wellness", "king-of-the-forest.jpg", "A traditional dried herb sold under its common product name for tea preparation.", "King of the Forest herb"],
  ["Catuaba Bark", "Dried Roots & Barks", "teas", "active", "catuaba-bark.jpg", "Cut catuaba bark for slow-simmered teas and traditional botanical routines.", "Catuaba bark"],
  ["Moringa Powder", "Green Powders", "powders", "daily-wellness", "moringa-powder.jpg", "A versatile moringa leaf powder for smoothies, soups, sauces, and everyday green blends.", "Moringa leaf powder"],
  // The old "sea-moss-powder*.jpg" files were actually photos of a
  // Bladderwrack Powder pouch (mislabeled), so this card showed the wrong
  // product. Those files have been deleted; use the real Sea Moss Powder
  // 500g shot. The Bladderwrack listing keeps its own photo.
  ["Sea Moss Powder", "Sea Botanicals", "powders", "daily-wellness", "ZOZ_2050.JPG", "A convenient powdered sea moss format for blending into drinks and foods.", "Sea moss powder"],
  ["Black Maca Powder", "Root Powders", "powders", "active", "black-maca-powder-original.jpg", "A rich, malty black maca powder for smoothies, oats, and warm drinks.", "Black maca root powder", 1.08],
  ["Senna Powder", "Herbal Powders", "powders", "digestive", "senna-powder.jpg", "A powdered senna format for occasional, careful use as directed on the label.", "Senna leaf powder"],
  ["Lemongrass", "Dried Leaves & Teas", "teas", "digestive", "lemongrass.jpg", "Bright dried lemongrass for refreshing hot or iced herbal tea.", "Lemongrass"],
  ["Spanish Sarsaparilla", "Dried Roots & Barks", "teas", "active", "spanish-sarsaparilla.jpg", "A traditional root botanical with an earthy aroma for slow-simmered infusions.", "Spanish sarsaparilla root"],
  ["Cayenne Powder", "Spice Powders", "powders", "digestive", "cayenne-powder.jpg", "A hot cayenne powder for customers who want bold heat in drinks or recipes.", "Cayenne pepper powder"],
  ["Fenugreek Powder", "Seed Powders", "powders", "daily-wellness", "fenugreek-powder.jpg", "Ground fenugreek with a warm, nutty bitterness for food and botanical blends.", "Fenugreek seed powder"],
  ["Halim Capsules", "Capsules", "capsules", "daily-wellness", "halim-capsules.jpg", "Halim in a convenient capsule format for customers who prefer measured servings.", "Halim seed capsules", 1.21],
  ["Shilajit Capsules", "Capsules", "capsules", "active", "shilajit-capsules.jpg", "Shilajit capsules packaged for simple daily use without mixing powders.", "Shilajit capsules"],
  ["Moringa Capsules", "Capsules", "capsules", "daily-wellness", "moringa-capsules.jpg", "Moringa leaf in an easy capsule format for everyday green nutrition routines.", "Moringa leaf capsules"],
  ["Dandelion Capsules", "Capsules", "capsules", "digestive", "dandelion-capsules.jpg", "Dandelion capsules for customers who prefer a straightforward supplement format.", "Dandelion capsules"],
  ["Holy Basil Capsules", "Capsules", "capsules", "daily-wellness", "holy-basil-capsules.jpg", "Holy basil capsules for a calm, convenient daily botanical routine.", "Holy basil capsules"],
  ["Tongkat Ali Capsules", "Capsules", "capsules", "active", "tongkat-ali-capsules.jpg", "Tongkat ali in capsule form for customers who prefer not to taste the bitter powder.", "Tongkat ali capsules"],
  ["Ashwagandha Capsules", "Capsules", "capsules", "daily-wellness", "ashwagandha-capsules.jpg", "Ashwagandha capsules for everyday balance routines and simple serving control.", "Ashwagandha capsules"],
  ["Oregano Capsules", "Capsules", "capsules", "seasonal", "oregano-capsules.jpg", "Oregano capsules for a compact, easy-to-store botanical supplement option.", "Oregano capsules", 1.33],
  ["Bitter Melon Capsules", "Capsules", "capsules", "daily-wellness", "bitter-melon-capsules.jpg", "Bitter melon capsules with a clean bottle format for daily routines.", "Bitter melon capsules"],
  ["Beard Oil", "Oils & Grooming", "oils", "beauty", "beard-oil.jpg", "A grooming oil for softening facial hair and adding a clean, polished finish.", "Botanical beard oil"],
  ["Black Castor Oil", "Oils & Grooming", "oils", "beauty", "black-castor-oil.jpg", "A rich castor oil for hair, scalp, and external beauty routines.", "Black castor oil"],
  ["Moringa Oil Cold Pressed", "Oils & Grooming", "oils", "beauty", "moringa-oil-cold-pressed-original-v6.jpg", "A pure, nutrient-dense cold-pressed moringa oil for skin hydration and external beauty care.", "Cold pressed moringa oil"],
  ["Sting Nettle Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1934.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Chaney Root", "New Arrivals", "powders", "daily-wellness", "ZOZ_1937.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Sting Nettle Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1939.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cinnamon Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_1941.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Moringa Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_1944.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Bladderwrack", "New Arrivals", "powders", "daily-wellness", "ZOZ_1946.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_1950.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_1952.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Purple Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_1954.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Senna Pods", "New Arrivals", "powders", "daily-wellness", "ZOZ_1956.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cerasee", "New Arrivals", "powders", "daily-wellness", "ZOZ_1957.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Mango Leaves Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1959.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Papaya Leave", "New Arrivals", "powders", "daily-wellness", "ZOZ_1961.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Papaya Leave", "New Arrivals", "powders", "daily-wellness", "ZOZ_1963.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Baobab Pulp", "New Arrivals", "powders", "daily-wellness", "ZOZ_1965.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Guava Leaves Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1967.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Guava Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_1970.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Neem Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_1971.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Neem Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1974.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Sarsaparilla Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1984.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Tongkat Ali Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1986.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cancer Bush", "New Arrivals", "powders", "daily-wellness", "ZOZ_1987.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Pimento Seed", "New Arrivals", "powders", "daily-wellness", "ZOZ_1989.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wormwood", "New Arrivals", "powders", "daily-wellness", "ZOZ_1994.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Fenugreek & Halim Seeds", "New Arrivals", "powders", "daily-wellness", "ZOZ_1995.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Halim Seeds", "New Arrivals", "powders", "daily-wellness", "ZOZ_1998.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Shilajit Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_1999.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wheat Grass Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2002.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Gotu Kola Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2004.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Licorice Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2007.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cinnamon Bark", "New Arrivals", "powders", "daily-wellness", "ZOZ_2010.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cinnamon Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2011.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Turmeric Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2013.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Turmeric Mix", "New Arrivals", "powders", "daily-wellness", "ZOZ_2016.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Pepper", "New Arrivals", "powders", "daily-wellness", "ZOZ_2018.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Pepper", "New Arrivals", "powders", "daily-wellness", "ZOZ_2019.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Pepper Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2020.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Stinging Nettle, Avocado And Pumpkin Seed Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2022.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Nutmeg", "New Arrivals", "powders", "daily-wellness", "ZOZ_2024.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cloves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2026.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Spanish Needle", "New Arrivals", "powders", "daily-wellness", "ZOZ_2028.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Fenugreek Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2031.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["King Of The Forest", "New Arrivals", "powders", "daily-wellness", "ZOZ_2032.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Lemongrass", "New Arrivals", "powders", "daily-wellness", "ZOZ_2035.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Osu Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2037.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Soursop Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2040.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Baobab Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2043.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Baobab Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2045.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cayenne Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2046.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Moringa Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2048.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Sea Moss Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2050.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Sea Moss Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2052.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Maca Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2054.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Moringa Setenopetala Seed", "New Arrivals", "powders", "daily-wellness", "ZOZ_2059.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cayenne Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2066.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Osu Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2075.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Soursop Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2077.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Lemongrass", "New Arrivals", "powders", "daily-wellness", "ZOZ_2079.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cinnamon Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2080.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Pepper", "New Arrivals", "powders", "daily-wellness", "ZOZ_2083.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Fenugreek Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2084.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wheat Grass Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2086.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cinnamon Bark", "New Arrivals", "powders", "daily-wellness", "ZOZ_2088.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Shilajit Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2092.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Stinging Nettle, Avocado and Pumpkin Seed Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2096.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Licorice Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2100.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Turmeric Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2106.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Turmeric Mix", "New Arrivals", "powders", "daily-wellness", "ZOZ_2108.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Spanish Needle", "New Arrivals", "powders", "daily-wellness", "ZOZ_2112.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Mango Leaves Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2125.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Neem Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2130.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Neem Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2134.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Senna Pods", "New Arrivals", "powders", "daily-wellness", "ZOZ_2137.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_2142.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Purple Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_2144.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Papaya Leave", "New Arrivals", "powders", "daily-wellness", "ZOZ_2147.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cerasee", "New Arrivals", "powders", "daily-wellness", "ZOZ_2148.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cerasee", "New Arrivals", "powders", "daily-wellness", "ZOZ_2149.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Halim Seeds", "New Arrivals", "powders", "daily-wellness", "ZOZ_2151.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cinnamon Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2154.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Moringa Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2156.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Bladderwrack", "New Arrivals", "powders", "daily-wellness", "ZOZ_2159.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Baobab Pulp", "New Arrivals", "powders", "daily-wellness", "ZOZ_2160.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Bladderwrack", "New Arrivals", "powders", "daily-wellness", "ZOZ_2162.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Halim Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2171.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Beetroot Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2174.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Shilajit Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2176.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Stinging Nettle Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2178.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Turmeric Mix Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2180.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Nettle, Avocado And Pumpkin Seed Vegan Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2185.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Acai Berry", "New Arrivals", "powders", "daily-wellness", "ZOZ_2188.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Dandelion", "New Arrivals", "powders", "daily-wellness", "ZOZ_2190.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Osu", "New Arrivals", "powders", "daily-wellness", "ZOZ_2192.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Holi Basil", "New Arrivals", "powders", "daily-wellness", "ZOZ_2194.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Nishati", "New Arrivals", "powders", "daily-wellness", "ZOZ_2200.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Tonkat Ali", "New Arrivals", "powders", "daily-wellness", "ZOZ_2206.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Clove, Wormwood & Black Walnut", "New Arrivals", "powders", "daily-wellness", "ZOZ_2208.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Aswagandha KSM-66", "New Arrivals", "powders", "daily-wellness", "ZOZ_2211.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Aswagandha KSM-66", "New Arrivals", "powders", "daily-wellness", "ZOZ_2212.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Testosterone Booster", "New Arrivals", "powders", "daily-wellness", "ZOZ_2216.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Moringa Seed Capsules", "Capsules", "capsules", "daily-wellness", "ZOZ_2221.JPG", "Moringa seed in an easy 1,000 mg capsule format — two capsules once a day with water.", "Moringa seed capsules"],
  ["Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_2223.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Oregano", "New Arrivals", "powders", "daily-wellness", "ZOZ_2226.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Soursop, Mango, And Moringa Vegan Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2228.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Bitter Melon Vegan Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2234.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Ginkgo Biloba Capsule", "New Arrivals", "powders", "daily-wellness", "ZOZ_2237.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Shilajit", "New Arrivals", "powders", "daily-wellness", "ZOZ_2241.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Coconut", "New Arrivals", "powders", "daily-wellness", "ZOZ_2246.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Seed Oil", "New Arrivals", "powders", "daily-wellness", "ZOZ_2249.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Himalayan Pink Salt Fine", "New Arrivals", "powders", "daily-wellness", "ZOZ_2254.JPG", "Fine-ground Himalayan pink salt for everyday cooking and seasoning.", "Himalayan pink salt (fine)"],
  ["Himalayan Pink Salt Coarse", "New Arrivals", "powders", "daily-wellness", "ZOZ_2257.JPG", "Coarse Himalayan pink salt crystals for grinders, brines, and bath soaks.", "Himalayan pink salt (coarse)"],
  ["Jimerito Honey", "New Arrivals", "powders", "daily-wellness", "ZOZ_2260.JPG", "A rare stingless-bee (jimerito) honey with a distinctive tangy, floral character.", "Jimerito (stingless bee) honey"],
  ["Cinnamon Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2878.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Baobab Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2881.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Bladderwrack Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2883.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Turmeric Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2885.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Pepper", "New Arrivals", "powders", "daily-wellness", "ZOZ_2891.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Turmeric Mix", "New Arrivals", "powders", "daily-wellness", "ZOZ_2892.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Stinging Nettle, Avocado and Pumpkin Seed Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2896.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wild Crafted Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_2900.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Cinnamon Bark", "New Arrivals", "powders", "daily-wellness", "ZOZ_2904.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Lemongrass", "New Arrivals", "powders", "daily-wellness", "ZOZ_2906.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Soursop Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2909.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Pimento Seed", "New Arrivals", "powders", "daily-wellness", "ZOZ_2910.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Baobab Pulp", "New Arrivals", "powders", "daily-wellness", "ZOZ_2913.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Wormwood", "New Arrivals", "powders", "daily-wellness", "ZOZ_2922.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Gotu Kola Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2925.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Senna Pods", "New Arrivals", "powders", "daily-wellness", "ZOZ_2928.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Mango Leaves Powder", "New Arrivals", "powders", "daily-wellness", "ZOZ_2932.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Guava Leaves", "New Arrivals", "powders", "daily-wellness", "ZOZ_2933.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Chia Seeds", "New Arrivals", "powders", "daily-wellness", "ZOZ_2943.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Flax Seed", "New Arrivals", "powders", "daily-wellness", "ZOZ_2947.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  // Products from "new product list and prices.docx" (2026-07-17).
  // Photos supplied by the owner in "D:\TZ added products" (2026-07-17).
  ["Tamarind Powder", "New Arrivals", "powders", "digestive", "tamarind-powder.jpg", "Tangy tamarind fruit powder for drinks, sauces, and traditional recipes.", "Tamarind fruit powder"],
  ["Black Seed", "New Arrivals", "seeds", "daily-wellness", "black-seed.jpg", "Whole black seeds for culinary use and traditional preparations.", "Black seed (nigella sativa)"],
  ["Jamaica Guaco", "New Arrivals", "teas", "daily-wellness", "jamaica-guaco.jpg", "A traditional dried herb prepared for slow-steeped infusions.", "Guaco herb"],
  ["Cordyceps Powder", "New Arrivals", "powders", "active", "cordyceps-powder.jpg", "A fine cordyceps mushroom powder for smoothies, coffee, and warm drinks.", "Cordyceps mushroom powder"],
  ["Medina", "New Arrivals", "teas", "active", "medina.jpg", "A traditional dried herb sold under its common product name for tea preparation.", "Medina herb"],
  ["Horny Goat Weed", "New Arrivals", "teas", "active", "horny-goat-weed.jpg", "A traditional dried botanical for carefully measured infusions.", "Horny goat weed herb"],
  ["Guinea Hen Weed", "New Arrivals", "teas", "daily-wellness", "guinea-hen-weed.jpg", "A strong traditional herb for slow-steeped infusions and botanical routines.", "Guinea hen weed herb"],
  ["Lion's Mane Mushrooms", "New Arrivals", "powders", "daily-wellness", "lions-mane-mushrooms.jpg", "Dried lion's mane mushroom for teas, broths, and everyday botanical blends.", "Lion's mane mushroom"],
  ["7 Mushroom Blend", "New Arrivals", "powders", "daily-wellness", "7-mushroom-blend.jpg", "A seven-mushroom powder blend for smoothies, coffee, and warm drinks.", "Reishi, chaga, shiitake, lion's mane, cordyceps, maitake, tremella"],
  ["Damiana Leaves", "New Arrivals", "teas", "daily-wellness", "damiana-leaves.jpg", "Dried damiana leaves with a soft herbal aroma for relaxing infusions.", "Damiana leaves"],
  ["Sangre de Grado", "New Arrivals", "oils", "beauty", "sangre-de-grado.jpg", "A traditional tree-sap botanical for external self-care use as directed on the label.", "Sangre de grado resin"],
  ["Shilajit Honey", "New Arrivals", "powders", "active", "shilajit-honey.jpg", "A shilajit and honey preparation for stirring into warm water or drinks.", "Honey, shilajit"],
  ["Snuff Powder", "New Arrivals", "powders", "daily-wellness", "snuff-powder.jpg", "A finely milled traditional botanical powder sold under its common product name.", "Botanical snuff powder"],
  ["Black Seed Soap", "New Arrivals", "body-care", "beauty", "black-seed-soap.jpg", "A black seed soap bar for everyday external cleansing routines.", "Black seed soap"],
  ["Ashwagandha Drops", "New Arrivals", "powders", "daily-wellness", "ashwagandha-drops.jpg", "Ashwagandha in a convenient liquid drop format for measured daily servings.", "Ashwagandha extract"],
  ["Traditional Chinese Herbal Formula (Back Tension)", "New Arrivals", "teas", "active", "tcm-back-tension.jpg", "A traditional Chinese herbal blend prepared for infusion as directed on the label.", "Traditional Chinese herbal blend"],
  ["Traditional Chinese Herbal Formula (Joint Stiffness)", "New Arrivals", "teas", "active", "tcm-joint-stiffness.jpg", "A traditional Chinese herbal blend prepared for infusion as directed on the label.", "Traditional Chinese herbal blend"],
  // Owner additions provided in chat (2026-07-18), photos in "D:\TZ added products".
  ["Fennel Capsules", "Capsules", "capsules", "digestive", "fennel-capsules.jpg", "Fennel seed in a convenient 1,000 mg capsule format for everyday digestive and appetite routines.", "Fennel seed capsules"],
  ["Raw Cocoa Butter", "Body Care", "body-care", "beauty", "raw-cocoa-butter.jpg", "Unrefined, organic raw cocoa butter that keeps its natural chocolate aroma, for moisturizing skin, softening stretch marks, and homemade lip balms.", "Raw cocoa butter"]
];

// Product descriptions taken VERBATIM from the owner's official product-label
// artwork (PDFs in "D:\wholesale\product description", provided 2026-07-23).
// Per the owner's instruction (2026-07-23), the Description shown in the shop
// "Learn More" panel must be the label's own wording — including the
// disease/treatment claims printed on the labels — and NOT any copy of ours.
//
// Two cases, keyed by normalized product name:
//   1. Labels that carry a DESCRIPTION paragraph -> `description` is that
//      paragraph verbatim (only obvious OCR typos fixed, e.g. "trengthens" ->
//      "strengthens"; no claims added or removed). `keyIngredients` is the
//      label's own ingredient/botanical identity.
//   2. Capsule / benefit-only labels (Shilajit, Ashwagandha, Tongkat Ali,
//      Nishati) have NO description paragraph — only a benefits list and an
//      ingredients list. For these we carry ONLY the label's `keyIngredients`
//      and leave `description` unset, so it falls back to the pre-existing
//      owner-written catalog text (never ours). Their benefit wording appears
//      in the separate Key Benefits section (see KEY_BENEFITS below).
//
// Black Walnut and Neem Oil labels have no standalone catalog product yet, so
// they're omitted pending the full list. NOTE: plain "Shilajit" (the resin
// jar) and "Nishati" have no label description paragraph and no owner catalog
// text, so their Description still shows the generic placeholder — flagged for
// the owner to supply wording.
const DESCRIPTION_OVERRIDES = {
  // --- 1. Labels WITH a description paragraph: verbatim label text ---
  "catuaba bark": {
    description: "Catuaba is a herbal remedy derived from the bark of a tree native to Brazil. They say Catuaba makes the old young again and the young never age. The use is to enhance libido and sexual performance in both men and women. It also enhances brain function, energy levels, and overall well-being. Catuaba boosts your dopamine so the brain functions better. Take two capsules daily. From what we know, dopamine basically shuts off negative emotion.",
    keyIngredients: "Catuaba bark extract, vegetable capsule"
  },
  "clove, wormwood & black walnut": {
    description: "This herbal blend is used to help eliminate parasites in the gastrointestinal tract while supporting overall gut health. These herbs have been used for centuries to address parasitic infections, including pinworms, roundworms, and tapeworms, and to help relieve symptoms associated with malaria. This combination is also beneficial for regulating menstrual cramps. This blend is not recommended for pregnant or breastfeeding women, individuals with epilepsy, or children. It should only be taken for a maximum of four weeks.",
    keyIngredients: "Clove, wormwood, black walnut"
  },
  "fenugreek & halim seeds": {
    description: "This combination can be used to support women who struggle with heavy periods — take one teaspoon of this powder per day. Fenugreek and halim seeds mix are a rich source of protein, magnesium, iron, copper, folate, manganese, and dietary fibre. This mix is good for post-pregnancy care as it is a rich source of calcium and vitamins, and it is a very good nutrition supplement for post-pregnancy recovery. This mix has amazing benefits for great health.",
    keyIngredients: "Fenugreek seed, halim (garden cress) seed"
  },
  "fenugreek and halim seeds": {
    description: "This combination can be used to support women who struggle with heavy periods — take one teaspoon of this powder per day. Fenugreek and halim seeds mix are a rich source of protein, magnesium, iron, copper, folate, manganese, and dietary fibre. This mix is good for post-pregnancy care as it is a rich source of calcium and vitamins, and it is a very good nutrition supplement for post-pregnancy recovery. This mix has amazing benefits for great health.",
    keyIngredients: "Fenugreek seed, halim (garden cress) seed"
  },
  "tamarind powder": {
    description: "Tamarind was used by the Tamils in south India in ancient times as a natural medicine. It also contains vitamin C, B, E, calcium, iron, potassium, manganese, phosphorus, and fibre. Tamarind helps your stomach to digest foods faster, as it stimulates the activity of bile. This tamarind powder can also be used to lower high blood pressure, as the potassium within works as a vasodilator to lower cardiovascular stress.",
    keyIngredients: "Tamarind fruit powder"
  },
  "wormwood": {
    description: "Wormwood is used to support gut health, which plays a central role in overall body function. This herb has been used for centuries to help address parasitic infections, specifically pinworms, roundworms, and tapeworms. It may also help relieve symptoms associated with malaria and is beneficial for regulating menstrual cramps.",
    keyIngredients: "Wormwood (Artemisia absinthium)"
  },
  "cancer bush": {
    description: "This herb has been a cornerstone in herbal medicine for centuries. Cancer bush is renowned for its ability to bolster the immune system; it strengthens the body's defences against various diseases, helping to ward off infections and illnesses effectively. Also cancer-fighting potential — although more research is needed — the bush offering hope for its use as a supplementary treatment. Antioxidant benefit: packed with antioxidants, the bush helps neutralize harmful free radicals in the body, which can reduce oxidative stress and lower risk of chronic diseases. Also good to reducing symptoms of anxiety.",
    keyIngredients: "Cancer bush (Sutherlandia frutescens)"
  },
  "halim seeds": {
    description: "The nutrients found in halim seeds include vitamins C and E, zinc, iron, and selenium. These nutrients play an important role in keeping the immune system functioning properly. Halim also keeps cholesterol levels in check. Halim seeds can be a great addition to the diet of pregnant women as they are rich in folic acid, iron, and calcium. Directions: boil one teaspoon to one cup of water for 10 minutes; use daily.",
    keyIngredients: "Halim (garden cress) seeds"
  },
  "king of the forest": {
    description: "The leaves are rubbed on the skin to treat herpes simplex virus, for fungal infections such as ringworm, athlete's foot and other skin fungi, scabies and other parasitic infections, skin blemishes, liver spots, eczema, and rashes. The leaves are said to be useful for promoting menstruation and improving blood circulation in females. The tea made from the leaves is used to purify the blood, combat constipation, for shortness of breath, and also to help with swelling, joint pain, and inflammation associated with arthritis. The whole plant is used for malaria. This herb is truly the king of the forest.",
    keyIngredients: "King of the Forest leaves"
  },

  // --- 2. Capsule / benefit-only labels: no description paragraph exists, so
  //        we carry ONLY the label's ingredient list and let the Description
  //        fall back to the owner's catalog text. ---
  "ashwagandha capsules": { keyIngredients: "Ashwagandha root extract (Withania somnifera), vegetable capsule" },
  "shilajit capsules": { keyIngredients: "Shilajit extract, vegetable capsule" },
  "tongkat ali capsules": { keyIngredients: "Tongkat Ali extract, vegetable capsule" },
  "nishati": { keyIngredients: "Ashwagandha (Withania somnifera), safed musli (Chlorophytum borivilianum), shilajit, vegetable capsule" }
};

// Key Benefits, taken VERBATIM from the owner's official product-label artwork
// (PDFs in "D:\wholesale\product description"). Per the owner's instruction
// (2026-07-23) this section uses only the labels' own wording — including the
// disease/treatment claims printed on them — and no copy of our own. Keyed by
// normalized product name; only products whose label carries benefit text
// appear here, so the shop's "Key Benefits" section is shown only for them.
// (Black Walnut and Neem Oil labels have no standalone catalog product yet.)
const KEY_BENEFITS = {
  // Capsule labels — explicit BENEFITS bullet lists.
  "shilajit capsules": ["Enhances Energy & Stamina", "Promotes Healthy Aging", "Supports Cognitive Function", "Boosts Immune System"],
  "shilajit powder": ["Enhances Energy & Stamina", "Promotes Healthy Aging", "Supports Cognitive Function", "Boosts Immune System"],
  "shilajit": ["Enhances Energy & Stamina", "Promotes Healthy Aging", "Supports Cognitive Function", "Boosts Immune System"],
  "ashwagandha capsules": ["Reduces Stress & Anxiety", "Boosts Brain Function & Memory", "Enhances Muscle Strength", "Supports Immune Health"],
  "tongkat ali capsules": ["Improve Concentration", "Increase Fertility (Both Men and Women)", "Boost Testosterone", "Reduces Stress"],
  // Prose labels — benefit statements in the labels' own words.
  "catuaba bark": [
    "Enhance libido and sexual performance in both men and women",
    "Enhance brain function, energy levels and overall well-being",
    "Boost dopamine in the brain to function better"
  ],
  "clove, wormwood & black walnut": [
    "Helps eliminate parasites in the gastrointestinal tract while supporting overall gut health",
    "Used for centuries to address parasitic infections, including pinworms, roundworms, and tapeworms",
    "Helps relieve symptoms associated with malaria",
    "Beneficial for regulating menstrual cramps"
  ],
  "wormwood": [
    "Supports gut health, which plays a central role in overall body function",
    "Used for centuries to help address parasitic infections — pinworms, roundworms, and tapeworms",
    "May help relieve symptoms associated with malaria",
    "Beneficial for regulating menstrual cramps"
  ],
  "cancer bush": [
    "Bolsters the immune system and strengthens the body's defences against various diseases",
    "Cancer-fighting potential (although more research is needed)",
    "Packed with antioxidants that help neutralize harmful free radicals, reducing oxidative stress",
    "Good for reducing symptoms of anxiety"
  ],
  "tamarind powder": [
    "Contains vitamin C, B, E, calcium, iron, potassium, manganese, phosphorus, and fibre",
    "Helps your stomach digest food faster by stimulating the activity of bile",
    "Can be used to lower high blood pressure — its potassium works as a vasodilator to lower cardiovascular stress"
  ],
  "fenugreek & halim seeds": [
    "A rich source of protein, magnesium, iron, copper, folate, manganese, and dietary fibre",
    "Supports women who struggle with heavy periods",
    "Good for post-pregnancy care and recovery — a rich source of calcium and vitamins"
  ],
  "fenugreek and halim seeds": [
    "A rich source of protein, magnesium, iron, copper, folate, manganese, and dietary fibre",
    "Supports women who struggle with heavy periods",
    "Good for post-pregnancy care and recovery — a rich source of calcium and vitamins"
  ],
  "halim seeds": [
    "Rich in vitamins C and E, zinc, iron, and selenium to help keep the immune system functioning properly",
    "Helps keep cholesterol levels in check",
    "Rich in folic acid, iron, and calcium — a great addition to the diet of pregnant women"
  ],
  "halim capsules": [
    "Rich in vitamins C and E, zinc, iron, and selenium to help keep the immune system functioning properly",
    "Helps keep cholesterol levels in check",
    "Rich in folic acid, iron, and calcium — a great addition to the diet of pregnant women"
  ],
  "king of the forest": [
    "Leaves are rubbed on the skin to treat herpes simplex virus and fungal infections such as ringworm and athlete's foot",
    "Traditionally used for skin blemishes, liver spots, eczema, and rashes",
    "Said to help promote menstruation and improve blood circulation in women",
    "Tea is used to purify the blood, combat constipation, and ease swelling, joint pain, and inflammation associated with arthritis",
    "The whole plant is used for malaria"
  ]
};

function makeProduct(item, index) {
  const [name, category, format, concern, imageFile, rawShortDescription, rawKeyIngredients, imageScale] = item;
  const defaults = formatDefaults[format];
  const topical = format === "oils" || format === "body-care" || format === "soaps" || format === "rubb";

  // Prefer an official-label description/ingredient list when we have one.
  const override = DESCRIPTION_OVERRIDES[normalizeName(name)];
  const shortDescription = override?.description ?? rawShortDescription;
  const keyIngredients = override?.keyIngredients ?? rawKeyIngredients;

  return {
    id: index + 1,
    name,
    category,
    format,
    concern,
    imageScale: imageScale || null,
    price: PRICE_OVERRIDES[normalizeName(name)] ?? defaults.price,
    currency: "TZS",
    image: `/images/products/royal-herbs/${imageFile}`,
    imageAlt: `Royal Maroon Herbs ${name} product packaging.`,
    shortDescription,
    keyIngredients,
    fullIngredients: keyIngredients.split(",").map((ingredient) => ingredient.trim()),
    keyBenefits: KEY_BENEFITS[normalizeName(name)] ?? null,
    usageInstructions: defaults.usageInstructions,
    servingGuidance: defaults.servingGuidance,
    warnings: topical
      ? [
          "For external use only unless the product label states otherwise.",
          "Patch test before first use.",
          "Discontinue use if irritation occurs."
        ]
      : standardWarnings,
    contraindications: topical
      ? ["Avoid use on broken or irritated skin.", "Avoid contact with eyes."]
      : ["Do not use as a substitute for medical advice or prescribed treatment."],
    allergyWarning: "Check the ingredient list carefully before use. Avoid if sensitive or allergic to this botanical.",
    storageInstructions: defaults.storageInstructions,
    healthDisclaimer: disclaimer,
    suitableFor: topical
      ? ["Customers seeking natural external self-care products", "Routine grooming and beauty rituals"]
      : ["Adults seeking traditional botanical products", "Customers who prefer single-ingredient herbal formats"],
    notSuitableFor: topical
      ? ["Infants", "Use on broken, irritated, or infected skin"]
      : ["Children unless advised by a qualified professional", "Pregnant or breastfeeding customers without professional guidance"]
  };
}

// Clean the catalog before building products:
// 1) Correct the `format` for items whose name makes their true category
//    obvious (the "New Arrivals" batch was all tagged "powders", so e.g.
//    "Stinging Nettle Capsules" was landing under Powder instead of Capsules).
// 2) Remove repeated products — keep the first occurrence of each name
//    (case-insensitive), which drops the duplicated core block and the
//    repeated New Arrivals re-shoots.
// Products whose true format isn't inferable from the name (the photo/product
// differs from the listing text). Keyed by normalized name.
const FORMAT_OVERRIDES = {
  'catuaba bark': 'capsules',
  // The "New Arrivals" re-shoot batch was all tagged "powders" in the catalog,
  // but each product photo shows its true format. Route each to the section it
  // actually belongs in (verified 2026-07-18 against the product images).
  // Capsule bottles:
  'acai berry': 'capsules',
  'osu': 'capsules',
  'nishati': 'capsules',
  'clove, wormwood & black walnut': 'capsules',
  'aswagandha ksm-66': 'capsules',
  'testosterone booster': 'capsules',
  'sea moss': 'capsules',
  // Cold-pressed oil (pump bottle):
  'coconut': 'oils',
  // Whole dried leaves / roots / sea vegetables, steeped like the other teas:
  'moringa leaves': 'teas',
  'chaney root': 'teas',
  'wild crafted bladderwrack': 'teas',
  'wild crafted purple sea moss': 'teas',
  'spanish needle': 'teas',
  // Whole seeds:
  'nutmeg': 'seeds',
  'moringa setenopetala seed': 'seeds',
  'chia seeds': 'seeds',
  'flax seed': 'seeds',
  // Standalone Botanicals sections (2026-07-19): route these into their own
  // headers (Rubb, Natural Honey, Salts, Soaps) instead of Powders/Teas/Oils/
  // Body Care. Verified against the product photos.
  'traditional chinese herbal formula (back tension)': 'rubb',  // 60ml topical pain liniment
  'traditional chinese herbal formula (joint stiffness)': 'rubb',
  'shilajit honey': 'honey',
  'jimerito honey': 'honey',
  'himalayan pink salt fine': 'salts',
  'himalayan pink salt coarse': 'salts',
  'sangre de grado': 'soaps',   // "Jabón Sangre de Grado" — a soap bar
  'black seed soap': 'soaps'
};

function correctFormat(item) {
  const [name] = item;
  const copy = [...item];
  const key = name.toLowerCase().replace(/\s+/g, ' ').trim();
  if (FORMAT_OVERRIDES[key]) copy[2] = FORMAT_OVERRIDES[key];
  else if (/capsule/i.test(name)) copy[2] = 'capsules';
  else if (/\boils?\b/i.test(name)) copy[2] = 'oils';
  return copy;
}

// Products to drop outright. These are either mislabeled or spelling-variant
// re-shoots of a product already in the catalog under its proper name, which
// the exact-name dedup below cannot catch. Removing them keeps the canonical
// entry and avoids the same product appearing twice (verified 2026-07-18).
const REMOVE_NAMES = new Set([
  'stinging nettle powder',  // photo is actually capsules; real powder is "Sting Nettle Powder", capsules are "Stinging Nettle Capsules"
  'papaya leave',            // re-shoot of "Papaya Leaf"
  'pimento seed',            // re-shoot of "Pimento Seeds"
  'fenugreek & halim seeds', // re-shoot of "Fenugreek and Halim Seeds"
  'licorice powder',         // re-shoot of "Liquorice Powder"
  'dandelion',               // re-shoot of "Dandelion Capsules"
  'holi basil',              // re-shoot of "Holy Basil Capsules"
  'tonkat ali',              // re-shoot of "Tongkat Ali Capsules"
  'oregano'                  // re-shoot of "Oregano Capsules"
]);

const seenNames = new Set();
const cleanedCatalog = catalog
  .map(correctFormat)
  .filter((item) => {
    const key = item[0].toLowerCase().replace(/\s+/g, ' ').trim();
    if (REMOVE_NAMES.has(key)) return false;
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

export const products = cleanedCatalog.map(makeProduct);
