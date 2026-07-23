// Process the replacement Bladderwrack Powder photo with the same pipeline
// as whiten_new_products.mjs: whiten the sampled backdrop, cap at 1600px,
// save as JPEG q88. New filename so stale caches can't serve the old shot.
import sharp from 'sharp';

const SRC = 'D:/TZ added products/bladderwrack powder 001.jpeg';
const DST = 'D:/RM_Tanzania/public/images/products/royal-herbs/bladderwrack-powder-001.jpg';
const MAX = 1600;

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const base = sharp(SRC, { limitInputPixels: false })
  .rotate()
  .resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
  .flatten({ background: '#ffffff' });

const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h, channels: ch } = info;

const rs = [], gs = [], bs = [];
const frame = 12;
const push = (x, y) => {
  const i = (y * w + x) * ch;
  rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
};
for (let y = 0; y < h; y += 4) {
  for (let x = 0; x < frame; x++) { push(x, y); push(w - 1 - x, y); }
}
for (let x = 0; x < w; x += 4) {
  for (let y = 0; y < frame; y++) { push(x, y); push(x, h - 1 - y); }
}
const bg = [median(rs), median(gs), median(bs)];
const gain = bg.map((v) => Math.min(255 / Math.max(v, 1), 1.45));

await sharp(data, { raw: { width: w, height: h, channels: ch } })
  .linear(gain, [0, 0, 0])
  .jpeg({ quality: 88 })
  .toFile(DST);

console.log(`done: bg rgb(${bg.join(',')}) gain ${gain.map((g) => g.toFixed(2)).join('/')}`);
