// Optimize the owner's wholesale/shop photos into the site.
import sharp from 'sharp';
import fs from 'fs';

const SRC = 'D:/wholesale';
const DST = 'D:/RM_Tanzania/public/images/wholesale';
fs.mkdirSync(DST, { recursive: true });

// wholesale 12.png is the standalone shop-front feature image
const jobs = [['wholesale 12.png', 'shop-front.jpg']];
for (let i = 1; i <= 11; i++) jobs.push([`wholesale ${i}.jpeg`, `gallery-${String(i).padStart(2, '0')}.jpg`]);

for (const [from, to] of jobs) {
  const out = await sharp(`${SRC}/${from}`, { limitInputPixels: false })
    .rotate()
    .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 82 })
    .toFile(`${DST}/${to}`);
  console.log(`${to}: ${out.width}x${out.height} ${(out.size / 1024).toFixed(0)} KB`);
}
console.log('done');
