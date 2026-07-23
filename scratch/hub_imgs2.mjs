import sharp from 'sharp';
import { statSync } from 'fs';
const SRC = 'D:/tanzania001/';
const DEST = 'D:/RM_Tanzania/public/images/hub/';
const map = [
  ['fenugreek.png', 'fenugreek.jpg'],
  ['baobab.png', 'baobab.jpg'],
  ['Gotu kola.png', 'gotu-kola.jpg'],
  ['holy_basil_.png', 'holy-basil.jpg'],
  ['holy basil 2.png', 'holy-basil-2.jpg'],
  ['cinnamon 1.png', 'cinnamon.jpg'],
  ['cinnamon 2.png', 'cinnamon-2.jpg'],
];
for (const [s, o] of map) {
  const m = await sharp(SRC + s).metadata();
  await sharp(SRC + s)
    .flatten({ background: '#ffffff' })
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(DEST + o);
  console.log(`${o.padEnd(18)} ${m.width}x${m.height} -> ${Math.round(statSync(DEST+o).size/1024)}KB`);
}
