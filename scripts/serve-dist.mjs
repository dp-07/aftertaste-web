// Serves dist/ the way Cloudflare Pages does, closely enough for local audits:
// clean URLs (/privacy → privacy.html, /privacy.html → 308 /privacy), the
// rules in dist/_headers (so the CSP is exercised), dist/_redirects, and
// 404.html with status 404. Usage: node scripts/serve-dist.mjs [port]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { DIST, requireDist } from './lib.mjs';

requireDist();
const port = Number(process.argv[2] || 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function parseHeaders() {
  const rules = [];
  let current = null;
  const file = join(DIST, '_headers');
  if (!existsSync(file)) return rules;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), headers: [] };
      rules.push(current);
    } else if (current) {
      const i = line.indexOf(':');
      current.headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
    }
  }
  return rules;
}

function parseRedirects() {
  const file = join(DIST, '_redirects');
  if (!existsSync(file)) return new Map();
  return new Map(
    readFileSync(file, 'utf8')
      .split('\n')
      .filter((l) => l.trim() && !l.trim().startsWith('#'))
      .map((l) => l.trim().split(/\s+/))
      .map(([from, to, code]) => [from, { to, code: Number(code || 302) }]),
  );
}

const rules = parseHeaders();
const redirects = parseRedirects();
const matches = (pattern, path) =>
  new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(path);

function resolve(path) {
  if (path === '/') return 'index.html';
  const clean = path.replace(/^\//, '');
  for (const c of [clean, clean + '.html', join(clean, 'index.html')]) {
    const f = join(DIST, c);
    if (existsSync(f) && statSync(f).isFile()) return c;
  }
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const path = decodeURIComponent(url.pathname);
  const redirect = redirects.get(path);
  if (redirect) {
    res.writeHead(redirect.code, { Location: redirect.to });
    return res.end();
  }
  if (path.endsWith('.html')) {
    res.writeHead(308, { Location: path.replace(/(index)?\.html$/, '') || '/' });
    return res.end();
  }
  let file = resolve(path);
  let status = 200;
  if (!file) {
    file = '404.html';
    status = 404;
  }
  const headers = { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' };
  for (const r of rules) if (matches(r.pattern, path)) for (const [k, v] of r.headers) headers[k] = v;
  // Meaningless (or harmful) on http://localhost.
  delete headers['Strict-Transport-Security'];
  if (headers['Content-Security-Policy']) {
    headers['Content-Security-Policy'] = headers['Content-Security-Policy'].replace(
      /;\s*upgrade-insecure-requests/,
      '',
    );
  }
  let body = readFileSync(join(DIST, file));
  if (
    /gzip/.test(req.headers['accept-encoding'] || '') &&
    /text|json|xml|svg|javascript/.test(headers['Content-Type'])
  ) {
    body = gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
  }
  res.writeHead(status, headers);
  res.end(body);
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
