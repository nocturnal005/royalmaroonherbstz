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

  // Restore the raw photo first
  fs.copyFileSync(
    "D:\\new product listings\\moringa\\moringa.jpeg",
    "public\\images\\products\\royal-herbs\\moringa-oil-cold-pressed-original.jpg"
  );

  console.log('Launching browser to apply Levels / White Point adjustment...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/');

  const rawBuffer = fs.readFileSync("D:\\new product listings\\moringa\\moringa.jpeg");
  const rawBase64 = rawBuffer.toString('base64');
  const rawDataUri = `data:image/jpeg;base64,${rawBase64}`;

  const result = await page.evaluate(async (uri) => {
    window.rawImageDataUri = uri;
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

        // White Point Adjustment
        // We know the background is around RGB 180-210.
        // We will set the white point to 175.
        // Any pixel value >= 175 becomes 255.
        // Values < 175 are stretched linearly.
        // We can also set a black point to increase contrast and prevent the bottle from washing out.
        // Let's set black point to 20, white point to 175.
        const bp = 10;
        const wp = 175;

        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) {
            let val = data[i + j];
            if (val <= bp) {
              val = 0;
            } else if (val >= wp) {
              val = 255;
            } else {
              val = Math.round(((val - bp) / (wp - bp)) * 255);
            }
            data[i + j] = val;
          }
        }

        tempCtx.putImageData(imgData, 0, 0);

        // Now place it on a square 800x800 white canvas
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 800;
        finalCanvas.height = 800;
        const finalCtx = finalCanvas.getContext('2d');

        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, 800, 800);

        // The image is 1200x1600. Let's scale it to fit 90% of the 800x800 canvas
        const targetHeight = 720;
        const scale = targetHeight / height; // 720 / 1600 = 0.45
        const targetWidth = width * scale; // 1200 * 0.45 = 540

        const destX = (800 - targetWidth) / 2; // (800 - 540) / 2 = 130
        const destY = (800 - targetHeight) / 2; // (800 - 720) / 2 = 40

        finalCtx.drawImage(tempCanvas, 0, 0, width, height, destX, destY, targetWidth, targetHeight);

        resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = window.rawImageDataUri;
    });
  }, rawDataUri);

  const base64Bytes = result.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = Buffer.from(base64Bytes, 'base64');

  // Overwrite target file
  const destPath = path.resolve('public/images/products/royal-herbs/moringa-oil-cold-pressed-original.jpg');
  fs.writeFileSync(destPath, buffer);
  console.log(`Successfully wrote white-point adjusted Moringa Oil image to: ${destPath}`);

  await browser.close();
}

main().catch(console.error);
