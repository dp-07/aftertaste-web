// Shared helpers for the gate scripts (no dependencies).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

export const ROOT = new URL('..', import.meta.url).pathname;
export const DIST = join(ROOT, 'dist');
export const SITE = 'https://theaftertaste.in';

export function walkFiles(dir, filter = () => true) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkFiles(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

export const htmlFiles = () => walkFiles(DIST, (p) => p.endsWith('.html'));
export const read = (p) => readFileSync(p, 'utf8');
export const rel = (p) => relative(ROOT, p);

export function requireDist() {
  if (!existsSync(DIST)) {
    console.error('dist/ is missing: run `npm run build` first.');
    process.exit(1);
  }
}

/** Page URL path for a dist HTML file (build.format 'file'). */
export function pagePath(file) {
  const r = relative(DIST, file).replace(/\\/g, '/');
  if (r === 'index.html') return '/';
  return '/' + r.replace(/(\/index)?\.html$/, '');
}

/** Very small attribute reader for our own generated HTML. */
export function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

export function report(name, problems) {
  if (problems.length) {
    console.error(`✗ ${name}: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`✓ ${name}`);
}
