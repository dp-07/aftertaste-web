// Rewrites the inline scripts' sha256 hashes in public/_headers: the theme
// script (every page) and the /coffee copy button script. Run after editing
// either; `npm run check:csp` verifies the result.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const SCRIPTS = ['src/scripts/theme.js', 'src/scripts/coffee-copy.js'];
const hashes = SCRIPTS.map((f) => {
  const hash = createHash('sha256')
    .update(readFileSync(join(ROOT, f), 'utf8'))
    .digest('base64');
  console.log(`${f} sha256-${hash}`);
  return `'sha256-${hash}'`;
});
const file = join(ROOT, 'public/_headers');
const before = readFileSync(file, 'utf8');
const after = before.replace(/(script-src 'self')(?: 'sha256-[^']+')+/, `$1 ${hashes.join(' ')}`);
if (after === before && !hashes.every((h) => before.includes(h)))
  throw new Error('No script-src hash found in public/_headers');
writeFileSync(file, after);
