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

  // 1. Restore original moringa image
  console.log('Restoring original image...');
  fs.copyFileSync(
    "D:\\new product listings\\moringa\\Moringa oil cold pressed.jpeg",
    "public\\images\\products\\royal-herbs\\moringa-oil-cold-pressed.jpg"
  );

  console.log('Launching browser to isolate the Moringa Oil bottle using adaptive background subtraction...');
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

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);

        const imgData = tempCtx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;

        // Iterate over pixels and use adaptive background color distance
        for (let y = 0; y < height; y++) {
          // Estimate background color for this row using left and right borders (avg of 15px)
          let bgR = 0, bgG = 0, bgB = 0;
          const sampleSize = 15;
          for (let i = 0; i < sampleSize; i++) {
            // Left sample
            const lIdx = (y * width + i) * 4;
            bgR += data[lIdx];
            bgG += data[lIdx + 1];
            bgB += data[lIdx + 2];

            // Right sample
            const rIdx = (y * width + (width - 1 - i)) * 4;
            bgR += data[rIdx];
            bgG += data[rIdx + 1];
            bgB += data[rIdx + 2];
          }
          bgR /= (sampleSize * 2);
          bgG /= (sampleSize * 2);
          bgB /= (sampleSize * 2);

          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Euclidean color distance from row background
            const dist = Math.sqrt(
              Math.pow(r - bgR, 2) +
              Math.pow(g - bgG, 2) +
              Math.pow(b - bgB, 2)
            );

            // Threshold: if color is different from background by more than 20 units
            if (dist > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        console.log(`Isolate bounds: X [${minX}, ${maxX}], Y [${minY}, ${maxY}]`);
        const bottleWidth = maxX - minX;
        const bottleHeight = maxY - minY;
        console.log(`Isolate dimensions: ${bottleWidth}x${bottleHeight}`);

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
          minX, minY, bottleWidth, bottleHeight,
          destX, destY, targetWidth, targetHeight
        );

        resolve({
          base64: finalCanvas.toDataURL('image/jpeg', 0.95),
          pctWidth: (targetWidth / 800) * 100,
          pctHeight: (targetHeight / 800) * 100
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
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
