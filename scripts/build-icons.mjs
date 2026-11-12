// Builds the raster icons from the brand sources (committed outputs):
//   public/favicon.ico            16/32/48 from public/favicon.svg (PNG-in-ICO)
//   public/apple-touch-icon.png   180 from brand/app-icon-1024.png
//   public/icons/icon-192.png, icon-512.png, icon-maskable-512.png
// Usage: npm run icons
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './lib.mjs';

const pub = (p) => join(ROOT, 'public', p);
mkdirSync(pub('icons'), { recursive: true });
const appIcon = join(ROOT, 'brand/app-icon-1024.png');

// The favicon SVG's dark-scheme rule does not apply when rasterising, so the ICO is the light (paprika) mark.
const svg = readFileSync(pub('favicon.svg'));
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(pub('favicon.ico'), Buffer.concat([header, ...pngs]));

await sharp(appIcon).resize(180, 180).png({ compressionLevel: 9 }).toFile(pub('apple-touch-icon.png'));
await sharp(appIcon).resize(192, 192).png({ compressionLevel: 9 }).toFile(pub('icons/icon-192.png'));
await sharp(appIcon).resize(512, 512).png({ compressionLevel: 9 }).toFile(pub('icons/icon-512.png'));
// The wordmark sits well inside the maskable safe zone (central 80%) on a full-bleed cream square.
await sharp(appIcon).resize(512, 512).png({ compressionLevel: 9 }).toFile(pub('icons/icon-maskable-512.png'));
console.log('icons written');
