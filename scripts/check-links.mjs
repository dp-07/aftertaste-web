// Internal link checker for dist/: every href/src/srcset that points at this
// site must resolve to a built file, and every #fragment to an element id.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, SITE, attrs, htmlFiles, pagePath, read, report, requireDist } from './lib.mjs';

requireDist();
const problems = [];
const ids = new Map();
const files = htmlFiles();

const idsOf = (file) => {
  if (!ids.has(file)) {
    const set = new Set();
    for (const m of read(file).matchAll(/\sid="([^"]+)"/g)) set.add(m[1]);
    ids.set(file, set);
  }
  return ids.get(file);
};

function resolveFile(path) {
  const clean = decodeURIComponent(path.split('?')[0]);
  const candidates =
    clean === '/'
      ? ['index.html']
      : clean.endsWith('/')
        ? [clean + 'index.html']
        : /\.[a-z0-9]+$/i.test(clean)
          ? [clean]
          : [clean + '.html', clean + '/index.html'];
  for (const c of candidates) {
    const f = join(DIST, c);
    if (existsSync(f)) return f;
  }
  return null;
}

for (const file of files) {
  const html = read(file);
  const here = pagePath(file);
  for (const m of html.matchAll(/<(a|link|img|source|script|use|image)\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    const urls = [];
    if (a.href) urls.push(a.href);
    if (a.src) urls.push(a.src);
    if (a.srcset) urls.push(...a.srcset.split(',').map((s) => s.trim().split(/\s+/)[0]));
    for (const raw of urls) {
      if (!raw || /^(mailto:|tel:|data:)/.test(raw)) continue;
      let url;
      try {
        url = new URL(raw, SITE + here);
      } catch {
        problems.push(`${here}: unparsable URL ${raw}`);
        continue;
      }
      if (url.origin !== SITE) continue; // external: not checked
      const target = url.pathname === here && raw.startsWith('#') ? file : resolveFile(url.pathname);
      if (!target) {
        problems.push(`${here}: broken link ${raw}`);
        continue;
      }
      if (url.hash && url.hash.length > 1 && target.endsWith('.html')) {
        const id = decodeURIComponent(url.hash.slice(1));
        if (!idsOf(target).has(id)) problems.push(`${here}: missing anchor ${raw}`);
      }
    }
  }
}

report(`links (${files.length} pages)`, problems);
