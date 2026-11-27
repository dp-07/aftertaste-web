// CSP consistency on dist/: every inline <script> must be allowed by a hash in
// public/_headers; no inline styles; no third-party resources.
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, SITE, attrs, htmlFiles, pagePath, read, report, requireDist } from './lib.mjs';

requireDist();
const problems = [];
const headers = read(join(ROOT, 'public/_headers'));
// One policy per rule block: the site-wide one and the /patron one (the only page with
// third-party content, after a tap: Bondin's embed script and two checkout iframes).
const policies = [];
{
  let pattern = '';
  for (const line of headers.split('\n')) {
    if (line && !/^\s/.test(line) && !line.startsWith('#')) pattern = line.trim();
    const m = line.match(/^\s+Content-Security-Policy:\s*(.+)/);
    if (m) policies.push({ pattern, csp: m[1] });
  }
}
const siteWide = policies.find((p) => p.pattern === '/*')?.csp ?? '';
if (!siteWide) problems.push('public/_headers has no site-wide Content-Security-Policy');
const patron = policies.find((p) => p.pattern === '/patron');
if (policies.some((p) => p.pattern !== '/*' && p.pattern !== '/patron'))
  problems.push('only /* and /patron may set a Content-Security-Policy');
const PATRON_HOSTS = {
  'script-src': ['https://bondin.io'],
  'frame-src': ['https://bondin.io', 'https://buymeacoffee.com'],
};
if (patron && !/^\s*!\s*Content-Security-Policy/m.test(headers.split(/^\/patron\s*$/m)[1] ?? ''))
  problems.push('/patron must detach (! Content-Security-Policy) the site-wide policy before setting its own');

for (const { pattern, csp } of policies) {
  const label = `${pattern} policy`;
  const directive = (name) => csp.match(new RegExp(`(?:^|;)\\s*${name}([^;]*)`))?.[1] ?? '';
  const scriptSrc = directive('script-src');
  if (/unsafe-inline|unsafe-eval/.test(scriptSrc))
    problems.push(`${label}: script-src allows unsafe-inline/unsafe-eval`);
  if (/unsafe-inline/.test(directive('style-src'))) problems.push(`${label}: style-src allows unsafe-inline`);
  // The beta form posts and fetches to this origin only.
  for (const name of ['form-action', 'connect-src']) {
    const value = directive(name).trim();
    if (value !== "'self'") problems.push(`${label}: ${name} must be exactly 'self' (is ${value || 'missing'})`);
  }
  // Any https:// host in a policy must be on the /patron allowlist for that directive.
  for (const m of csp.matchAll(/(?:^|;)\s*([a-z-]+)((?:\s+[^;\s]+)*)/g)) {
    const hosts = m[2].split(/\s+/).filter((t) => /^https?:/.test(t));
    const allowed = pattern === '/patron' ? (PATRON_HOSTS[m[1]] ?? []) : [];
    for (const h of hosts) if (!allowed.includes(h)) problems.push(`${label}: ${m[1]} allows ${h}`);
  }
}
const scriptSrc = siteWide.match(/script-src([^;]*)/)?.[1] ?? '';

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
  for (const m of html.matchAll(/<form\b[^>]*>/gi)) {
    const action = attrs(m[0]).action ?? '';
    if (!action.startsWith('/') || action.startsWith('//')) problems.push(`${path}: form posts off-site (${action})`);
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
