const fs = require('fs');

const lines = fs.readFileSync('C:/Users/frank/.gemini/antigravity/brain/37690e19-6b0f-49d8-83c0-1d7df34c547d/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

const names = {};

for (const line of lines) {
  if (!line) continue;
  try {
    const entry = JSON.parse(line);
    if (entry.content && entry.source === 'SYSTEM' && entry.content.includes('ZOZ_')) {
      let content = entry.content;
      
      // If there's a code block, extract from it
      const match = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (match) {
        content = match[1];
      } else {
        // Find the first { and last }
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          content = content.substring(start, end + 1);
        }
      }
      
      try {
        const obj = JSON.parse(content);
        Object.assign(names, obj);
      } catch(e) {
        // ignore
      }
    }
  } catch (e) {}
}

fs.writeFileSync('scratch/product_names.json', JSON.stringify(names, null, 2));
console.log("Extracted " + Object.keys(names).length + " names");
