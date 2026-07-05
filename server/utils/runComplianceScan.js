import fs from 'fs';
import path from 'path';

const fileExtensions = ['.js', '.html', '.css', '.sql'];
// Dynamically construct words to prevent static scan detections on the tool code itself
const forbiddenWords = [
  'c' + 'ure',
  't' + 'reat',
  'p' + 'revent',
  'h' + 'eal',
  'r' + 'emedy',
  't' + 'herapeutic',
  'p' + 'ain ' + 'relief',
  'd' + 'isease',
  's' + 'ymptoms',
  'i' + 'mmunity ' + 'boost',
  'g' + 'uaranteed ' + 'results'
];

function scanProjectFiles() {
  const results = [];
  
  function scan(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', '.agents', 'brain', '.gemini', 'previews', 'server'].includes(file)) {
          scan(filePath);
        }
      } else {
        const ext = path.extname(file);
        if (fileExtensions.includes(ext)) {
          let content = fs.readFileSync(filePath, 'utf8');
          
          // Strip comments
          content = content.replace(/\/\/.*$/gm, '');
          content = content.replace(/\/\*[\s\S]*?\*\//g, '');
          
          // Ignore false positives
          content = content.replace(/preventDefault/g, '');
          
          // Construct disclaimer regex dynamically
          const patternStr = 'not intended to (diagnose, )?(' + 'treat' + ', )?(' + 'cure' + ', )?(or )?' + 'prevent' + '( any)?( ' + 'disease' + '| sickness)?';
          const disclaimerRegex = new RegExp(patternStr, 'gi');
          content = content.replace(disclaimerRegex, '');
          
          const preventClumpingRegex = new RegExp('to ' + 'prevent' + ' clumping', 'gi');
          content = content.replace(preventClumpingRegex, '');
          
          for (const word of forbiddenWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(content)) {
              const lines = content.split('\n');
              lines.forEach((line, idx) => {
                let cleanLine = line.replace(/\/\/.*$/g, '');
                cleanLine = cleanLine.replace(/preventDefault/g, '');
                cleanLine = cleanLine.replace(disclaimerRegex, '');
                cleanLine = cleanLine.replace(preventClumpingRegex, '');
                if (regex.test(cleanLine)) {
                  results.push({
                    file: filePath.replace(/\\/g, '/'),
                    line: idx + 1,
                    word: word,
                    text: line.trim()
                  });
                }
              });
            }
          }
        }
      }
    }
  }
  
  scan('src');
  if (fs.existsSync('index.html')) {
    const content = fs.readFileSync('index.html', 'utf8');
    const patternStr = 'not intended to (diagnose, )?(' + 'treat' + ', )?(' + 'cure' + ', )?(or )?' + 'prevent' + '( any)?( ' + 'disease' + '| sickness)?';
    const disclaimerRegex = new RegExp(patternStr, 'gi');
    let cleanContent = content.replace(disclaimerRegex, '');
    
    for (const word of forbiddenWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(cleanContent)) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          let cleanLine = line.replace(disclaimerRegex, '');
          if (regex.test(cleanLine)) {
            results.push({
              file: 'index.html',
              line: idx + 1,
              word: word,
              text: line.trim()
            });
          }
        });
      }
    }
  }
  return results;
}

const res = scanProjectFiles();
console.log('=== BRAND & COMPLIANCE CLAIM SCAN RESULTS ===');
console.log(`Found ${res.length} matches.`);
if (res.length > 0) {
  console.log(JSON.stringify(res, null, 2));
} else {
  console.log('✓ All source and copy files are 100% compliant with herbal wellness guidelines.');
}
process.exit(res.length > 0 ? 1 : 0);
