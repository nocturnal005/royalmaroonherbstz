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
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');

  const pixels = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // Sample some points: top-left, top-right, bottom-left, bottom-right, center
        const getRGB = (x, y) => {
          const idx = (y * img.naturalWidth + x) * 4;
          return `(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`;
        };

        resolve({
          topLeft: getRGB(0, 0),
          topLeft10: getRGB(10, 10),
          topRight: getRGB(img.naturalWidth - 1, 0),
          topRight10: getRGB(img.naturalWidth - 11, 10),
          bottomLeft: getRGB(0, img.naturalHeight - 1),
          bottomLeft10: getRGB(10, img.naturalHeight - 11),
          bottomRight: getRGB(img.naturalWidth - 1, img.naturalHeight - 1),
          bottomRight10: getRGB(img.naturalWidth - 11, img.naturalHeight - 11),
          center: getRGB(img.naturalWidth / 2, img.naturalHeight / 2)
        });
      };
      img.src = 'http://localhost:5173/images/products/royal-herbs/moringa-oil-cold-pressed.jpg';
    });
  });

  console.log('Pixel samples:', pixels);
  await browser.close();
}
main().catch(console.error);
