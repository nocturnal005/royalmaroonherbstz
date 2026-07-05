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

  console.log('Launching browser to isolate and center the Moringa Oil bottle...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/');

  const result = await page.evaluate(async () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Create temporary canvas to read pixels
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);

        const imgData = tempCtx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Find bounding box of the bottle
        // The background is light grey/white, so pixels where any RGB channel is < 235 are considered part of the bottle
        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Threshold: if pixel is not light grey/white
            if (r < 235 || g < 235 || b < 235) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        console.log(`Detected bottle bounds: X [${minX}, ${maxX}], Y [${minY}, ${maxY}]`);
        const bottleWidth = maxX - minX;
        const bottleHeight = maxY - minY;
        console.log(`Bottle dimensions: ${bottleWidth}x${bottleHeight}`);

        // Create the final square 800x800 canvas with a pure white background
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 800;
        finalCanvas.height = 800;
        const finalCtx = finalCanvas.getContext('2d');

        // Pure white background
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, 800, 800);

        // We want the bottle height to be exactly 90% of the canvas height (720px)
        const targetHeight = 720;
        const scale = targetHeight / bottleHeight;
        const targetWidth = bottleWidth * scale;

        // Center horizontally and vertically
        const destX = (800 - targetWidth) / 2;
        const destY = (800 - targetHeight) / 2;

        console.log(`Drawing bottle scaled to ${Math.round(targetWidth)}x${targetHeight} at position (${Math.round(destX)}, ${destY})`);

        // Draw only the cropped bottle onto the final canvas
        finalCtx.drawImage(
          img,
          minX, minY, bottleWidth, bottleHeight, // source bounds
          destX, destY, targetWidth, targetHeight // destination bounds
        );

        resolve({
          base64: finalCanvas.toDataURL('image/jpeg', 0.95),
          pctWidth: (targetWidth / 800) * 100,
          pctHeight: (targetHeight / 800) * 100
        });
      };
      img.onerror = () => reject(new Error('Failed to load Moringa image'));
      img.src = 'http://localhost:5173/images/products/royal-herbs/moringa-oil-cold-pressed.jpg';
    });
  });

  const base64Bytes = result.base64.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = Buffer.from(base64Bytes, 'base64');

  const destPath = path.resolve('public/images/products/royal-herbs/moringa-oil-cold-pressed.jpg');
  fs.writeFileSync(destPath, buffer);
  console.log(`Successfully wrote processed Moringa Oil image to: ${destPath}`);
  console.log(`New Pct Width: ${result.pctWidth.toFixed(1)}%, Height: ${result.pctHeight.toFixed(1)}%`);

  await browser.close();
}

main().catch(console.error);
