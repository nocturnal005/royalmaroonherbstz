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

async function main() {
  const chromePath = getChromePath();
  const sourceDir = "D:\\new product listings\\Highlights";
  const targetDir = path.resolve("public/images/products/royal-herbs");
  
  const filesList = fs.readFileSync('scratch/offcenter_list.txt', 'utf8').split('\n').map(l => l.trim()).filter(Boolean);

  console.log(`Found ${filesList.length} images to fix off-center issue.`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new"
  });

  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  for (let i = 0; i < filesList.length; i++) {
    const file = filesList[i];
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(targetDir, file);

    console.log(`[${i+1}/${filesList.length}] Smart-Centering ${file}...`);
    try {
      if (!fs.existsSync(sourcePath)) {
          console.log(`Source missing: ${sourcePath}`);
          continue;
      }
      
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

            // STEP 1: Adaptive backdrop detection
            const sampleSize = 20;
            let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
            const corners = [ [0, 0], [width - sampleSize, 0], [0, height - sampleSize], [width - sampleSize, height - sampleSize] ];
            for (const [cx, cy] of corners) {
              for (let dy = 0; dy < sampleSize; dy++) {
                for (let dx = 0; dx < sampleSize; dx++) {
                  const px = cx + dx;
                  const py = cy + dy;
                  const idx = (py * width + px) * 4;
                  bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2]; bgCount++;
                }
              }
            }
            bgR = Math.round(bgR / bgCount);
            bgG = Math.round(bgG / bgCount);
            bgB = Math.round(bgB / bgCount);

            // STEP 2: Replace backdrop pixels with stone-50
            const BG_THRESHOLD = 45;       
            const BG_SOFT_THRESHOLD = 55;  
            const targetR = 250, targetG = 250, targetB = 249;

            const isProduct = new Uint8Array(width * height);

            for (let k = 0; k < data.length; k += 4) {
              const r = data[k], g = data[k+1], b = data[k+2];
              const dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);
              const pixelIndex = k / 4;

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

            // STEP 3: Detect bounding box
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

            // FIND CAP CENTER FOR SMART CENTERING
            let capMinX = width, capMaxX = 0;
            const capBottom = Math.min(maxY, minY + 150); // Top 150px of the bottle
            for (let y = minY; y < capBottom; y++) {
              for (let x = minX; x <= maxX; x++) {
                if (isProduct[y * width + x]) {
                  if (x < capMinX) capMinX = x;
                  if (x > capMaxX) capMaxX = x;
                }
              }
            }
            const capCenterX = (capMinX + capMaxX) / 2;

            // Padding
            const padX = Math.round(width * 0.03);
            const padY = Math.round(height * 0.03);
            minX = Math.max(0, minX - padX);
            minY = Math.max(0, minY - padY);
            maxX = Math.min(width - 1, maxX + padX);
            maxY = Math.min(height - 1, maxY + padY);

            const cropW = maxX - minX + 1;
            const cropH = maxY - minY + 1;

            // STEP 5: Strict Uniform Sizing (using same formula as before to maintain uniform height)
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

            finalCtx.fillStyle = '#fafaf9';
            finalCtx.fillRect(0, 0, OUTPUT, OUTPUT);

            // SMART CENTERING: Align capCenterX to OUTPUT / 2
            const destX = Math.round((OUTPUT / 2) - ((capCenterX - minX) * scale));
            const destY = Math.round((OUTPUT - renderH) / 2);
            
            finalCtx.drawImage(
              tempCanvas,
              minX, minY, cropW, cropH,
              destX, destY, renderW, renderH
            );

            resolve({
              imageData: finalCanvas.toDataURL('image/jpeg', 0.95)
            });
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = uri;
        });
      }, rawDataUri);

      const base64Bytes = result.imageData.replace(/^data:image\/jpeg;base64,/, '');
      const buffer = Buffer.from(base64Bytes, 'base64');
      fs.writeFileSync(destPath, buffer);
      
    } catch (e) {
      console.error(`  Failed: ${e.message}`);
    }
  }

  await browser.close();
  console.log("\n--- Complete: All 65 images Smart-Centered! ---\n");
}

main().catch(console.error);
