import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const srv = spawn(process.execPath, ['scripts/serve-dist.mjs', '4866']);
await new Promise((r) => srv.stdout.once('data', r));
const b = await chromium.launch({ channel: 'chrome' });
const measure = async (block, path) => {
  const p = await b.newPage({ viewport: { width: 412, height: 823 } });
  if (block) await p.route('**/*.woff2', (r) => r.abort());
  await p.goto('http://localhost:4866' + path);
  await p.waitForTimeout(800);
  const m = await p.evaluate(() =>
    [
      ...document.querySelectorAll(
        'header.site-header, .head > *, .layout, .toc, .hero h1, .hero .support, .hero .actions, .hero .intro > *',
      ),
    ].map(
      (e) =>
        `${e.tagName}.${e.className.split(' ')[0]} h=${Math.round(e.getBoundingClientRect().height)} top=${Math.round(e.getBoundingClientRect().top)}`,
    ),
  );
  await p.close();
  return m;
};
for (const path of ['/privacy', '/']) {
  const a = await measure(true, path),
    c = await measure(false, path);
  console.log(path);
  a.forEach((x, i) => {
    if (x !== c[i]) console.log('  fallback', x, '\n  webfont ', c[i]);
  });
}
await b.close();
srv.kill();
