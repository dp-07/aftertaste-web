// Runs every gate in order and stops at the first failure. The build log may
// only warn about unresolved [TODO: …] markers in the synced legal text.
import { spawnSync } from 'node:child_process';
import { ROOT } from './lib.mjs';

const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', FORCE_COLOR: '0' };
const run = (cmd) => spawnSync(cmd, { cwd: ROOT, env, shell: true, encoding: 'utf8' });

function gate(name, cmd, inspect) {
  process.stdout.write(`▸ ${name} … `);
  const r = run(cmd);
  const out = `${r.stdout}\n${r.stderr}`;
  const extra = inspect ? inspect(out) : [];
  if (r.status !== 0 || extra.length) {
    console.log('FAILED');
    console.log(out.trim());
    for (const e of extra) console.log(`  - ${e}`);
    process.exit(1);
  }
  console.log('ok');
  return out;
}

const buildLog = gate('build', 'npx astro build', (out) =>
  out
    .split('\n')
    .filter((l) => /warn|deprecat/i.test(l) && !l.includes('[legal-todo]'))
    .map((l) => `unexpected warning: ${l.trim()}`),
);
const todos = buildLog.split('\n').filter((l) => l.includes('[legal-todo]'));
if (todos.length) console.log(`  (${todos.length} intentional legal TODO warning(s))`);

gate('astro check', 'npx astro check');
gate('eslint', 'npx eslint . --max-warnings 0');
gate('prettier', 'npx prettier --check .');
gate('html-validate', 'npx html-validate "dist/**/*.html"');
gate('links', 'node scripts/check-links.mjs');
gate('seo', 'node scripts/check-seo.mjs');
gate('csp', 'node scripts/check-csp.mjs');
gate('js budget', 'node scripts/check-budget.mjs');
gate('no app code', 'node scripts/check-no-app-code.mjs');
console.log('All gates passed.');
