import fs from 'fs';
import path from 'path';

const stagingDir = path.resolve("public/images/staging");
const productsDir = path.resolve("public/images/products/royal-herbs");
const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));

console.log(`Migrating ${manifest.length} images from staging to live products...\n`);

// Step 1: Copy all staging images to the products directory
let copied = 0;
for (const file of manifest) {
  const src = path.join(stagingDir, file);
  const dest = path.join(productsDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied++;
  }
}
console.log(`Copied ${copied} images to products directory.\n`);

// Step 2: Generate catalog entries for products.js
// Each entry follows: [name, category, format, concern, imageFile, description, keyIngredients]
const newEntries = manifest.map((file, idx) => {
  const num = idx + 1;
  return `  ["New Product ${num}", "New Arrivals", "powders", "daily-wellness", "${file}", "A new Royal Maroon Herbs botanical product awaiting full description.", "Botanical ingredients"]`;
});

// Step 3: Insert into products.js right before the closing bracket of the catalog array
const productsPath = path.resolve("src/data/products.js");
let content = fs.readFileSync(productsPath, 'utf8');

// Find the last entry (Himalayan Bath Salt line) and append after it
const lastEntryLine = '  ["Himalayan Bath Salt", "Bath & Body Minerals", "body-care", "beauty", "himalayan-bath-salt.jpg", "Pink mineral bath salt for soaking rituals and simple at-home self-care.", "Himalayan salt"]';

const insertionPoint = lastEntryLine;
const newCatalogLines = ',\n' + newEntries.join(',\n');

content = content.replace(insertionPoint, insertionPoint + newCatalogLines);

fs.writeFileSync(productsPath, content, 'utf8');
console.log(`Added ${manifest.length} new catalog entries to products.js.`);
console.log(`Total catalog now has ${50 + manifest.length} products.`);
