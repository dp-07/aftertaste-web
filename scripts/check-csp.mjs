// CSP consistency on dist/: every inline <script> must be allowed by a hash in
// public/_headers; no inline styles; no third-party resources.
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, SITE, attrs, htmlFiles, pagePath, read, report, requireDist } from './lib.mjs';

requireDist();
const problems = [];
const headers = read(join(ROOT, 'public/_headers'));
const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? '';
if (!csp) problems.push('public/_headers has no Content-Security-Policy');
const scriptSrc = csp.match(/script-src([^;]*)/)?.[1] ?? '';
if (/unsafe-inline|unsafe-eval/.test(scriptSrc)) problems.push('script-src allows unsafe-inline/unsafe-eval');
const styleSrc = csp.match(/style-src([^;]*)/)?.[1] ?? '';
if (/unsafe-inline/.test(styleSrc)) problems.push('style-src allows unsafe-inline');

for (const file of htmlFiles()) {
  const html = read(file);
  const path = pagePath(file);
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const a = attrs(m[1]);
    if (a.src) continue;
    if (a.type === 'application/ld+json') continue; // data block, never executed
    const hash = `'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`;
    if (!scriptSrc.includes(hash)) problems.push(`${path}: inline script not in CSP (${hash})`);
  }
  if (/<style\b/i.test(html)) problems.push(`${path}: inline <style> element`);
  if (/\sstyle="/i.test(html)) problems.push(`${path}: inline style attribute`);
  for (const m of html.matchAll(/<(script|link|img|source|iframe)\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    for (const u of [a.src, m[1] === 'link' && a.rel !== 'canonical' ? a.href : null]) {
      if (u && /^https?:\/\//.test(u) && !u.startsWith(SITE)) problems.push(`${path}: third-party resource ${u}`);
    }
  }
}

report('csp (inline script hashes, no inline styles, no third parties)', problems);
