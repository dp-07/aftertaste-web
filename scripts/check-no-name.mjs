// The site publishes no personal name, except the legal name where the legal
// documents require it. Fails if the owner's first name appears (case-
// insensitive, whole word) anywhere in dist/ text files.
//
// Exception: on the two legal pages (synced from the app repo) the exact legal
// name "Paras D Prasad" is allowed. Any other form there (for example the
// older "Paras Dev Prasad" in drafts not yet re-synced) is reported as a
// warning, not a failure: fix it in the app repo and re-run `npm run sync:legal`.
import { relative } from 'node:path';
import { DIST, read, report, requireDist, walkFiles } from './lib.mjs';

requireDist();
const LEGAL_PAGES = new Set(['privacy.html', 'terms.html']);
const LEGAL_NAME = /\bParas D Prasad\b/g;
const NAME = /\bparas\b/i;

const problems = [];
const warnings = [];
for (const file of walkFiles(DIST, (p) =>
  /\.(html|xml|txt|json|webmanifest|css|js|svg|map)$|_headers$|_redirects$/.test(p),
)) {
  const name = relative(DIST, file);
  const legal = LEGAL_PAGES.has(name);
  const text = legal ? read(file).replace(LEGAL_NAME, '') : read(file);
  if (!NAME.test(text)) continue;
  (legal ? warnings : problems).push(name);
}
for (const name of warnings)
  console.warn(
    `  ⚠ ${name}: name is not the approved legal form "Paras D Prasad": fix the app repo text, then npm run sync:legal`,
  );
report('no personal name in dist/ (legal name allowed on legal pages only)', problems);
