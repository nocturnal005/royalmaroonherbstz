const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

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
  throw new Error('No Chrome/Edge found');
}

async function testProcess() {
  const chromePath = getChromePath();
  const sourcePath = "D:\\new product listings\\Highlights\\ZOZ_2171.JPG";
  const destPath = path.resolve("scratch/test_halim.jpg");

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new"
  });

  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  const rawBuffer = fs.readFileSync(sourcePath);
  const rawBase64 = rawBuffer.toString('base64');
  const rawDataUri = `data:image/jpeg;base64,${rawBase64}`;

  const result = await page.evaluate(async (uri) => {
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

        // Backdrop detection
        const sampleSize = 20;
        const corners = [ [0, 0], [width - sampleSize, 0], [0, height - sampleSize], [width - sampleSize, height - sampleSize] ];
        const cornerColors = [];
        for (const [cx, cy] of corners) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = 0; dy < sampleSize; dy++) {
            for (let dx = 0; dx < sampleSize; dx++) {
              const px = cx + dx;
              const py = cy + dy;
              const idx = (py * width + px) * 4;
              r += data[idx]; g += data[idx+1]; b += data[idx+2]; count++;
            }
          }
          cornerColors.push({ r: r/count, g: g/count, b: b/count, brightness: (r+g+b)/count });
        }
        cornerColors.sort((a, b) => b.brightness - a.brightness);
        const bgR = Math.round((cornerColors[0].r + cornerColors[1].r) / 2);
        const bgG = Math.round((cornerColors[0].g + cornerColors[1].g) / 2);
        const bgB = Math.round((cornerColors[0].b + cornerColors[1].b) / 2);

        const BG_THRESHOLD = 45;       
        const BG_SOFT_THRESHOLD = 55;  
        const targetR = 255, targetG = 255, targetB = 255;

        const isProduct = new Uint8Array(width * height);

        const bgSum = bgR + bgG + bgB;
        const nbgR = bgR / bgSum, nbgG = bgG / bgSum, nbgB = bgB / bgSum;

        for (let k = 0; k < data.length; k += 4) {
          const r = data[k], g = data[k+1], b = data[k+2];
          const pixelIndex = k / 4;

          let dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);

          const sum = r + g + b;
          if (sum > 30) {
            const nr = r / sum, ng = g / sum, nb = b / sum;
            const chromDist = Math.sqrt((nr - nbgR)**2 + (ng - nbgG)**2 + (nb - nbgB)**2) * 255;
            
            // If the color matches the background's hue (chromaticity) and isn't pitch black, it's shadow/backdrop
            if (chromDist < 12 && sum/3 > 70) {
              dist = 0;
            }
          }

          if (dist < BG_THRESHOLD) {
            data[k] = targetR; data[k+1] = targetG; data[k+2] = targetB;
            isProduct[pixelIndex] = 0;
          } else if (dist < BG_SOFT_THRESHOLD) {
            const factor = (dist - BG_THRESHOLD) / (BG_SOFT_THRESHOLD - BG_THRESHOLD);
            data[k] = Math.round(targetR + (r - targetR) * factor);
            data[k+1] = Math.round(targetG + (g - targetG) * factor);
            data[k+2] = Math.round(targetB + (b - targetB) * factor);
            isProduct[pixelIndex] = factor > 0.5 ? 1 : 0;
          } else {
            isProduct[pixelIndex] = 1;
          }
        }
        tempCtx.putImageData(imgData, 0, 0);

        // Bounding box
        let minX = width, minY = height, maxX = 0, maxY = 0;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (isProduct[y * width + x]) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const padX = Math.round(width * 0.03);
        const padY = Math.round(height * 0.03);
        minX = Math.max(0, minX - padX);
        minY = Math.max(0, minY - padY);
        maxX = Math.min(width - 1, maxX + padX);
        maxY = Math.min(height - 1, maxY + padY);

        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        const OUTPUT = 1600;
        const TARGET_FILL = 0.78;
        const targetProductHeight = OUTPUT * TARGET_FILL;

        const scale = targetProductHeight / cropH;
        let renderW = Math.round(cropW * scale);
        let renderH = Math.round(cropH * scale);

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = OUTPUT;
        finalCanvas.height = OUTPUT;
        const finalCtx = finalCanvas.getContext('2d');

        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, OUTPUT, OUTPUT);

        const destX = Math.round((OUTPUT - renderW) / 2);
        const destY = Math.round((OUTPUT - renderH) / 2);
        finalCtx.drawImage(
          tempCanvas,
          minX, minY, cropW, cropH,
          destX, destY, renderW, renderH
        );

        resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = uri;
    });
  }, rawDataUri);

  const base64Bytes = result.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = Buffer.from(base64Bytes, 'base64');
  fs.writeFileSync(destPath, buffer);
  
  await browser.close();
  console.log("Done");
}

testProcess().catch(console.error);
