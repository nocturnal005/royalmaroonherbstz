import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

// Find Chrome/Edge path on Windows
function getChromePath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const chromePath = getChromePath();
  if (!chromePath) {
    console.error('Chrome or Edge not found.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Navigate to local dev server to match origins and avoid CORS block on canvas
  await page.goto('http://localhost:5173/');
  
  const imgDir = path.resolve('public/images/products/royal-herbs');
  const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

  console.log(`Analyzing ${files.length} images...`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(imgDir, file);
    const fileUrl = `http://localhost:5173/images/products/royal-herbs/${file}`;
    
    // Load image in page and measure bounds using canvas
    const stats = await page.evaluate(async (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log('Loaded image: ' + url);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          
          let minX = canvas.width;
          let maxX = 0;
          let minY = canvas.height;
          let maxY = 0;
          
          // Helper to check if pixel is "background" (close to white / transparent)
          // We consider background if R > 248, G > 248, B > 248 or A < 10
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const idx = (y * canvas.width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];
              
              const isBg = (r > 248 && g > 248 && b > 248) || a < 10;
              if (!isBg) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          
          const width = maxX >= minX ? (maxX - minX + 1) : 0;
          const height = maxY >= minY ? (maxY - minY + 1) : 0;
          
          resolve({
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            minX, maxX, minY, maxY,
            width, height,
            widthPct: width / img.naturalWidth,
            heightPct: height / img.naturalHeight
          });
        };
        img.onerror = (e) => {
          console.error('Failed to load image: ' + url, e);
          resolve(null);
        };
        img.src = url;
      });
    }, fileUrl);

    if (stats) {
      results.push({ file, ...stats });
    }
  }

  await browser.close();

  // Sort by product height percentage to find the smallest subjects
  results.sort((a, b) => a.heightPct - b.heightPct);

  console.log('\n--- ANALYSIS RESULTS (Sorted by subject height percentage) ---');
  results.forEach(r => {
    console.log(`${r.file.padEnd(30)}: Size ${r.naturalWidth}x${r.naturalHeight} | Subject ${r.width}x${r.height} | Pct Width: ${(r.widthPct * 100).toFixed(1)}%, Height: ${(r.heightPct * 100).toFixed(1)}%`);
  });

  // Write results to JSON file
  fs.writeFileSync('scratch/image_analysis.json', JSON.stringify(results, null, 2));
  console.log('\nSaved results to scratch/image_analysis.json');
}

main().catch(console.error);
