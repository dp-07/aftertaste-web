// Ad hoc audit: finds adjacent text nodes in different elements with no space between them
// (they read as one word in textContent and to some assistive tech). Usage: node scripts/.runtogether.mjs
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const srv = spawn(process.execPath, ['scripts/serve-dist.mjs', '4871']);
await new Promise((r) => srv.stdout.once('data', r));
const b = await chromium.launch({ channel: 'chrome' });
for (const path of ['/', '/privacy', '/terms', '/support', '/404']) {
  const p = await b.newPage();
  await p.goto('http://localhost:4871' + path, { waitUntil: 'networkidle' });
  const hits = await p.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let prev = null;
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (['SCRIPT', 'STYLE'].includes(el.tagName) || el.closest('[aria-hidden="true"]')) continue;
      const t = n.textContent;
      if (!t.trim()) {
        if (/\s/.test(t)) prev = null;
        continue;
      }
      if (
        prev &&
        prev.el !== el &&
        !/\s$/.test(prev.t) &&
        !/^\s/.test(t) &&
        !/^[.,;:!?)’'”]/.test(t) &&
        !/[(‘“]$/.test(prev.t)
      ) {
        // Skip pairs separated by a structural block (paragraph, list item, heading, ...).
        const up = (e) => {
          const a = [];
          for (; e; e = e.parentElement) a.push(e);
          return a;
        };
        const A = up(prev.el),
          B = up(el);
        const lca = A.find((x) => B.includes(x));
        const path = [...A.slice(0, A.indexOf(lca)), ...B.slice(0, B.indexOf(lca))];
        const BLOCK =
          /^(P|LI|H[1-6]|DIV|TD|TH|TR|TABLE|SECTION|ARTICLE|HEADER|FOOTER|NAV|UL|OL|DETAILS|SUMMARY|FIGURE|FIGCAPTION|MAIN|ASIDE|DT|DD|FORM|BUTTON|LABEL|THEAD|TBODY)$/;
        if (!path.some((x) => BLOCK.test(x.tagName)))
          out.push(
            `${prev.t.trim().slice(-18)} | ${t.trim().slice(0, 18)}  <${prev.el.tagName.toLowerCase()}.${prev.el.className}> <${el.tagName.toLowerCase()}.${el.className}>`.replace(
              /\n/g,
              ' ',
            ),
          );
      }
      prev = { t, el };
    }
    return out;
  });
  console.log(path, hits.length ? '\n  ' + hits.join('\n  ') : 'ok');
  await p.close();
}
await b.close();
srv.kill();
