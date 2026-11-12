// Slices tall review screenshots into chunks (reports/screens/slices/) for reading.
// Usage: node scripts/slice-screens.mjs <file.png> [chunkHeight]
import { mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './lib.mjs';

const [file, chunkArg] = process.argv.slice(2);
const chunk = Number(chunkArg || 1600);
const out = join(ROOT, 'reports/screens/slices');
mkdirSync(out, { recursive: true });
const { width, height } = await sharp(file).metadata();
for (let top = 0, i = 0; top < height; top += chunk, i++) {
  const h = Math.min(chunk, height - top);
  const name = join(out, `${basename(file, '.png')}-${String(i).padStart(2, '0')}.png`);
  await sharp(file).extract({ left: 0, top, width, height: h }).toFile(name);
  console.log(name);
}
