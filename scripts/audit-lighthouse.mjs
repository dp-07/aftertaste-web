// Lighthouse (mobile: simulated slow 4G + CPU throttling; desktop preset) for
// every page, against dist/ served with production headers, in the system
// Google Chrome. Lighthouse runs through npx at a pinned version and is not a
// project dependency. Reports: reports/lighthouse/. Usage: npm run audit:lighthouse
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, requireDist } from './lib.mjs';

requireDist();
const LIGHTHOUSE = 'lighthouse@13.6.0';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) {
  console.error(`Google Chrome not found at ${CHROME}; set CHROME_PATH.`);
  process.exit(1);
}
const PAGES = (process.argv.find((a) => a.startsWith('--pages='))?.split('=')[1] ?? '/,/privacy,/terms,/support').split(
  ',',
);
const OUT = join(ROOT, 'reports/lighthouse');
mkdirSync(OUT, { recursive: true });
const PORT = 4800 + Math.floor(Math.random() * 100);
const server = spawn(process.execPath, [join(ROOT, 'scripts/serve-dist.mjs'), String(PORT)], { stdio: 'pipe' });
await new Promise((r) => server.stdout.once('data', r));

const rows = [];
let failed = false;
try {
  for (const preset of ['mobile', 'desktop']) {
    for (const path of PAGES) {
      const name = `${preset}-${path === '/' ? 'home' : path.slice(1)}`;
      const args = [
        '--yes',
        LIGHTHOUSE,
        `http://localhost:${PORT}${path}`,
        '--quiet',
        '--output=json',
        '--output=html',
        `--output-path=${join(OUT, name)}`,
        '--only-categories=performance,accessibility,best-practices,seo',
        '--chrome-flags=--headless=new',
        ...(preset === 'desktop' ? ['--preset=desktop'] : []),
      ];
      const r = spawnSync('npx', args, { env: { ...process.env, CHROME_PATH: CHROME }, encoding: 'utf8' });
      const file = join(OUT, `${name}.report.json`);
      if (r.status !== 0 || !existsSync(file)) {
        console.error(r.stderr);
        failed = true;
        continue;
      }
      const lhr = JSON.parse(readFileSync(file, 'utf8'));
      const s = (k) => Math.round(lhr.categories[k].score * 100);
      const a = (k) => lhr.audits[k];
      const row = {
        page: `${preset} ${path}`,
        perf: s('performance'),
        a11y: s('accessibility'),
        bp: s('best-practices'),
        seo: s('seo'),
        lcp: (a('largest-contentful-paint').numericValue / 1000).toFixed(2),
        cls: a('cumulative-layout-shift').numericValue.toFixed(3),
        tbt: Math.round(a('total-blocking-time').numericValue),
      };
      rows.push(row);
      // The 404 is noindex on purpose, so its SEO score (is-crawlable) is not a target.
      const scores = path === '/404' ? [row.perf, row.a11y, row.bp] : [row.perf, row.a11y, row.bp, row.seo];
      if (scores.some((v) => v < 95) || Number(row.lcp) >= 2 || Number(row.cls) >= 0.05) {
        failed = true;
      }
    }
  }
} finally {
  server.kill();
}

console.log('page               perf a11y  bp  seo   LCP s   CLS    TBT ms');
for (const r of rows) {
  console.log(
    `${r.page.padEnd(18)} ${String(r.perf).padStart(4)} ${String(r.a11y).padStart(4)} ${String(r.bp).padStart(3)} ${String(r.seo).padStart(4)} ${r.lcp.padStart(7)} ${r.cls.padStart(6)} ${String(r.tbt).padStart(8)}`,
  );
}
console.log(
  failed
    ? '✗ below target (≥ 95 each, LCP < 2.0 s, CLS < 0.05)'
    : '✓ all targets met (404 SEO excluded: noindex by design)',
);
process.exit(failed ? 1 : 0);
