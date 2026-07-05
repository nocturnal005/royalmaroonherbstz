const puppeteer = require('puppeteer-core');
const fs = require('fs');

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

async function debugPixels() {
  const chromePath = getChromePath();
  const sourcePath = "D:\\new product listings\\Highlights\\ZOZ_2106.JPG";

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new"
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log(msg.text()));
  await page.setContent('<html><body></body></html>');

  const rawBuffer = fs.readFileSync(sourcePath);
  const rawBase64 = rawBuffer.toString('base64');
  const rawDataUri = `data:image/jpeg;base64,${rawBase64}`;

  await page.evaluate(async (uri) => {
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

        // Sample shadow area (roughly middle height, right side of pouch)
        // Let's print out values around x = width * 0.7, y = height * 0.5
        const startX = Math.round(width * 0.65);
        const endX = Math.round(width * 0.75);
        const startY = Math.round(height * 0.45);
        const endY = Math.round(height * 0.55);

        console.log(`Sampling from X [${startX}, ${endX}], Y [${startY}, ${endY}]`);

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

        console.log(`Backdrop color: RGB [${bgR}, ${bgG}, ${bgB}]`);

        let count = 0;
        for (let y = startY; y < endY; y += 20) {
          for (let x = startX; x < endX; x += 20) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            const dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);
            const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);
            const brightness = (r + g + b) / 3;
            if (count < 15) {
              console.log(`Px [${x}, ${y}] - RGB [${r}, ${g}, ${b}] - dist: ${dist.toFixed(1)}, maxDiff: ${maxDiff}, brightness: ${brightness.toFixed(1)}`);
              count++;
            }
          }
        }
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = uri;
    });
  }, rawDataUri);

  await browser.close();
}

debugPixels().catch(console.error);
