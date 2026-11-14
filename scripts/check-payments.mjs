// Payment-link rules on dist/:
// 1. /privacy, /terms and /support must not link to /coffee or buymeacoffee.com,
//    nor contain any upi:// link (the app links to these pages; Google Play
//    payment policy). Plain-text mentions in the synced policy are fine.
// 2. No upi:// link anywhere may carry a payee name (pn=): UPI apps show the
//    bank-verified name, and the site publishes no personal name.
import { relative } from 'node:path';
import { DIST, read, report, requireDist, walkFiles } from './lib.mjs';

requireDist();
const PLAY_PAGES = new Set(['privacy.html', 'terms.html', 'support.html']);
const FORBIDDEN = [
  [/href="\/coffee[#?"]/i, 'a link to /coffee'],
  [/buymeacoffee\.com/i, 'buymeacoffee.com'],
  [/upi:\/\//i, 'a upi:// link'],
];
const problems = [];
for (const file of walkFiles(DIST, (p) => /\.(html|xml|txt|json|js|svg)$/.test(p))) {
  const name = relative(DIST, file);
  const text = read(file);
  if (PLAY_PAGES.has(name)) {
    for (const [pattern, what] of FORBIDDEN) if (pattern.test(text)) problems.push(`${name}: contains ${what}`);
  }
  for (const m of text.matchAll(/upi:\/\/[^"'\s<>]*/gi)) {
    if (/[?&;]pn=/i.test(m[0])) problems.push(`${name}: upi:// link has a payee name (pn=)`);
  }
}
report('payment links (none on /privacy, /terms, /support; no pn= in upi:// links)', problems);
