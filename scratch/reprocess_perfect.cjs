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
  const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));

  console.log(`Found ${manifest.length} images to re-process for perfect centering, color, and orientation.`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new"
  });

  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  for (let i = 0; i < manifest.length; i++) {
    const file = manifest[i];
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(targetDir, file);

    console.log(`[${i+1}/${manifest.length}] Processing ${file}...`);
    try {
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

            // STEP 1: Robust Adaptive Backdrop Detection (ignoring shadowed corners)
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

            // STEP 2: Replace backdrop pixels with PURE WHITE
            const BG_THRESHOLD = 45;       
            const BG_SOFT_THRESHOLD = 55;  
            const targetR = 255, targetG = 255, targetB = 255;

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

            // STEP 4: Smart Center (Find the true center using the bottle cap to ignore asymmetric shadows)
            let capMinX = width, capMaxX = 0;
            const capBottom = Math.min(maxY + 150, height); 
            // We search from the top of the product down 150 pixels.
            for (let y = minY; y < capBottom; y++) {
              for (let x = minX; x <= maxX; x++) {
                if (isProduct[y * width + x]) {
                  if (x < capMinX) capMinX = x;
                  if (x > capMaxX) capMaxX = x;
                }
              }
            }
            let capCenterX = (capMinX + capMaxX) / 2;
            let trueWidth = capMaxX - capMinX;
            // If the cap somehow spans the whole image, fallback to normal bounding box center
            if (trueWidth > width * 0.9) {
                capCenterX = (minX + maxX) / 2;
                trueWidth = maxX - minX;
            }

            // Padding
            const padX = Math.round(width * 0.03);
            const padY = Math.round(height * 0.03);
            minX = Math.max(0, minX - padX);
            minY = Math.max(0, minY - padY);
            maxX = Math.min(width - 1, maxX + padX);
            maxY = Math.min(height - 1, maxY + padY);

            const cropW = maxX - minX + 1;
            const cropH = maxY - minY + 1;

            // STEP 5: Orientation normalization using TRUE WIDTH, not cropW (which includes shadow)
            let isSideways = false;
            let finalCropW = cropW;
            let finalCropH = cropH;

            // If the TRUE BOTTLE WIDTH is noticeably wider than its height, the pouch is sideways.
            if (trueWidth > cropH * 1.1) {
              isSideways = true;
              finalCropW = cropH; // swap dimensions for sizing calculation
              finalCropH = trueWidth; // use true width for height calculation when sideways
            }

            // STEP 6: Strict Uniform Sizing
            const OUTPUT = 1600;
            const TARGET_FILL = 0.78;
            const targetProductHeight = OUTPUT * TARGET_FILL;

            const scale = targetProductHeight / finalCropH;
            let renderW = Math.round(cropW * scale); // Render width uses full cropW to include shadow
            let renderH = Math.round(cropH * scale);

            const maxWidth = OUTPUT * 0.88;
            if (renderW > maxWidth && !isSideways) {
              const shrink = maxWidth / renderW;
              renderW = Math.round(renderW * shrink);
              renderH = Math.round(renderH * shrink);
              // note: if we shrink, scale changes, but we will recalculate destX below anyway.
            }

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = OUTPUT;
            finalCanvas.height = OUTPUT;
            const finalCtx = finalCanvas.getContext('2d');

            finalCtx.fillStyle = '#ffffff'; 
            finalCtx.fillRect(0, 0, OUTPUT, OUTPUT);

            if (isSideways) {
              finalCtx.save();
              finalCtx.translate(OUTPUT / 2, OUTPUT / 2);
              finalCtx.rotate(-Math.PI / 2); 
              finalCtx.drawImage(
                tempCanvas,
                minX, minY, cropW, cropH,
                -renderH / 2, -renderW / 2, renderH, renderW
              );
              finalCtx.restore();
            } else {
              // Recalculate actual scale used in case of maxWidth shrinkage
              const actualScale = renderH / cropH;
              // SMART CENTERING: Shift the drawn image so the capCenterX is exactly at OUTPUT / 2
              const destX = Math.round((OUTPUT / 2) - ((capCenterX - minX) * actualScale));
              const destY = Math.round((OUTPUT - renderH) / 2);
              
              finalCtx.drawImage(
                tempCanvas,
                minX, minY, cropW, cropH,
                destX, destY, renderW, renderH
              );
            }

            resolve({
              imageData: finalCanvas.toDataURL('image/jpeg', 0.95),
              sideways: isSideways
            });
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = uri;
        });
      }, rawDataUri);

      const base64Bytes = result.imageData.replace(/^data:image\/jpeg;base64,/, '');
      const buffer = Buffer.from(base64Bytes, 'base64');
      fs.writeFileSync(destPath, buffer);

      if (result.sideways) {
        console.log(`  Fixed orientation: Rotated -90 degrees.`);
      }
      
    } catch (e) {
      console.error(`  Failed: ${e.message}`);
    }
  }

  await browser.close();
  console.log("\n--- Complete: Ultimate Perfection! ---\n");
}

main().catch(console.error);
