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

  console.log('Restoring original moringa.jpeg image to source...');
  fs.copyFileSync(
    "D:\\new product listings\\moringa\\moringa.jpeg",
    "public\\images\\products\\royal-herbs\\moringa-oil-cold-pressed-original.jpg"
  );

  console.log('Launching browser to perform soft box vignette border blending...');
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

        // Create temporary canvas to read pixels of original image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);

        const imgData = tempCtx.getImageData(0, 0, width, height);
        const srcData = imgData.data;

        // Create target canvas for soft vignette image
        const vigCanvas = document.createElement('canvas');
        vigCanvas.width = width;
        vigCanvas.height = height;
        const vigCtx = vigCanvas.getContext('2d');
        const vigImgData = vigCtx.createImageData(width, height);
        const vigData = vigImgData.data;

        // Apply soft box vignette to fade borders to pure white
        for (let y = 0; y < height; y++) {
          // Vertical alpha profile
          let alphaY = 1.0;
          const topFadeStart = 200;
          const topFadeEnd = 30;
          const bottomFadeStart = 1450;
          const bottomFadeEnd = 1590;

          if (y < topFadeEnd) {
            alphaY = 0.0;
          } else if (y > bottomFadeEnd) {
            alphaY = 0.0;
          } else if (y < topFadeStart) {
            alphaY = (y - topFadeEnd) / (topFadeStart - topFadeEnd);
          } else if (y > bottomFadeStart) {
            alphaY = (bottomFadeEnd - y) / (bottomFadeEnd - bottomFadeStart);
          }

          for (let x = 0; x < width; x++) {
            // Horizontal alpha profile
            let alphaX = 1.0;
            const leftFadeStart = 350;
            const leftFadeEnd = 40;
            const rightFadeStart = 850;
            const rightFadeEnd = 1160;

            if (x < leftFadeEnd) {
              alphaX = 0.0;
            } else if (x > rightFadeEnd) {
              alphaX = 0.0;
            } else if (x < leftFadeStart) {
              alphaX = (x - leftFadeEnd) / (leftFadeStart - leftFadeEnd);
            } else if (x > rightFadeStart) {
              alphaX = (rightFadeEnd - x) / (rightFadeEnd - rightFadeStart);
            }

            const alpha = alphaX * alphaY;
            const idx = (y * width + x) * 4;

            // Blend source pixel color with pure white background
            vigData[idx] = Math.round(srcData[idx] * alpha + 255 * (1 - alpha));
            vigData[idx + 1] = Math.round(srcData[idx + 1] * alpha + 255 * (1 - alpha));
            vigData[idx + 2] = Math.round(srcData[idx + 2] * alpha + 255 * (1 - alpha));
            vigData[idx + 3] = 255;
          }
        }
        vigCtx.putImageData(vigImgData, 0, 0);

        // Now, we want to crop the active bottle area from the vignette canvas and place it on an 800x800 square canvas
        // This centers the product and scales it to 90% height
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 800;
        finalCanvas.height = 800;
        const finalCtx = finalCanvas.getContext('2d');

        // Pure white background
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, 800, 800);

        // We know the bottle Y bounds in the cropped region are approximately Y [104, 1599]
        // Let's use the full height of the vignetted canvas to preserve the entire bottle and bottom shadow
        const sourceMinY = 30;
        const sourceMaxY = 1590;
        const sourceHeight = sourceMaxY - sourceMinY;

        // X bounds: we crop from X [40, 1160]
        const sourceMinX = 40;
        const sourceMaxX = 1160;
        const sourceWidth = sourceMaxX - sourceMinX;

        // Target height is 720px (90% of 800)
        const targetHeight = 720;
        const scale = targetHeight / sourceHeight;
        const targetWidth = sourceWidth * scale;

        const destX = (800 - targetWidth) / 2;
        const destY = (800 - targetHeight) / 2;

        finalCtx.drawImage(
          vigCanvas,
          sourceMinX, sourceMinY, sourceWidth, sourceHeight,
          destX, destY, targetWidth, targetHeight
        );

        resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = 'http://localhost:5173/images/products/royal-herbs/moringa-oil-cold-pressed-original.jpg?nocache=' + Date.now();
    });
  });

  const base64Bytes = result.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = Buffer.from(base64Bytes, 'base64');

  // Overwrite the original target file on disk so the storefront displays it
  const destPath = path.resolve('public/images/products/royal-herbs/moringa-oil-cold-pressed-original.jpg');
  fs.writeFileSync(destPath, buffer);
  console.log(`Successfully wrote vignetted Moringa Oil image to: ${destPath}`);

  await browser.close();
}

main().catch(console.error);
