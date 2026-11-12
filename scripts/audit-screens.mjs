// Screenshots for design review: pages × widths × themes, full page, served
// from dist/ with the production headers (scripts/serve-dist.mjs), using the
// system Google Chrome. Also records console errors and CSP violations.
// Usage: node scripts/audit-screens.mjs [--pages=/,/privacy] [--widths=375,768,1440] [--reduced]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { ROOT, requireDist } from './lib.mjs';

requireDist();
const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const pages = arg('pages', '/,/privacy').split(',');
const widths = arg('widths', '375,768,1440').split(',').map(Number);
const themes = arg('themes', 'light,dark').split(',');
const reduced = process.argv.includes('--reduced');
const OUT = join(ROOT, 'reports/screens');
mkdirSync(OUT, { recursive: true });

const PORT = 4400 + Math.floor(Math.random() * 400);
const server = spawn(process.execPath, [join(ROOT, 'scripts/serve-dist.mjs'), String(PORT)], { stdio: 'pipe' });
await new Promise((r) => server.stdout.once('data', r));

const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];
try {
  for (const theme of themes) {
    for (const width of widths) {
      const ctx = await browser.newContext({
        viewport: { width, height: width < 600 ? 812 : 900 },
        deviceScaleFactor: 1,
        colorScheme: theme,
        reducedMotion: reduced ? 'reduce' : 'no-preference',
      });
      const page = await ctx.newPage();
      page.on('console', (m) => m.type() === 'error' && problems.push(`${width} ${theme}: console: ${m.text()}`));
      page.on('pageerror', (e) => problems.push(`${width} ${theme}: ${e.message}`));
      for (const path of pages) {
        await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1600); // hero assembly
        // Walk the page so viewport-triggered stamps and prints fire.
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += 400) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(60);
        }
        await page.waitForTimeout(3200);
        const name = `${path === '/' ? 'home' : path.slice(1)}-${width}-${theme}${reduced ? '-reduced' : ''}`;
        const receipt = await page.$('#receipt');
        if (receipt) {
          const box = await page.evaluate(() => {
            const el = document.getElementById('receipt');
            return { top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight };
          });
          for (const f of [0.35, 0.95]) {
            await page.evaluate(
              ([t, hh, ff]) => window.scrollTo(0, t + (hh - window.innerHeight) * ff),
              [box.top, box.height, f],
            );
            await page.waitForTimeout(400);
            await page.screenshot({ path: join(OUT, `${name}-receipt-${Math.round(f * 100)}.png`) });
          }
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (overflow > 0) problems.push(`${name}: horizontal overflow ${overflow}px`);
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
for (const p of problems) console.log(`! ${p}`);
console.log(`Screenshots in reports/screens (${problems.length} problem(s)).`);
