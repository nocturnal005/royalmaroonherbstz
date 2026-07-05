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

(async () => {
  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: "new"
  });
  
  const page = await browser.newPage();
  
  const imagesDir = path.join(__dirname, '../public/images/products/royal-herbs');
  const files = fs.readdirSync(imagesDir).filter(f => f.startsWith('ZOZ_') && f.toLowerCase().endsWith('.jpg'));
  
  const offCenterFiles = [];
  
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const dataUri = 'data:image/jpeg;base64,' + fs.readFileSync(filePath, 'base64');
    
    const result = await page.evaluate(async (uri) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          
          let topY = -1;
          let capLeft = canvas.width;
          let capRight = -1;
          
          // Find the very top non-white pixel
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const idx = (y * canvas.width + x) * 4;
              const r = data[idx];
              const g = data[idx+1];
              const b = data[idx+2];
              // Assuming white background is > 240
              if (r < 240 || g < 240 || b < 240) {
                if (topY === -1) topY = y;
              }
            }
            if (topY !== -1) break;
          }
          
          if (topY === -1) {
            resolve({ offCenter: false, error: 'blank' });
            return;
          }
          
          // Analyze the "cap" area (top 150 pixels of the bottle)
          const capBottom = topY + 150;
          for (let y = topY; y < Math.min(capBottom, canvas.height); y++) {
            for (let x = 0; x < canvas.width; x++) {
              const idx = (y * canvas.width + x) * 4;
              const r = data[idx];
              const g = data[idx+1];
              const b = data[idx+2];
              if (r < 240 || g < 240 || b < 240) {
                if (x < capLeft) capLeft = x;
                if (x > capRight) capRight = x;
              }
            }
          }
          
          const capCenter = (capLeft + capRight) / 2;
          const expectedCenter = canvas.width / 2;
          const offset = capCenter - expectedCenter;
          
          resolve({
            topY,
            capLeft,
            capRight,
            capCenter,
            offset,
            isOffCenter: Math.abs(offset) > 40 // Flag if cap center is more than 40px away from dead center
          });
        };
        img.src = uri;
      });
    }, dataUri);
    
    if (result.isOffCenter) {
      offCenterFiles.push({ file, offset: result.offset });
    }
  }
  
  await browser.close();
  
  console.log("Found " + offCenterFiles.length + " off-center images:");
  offCenterFiles.forEach(f => {
    const direction = f.offset < 0 ? "LEFT" : "RIGHT";
    console.log(`- ${f.file} (shifted ${Math.abs(Math.round(f.offset))}px to the ${direction})`);
  });
})();
