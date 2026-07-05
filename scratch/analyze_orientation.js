import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

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

async function analyze() {
  const chromePath = getChromePath();
  const sourceDir = "D:\\new product listings\\Highlights";
  
  // We only care about the 136 remaining images
  const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  for (const file of manifest) {
    const sourcePath = path.join(sourceDir, file);
    const rawBuffer = fs.readFileSync(sourcePath);
    const rawBase64 = rawBuffer.toString('base64');
    const rawDataUri = `data:image/jpeg;base64,${rawBase64}`;

    const result = await page.evaluate(async (uri) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          resolve({
            w: img.naturalWidth,
            h: img.naturalHeight
          });
        };
        img.src = uri;
      });
    }, rawDataUri);

    if (result.w > result.h) {
      console.log(`Landscape: ${file} (${result.w}x${result.h})`);
    } else if (result.w > result.h * 0.9) {
      console.log(`Squarish: ${file} (${result.w}x${result.h})`);
    }
  }

  await browser.close();
}

analyze().catch(console.error);
