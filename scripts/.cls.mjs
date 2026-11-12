import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const srv = spawn(process.execPath, ['scripts/serve-dist.mjs', '4865']);
await new Promise((r) => srv.stdout.once('data', r));
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({
  viewport: { width: 412, height: 823 },
  deviceScaleFactor: 1.75,
  isMobile: true,
  hasTouch: true,
});
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await p.addInitScript(() => {
  window.__ls = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      window.__ls.push({
        v: e.value,
        t: Math.round(e.startTime),
        src: e.sources.map((s) => ({
          n: s.node ? s.node.className || s.node.nodeName : null,
          prev: [s.previousRect.y, s.previousRect.height],
          cur: [s.currentRect.y, s.currentRect.height],
        })),
      });
  }).observe({ type: 'layout-shift', buffered: true });
});
for (const path of ['/privacy', '/']) {
  await p.goto('http://localhost:4865' + path, { waitUntil: 'load' });
  await p.waitForTimeout(4000);
  console.log(path, JSON.stringify(await p.evaluate(() => window.__ls), null, 0));
}
await b.close();
srv.kill();
