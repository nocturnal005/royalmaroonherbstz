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

  const sourceDir = "D:\\new product listings\\Highlights";
  const targetDir = path.resolve("public/images/staging");
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'));
  console.log(`Found ${files.length} images to process.`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  // Pass 1: Process all images with adaptive backdrop detection
  const imageFingerprints = []; // For deduplication

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(targetDir, file);

    console.log(`[${i+1}/${files.length}] Processing ${file}...`);
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

            // STEP 1: Adaptive backdrop detection
            // Sample 4 corner regions (20x20 pixel blocks) to detect backdrop color
            const sampleSize = 20;
            let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
            
            const corners = [
              [0, 0],                                    // top-left
              [width - sampleSize, 0],                   // top-right
              [0, height - sampleSize],                  // bottom-left
              [width - sampleSize, height - sampleSize]  // bottom-right
            ];

            for (const [cx, cy] of corners) {
              for (let dy = 0; dy < sampleSize; dy++) {
                for (let dx = 0; dx < sampleSize; dx++) {
                  const px = cx + dx;
                  const py = cy + dy;
                  const idx = (py * width + px) * 4;
                  bgR += data[idx];
                  bgG += data[idx+1];
                  bgB += data[idx+2];
                  bgCount++;
                }
              }
            }
            bgR = Math.round(bgR / bgCount);
            bgG = Math.round(bgG / bgCount);
            bgB = Math.round(bgB / bgCount);

            // STEP 2: Replace backdrop pixels with stone-50
            // Any pixel "close" to the sampled backdrop color gets replaced
            const BG_THRESHOLD = 45;       // color distance to backdrop
            const BG_SOFT_THRESHOLD = 55;  // soft transition zone
            const targetR = 250, targetG = 250, targetB = 249; // #fafaf9

            const isProduct = new Uint8Array(width * height);

            for (let k = 0; k < data.length; k += 4) {
              const r = data[k];
              const g = data[k+1];
              const b = data[k+2];
              const pixelIndex = k / 4;
              
              // Color distance to sampled backdrop
              const dist = Math.sqrt(
                (r - bgR) * (r - bgR) +
                (g - bgG) * (g - bgG) +
                (b - bgB) * (b - bgB)
              );

              if (dist < BG_THRESHOLD) {
                // Clearly backdrop -> replace
                data[k] = targetR;
                data[k+1] = targetG;
                data[k+2] = targetB;
                isProduct[pixelIndex] = 0;
              } else if (dist < BG_SOFT_THRESHOLD) {
                // Transition zone -> blend
                const factor = (dist - BG_THRESHOLD) / (BG_SOFT_THRESHOLD - BG_THRESHOLD);
                data[k] = Math.round(targetR + (r - targetR) * factor);
                data[k+1] = Math.round(targetG + (g - targetG) * factor);
                data[k+2] = Math.round(targetB + (b - targetB) * factor);
                isProduct[pixelIndex] = factor > 0.5 ? 1 : 0;
              } else {
                // Product pixel — untouched
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

            // STEP 4: Uniform sizing onto 1600x1600
            const OUTPUT = 1600;
            const TARGET_FILL = 0.78;
            const targetProductHeight = OUTPUT * TARGET_FILL;

            const scale = targetProductHeight / cropH;
            const clampedScale = Math.min(scale, 1.5);
            let renderW = Math.round(cropW * clampedScale);
            let renderH = Math.round(cropH * clampedScale);

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

            finalCtx.fillStyle = '#fafaf9';
            finalCtx.fillRect(0, 0, OUTPUT, OUTPUT);

            const destX = Math.round((OUTPUT - renderW) / 2);
            const destY = Math.round((OUTPUT - renderH) / 2);

            finalCtx.drawImage(
              tempCanvas,
              minX, minY, cropW, cropH,
              destX, destY, renderW, renderH
            );

            // STEP 5: Generate a tiny fingerprint for deduplication
            // Downscale to 8x8 and extract average luminance per cell
            const fpCanvas = document.createElement('canvas');
            fpCanvas.width = 8;
            fpCanvas.height = 8;
            const fpCtx = fpCanvas.getContext('2d');
            fpCtx.drawImage(finalCanvas, 0, 0, 8, 8);
            const fpData = fpCtx.getImageData(0, 0, 8, 8).data;
            const fingerprint = [];
            for (let p = 0; p < fpData.length; p += 4) {
              fingerprint.push(Math.round(0.299*fpData[p] + 0.587*fpData[p+1] + 0.114*fpData[p+2]));
            }

            resolve({
              imageData: finalCanvas.toDataURL('image/jpeg', 0.95),
              fingerprint: fingerprint,
              bgColor: [bgR, bgG, bgB]
            });
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = uri;
        });
      }, rawDataUri);

      const base64Bytes = result.imageData.replace(/^data:image\/jpeg;base64,/, '');
      const buffer = Buffer.from(base64Bytes, 'base64');
      fs.writeFileSync(destPath, buffer);

      imageFingerprints.push({
        file: file,
        fingerprint: result.fingerprint,
        fileSize: rawBuffer.length
      });

      console.log(`  Backdrop detected: rgb(${result.bgColor.join(',')})`);
      
    } catch (e) {
      console.error(`  Failed: ${e.message}`);
    }
  }

  await browser.close();
  console.log("\n--- Pass 1 Complete: All images processed ---\n");

  // Pass 2: Deduplication using perceptual fingerprints
  console.log("--- Pass 2: Deduplicating similar images ---");
  
  function fingerprintDistance(fp1, fp2) {
    let sum = 0;
    for (let i = 0; i < fp1.length; i++) {
      sum += (fp1[i] - fp2[i]) * (fp1[i] - fp2[i]);
    }
    return Math.sqrt(sum / fp1.length); // RMS distance
  }

  // Group similar images (RMS distance < 18 = visually same product)
  const SIMILARITY_THRESHOLD = 18;
  const groups = [];
  const assigned = new Set();

  for (let i = 0; i < imageFingerprints.length; i++) {
    if (assigned.has(i)) continue;
    
    const group = [i];
    assigned.add(i);

    for (let j = i + 1; j < imageFingerprints.length; j++) {
      if (assigned.has(j)) continue;
      const dist = fingerprintDistance(
        imageFingerprints[i].fingerprint,
        imageFingerprints[j].fingerprint
      );
      if (dist < SIMILARITY_THRESHOLD) {
        group.push(j);
        assigned.add(j);
      }
    }
    groups.push(group);
  }

  console.log(`Found ${groups.length} unique products from ${imageFingerprints.length} images.`);

  // From each group, keep the image with the largest original file size (best quality)
  const keepFiles = new Set();
  let removedCount = 0;

  for (const group of groups) {
    // Sort by file size descending
    group.sort((a, b) => imageFingerprints[b].fileSize - imageFingerprints[a].fileSize);
    const bestIdx = group[0];
    keepFiles.add(imageFingerprints[bestIdx].file);

    if (group.length > 1) {
      console.log(`  Keeping ${imageFingerprints[bestIdx].file} (${(imageFingerprints[bestIdx].fileSize/1024).toFixed(0)}KB), removing ${group.length - 1} duplicates:`);
      for (let g = 1; g < group.length; g++) {
        const removeFile = imageFingerprints[group[g]].file;
        console.log(`    - ${removeFile} (${(imageFingerprints[group[g]].fileSize/1024).toFixed(0)}KB)`);
        const removePath = path.join(targetDir, removeFile);
        if (fs.existsSync(removePath)) {
          fs.unlinkSync(removePath);
        }
        removedCount++;
      }
    }
  }

  console.log(`\nRemoved ${removedCount} duplicate images. ${keepFiles.size} unique products remain.\n`);

  // Write updated manifest
  const remainingFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.JPG') || f.endsWith('.jpg'));
  fs.writeFileSync('src/data/stagingImages.json', JSON.stringify(remainingFiles, null, 2));
  console.log(`Manifest updated with ${remainingFiles.length} images.`);
}

main().catch(console.error);
