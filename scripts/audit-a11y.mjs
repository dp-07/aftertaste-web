// Accessibility audit: axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on every page
// in light and dark, then keyboard checks of the interactive pieces. Runs
// against dist/ served with production headers, in the system Google Chrome.
// Usage: npm run audit:a11y
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { ROOT, requireDist } from './lib.mjs';

requireDist();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const PAGES = ['/', '/privacy', '/terms', '/support', '/coffee', '/404'];
const PORT = 4500 + Math.floor(Math.random() * 300);
const server = spawn(process.execPath, [join(ROOT, 'scripts/serve-dist.mjs'), String(PORT)], { stdio: 'pipe' });
await new Promise((r) => server.stdout.once('data', r));
const base = `http://localhost:${PORT}`;
const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];

try {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
      for (const path of PAGES) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        // Bring motion to rest (stamps, prints) so axe sees final colours.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(3200);
        await page.evaluate(axeSource); // via DevTools, so the page CSP does not apply
        const result = await page.evaluate(() =>
          axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
          }),
        );
        for (const v of result.violations) {
          problems.push(
            `${path} ${colorScheme} ${width}: ${v.id} (${v.impact}) × ${v.nodes.length}: ${v.nodes[0]?.target}`,
          );
        }
        console.log(
          `${path.padEnd(9)} ${colorScheme.padEnd(5)} ${width}: ${result.violations.length} violation(s), ${result.passes.length} rules passed`,
        );
      }
      await page.close();
    }
  }

  // Keyboard: the demo and the theme toggle work without a pointer.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.focus('[data-pick-btn]');
  await page.keyboard.press('Enter');
  const status = await page.textContent('[data-status]');
  if (!status?.startsWith('Tonight: ')) problems.push(`demo: live region not updated by keyboard (got "${status}")`);
  else console.log(`demo via keyboard: "${status}"`);
  await page.keyboard.press('Space');
  const status2 = await page.textContent('[data-status]');
  if (status2 === status) problems.push('demo: second pick repeated the first');
  await page.focus('[data-theme-set="dark"]');
  await page.keyboard.press('Enter');
  const theme = await page.evaluate(() => [
    document.documentElement.dataset.theme,
    localStorage.getItem('aftertaste-theme'),
  ]);
  if (theme[0] !== 'dark' || theme[1] !== 'dark') problems.push(`theme toggle via keyboard failed: ${theme}`);
  else console.log('theme toggle via keyboard: dark, persisted');
  await page.reload();
  const after = await page.evaluate(() => [
    document.documentElement.dataset.theme,
    document.querySelector('[data-theme-set="dark"]').getAttribute('aria-pressed'),
  ]);
  if (after[0] !== 'dark' || after[1] !== 'true') problems.push(`theme not restored on reload: ${after}`);
  else console.log('theme restored on reload, toggle state announced');

  // Keyboard: the diary strip scrolls with arrow keys; the beta banner dismisses.
  await page.focus('#from-the-diary .strip');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const scrolled = await page.$eval('#from-the-diary .strip', (s) => s.scrollLeft);
  if (!(scrolled > 0)) problems.push('diary strip: arrow keys do not scroll it');
  else console.log(`diary strip via keyboard: scrolled ${scrolled}px`);
  await page.focus('[data-banner-dismiss]');
  await page.keyboard.press('Enter');
  const banner = await page.evaluate(() => [
    getComputedStyle(document.querySelector('.beta-banner')).display,
    document.activeElement?.id,
  ]);
  if (banner[0] !== 'none' || banner[1] !== 'main') problems.push(`banner dismiss via keyboard failed: ${banner}`);
  else console.log('beta banner dismissed via keyboard, focus moved to main');
  await page.close();
} finally {
  await browser.close();
  server.kill();
}

for (const p of problems) console.log(`✗ ${p}`);
console.log(problems.length ? `${problems.length} problem(s)` : '✓ no accessibility problems found');
process.exit(problems.length ? 1 : 0);
