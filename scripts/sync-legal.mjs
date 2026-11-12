// Copies the legal markdown from the app repo (read-only) into
// src/content/legal/ and records where it came from in frontmatter.
// Usage: APP_REPO_PATH=/path/to/DishDiary npm run sync:legal
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const app = process.env.APP_REPO_PATH;
if (!app || !existsSync(join(app, 'docs/legal'))) {
  console.error('Set APP_REPO_PATH to the app repo (it must contain docs/legal/).');
  process.exit(1);
}

const FILES = [
  { from: 'docs/legal/privacy-policy.md', to: 'privacy.md' },
  { from: 'docs/legal/terms.md', to: 'terms.md' },
];
const git = (...args) => execFileSync('git', ['-C', app, ...args], { encoding: 'utf8' }).trim();
const OUT = join(ROOT, 'src/content/legal');
mkdirSync(OUT, { recursive: true });
const today = new Date().toISOString().slice(0, 10);

for (const f of FILES) {
  const body = readFileSync(join(app, f.from), 'utf8');
  const title = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!title) throw new Error(`${f.from} has no H1 title`);
  const [commit, updated] = git('log', '-1', '--format=%H|%cs', '--', f.from).split('|');
  const dirty = git('status', '--porcelain', '--', f.from) !== '';
  if (dirty) console.warn(`! ${f.from} has uncommitted changes; recording the last commit plus "sourceDirty: true".`);
  const todos = (body.match(/\[TODO:/g) || []).length;

  const front = [
    '---',
    `# Synced by \`npm run sync:legal\` from the app repo. Do not edit here: edit ${f.from} in the app repo and re-sync.`,
    `title: ${JSON.stringify(title)}`,
    `source: ${JSON.stringify(f.from)}`,
    `sourceCommit: ${JSON.stringify(commit)}`,
    `sourceUpdated: ${JSON.stringify(updated)}`,
    ...(dirty ? ['sourceDirty: true'] : []),
    `syncedAt: ${JSON.stringify(today)}`,
    '---',
    '',
  ].join('\n');
  writeFileSync(join(OUT, f.to), front + body);
  console.log(`✓ ${f.from} → src/content/legal/${f.to} (${commit.slice(0, 7)}, ${updated}, ${todos} TODO)`);
}
