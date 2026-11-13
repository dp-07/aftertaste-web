// The site publishes no personal name. Fails if the owner's first name appears
// (case-insensitive, whole word) anywhere in dist/ text files.
//
// TEMPORARY EXCEPTION: the synced legal drafts still name the responsible
// party in the app repo. Those two pages are reported as a warning, not a
// failure, until the app repo is changed and `npm run sync:legal` is re-run.
// Delete PENDING_LEGAL_RESYNC then (docs/TASKS.md).
import { relative } from 'node:path';
import { DIST, read, report, requireDist, walkFiles } from './lib.mjs';

requireDist();
const PENDING_LEGAL_RESYNC = new Set(['privacy.html', 'terms.html']);
const NAME = /\bparas\b/i;

const problems = [];
const pending = [];
for (const file of walkFiles(DIST, (p) =>
  /\.(html|xml|txt|json|webmanifest|css|js|svg|map)$|_headers$|_redirects$/.test(p),
)) {
  if (!NAME.test(read(file))) continue;
  const name = relative(DIST, file);
  (PENDING_LEGAL_RESYNC.has(name) ? pending : problems).push(name);
}
for (const name of pending)
  console.warn(`  ⚠ ${name} still names a person (legal text from the app repo): re-run sync:legal after it changes`);
report('no personal name in dist/', problems);
