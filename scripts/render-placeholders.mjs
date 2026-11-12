// Renders PLACEHOLDER app screenshots (1080 × 2340) into src/assets/screenshots/
// with the system Google Chrome. They approximate the app's Home screen from
// its tokens and copy so the phone frame has something honest to show until
// real screenshots replace them (README "Screenshots"). Usage:
//   node scripts/render-placeholders.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import feather from 'feather-icons';
import { ROOT } from './lib.mjs';

const OUT = join(ROOT, 'src/assets/screenshots');
const fonts = pathToFileURL(join(ROOT, 'src/assets/fonts')).href;
const icon = (name, size = 20, extra = '') =>
  feather.icons[name].toSvg({ width: size, height: size, 'stroke-width': 2, ...(extra ? { class: extra } : {}) });

const wordmark = `
<span class="wm"><span>af</span><svg class="g t" viewBox="20 0 60 90"><path d="M49 42 V75 Q49 86 63 85" fill="none" stroke="#1F1B16" stroke-width="16" stroke-linecap="round"/><path d="M49 42 V75 Q49 86 63 85" fill="none" stroke="#EFE4D2" stroke-width="8" stroke-linecap="round"/><path d="M24 38 C24 18 74 18 74 38 Q74 43 69 43 H29 Q24 43 24 38 Z" fill="#C2412D"/></svg><span>e</span><svg class="g r" viewBox="26 0 52 90"><path d="M36 87 V42" stroke="#5E8236" stroke-width="10" stroke-linecap="round"/><path d="M36 50 C38 34 56 30 72 34 C66 48 52 50 36 50 Z" fill="#6E9A3E"/></svg><span>ta</span><svg class="g s" viewBox="24 0 50 90"><path d="M60 40 C52 36 36 38 36 50 C36 62 64 58 64 72 C64 86 40 88 32 80" fill="none" stroke="#D9A548" stroke-width="10" stroke-linecap="round"/></svg><span>t</span><svg class="g e" viewBox="14 0 64 90"><path d="M24 62 H70 C70 46 60 37 47 37 C33 37 22 48 22 62 C22 77 33 87 48 87 C57 87 65 84 70 78" fill="none" stroke="#B9773A" stroke-width="11" stroke-linecap="round"/></svg></span>`;

const seal = `<svg viewBox="0 0 100 100" class="seal"><circle cx="50" cy="50" r="40" fill="none" stroke="#C2412D" stroke-width="4"/><circle cx="50" cy="50" r="33.5" fill="none" stroke="#C2412D" stroke-width="1.6"/><g transform="translate(0 -3)"><path d="M44 55 H56 L57.5 71 Q50 76 42.5 71 Z" fill="#EFE4D2" stroke="#1F1B16" stroke-width="2.5" stroke-linejoin="round"/><path d="M29 52 C29 30 71 30 71 52 Q71 56 67 56 H33 Q29 56 29 52 Z" fill="#C2412D"/><circle cx="40" cy="44" r="3" fill="#FBF3E6"/><circle cx="53" cy="38" r="2.6" fill="#FBF3E6"/><circle cx="62" cy="46" r="2.6" fill="#FBF3E6"/></g></svg>`;

const row = (name, meta, source, tone) => `
  <div class="row"><div class="thumb ${tone}">${seal}</div><div class="rowtext"><div class="cardtitle">${name}</div><div class="mono">${meta}</div><div class="small faint">${source}</div></div><div class="bm">${icon('bookmark', 18)}</div></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Prata;src:url(${fonts}/prata-400.woff2)}
@font-face{font-family:'DM Sans';font-weight:400;src:url(${fonts}/dm-sans-400.woff2)}
@font-face{font-family:'DM Sans';font-weight:500;src:url(${fonts}/dm-sans-500.woff2)}
@font-face{font-family:'DM Sans';font-weight:600;src:url(${fonts}/dm-sans-600.woff2)}
@font-face{font-family:'DM Mono';src:url(${fonts}/dm-mono-400.woff2)}
*{box-sizing:border-box;margin:0}
body{width:360px;height:780px;overflow:hidden;background:#F4EFE6;color:#1F1B16;font:400 16px/24px 'DM Sans';position:relative}
.status{height:28px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;font:500 13px 'DM Sans'}
.status i{display:inline-block;width:14px;height:9px;border:1.5px solid #1F1B16;border-radius:2px;margin-left:6px}
header{display:flex;justify-content:space-between;align-items:center;padding:10px 20px 4px}
.wm{display:inline-flex;align-items:baseline;font:26px/1 Prata}
.g{height:.865em;display:block}.t{width:.576em}.r{width:.5em}.s{width:.48em}.e{width:.614em}
.ib{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#F3DED6;color:#C2412D}
.greet{font:24px/30px Prata;padding:14px 20px 12px}
.search{margin:0 20px;height:52px;border-radius:999px;background:#FBF8F2;border:1px solid #E4DCCD;display:flex;align-items:center;gap:10px;padding:0 18px;color:#9A9083;font-size:16px}
.card{margin:16px 20px 0;background:#FBF8F2;border-radius:20px;padding:16px;box-shadow:0 2px 8px rgba(31,27,22,.1);display:flex;flex-direction:column;gap:12px}
.ct{display:flex;align-items:center;gap:12px}.tile{width:36px;height:36px;border-radius:50%;background:#F3DED6;color:#C2412D;display:grid;place-items:center}
.cardtitle{font:20px/26px Prata}.body{font-size:14px;line-height:20px;color:#6B6257}
.chips{display:flex;gap:8px;flex-wrap:wrap}.chip{height:34px;border-radius:999px;border:1px solid #CFC4B1;padding:0 12px;display:inline-flex;align-items:center;gap:6px;font:500 13px 'DM Sans'}
.chip.on{background:#1F1B16;color:#F4EFE6;border-color:#1F1B16}
.btn{height:52px;border-radius:999px;background:#C2412D;color:#FFF8F0;display:flex;align-items:center;justify-content:center;gap:8px;font:500 16px 'DM Sans'}
.seg{margin:20px 20px 4px;background:#FBF8F2;border:1px solid #E4DCCD;border-radius:999px;padding:3px;display:flex}
.seg span{flex:1;text-align:center;height:38px;border-radius:999px;font:500 14px/38px 'DM Sans';color:#6B6257}.seg .on{background:#FFFDF9;color:#1F1B16;box-shadow:0 2px 8px rgba(31,27,22,.1)}
.row{display:flex;gap:12px;align-items:center;margin:8px 20px 0;padding:8px;background:#FBF8F2;border-radius:14px}
.thumb{width:64px;height:64px;border-radius:14px;display:grid;place-items:center;flex:none}.thumb .seal{width:40px}
.p1{background:#F3DED6}.p2{background:#E4EAD6}.p3{background:#F6E7CF}
.rowtext{flex:1;min-width:0}.rowtext .cardtitle{font-size:18px;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mono{font:13px/18px 'DM Mono';color:#6B6257}.small{font-size:13px;line-height:18px}.faint{color:#9A9083}
.bm{width:40px;height:40px;border-radius:50%;background:#F3DED6;color:#C2412D;display:grid;place-items:center}
.fab{position:absolute;right:20px;bottom:86px;height:52px;padding:0 20px;border-radius:999px;background:#C2412D;color:#FFF8F0;display:flex;align-items:center;gap:8px;font:500 16px 'DM Sans';box-shadow:0 6px 16px rgba(194,65,45,.3)}
nav{position:absolute;left:0;right:0;bottom:0;height:72px;background:#FBF8F2;border-top:1px solid #E4DCCD;display:flex;justify-content:space-around;align-items:center;padding-bottom:6px}
nav div{display:flex;flex-direction:column;align-items:center;gap:2px;font:500 11px 'DM Sans';color:#9A9083}
nav .on{color:#C2412D}nav .on svg{background:#F3DED6;border-radius:999px;padding:4px 14px;width:52px;height:30px}
</style></head><body>
<div class="status"><span>9:41</span><span><i></i></span></div>
<header>${wordmark}<span class="ib">${icon('map', 20)}</span></header>
<div class="greet">Good evening</div>
<div class="search">${icon('search', 20)}<span>Search places near you</span></div>
<div class="card">
  <div class="ct"><span class="tile">${icon('shuffle', 18)}</span><span class="cardtitle">What should we eat?</span></div>
  <div class="body">We'll pick from your list, your favourites and friends' top spots.</div>
  <div class="chips"><span class="chip on">${icon('map-pin', 14)}Nearby</span><span class="chip">${icon('compass', 14)}Somewhere new</span><span class="chip">Veg-friendly</span></div>
  <div class="btn">${icon('shuffle', 18)}Pick for me</div>
</div>
<div class="seg"><span class="on">Want to try (3)</span><span>From friends</span></div>
${row('Saffron &amp; Salt', 'Restaurant · 2.1 km', 'Saved from search', 'p1')}
${row('Little Ladoo Bakery', 'Bakery · 800 m', "From Ronnie's diary", 'p3')}
${row('Banyan Tree Dhaba', 'Dhaba · 3.4 km', 'Added by you', 'p2')}
<div class="fab">${icon('plus', 20)}Add place</div>
<nav><div class="on">${icon('home', 22)}Home</div><div>${icon('book-open', 22)}Places</div><div>${icon('image', 22)}Gallery</div><div>${icon('user', 22)}Profile</div></nav>
</body></html>`;

mkdirSync(OUT, { recursive: true });
const tmp = join(ROOT, 'node_modules/.cache/placeholder-home.html');
mkdirSync(join(ROOT, 'node_modules/.cache'), { recursive: true });
writeFileSync(tmp, html);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 3 });
await page.goto(pathToFileURL(tmp).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(OUT, 'home-placeholder.png') });
await browser.close();
console.log('wrote src/assets/screenshots/home-placeholder.png (PLACEHOLDER)');
