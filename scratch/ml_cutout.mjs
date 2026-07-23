// ML background removal for the new product photos: segment the product,
// composite onto pure white, trim, and pad to a consistent framing so all
// cards in the grid share the same clean background.
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';

const SRC = 'D:/TZ added products';
const DST = 'D:/RM_Tanzania/public/images/products/royal-herbs';

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

for (const [from, to] of files) {
  try {
    const png = await sharp(`${SRC}/${from}`, { limitInputPixels: false })
      .rotate()
      .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();

    const blob = new Blob([png], { type: 'image/png' });
    const cut = Buffer.from(await (await removeBackground(blob)).arrayBuffer());

    // composite on white, trim to the product, pad evenly
    const onWhite = await sharp(cut).flatten({ background: '#ffffff' }).toBuffer();
    let img = sharp(onWhite).trim({ background: '#ffffff', threshold: 12 });
    const trimmed = await img.toBuffer({ resolveWithObject: true }).catch(() => null);
    let final;
    if (trimmed && trimmed.info.width > 50 && trimmed.info.height > 50) {
      const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 0.07);
      final = sharp(trimmed.data).extend({
        top: pad, bottom: pad, left: pad, right: pad,
        background: '#ffffff'
      });
    } else {
      final = sharp(onWhite); // trim failed; keep uncropped
    }
    await final.jpeg({ quality: 90 }).toFile(`${DST}/${to}`);
    console.log(`ok  ${to}${trimmed ? '' : '  (no trim)'}`);
  } catch (err) {
    console.log(`FAIL ${to}: ${err.message}`);
  }
}
console.log('done');
