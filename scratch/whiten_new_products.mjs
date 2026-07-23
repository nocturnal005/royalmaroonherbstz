// Normalize new-product photo backgrounds to white so they match the
// existing catalog cards: sample the backdrop color from the image border,
// then scale each channel so the backdrop maps to pure white.
import sharp from 'sharp';

const SRC = 'D:/TZ added products';
const DST = 'D:/RM_Tanzania/public/images/products/royal-herbs';
const MAX = 1600;

const files = [
  ['Ashwagandha drops.jpeg', 'ashwagandha-drops.jpg'],
  ['Black Seed.png', 'black-seed.jpg'],
  ['Black Seed Soap.jpeg', 'black-seed-soap.jpg'],
  ['Cordyceps Powder 1.png', 'cordyceps-powder.jpg'],
  ['Damiana Leaves.jpeg', 'damiana-leaves.jpg'],
  ['Guinea Hen Weed.jpeg', 'guinea-hen-weed.jpg'],
  ['Horny Goat Weed 2.png', 'horny-goat-weed.jpg'],
  ['Jamaica Guaco 1.png', 'jamaica-guaco.jpg'],
  ["Lion's Mane Mushrooms.jpeg", 'lions-mane-mushrooms.jpg'],
  ['Medina 1.png', 'medina.jpg'],
  ['Sangre de Grado.jpeg', 'sangre-de-grado.jpg'],
  ['Shilajit Honey.jpeg', 'shilajit-honey.jpg'],
  ['snuff powder.jpeg', 'snuff-powder.jpg'],
  ['Tamarind Powder.png', 'tamarind-powder.jpg'],
  ['Traditional Chinese herbal formula-Back Tension.jpeg', 'tcm-back-tension.jpg'],
  ['Traditional Chinese herbal formula-Joint Stiffness.jpeg', 'tcm-joint-stiffness.jpg']
];

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

for (const [from, to] of files) {
  const base = sharp(`${SRC}/${from}`, { limitInputPixels: false })
    .rotate() // respect EXIF orientation
    .resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' });

  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  // sample a 12px frame around the border for the backdrop color
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

  // map the backdrop to white; cap the gain so dark accidental borders
  // can't blow the whole image out
  const gain = bg.map((v) => Math.min(255 / Math.max(v, 1), 1.45));

  await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .linear(gain, [0, 0, 0])
    .jpeg({ quality: 88 })
    .toFile(`${DST}/${to}`);

  console.log(`${to}: bg rgb(${bg.join(',')}) gain ${gain.map((g) => g.toFixed(2)).join('/')}`);
}
console.log('done');
