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
  { file: 'bladderwrack-powder.jpg', angle: 2.0 },
  { file: 'sea-moss-powder.jpg', angle: 2.0 }
];

async function main() {
  // 1. Restore backups to start fresh from original images
  console.log('Restoring original image backups...');
  for (const target of targets) {
    const destPath = path.resolve(`public/images/products/royal-herbs/${target.file}`);
    const backupPath = destPath + '.backup';
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, destPath);
      console.log(`  Restored ${target.file} from backup.`);
    } else {
      console.warn(`  Backup for ${target.file} not found!`);
    }
  }

  const chromePath = getChromePath();
  if (!chromePath) {
    console.error('Chrome/Edge not found.');
    process.exit(1);
  }

  console.log('\nLaunching browser to rotate images with fine-tuned angles...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/');

  for (const target of targets) {
    const imageUrl = `http://localhost:5173/images/products/royal-herbs/${target.file}?nocache=${Date.now()}`;
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
    fs.writeFileSync(destPath, buffer);
    console.log(`  Successfully wrote rotated image to: ${destPath}`);
  }

  await browser.close();
  console.log('\nFine-tuned rotation operations completed.');
}

main().catch(console.error);
