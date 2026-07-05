const fs = require('fs');

const productsFile = 'src/data/products.js';
let content = fs.readFileSync(productsFile, 'utf8');

const names = JSON.parse(fs.readFileSync('scratch/product_names.json', 'utf8'));

let updatedCount = 0;

for (const [file, name] of Object.entries(names)) {
  // Pattern to match: ["New Product \d+", "New Arrivals", "powders", "daily-wellness", "ZOZ_1234.JPG"
  // Actually, some might be "vegan-capsules", etc. So we match generic format.
  // Look for the specific file name in the line.
  
  const regex = new RegExp(`\\[\\s*"New Product \\d+",\\s*"([^"]+)",\\s*"([^"]+)",\\s*"([^"]+)",\\s*"${file}"`);
  
  if (regex.test(content)) {
    content = content.replace(regex, `["${name}", "$1", "$2", "$3", "${file}"`);
    updatedCount++;
  } else {
    // try matching without New Product \d+ just in case it was already updated
    const fallbackRegex = new RegExp(`\\[\\s*"[^"]+",\\s*"([^"]+)",\\s*"([^"]+)",\\s*"([^"]+)",\\s*"${file}"`);
    if (fallbackRegex.test(content)) {
      content = content.replace(fallbackRegex, `["${name}", "$1", "$2", "$3", "${file}"`);
      updatedCount++;
    }
  }
}

fs.writeFileSync(productsFile, content, 'utf8');
console.log(`Successfully updated ${updatedCount} product entries in products.js`);
