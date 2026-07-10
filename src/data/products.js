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
  }
};

const catalog = [
  ["Stinging Nettle Powder", "Herbal Powders", "powders", "daily-wellness", "stinging-nettle-powder.jpg", "A finely milled green nettle powder for simple teas, smoothies, and everyday botanical routines.", "Stinging nettle leaf powder"],
  ["Wild Crafted Sea Moss", "Sea Botanicals", "teas", "daily-wellness", "wild-crafted-sea-moss.jpg", "Whole dried sea moss for soaking, rinsing, and preparing into gels, drinks, or kitchen blends.", "Wild crafted sea moss"],
  ["Baobab Pulp", "Fruit Powders", "powders", "seasonal", "baobab-pulp.jpg", "Tangy baobab pulp with a bright fruit character, ideal for juices, smoothies, and breakfast bowls.", "Baobab fruit pulp"],
  ["Bladderwrack Powder", "Sea Botanicals", "powders", "daily-wellness", "bladderwrack-powder-original.jpg", "A marine botanical powder with a naturally briny profile for careful use in smoothies or water.", "Bladderwrack powder", 1.30],
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
  ["Sea Moss Powder", "Sea Botanicals", "powders", "daily-wellness", "sea-moss-powder-original.jpg", "A convenient powdered sea moss format for blending into drinks and foods.", "Sea moss powder"],
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
  ["Bladderwrack Powder", "Sea Botanicals", "powders", "daily-wellness", "bladderwrack-powder-original.jpg", "A marine botanical powder with a naturally briny profile for careful use in smoothies or water.", "Bladderwrack powder", 1.30],
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
  ["Sea Moss Powder", "Sea Botanicals", "powders", "daily-wellness", "sea-moss-powder-original.jpg", "A convenient powdered sea moss format for blending into drinks and foods.", "Sea moss powder"],
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
  ["Ashwagandha", "New Arrivals", "powders", "daily-wellness", "ZOZ_2213.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Ashwagandha", "New Arrivals", "powders", "daily-wellness", "ZOZ_2215.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Testosterone Booster", "New Arrivals", "powders", "daily-wellness", "ZOZ_2216.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Moringa Seed", "New Arrivals", "powders", "daily-wellness", "ZOZ_2221.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Sea Moss", "New Arrivals", "powders", "daily-wellness", "ZOZ_2223.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Oregano", "New Arrivals", "powders", "daily-wellness", "ZOZ_2226.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Soursop, Mango, And Moringa Vegan Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2228.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Bitter Melon Vegan Capsules", "New Arrivals", "powders", "daily-wellness", "ZOZ_2234.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Ginkgo Biloba Capsule", "New Arrivals", "powders", "daily-wellness", "ZOZ_2237.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Shilajit", "New Arrivals", "powders", "daily-wellness", "ZOZ_2241.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Coconut", "New Arrivals", "powders", "daily-wellness", "ZOZ_2246.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Black Seed Oil", "New Arrivals", "powders", "daily-wellness", "ZOZ_2249.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Himalayan Pink Salt Fine", "New Arrivals", "powders", "daily-wellness", "ZOZ_2254.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Himalayan Pink Salt Coarse", "New Arrivals", "powders", "daily-wellness", "ZOZ_2257.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
  ["Jimerito Honey", "New Arrivals", "powders", "daily-wellness", "ZOZ_2260.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"],
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
  ["Flax Seed", "New Arrivals", "powders", "daily-wellness", "ZOZ_2947.JPG", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"]
];

function makeProduct(item, index) {
  const [name, category, format, concern, imageFile, shortDescription, keyIngredients, imageScale] = item;
  const defaults = formatDefaults[format];
  const topical = format === "oils" || format === "body-care";

  return {
    id: index + 1,
    name,
    category,
    format,
    concern,
    imageScale: imageScale || null,
    price: defaults.price,
    currency: "TZS",
    image: `/images/products/royal-herbs/${imageFile}`,
    imageAlt: `Royal Maroon Herbs ${name} product packaging.`,
    shortDescription,
    keyIngredients,
    fullIngredients: keyIngredients.split(",").map((ingredient) => ingredient.trim()),
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
  'catuaba bark': 'capsules'
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

const seenNames = new Set();
const cleanedCatalog = catalog
  .map(correctFormat)
  .filter((item) => {
    const key = item[0].toLowerCase().replace(/\s+/g, ' ').trim();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

export const products = cleanedCatalog.map(makeProduct);
