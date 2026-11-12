// SEO presence checks on dist/: sitemap + robots, and per page a unique title
// and description, a canonical URL, lang="en-IN" and an existing OG image.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, SITE, htmlFiles, pagePath, read, rel, report, requireDist, walkFiles } from './lib.mjs';

requireDist();
const problems = [];

for (const f of ['sitemap-index.xml', 'sitemap-0.xml', 'robots.txt']) {
  if (!existsSync(join(DIST, f))) problems.push(`missing ${f}`);
}
const robots = existsSync(join(DIST, 'robots.txt')) ? read(join(DIST, 'robots.txt')) : '';
if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) problems.push('robots.txt does not reference the sitemap');

const sitemap = existsSync(join(DIST, 'sitemap-0.xml')) ? read(join(DIST, 'sitemap-0.xml')) : '';
const inSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

const titles = new Map();
const descriptions = new Map();
for (const file of htmlFiles()) {
  const html = read(file);
  const path = pagePath(file);
  const noindex = /<meta name="robots" content="noindex"/.test(html);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];

  if (!/<html lang="en-IN"/.test(html)) problems.push(`${path}: lang is not en-IN`);
  if (!title) problems.push(`${path}: no <title>`);
  if (!desc) problems.push(`${path}: no meta description`);
  else if (desc.length < 50 || desc.length > 170) problems.push(`${path}: description is ${desc.length} chars`);
  if (title) titles.set(title, [...(titles.get(title) || []), path]);
  if (desc) descriptions.set(desc, [...(descriptions.get(desc) || []), path]);
  if (!ogImage || !existsSync(join(DIST, new URL(ogImage).pathname)))
    problems.push(`${path}: OG image missing (${ogImage})`);
  if (!/<meta name="twitter:card" content="summary_large_image"/.test(html)) problems.push(`${path}: no Twitter card`);

  if (noindex) {
    if ([...inSitemap].some((u) => new URL(u).pathname === path))
      problems.push(`${path}: noindex page is in the sitemap`);
    continue;
  }
  const expected = SITE + (path === '/' ? '/' : path);
  if (canonical !== expected) problems.push(`${path}: canonical ${canonical} ≠ ${expected}`);
  if (!inSitemap.has(expected)) problems.push(`${path}: not in sitemap`);
}

for (const [t, paths] of titles) if (paths.length > 1) problems.push(`duplicate title "${t}": ${paths.join(', ')}`);
for (const [d, paths] of descriptions)
  if (paths.length > 1) problems.push(`duplicate description on ${paths.join(', ')}: ${d.slice(0, 40)}…`);

// HTTPS only (.app is an HSTS-preloaded TLD) and one canonical host. Not
// links, so exempt: XML namespace identifiers (xmlns="http://…", exact strings
// by spec) and the font licences in /fonts/, which are redistributed verbatim.
const host = new URL(SITE).hostname;
const scanned = walkFiles(DIST, (p) => /\.(html|xml|txt|webmanifest|json|css|js|svg)$|_headers$|_redirects$/.test(p));
for (const file of scanned) {
  const text = read(file).replace(/xmlns(?::[\w-]+)?=(["'])[^"']*\1/g, '');
  if (!rel(file).startsWith('dist/fonts/')) {
    for (const m of text.matchAll(/http:\/\/[^\s"'<>)]+/g)) problems.push(`${rel(file)}: insecure URL ${m[0]}`);
  }
  for (const m of text.matchAll(/(?:www\.)?theaftertaste\.[a-z]+/g)) {
    if (m[0] !== host && m[0] !== `www.${host}`) problems.push(`${rel(file)}: non-canonical host ${m[0]}`);
  }
}

report('seo (sitemap, robots, titles, canonicals, OG, https-only, canonical host)', problems);
