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

  // Use the remaining products from staging manifest
  const sourceDir = "D:\\new product listings\\Highlights";
  const targetDir = path.resolve("public/images/products/royal-herbs");
  const manifest = JSON.parse(fs.readFileSync('src/data/stagingImages.json', 'utf8'));
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Found ${manifest.length} images to re-process and align.`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
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

      const result = await page.evaluate(async (uri, filename) => {
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
            bgR = Math.round((cornerColors[0].r + cornerColors[1].r) / 2);
            bgG = Math.round((cornerColors[0].g + cornerColors[1].g) / 2);
            bgB = Math.round((cornerColors[0].b + cornerColors[1].b) / 2);

            // STEP 2: Replace backdrop pixels with stone-50
            const BG_THRESHOLD = 45;       
            const BG_SOFT_THRESHOLD = 55;  
            const targetR = 255, targetG = 255, targetB = 255; // #ffffff

            const isProduct = new Uint8Array(width * height);

            const bgSum = bgR + bgG + bgB;
            const nbgR = bgR / bgSum, nbgG = bgG / bgSum, nbgB = bgB / bgSum;

            const skipBgRemoval = ["ZOZ_2246.JPG", "ZOZ_2249.JPG", "ZOZ_2250.JPG", "ZOZ_2252.JPG", "ZOZ_2254.JPG", "ZOZ_2257.JPG"].includes(filename);

            for (let k = 0; k < data.length; k += 4) {
              const r = data[k], g = data[k+1], b = data[k+2];
              const pixelIndex = k / 4;

              if (skipBgRemoval) {
                // If skipping background removal, we do not modify the raw pixels at all.
                // We only populate isProduct for bounding box calculation.
                // Since the backdrop is already white, any pixel sufficiently far from white is part of the product.
                const distFromWhite = Math.sqrt((r - 255)**2 + (g - 255)**2 + (b - 255)**2);
                isProduct[pixelIndex] = distFromWhite > 15 ? 1 : 0;
                continue;
              }
              
              let dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);

              const sum = r + g + b;
              if (sum > 30) {
                const nr = r / sum, ng = g / sum, nb = b / sum;
                const chromDist = Math.sqrt((nr - nbgR)**2 + (ng - nbgG)**2 + (nb - nbgB)**2) * 255;
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

            // Padding
            const padX = Math.round(width * 0.03);
            const padY = Math.round(height * 0.03);
            minX = Math.max(0, minX - padX);
            minY = Math.max(0, minY - padY);
            maxX = Math.min(width - 1, maxX + padX);
            maxY = Math.min(height - 1, maxY + padY);

            const cropW = maxX - minX + 1;
            const cropH = maxY - minY + 1;

            // STEP 4: Orientation normalization
            let isSideways = false;
            let finalCropW = cropW;
            let finalCropH = cropH;

            // If the bounding box is noticeably wider than it is tall, the pouch is lying on its side (rotated camera)
            if (cropW > cropH * 1.1) {
              isSideways = true;
              finalCropW = cropH; // swap dimensions for sizing
              finalCropH = cropW;
            }

            // STEP 5: Strict Uniform Sizing
            const OUTPUT = 1600;
            const TARGET_FILL = 0.78;
            const targetProductHeight = OUTPUT * TARGET_FILL;

            // We do NOT clamp the scale. We want EVERY product to be exactly the target height.
            const scale = targetProductHeight / finalCropH;
            let renderW = Math.round(finalCropW * scale);
            let renderH = Math.round(finalCropH * scale);

            // Width bounding just in case it's extremely wide
            const maxWidth = OUTPUT * 0.88;
            if (renderW > maxWidth) {
              const shrink = maxWidth / renderW;
              renderW = Math.round(renderW * shrink);
              renderH = Math.round(renderH * shrink);
            }

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = OUTPUT;
            finalCanvas.height = OUTPUT;
            const finalCtx = finalCanvas.getContext('2d');

            finalCtx.fillStyle = '#ffffff';
            finalCtx.fillRect(0, 0, OUTPUT, OUTPUT);

            if (isSideways) {
              // Draw rotated by -90 degrees
              finalCtx.save();
              finalCtx.translate(OUTPUT / 2, OUTPUT / 2);
              finalCtx.rotate(-Math.PI / 2); // Rotate counter-clockwise (usual for portrait taken in landscape)
              
              // We draw with width=renderH and height=renderW because we are in a rotated frame
              finalCtx.drawImage(
                tempCanvas,
                minX, minY, cropW, cropH,
                -renderH / 2, -renderW / 2, renderH, renderW
              );
              finalCtx.restore();
            } else {
              const destX = Math.round((OUTPUT - renderW) / 2);
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
      }, rawDataUri, file);

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
  console.log("\n--- Complete: All products resized to strictly uniform dimensions ---\n");
}

main().catch(console.error);
