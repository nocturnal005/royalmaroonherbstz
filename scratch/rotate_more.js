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

const targets = [
  { file: 'sea-moss-powder.jpg', angle: 4.5 },
  { file: 'black-maca-powder.jpg', angle: 3.0 }
];

async function main() {
  const chromePath = getChromePath();
  if (!chromePath) {
    console.error('Chrome/Edge not found.');
    process.exit(1);
  }

  console.log('Launching browser to rotate images...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/');

  for (const target of targets) {
    const imageUrl = `http://localhost:5173/images/products/royal-herbs/${target.file}`;
    console.log(`\nProcessing: ${target.file} (Rotating ${target.angle}° clockwise)`);

    const base64Data = await page.evaluate(async (url, angle) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log(`Image loaded: ${img.naturalWidth}x${img.naturalHeight}`);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');

          // White background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Center and rotate
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(angle * Math.PI / 180);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => reject(new Error('Image failed to load: ' + url));
        img.src = url;
      });
    }, imageUrl, target.angle);

    const base64Bytes = base64Data.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Bytes, 'base64');

    const destPath = path.resolve(`public/images/products/royal-herbs/${target.file}`);
    
    // Backup
    const backupPath = destPath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(destPath, backupPath);
      console.log(`  Backup created at: ${backupPath}`);
    }

    fs.writeFileSync(destPath, buffer);
    console.log(`  Successfully wrote rotated image to: ${destPath}`);
  }

  await browser.close();
  console.log('\nRotation operations completed successfully.');
}

main().catch(console.error);
