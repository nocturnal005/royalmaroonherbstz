import fs from 'fs';
import path from 'path';

async function extractNames() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("No OPENAI_API_KEY found");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));
  const targetDir = path.resolve('public/images/products/royal-herbs');
  
  const results = {};
  const cacheFile = 'scratch/product_names.json';
  if (fs.existsSync(cacheFile)) {
    Object.assign(results, JSON.parse(fs.readFileSync(cacheFile, 'utf8')));
  }

  let count = 0;
  for (let i = 0; i < manifest.length; i++) {
    const file = manifest[i];
    if (results[file]) {
      console.log(`Skipping ${file}, already extracted: ${results[file]}`);
      continue;
    }
    
    const imagePath = path.join(targetDir, file);
    if (!fs.existsSync(imagePath)) continue;

    console.log(`[${i+1}/${manifest.length}] Extracting name for ${file}...`);
    
    const base64Image = fs.readFileSync(imagePath).toString('base64');
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a highly accurate OCR assistant for e-commerce. Extract the main product name from the product label in the image. Exclude the brand name 'Royal Maroon Herbs' unless it is strictly part of the specific product name. Exclude capsule counts (e.g. '60 Vegan Capsules') and weights (e.g. '100g'). Include descriptors like 'Powder' or 'Vegan Capsules' or 'Capsules'. Output ONLY the clean product name in Title Case, with no quotes or extra text."
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "low" // 'low' uses 85 tokens, fast and cheap, perfectly fine for large text
                  }
                }
              ]
            }
          ],
          max_tokens: 20,
          temperature: 0
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error("API Error:", data.error.message);
        break; // Stop on rate limit or error
      }
      
      let name = data.choices[0].message.content.trim();
      results[file] = name;
      console.log(`  -> ${name}`);
      
      fs.writeFileSync(cacheFile, JSON.stringify(results, null, 2));
      
      count++;
      // Sleep a bit to avoid rate limits
      await new Promise(r => setTimeout(r, 200));

    } catch (e) {
      console.error(`  Failed: ${e.message}`);
    }
  }
  
  console.log(`Extracted ${count} new names.`);
}

extractNames().catch(console.error);
