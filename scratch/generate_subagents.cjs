const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));
const chunkSize = 15;
const subagents = [];

for(let i=0; i<manifest.length; i+=chunkSize) {
  const chunk = manifest.slice(i, i+chunkSize);
  const prompt = "Call `view_file` on the following images in the folder `public/images/products/royal-herbs`. Look at each image and extract the main product name from the label in Title Case. Exclude brand 'Royal Maroon Herbs' and capsule counts/weights. Return ONLY a JSON object mapping filename to product name:\n" + chunk.join("\n");
  subagents.push({
    TypeName: 'research',
    Role: 'Image OCR Specialist ' + (i/chunkSize + 1),
    Prompt: prompt
  });
}
fs.writeFileSync('scratch/subagents.json', JSON.stringify({Subagents: subagents}, null, 2));
