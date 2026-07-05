import fs from 'fs';

function readDocxXml(xmlPath) {
  if (!fs.existsSync(xmlPath)) return 'Not found';
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const textMatches = xml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
  const text = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
  return text;
}

console.log('=== PRD TEXT ===');
const prdText = readDocxXml('d:/RM_Tanzania/temp_prd/word/document.xml');
console.log(prdText.slice(0, 3000));
fs.writeFileSync('d:/RM_Tanzania/scratch/prd_text.txt', prdText);

console.log('=== XML TEXT ===');
const xmlText = readDocxXml('d:/RM_Tanzania/temp_xml/word/document.xml');
console.log(xmlText.slice(0, 3000));
fs.writeFileSync('d:/RM_Tanzania/scratch/xml_text.txt', xmlText);
