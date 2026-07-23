import sharp from 'sharp';
const dir = 'D:/RM_Tanzania/public/images/hub/';
const files = ['moringa','turmeric','ashwagandha','neem','guava'];
for (const f of files) {
  const src = dir + f + '.png';
  const out = dir + f + '.jpg';
  const meta = await sharp(src).metadata();
  await sharp(src)
    .flatten({ background: '#ffffff' })
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  const kb = Math.round((await import('fs')).statSync(out).size/1024);
  console.log(`${f}: ${meta.width}x${meta.height} png -> ${out.split('/').pop()} ${kb}KB`);
}
