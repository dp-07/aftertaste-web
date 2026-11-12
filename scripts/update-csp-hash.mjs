// Rewrites the theme script's sha256 in public/_headers from src/scripts/theme.js.
// Run after editing the theme script; `npm run check:csp` verifies the result.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const script = readFileSync(join(ROOT, 'src/scripts/theme.js'), 'utf8');
const hash = createHash('sha256').update(script).digest('base64');
const file = join(ROOT, 'public/_headers');
const before = readFileSync(file, 'utf8');
const after = before.replace(/(script-src 'self' )'sha256-[^']+'/, `$1'sha256-${hash}'`);
if (after === before && !before.includes(hash)) throw new Error('No script-src hash found in public/_headers');
writeFileSync(file, after);
console.log(`theme script sha256-${hash}`);
