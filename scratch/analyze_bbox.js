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

async function analyzeBBox() {
  const chromePath = getChromePath();
  const sourceDir = "D:\\new product listings\\Highlights";
  const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));

  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  console.log("Analyzing aspect ratios and crop sizes...");
  let countSmall = 0;

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
          const width = img.naturalWidth;
          const height = img.naturalHeight;

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(img, 0, 0);

          const imgData = tempCtx.getImageData(0, 0, width, height).data;
          
          const sampleSize = 20;
          let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
          const corners = [
            [0, 0], [width - sampleSize, 0], [0, height - sampleSize], [width - sampleSize, height - sampleSize]
          ];
          for (const [cx, cy] of corners) {
            for (let dy = 0; dy < sampleSize; dy++) {
              for (let dx = 0; dx < sampleSize; dx++) {
                const idx = ((cy + dy) * width + (cx + dx)) * 4;
                bgR += imgData[idx]; bgG += imgData[idx+1]; bgB += imgData[idx+2]; bgCount++;
              }
            }
          }
          bgR = Math.round(bgR / bgCount);
          bgG = Math.round(bgG / bgCount);
          bgB = Math.round(bgB / bgCount);

          const BG_SOFT_THRESHOLD = 55;
          let minX = width, minY = height, maxX = 0, maxY = 0;

          for (let k = 0; k < imgData.length; k += 4) {
            const r = imgData[k], g = imgData[k+1], b = imgData[k+2];
            const dist = Math.sqrt((r-bgR)**2 + (g-bgG)**2 + (b-bgB)**2);
            if (dist >= BG_SOFT_THRESHOLD) {
              const pixelIndex = k / 4;
              const x = pixelIndex % width;
              const y = Math.floor(pixelIndex / width);
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }

          resolve({
            w: width, h: height,
            cropW: maxX - minX + 1, cropH: maxY - minY + 1
          });
        };
        img.src = uri;
      });
    }, rawDataUri);

    const aspect = result.cropW / result.cropH;
    
    // Simulate sizing
    const OUTPUT = 1600;
    const TARGET_FILL = 0.78;
    const targetProductHeight = OUTPUT * TARGET_FILL; // 1248

    const scale = targetProductHeight / result.cropH;
    const clampedScale = Math.min(scale, 1.5);
    let renderW = result.cropW * clampedScale;
    let renderH = result.cropH * clampedScale;

    const maxWidth = OUTPUT * 0.88; // 1408
    if (renderW > maxWidth) {
      const shrink = maxWidth / renderW;
      renderW *= shrink;
      renderH *= shrink;
    }

    if (renderH < 1000 || aspect > 1.0) {
      console.log(`${file}: cropW=${result.cropW}, cropH=${result.cropH}, aspect=${aspect.toFixed(2)}, finalH=${renderH.toFixed(0)}, originalH=${result.h}`);
      countSmall++;
    }
  }
  console.log(`\nFound ${countSmall} images that result in small or wide output.`);
  await browser.close();
}

analyzeBBox().catch(console.error);
