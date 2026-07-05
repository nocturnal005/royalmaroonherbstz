import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

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
    console.error('Chrome/Edge not found.');
    process.exit(1);
  }

  console.log('Launching browser to rotate image...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Navigate to match origin (avoids CORS issues on canvas read)
  await page.goto('http://localhost:5173/');

  const imageUrl = 'http://localhost:5173/images/products/royal-herbs/bladderwrack-powder.jpg';
  
  console.log(`Loading image for rotation: ${imageUrl}`);

  const base64Data = await page.evaluate(async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log(`Image loaded successfully: ${img.naturalWidth}x${img.naturalHeight}`);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Translate to center, rotate, and draw
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Rotate 4.5 degrees clockwise
        ctx.rotate(4.5 * Math.PI / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        // Export as JPEG with high quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        console.error('Failed to load image inside browser');
        reject(new Error('Image failed to load'));
      };
      img.src = url;
    });
  }, imageUrl);

  await browser.close();

  // Strip prefix to get raw base64 bytes
  const base64Bytes = base64Data.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = Buffer.from(base64Bytes, 'base64');

  const destPath = path.resolve('public/images/products/royal-herbs/bladderwrack-powder.jpg');
  
  // Backup original image
  const backupPath = destPath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(destPath, backupPath);
    console.log(`Created backup of original image at: ${backupPath}`);
  }

  fs.writeFileSync(destPath, buffer);
  console.log(`Successfully rotated image and wrote to: ${destPath}`);
}

main().catch(console.error);
