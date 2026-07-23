import sharp from 'sharp';
const SRC='D:/tanzania001/mushroom blend.jpeg';
const OUT='D:/RM_Tanzania/public/images/products/cutouts/mushroom-blend.png';
// Pouch and shelf share the same tan, so color keying fails. Isolate the pouch
// with a hand-traced silhouette mask on a fresh crop, feathered, transparent PNG.
const W=640,H=900;
const base = sharp(SRC).extract({ left:110, top:18, width:748, height:1052 }).resize(W,H,{fit:'fill'});
// stand-up pouch silhouette: crinkled top seal (narrower), straight body sides,
// flat rounded bottom. Traced against the reference.
const path = `
  M 34,168
  L 150,40 L 205,18 L 300,22 L 400,18 L 470,34 L 606,168
  L 606,842
  Q 606,884 566,884
  L 74,884
  Q 34,884 34,842
  Z`;
const mask = Buffer.from(
  `<svg width="${W}" height="${H}"><path d="${path}" fill="#fff"/></svg>`
);
// blur the mask edge slightly for a clean anti-aliased cut
const maskBuf = await sharp(mask).blur(1.2).toColourspace('b-w').raw().toBuffer();
const { data } = await base.ensureAlpha().raw().toBuffer({ resolveWithObject:true });
for(let i=0;i<W*H;i++){ data[i*4+3]=maskBuf[i]; }
// trim to content bbox + small pad
let minX=W,minY=H,maxX=0,maxY=0;
for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(data[(y*W+x)*4+3]>8){ if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y; } }
const pad=6; minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(W-1,maxX+pad);maxY=Math.min(H-1,maxY+pad);
await sharp(Buffer.from(data.buffer),{raw:{width:W,height:H,channels:4}})
  .extract({left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1}).png().toFile(OUT);
// also composite on white so I can review it as the card would show
await sharp(OUT).flatten({background:'#ffffff'}).toFile('D:/RM_Tanzania/scratch/mushroom-onwhite.png');
console.log('done', maxX-minX+1, 'x', maxY-minY+1);
