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

  console.log('Restoring original image...');
  fs.copyFileSync(
    "D:\\new product listings\\moringa\\Moringa oil cold pressed.jpeg",
    "public\\images\\products\\royal-herbs\\moringa-oil-cold-pressed.jpg"
  );

  console.log('Launching browser to perform pixel-level background removal...');
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
        const srcData = imgData.data;

        // 1. Find bounding box of the bottle using adaptive row distance
        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;

        // Cache row backgrounds and distances
        const rowBg = [];
        for (let y = 0; y < height; y++) {
          let bgR = 0, bgG = 0, bgB = 0;
          const sampleSize = 15;
          for (let i = 0; i < sampleSize; i++) {
            const lIdx = (y * width + i) * 4;
            bgR += srcData[lIdx];
            bgG += srcData[lIdx + 1];
            bgB += srcData[lIdx + 2];

            const rIdx = (y * width + (width - 1 - i)) * 4;
            bgR += srcData[rIdx];
            bgG += srcData[rIdx + 1];
            bgB += srcData[rIdx + 2];
          }
          rowBg.push({
            r: bgR / (sampleSize * 2),
            g: bgG / (sampleSize * 2),
            b: bgB / (sampleSize * 2)
          });
        }

        // We also want to filter out any small dust/shadows at the very top and bottom.
        // Let's find the vertical bounds:
        for (let y = 0; y < height; y++) {
          const bg = rowBg[y];
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const dist = Math.sqrt(
              Math.pow(srcData[idx] - bg.r, 2) +
              Math.pow(srcData[idx + 1] - bg.g, 2) +
              Math.pow(srcData[idx + 2] - bg.b, 2)
            );

            // A threshold of 20 is perfect to detect label/bottle/cap
            if (dist > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // Add 5px padding around the detected bounds if possible
        minX = Math.max(0, minX - 5);
        maxX = Math.min(width - 1, maxX + 5);
        minY = Math.max(0, minY - 5);
        maxY = Math.min(height - 1, maxY + 5);

        const bottleWidth = maxX - minX;
        const bottleHeight = maxY - minY;
        console.log(`Bounds: X [${minX}, ${maxX}], Y [${minY}, ${maxY}] (${bottleWidth}x${bottleHeight})`);

        // 2. Create the final 800x800 canvas
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 800;
        finalCanvas.height = 800;
        const finalCtx = finalCanvas.getContext('2d');

        // Fill with white
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, 800, 800);

        const destImgData = finalCtx.getImageData(0, 0, 800, 800);
        const destData = destImgData.data;

        // Target height is 720px (90% of 800)
        const targetHeight = 720;
        const scale = targetHeight / bottleHeight;
        const targetWidth = bottleWidth * scale;

        const destX = (800 - targetWidth) / 2;
        const destY = (800 - targetHeight) / 2;

        // Loop over the destination canvas and copy pixels
        for (let dy = 0; dy < 800; dy++) {
          for (let dx = 0; dx < 800; dx++) {
            // Map dest pixel back to source image
            const sx = minX + (dx - destX) / scale;
            const sy = minY + (dy - destY) / scale;

            const x = Math.round(sx);
            const y = Math.round(sy);

            const destIdx = (dy * 800 + dx) * 4;

            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
              const srcIdx = (y * width + x) * 4;
              const bg = rowBg[y];

              const dist = Math.sqrt(
                Math.pow(srcData[srcIdx] - bg.r, 2) +
                Math.pow(srcData[srcIdx + 1] - bg.g, 2) +
                Math.pow(srcData[srcIdx + 2] - bg.b, 2)
              );

              // If it's part of the bottle, copy color
              if (dist > 18) {
                destData[destIdx] = srcData[srcIdx];
                destData[destIdx + 1] = srcData[srcIdx + 1];
                destData[destIdx + 2] = srcData[srcIdx + 2];
                destData[destIdx + 3] = 255;
              } else {
                // Otherwise keep it white
                destData[destIdx] = 255;
                destData[destIdx + 1] = 255;
                destData[destIdx + 2] = 255;
                destData[destIdx + 3] = 255;
              }
            } else {
              destData[destIdx] = 255;
              destData[destIdx + 1] = 255;
              destData[destIdx + 2] = 255;
              destData[destIdx + 3] = 255;
            }
          }
        }

        // Put image data back to final canvas
        finalCtx.putImageData(destImgData, 0, 0);

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
  console.log(`Successfully wrote pixel-isolated Moringa Oil image to: ${destPath}`);
  console.log(`New Pct Width: ${result.pctWidth.toFixed(1)}%, Height: ${result.pctHeight.toFixed(1)}%`);

  await browser.close();
}

main().catch(console.error);
