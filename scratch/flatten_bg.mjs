// Flatten new-product photo backdrops to pure white so every card in the
// grid shares the same background. Pipeline per image:
//   1. resize + global white-point gain (border median -> white)
//   2. flood-fill the backdrop from the borders: walk smooth gradients,
//      stop at product edges / contact shadows / saturated colors
//   3. feather the mask and lerp backdrop pixels to white
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

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

for (const [from, to] of files) {
  const { data, info } = await sharp(`${SRC}/${from}`, { limitInputPixels: false })
    .rotate()
    .resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const n = w * h;

  // --- 1. global white-point from border median -------------------------
  const rs = [], gs = [], bs = [];
  for (let y = 0; y < h; y += 4) for (const x of [0, 1, 2, 3, w - 4, w - 3, w - 2, w - 1]) {
    const i = (y * w + x) * ch; rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
  }
  for (let x = 0; x < w; x += 4) for (const y of [0, 1, 2, 3, h - 4, h - 3, h - 2, h - 1]) {
    const i = (y * w + x) * ch; rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
  }
  const gain = [median(rs), median(gs), median(bs)].map((v) => Math.min(255 / Math.max(v, 1), 1.45));
  for (let i = 0; i < n; i++) {
    const o = i * ch;
    data[o] = Math.min(255, Math.round(data[o] * gain[0]));
    data[o + 1] = Math.min(255, Math.round(data[o + 1] * gain[1]));
    data[o + 2] = Math.min(255, Math.round(data[o + 2] * gain[2]));
  }

  // --- 2. flood-fill backdrop from borders ------------------------------
  // A pixel can join the backdrop if it is near-neutral and bright, and
  // differs only slightly from the neighbour it was reached from (smooth
  // gradient). Product edges and contact shadows break both rules.
  const mask = new Uint8Array(n); // 255 = backdrop
  const queue = new Int32Array(n);
  let qh = 0, qt = 0;
  const canBeBg = (o) => {
    const r = data[o], g = data[o + 1], b = data[o + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mx - mn <= 42 && mn >= 150;
  };
  const smooth = (o, p) =>
    Math.abs(data[o] - data[p]) + Math.abs(data[o + 1] - data[p + 1]) + Math.abs(data[o + 2] - data[p + 2]) <= 26;
  const seed = (i) => {
    if (!mask[i] && canBeBg(i * ch)) { mask[i] = 255; queue[qt++] = i; }
  };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (qh < qt) {
    const i = queue[qh++];
    const x = i % w, y = (i / w) | 0, o = i * ch;
    if (x > 0 && !mask[i - 1] && canBeBg(o - ch) && smooth(o - ch, o)) { mask[i - 1] = 255; queue[qt++] = i - 1; }
    if (x < w - 1 && !mask[i + 1] && canBeBg(o + ch) && smooth(o + ch, o)) { mask[i + 1] = 255; queue[qt++] = i + 1; }
    if (y > 0 && !mask[i - w] && canBeBg(o - w * ch) && smooth(o - w * ch, o)) { mask[i - w] = 255; queue[qt++] = i - w; }
    if (y < h - 1 && !mask[i + w] && canBeBg(o + w * ch) && smooth(o + w * ch, o)) { mask[i + w] = 255; queue[qt++] = i + w; }
  }
  const bgShare = qt / n;

  // --- 3. feather mask, lerp backdrop to white --------------------------
  const soft = await sharp(Buffer.from(mask), { raw: { width: w, height: h, channels: 1 } })
    .blur(2.5)
    .raw()
    .toBuffer();
  const out = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) {
    const o = i * ch, t = i * 3, a = soft[i] / 255;
    out[t] = Math.round(data[o] + (255 - data[o]) * a);
    out[t + 1] = Math.round(data[o + 1] + (255 - data[o + 1]) * a);
    out[t + 2] = Math.round(data[o + 2] + (255 - data[o + 2]) * a);
  }
  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 88 })
    .toFile(`${DST}/${to}`);
  console.log(`${to}: backdrop ${(bgShare * 100).toFixed(0)}% of frame`);
}
console.log('done');
