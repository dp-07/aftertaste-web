// JS budget: the landing page ships ≤ 30 KB of gzipped JS (module scripts and
// everything they import); legal, support and 404 pages ship no script files
// (the inline theme script is the only JS there).
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { DIST, attrs, htmlFiles, pagePath, read, report, requireDist } from './lib.mjs';

requireDist();
const LANDING_MAX = 30 * 1024;
const NO_JS = new Set(['/privacy', '/terms', '/support', '/404']);
const problems = [];
const summary = [];

function collect(file, seen) {
  if (seen.has(file) || !existsSync(file)) return;
  seen.add(file);
  const code = readFileSync(file, 'utf8');
  for (const m of code.matchAll(/(?:import|from)\s*\(?\s*["'](\.{1,2}\/[^"']+\.js)["']/g)) {
    collect(join(dirname(file), m[1]), seen);
  }
}

for (const file of htmlFiles()) {
  const html = read(file);
  const path = pagePath(file);
  const seen = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const a = attrs(m[1]);
    if (a.src) collect(join(DIST, a.src.replace(/^\//, '')), seen);
  }
  const inline = [...html.matchAll(/<script\b(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .join('');
  const gz = [...seen].reduce((n, f) => n + gzipSync(readFileSync(f)).length, 0) + gzipSync(inline).length;
  summary.push(`${path.padEnd(10)} ${seen.size} file(s), ${(gz / 1024).toFixed(1)} KB gz (incl. inline)`);
  if (path === '/' && gz > LANDING_MAX) problems.push(`/: ${(gz / 1024).toFixed(1)} KB gz > 30 KB`);
  if (NO_JS.has(path) && seen.size > 0) problems.push(`${path}: ships ${seen.size} script file(s); expected none`);
}

for (const line of summary) console.log(`  ${line}`);
report('js budget', problems);
