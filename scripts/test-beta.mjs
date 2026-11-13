// End-to-end test of the beta list, entirely local: applies the D1 migration
// to a throwaway local database, serves dist/ plus functions/ with
// `wrangler pages dev` (pinned wrangler via npx; first run downloads it), then
// checks the API (validation, dedupe, honeypot, timing, rate limit, size,
// type and origin limits, both response modes), the stored rows, the form in
// Chrome with and without JS, and the dismissible banner.
// Never touches the remote database. Usage: npm run build && npm run test:beta
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { ROOT, WRANGLER, requireDist } from './lib.mjs';

requireDist();
const state = mkdtempSync(join(tmpdir(), 'aftertaste-d1-'));
const PORT = 8800 + Math.floor(Math.random() * 100);
const base = `http://localhost:${PORT}`;
const api = `${base}/api/beta`;
const problems = [];
const check = (ok, what) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) problems.push(what);
};

const wrangler = (args) =>
  spawnSync('npx', ['--yes', WRANGLER, ...args, '--persist-to', state], { cwd: ROOT, encoding: 'utf8' });
const sql = (command) => {
  const r = wrangler(['d1', 'execute', 'aftertaste-beta', '--local', '--json', '--command', command]);
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout)[0].results;
};

const migrate = wrangler(['d1', 'migrations', 'apply', 'aftertaste-beta', '--local']);
if (migrate.status !== 0) throw new Error(`migration failed:\n${migrate.stderr || migrate.stdout}`);

const server = spawn(
  'npx',
  [
    '--yes',
    WRANGLER,
    'pages',
    'dev',
    '--port',
    String(PORT),
    '--persist-to',
    state,
    '--binding',
    'RATE_LIMIT_SALT=test-salt',
    '--show-interactive-dev-session=false',
  ],
  { cwd: ROOT, stdio: 'ignore', detached: true },
);
const stop = () => {
  try {
    process.kill(-server.pid);
  } catch {
    // already gone
  }
  rmSync(state, { recursive: true, force: true });
};

// Each case gets its own network (locally the header is ours to set; in
// production Cloudflare sets CF-Connecting-IP itself).
let net = 0;
const post = (body, { json = true, ip = `198.51.100.${++net}`, headers = {} } = {}) =>
  fetch(api, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'CF-Connecting-IP': ip,
      ...(json ? { Accept: 'application/json' } : {}),
      ...headers,
    },
    body,
  });
const result = async (res) => `${res.status} ${JSON.stringify(await res.json())}`;

try {
  for (let i = 0; ; i++) {
    if (i > 120) throw new Error('wrangler pages dev did not start');
    const ok = await fetch(base).then(
      (r) => r.ok,
      () => false,
    );
    if (ok) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  // ── API ──
  const ok = '200 {"ok":true}';
  check(
    (await result(
      await post('email=%20Test.User%40Example.COM%20&city=%20New%20%20%20Delhi%20&heard=friend&elapsed_ms=5000'),
    )) === ok,
    'valid sign-up → 200 ok',
  );
  check((await result(await post('email=test.user%40example.com&elapsed_ms=5000'))) === ok, 'duplicate → same answer');
  check(
    (await result(await post('email=nope%40&elapsed_ms=5000'))) === '400 {"ok":false,"error":"invalid"}',
    'invalid email → 400 invalid',
  );
  check((await result(await post('email=bot1%40example.com&website=x&elapsed_ms=5000'))) === ok, 'honeypot → looks ok');
  check((await result(await post('email=bot2%40example.com&elapsed_ms=300'))) === ok, 'too fast → looks ok');
  check((await result(await post('email=nojs%40example.com&heard=tiktok'))) === ok, 'no timing field (no JS) → ok');
  const redirect = await post('email=form%40example.com', { json: false });
  check(redirect.status === 303 && redirect.headers.get('location') === '/#joined', 'no-JS mode → 303 /#joined');
  const bad = await post('email=bad', { json: false });
  check(bad.status === 303 && bad.headers.get('location') === '/#join-invalid', 'no-JS invalid → 303 /#join-invalid');
  check(
    (await post('email=x%40example.com', { headers: { Origin: 'https://example.com' } })).status === 403,
    'cross-origin → 403',
  );
  check(
    (await post('{"email":"x@example.com"}', { headers: { 'Content-Type': 'application/json' } })).status === 415,
    'non-form body → 415',
  );
  check((await post(`email=a%40example.com&city=${'a'.repeat(3000)}`)).status === 413, 'body over 2 KB → 413');
  const headers = (await post('email=headers%40example.com')).headers;
  check(
    headers.get('cache-control') === 'no-store' && headers.get('x-content-type-options') === 'nosniff',
    'responses are no-store and nosniff',
  );
  const statuses = [];
  for (let i = 0; i < 11; i++) statuses.push((await post(`email=r${i}%40example.com`, { ip: '203.0.113.9' })).status);
  check(statuses.slice(0, 10).every((s) => s === 200) && statuses[10] === 429, '11th attempt in an hour → 429');

  // ── Browser ──
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const js = await browser.newContext({ extraHTTPHeaders: { 'CF-Connecting-IP': '192.0.2.10' } });
    const page = await js.newPage();
    await page.goto(`${base}/#join`);
    await page.fill('#join-email', 'Browser@Example.com');
    await page.fill('#join-city', 'Pune');
    await page.selectOption('#join-heard', 'search');
    await page.click('[data-join-form] button[type="submit"]');
    check((await page.getAttribute('[data-join]', 'data-state')) === 'saving', 'JS: ticket shows at once (optimistic)');
    check(await page.evaluate(() => document.activeElement?.id === 'joined'), 'JS: focus moves to the ticket');
    await page.waitForSelector('[data-join][data-state="saved"]', { timeout: 10000 });
    check(
      (await page.textContent('[data-join-live]'))?.startsWith('You’re on the list.') ?? false,
      'JS: confirmation announced (aria-live)',
    );
    check(
      await page.evaluate(() => document.querySelector('#joined [data-press]')?.classList.contains('is-pressed')),
      'JS: SEAT SAVED stamp pressed on confirmation',
    );

    const page2 = await js.newPage();
    await page2.goto(`${base}/#join`);
    await page2.fill('#join-email', 'a@b.c');
    await page2.click('[data-join-form] button[type="submit"]');
    await page2.waitForSelector('[data-join][data-state="invalid"]', { timeout: 10000 });
    check(
      (await page2.getAttribute('#join-email', 'aria-invalid')) === 'true' &&
        (await page2.evaluate(() => document.activeElement?.id === 'join-email')),
      'JS: server-rejected email → message, aria-invalid, focus on the field',
    );

    const nojs = await browser.newContext({
      javaScriptEnabled: false,
      extraHTTPHeaders: { 'CF-Connecting-IP': '192.0.2.11' },
    });
    const page3 = await nojs.newPage();
    await page3.goto(`${base}/#join`);
    await page3.fill('#join-email', 'nojs-browser@example.com');
    await Promise.all([page3.waitForURL(/#joined$/), page3.click('[data-join-form] button[type="submit"]')]);
    check(
      (await page3.isVisible('#joined')) && !(await page3.isVisible('[data-join-form]')),
      'no JS: POST + redirect shows the ticket and hides the form',
    );

    const page4 = await js.newPage();
    await page4.goto(`${base}/privacy`);
    await page4.click('[data-banner-dismiss]');
    check(!(await page4.isVisible('.beta-banner')), 'banner: dismiss hides it');
    await page4.goto(`${base}/`);
    const shift = await page4.evaluate(
      () =>
        new Promise((resolve) => {
          let sum = 0;
          new PerformanceObserver((l) => l.getEntries().forEach((e) => (sum += e.value))).observe({
            type: 'layout-shift',
            buffered: true,
          });
          setTimeout(() => resolve(sum), 1500);
        }),
    );
    check(
      !(await page4.isVisible('.beta-banner')) && shift < 0.01,
      `banner: stays dismissed on the next page, no layout shift (CLS ${shift.toFixed(3)})`,
    );
  } finally {
    await browser.close();
  }

  // ── Stored data ──
  const columns = sql('PRAGMA table_info(beta_signups)').map((c) => c.name);
  check(columns.join() === 'id,email,city,heard,created_at', `only these columns are stored: ${columns.join(', ')}`);
  const rows = sql('SELECT email, city, heard FROM beta_signups ORDER BY id');
  const emails = rows.map((r) => r.email);
  check(
    rows[0]?.email === 'test.user@example.com' && rows[0]?.city === 'New Delhi' && rows[0]?.heard === 'friend',
    'email trimmed and lower-cased, city normalised',
  );
  check(emails.filter((e) => e === 'test.user@example.com').length === 1, 'duplicate stored once');
  check(!emails.some((e) => e.startsWith('bot')), 'honeypot and too-fast submissions not stored');
  check(rows.find((r) => r.email === 'nojs@example.com')?.heard === null, 'unknown "heard" value stored as null');
  check(
    emails.includes('browser@example.com') && emails.includes('nojs-browser@example.com'),
    'browser sign-ups stored',
  );
  const buckets = sql('SELECT bucket FROM beta_rate_limits').map((r) => r.bucket);
  check(
    buckets.length > 0 && buckets.every((b) => /^[0-9a-f]{64}$/.test(b)),
    'rate-limit rows hold only keyed hashes, no IPs',
  );
} finally {
  stop();
}

console.log(problems.length ? `${problems.length} problem(s)` : '✓ beta list works end to end');
process.exit(problems.length ? 1 : 0);
