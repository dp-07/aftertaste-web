// Renders the Open Graph / Twitter card images (1200 × 630) into public/og/
// with the system Google Chrome and the site's own fonts and brand glyphs.
// One per page type: home, legal, support, default. Usage: npm run og
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { ROOT } from './lib.mjs';

const fonts = pathToFileURL(join(ROOT, 'src/assets/fonts')).href;
const OUT = join(ROOT, 'public/og');

// Brand pack glyphs (light files), full detail.
const T = `<svg class="g t" viewBox="20 0 60 90"><path d="M49 42 V75 Q49 86 63 85" fill="none" stroke="#1F1B16" stroke-width="15" stroke-linecap="round"/><path d="M49 42 V75 Q49 86 63 85" fill="none" stroke="#EFE4D2" stroke-width="9" stroke-linecap="round"/><path d="M24 38 C24 18 74 18 74 38 Q74 43 69 43 H29 Q24 43 24 38 Z" fill="#C2412D"/><circle cx="38" cy="30" r="3.5" fill="#FBF8F2"/><circle cx="56" cy="26" r="3" fill="#FBF8F2"/><circle cx="64" cy="35" r="3" fill="#FBF8F2"/></svg>`;
const R = `<svg class="g r" viewBox="26 0 52 90"><path d="M36 87 V42" stroke="#5E8236" stroke-width="8" stroke-linecap="round"/><path d="M36 50 C38 34 56 30 72 34 C66 48 52 50 36 50 Z" fill="#6E9A3E"/></svg>`;
const S = `<svg class="g s" viewBox="24 0 50 90"><path transform="translate(4 2)" d="M60 40 C52 36 36 38 36 50 C36 62 64 58 64 72 C64 86 40 88 32 80" fill="none" stroke="#D9A548" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/><path d="M60 40 C52 36 36 38 36 50 C36 62 64 58 64 72 C64 86 40 88 32 80" fill="none" stroke="#E3B55E" stroke-width="7.5" stroke-linecap="round"/></svg>`;
const E = `<svg class="g e" viewBox="14 0 64 90"><path d="M24 62 H70 C70 46 60 37 47 37 C33 37 22 48 22 62 C22 77 33 87 48 87 C57 87 65 84 70 78" fill="none" stroke="#B9773A" stroke-width="9" stroke-linecap="round"/><path d="M24 62 H70 C70 46 60 37 47 37 C33 37 22 48 22 62 C22 77 33 87 48 87 C57 87 65 84 70 78" fill="none" stroke="#F6E7CF" stroke-width="2" stroke-linecap="round"/><path d="M45 52 c3 1 5 -2 3 -4 c-3 -3 -8 0 -7 4 c1 4 9 4 10 0" fill="none" stroke="#B9773A" stroke-width="3" stroke-linecap="round"/></svg>`;
const stacked = `<div class="wm"><div class="line"><span>af</span>${T}<span>e</span>${R}</div><div class="line"><span>ta</span>${S}<span>t</span>${E}</div></div>`;
const oneLine = `<div class="wm one"><div class="line"><span>af</span>${T}<span>e</span>${R}<span>ta</span>${S}<span>t</span>${E}</div></div>`;
const seal = `<svg class="seal" viewBox="0 0 100 100"><g transform="rotate(-8 50 50)" opacity="0.94"><circle cx="50" cy="50" r="44" fill="none" stroke="#C2412D" stroke-width="3"/><circle cx="50" cy="50" r="38" fill="none" stroke="#C2412D" stroke-width="1.2"/><path d="M45.5 41 H54.5 L55.5 52 Q50 55.5 44.5 52 Z" fill="none" stroke="#C2412D" stroke-width="1.8" stroke-linejoin="round"/><path d="M34 39 C34 22 66 22 66 39 Q66 42 63 42 H37 Q34 42 34 39 Z" fill="#C2412D"/><circle cx="43" cy="33" r="2.2" fill="#FBF8F2"/><circle cx="53" cy="28.5" r="1.9" fill="#FBF8F2"/><circle cx="59.5" cy="35" r="1.9" fill="#FBF8F2"/><text x="50" y="69" text-anchor="middle" font-family="Prata" font-size="11" fill="#C2412D">aftertaste</text><text x="50" y="78" text-anchor="middle" font-family="DM Sans" font-weight="500" font-size="4.6" letter-spacing="1.3" fill="#C2412D">TASTE DIARY</text></g></svg>`;

const css = `
@font-face{font-family:Prata;src:url(${fonts}/prata-400.woff2)}
@font-face{font-family:'DM Sans';font-weight:400;src:url(${fonts}/dm-sans-400.woff2)}
@font-face{font-family:'DM Sans';font-weight:500;src:url(${fonts}/dm-sans-500.woff2)}
@font-face{font-family:'DM Mono';src:url(${fonts}/dm-mono-400.woff2)}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#F4EFE6;color:#1F1B16;font-family:'DM Sans';position:relative}
.frame{position:absolute;inset:36px;border:1.5px solid #CFC4B1;border-radius:28px}
.wm{display:inline-flex;flex-direction:column;font-family:Prata;line-height:1}
.wm .line{display:flex;align-items:baseline;height:1em}
.wm.one .line{height:auto}
.g{display:block;height:.865em}.t{width:.576em}.r{width:.5em}.s{width:.48em}.e{width:.614em}
.label{font:500 18px 'DM Sans';letter-spacing:.14em;text-transform:uppercase;color:#C2412D}
.mono{font:20px 'DM Mono';color:#6B6257;letter-spacing:.02em}
.rule{height:1.5px;background:#CFC4B1}
`;

const pages = {
  home: `
    <div class="frame"></div>
    <div style="position:absolute;left:96px;top:92px" class="label">A private food diary for Android</div>
    <div style="position:absolute;left:90px;top:136px;font-size:150px">${stacked}</div>
    <div style="position:absolute;left:96px;bottom:84px;font:40px Prata">Your personal food memory</div>
    <div style="position:absolute;right:100px;top:140px;width:290px;height:290px">${seal}</div>
    <div style="position:absolute;right:96px;bottom:98px" class="mono">theaftertaste.app</div>`,
  legal: `
    <div class="frame"></div>
    <div style="position:absolute;left:96px;top:92px;font-size:44px">${oneLine}</div>
    <div style="position:absolute;left:96px;top:226px" class="label">Legal</div>
    <div style="position:absolute;left:92px;top:262px;font:104px/1.05 Prata">Privacy &amp; terms</div>
    <div style="position:absolute;left:96px;bottom:92px;font:30px 'DM Sans';color:#6B6257">What the app collects, why, and how to delete it.</div>
    <div style="position:absolute;right:96px;top:104px" class="mono">theaftertaste.app</div>`,
  support: `
    <div class="frame"></div>
    <div style="position:absolute;left:96px;top:92px;font-size:44px">${oneLine}</div>
    <div style="position:absolute;left:96px;top:226px" class="label">Support</div>
    <div style="position:absolute;left:92px;top:262px;font:104px/1.05 Prata">How can we help?</div>
    <div style="position:absolute;left:96px;bottom:92px;font:30px 'DM Sans';color:#6B6257">Account deletion, sharing, location and exports.</div>
    <div style="position:absolute;right:96px;top:104px" class="mono">theaftertaste.app</div>`,
};
pages.default = pages.home;

mkdirSync(OUT, { recursive: true });
const tmpDir = join(ROOT, 'node_modules/.cache');
mkdirSync(tmpDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [name, body] of Object.entries(pages)) {
  const tmp = join(tmpDir, `og-${name}.html`);
  writeFileSync(
    tmp,
    `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`,
  );
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  console.log(`public/og/${name}.png`);
}
await browser.close();
