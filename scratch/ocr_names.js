import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));
const targetDir = path.resolve('public/images/products/royal-herbs');
const productsFile = path.resolve('src/data/products.js');

async function processImages() {
  let productsContent = fs.readFileSync(productsFile, 'utf8');

  for (let i = 0; i < manifest.length; i++) {
    const file = manifest[i];
    const imagePath = path.join(targetDir, file);

    console.log(`[${i+1}/${manifest.length}] OCR processing ${file}...`);
    try {
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
      
      // Clean up text
      let cleaned = text.replace(/[^A-Za-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
      
      // We know all items are royal herbs products. Often the OCR might pick up "ROYAL MAROON HERBS" or "Net Weight" or "60 Vegan Capsules"
      cleaned = cleaned.replace(/royal maroon herbs/i, '')
                       .replace(/Net Weight/i, '')
                       .replace(/100g/i, '')
                       .replace(/60 vegan capsules?/i, '')
                       .replace(/vegan capsules?/i, 'Capsules')
                       .replace(/capsules?/i, 'Capsules')
                       .trim();
                       
      // Take first few salient words
      let words = cleaned.split(' ').filter(w => w.length > 2);
      let productName = words.slice(0, 4).join(' ');
      
      if (!productName) {
        productName = `Unnamed Product ${i}`;
      } else {
        // Title case
        productName = productName.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
      
      console.log(`  -> Extracted: ${productName}`);

      // We need to replace `New Product ${existing_id}` where existing_id is 50 + i
      // Wait, in products.js they are named "New Product 50", "New Product 51" etc.
      // Let's just find the entry containing `${file}` and replace "New Product \\d+" with the new name.
      
      const filePattern = new RegExp(`\\[\\s*"New Product \\d+",\\s*"New Arrivals",\\s*"powders",\\s*"daily-wellness",\\s*"${file}"`);
      if (filePattern.test(productsContent)) {
         productsContent = productsContent.replace(filePattern, `["${productName}", "New Arrivals", "powders", "daily-wellness", "${file}"`);
      } else {
         // Also check for capsules if it was modified
         const filePattern2 = new RegExp(`\\[\\s*"New Product \\d+",\\s*([^,]+),\\s*([^,]+),\\s*([^,]+),\\s*"${file}"`);
         productsContent = productsContent.replace(filePattern2, `["${productName}", $1, $2, $3, "${file}"`);
      }

    } catch (e) {
      console.error(`  Failed OCR for ${file}: ${e.message}`);
    }
  }

  fs.writeFileSync(productsFile, productsContent, 'utf8');
  console.log("Updated products.js with OCR names.");
}

processImages().catch(console.error);
