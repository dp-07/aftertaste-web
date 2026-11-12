// Internal link checker for dist/: every href/src/srcset that points at this
// site must resolve to a built file, and every #fragment to an element id.
// Also checks relative links (and #anchors) in the Markdown docs.
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DIST, ROOT, SITE, attrs, htmlFiles, pagePath, read, rel, report, requireDist } from './lib.mjs';

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

// Markdown docs: relative links must point at files that exist, and #anchors
// at headings (GitHub-style slugs). External links are not checked.
const slug = (h) =>
  h
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
const mdIds = (file) =>
  new Set(
    read(file)
      .replace(/```[\s\S]*?```/g, '')
      .split('\n')
      .filter((l) => /^#{1,6}\s/.test(l))
      .map((l) => slug(l.replace(/^#+\s+/, ''))),
  );
const docs = [
  join(ROOT, 'README.md'),
  join(ROOT, 'CLAUDE.md'),
  ...readdirSync(join(ROOT, 'docs'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(ROOT, 'docs', f)),
].filter(existsSync);
for (const file of docs) {
  const text = read(file).replace(/```[\s\S]*?```/g, '');
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const [target, hash] = m[1].split('#');
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    const dest = target ? resolve(dirname(file), target) : file;
    if (!existsSync(dest)) {
      problems.push(`${rel(file)}: broken link ${m[1]}`);
    } else if (hash && dest.endsWith('.md') && !mdIds(dest).has(hash)) {
      problems.push(`${rel(file)}: missing anchor ${m[1]}`);
    }
  }
}

report(`links (${files.length} pages, ${docs.length} docs)`, problems);
