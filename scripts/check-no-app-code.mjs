// Fails if any file in this repo (tracked or not ignored) or in dist/ contains
// an identifier that only belongs in the app repo: backend URLs and keys, app
// source idioms, or app env names. Values are never printed.
//
// With APP_REPO_PATH set, it also reads the app repo's env files (read-only)
// and fails if any of their values (16+ chars) appears here.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DIST, ROOT, report, walkFiles } from './lib.mjs';

const SELF = 'scripts/check-no-app-code.mjs';
const j = (...p) => p.join('');
const PATTERNS = [
  ['Supabase project URL', new RegExp(j('[a-z0-9]{20}\\.', 'supa', 'base\\.co'))],
  ['Supabase host', new RegExp(j('supa', 'base\\.(co|in)\\b'))],
  ['JWT (Supabase anon/service key)', /eyJ[\w-]{10,}\.eyJ[\w-]{10,}/],
  ['Supabase API key', new RegExp(j('sb_', '(publishable|secret)_[\\w-]{10,}'))],
  ['service role reference', new RegExp(j('service', '_role'), 'i')],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['RevenueCat key', /\b(goog|appl|amzn)_[A-Za-z0-9]{20,}/],
  ['Expo public env name', new RegExp(j('EXPO', '_PUBLIC_'))],
  ['React Native import', /from\s+['"]react-native['"]/],
  ['Expo import', /from\s+['"](expo-[\w-]+|@expo\/[\w-]+)['"]/],
  ['App UI hook', new RegExp(j('use', 'UiTheme'))],
  ['RN StyleSheet', new RegExp(j('StyleSheet', '\\.create'))],
  ['App storage bucket / project', new RegExp(j('bitemarks-', '(media|dev)'))],
];

const files = execSync('git ls-files -co --exclude-standard', { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => f !== SELF && !f.startsWith('src/assets/fonts/') && !/\.(png|jpe?g|webp|avif|ico|woff2?)$/i.test(f))
  .map((f) => join(ROOT, f))
  .concat(walkFiles(DIST, (p) => /\.(html|js|css|xml|txt|json|webmanifest|svg)$/.test(p) || p.endsWith('_headers')));

const secrets = [];
const app = process.env.APP_REPO_PATH;
if (app && existsSync(app)) {
  for (const name of readdirSync(app).filter((n) => n.startsWith('.env'))) {
    for (const line of readFileSync(join(app, name), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?([^"'\s#]+)/);
      if (m && m[2].length >= 16) secrets.push({ key: `${name}:${m[1]}`, value: m[2] });
    }
  }
}

const problems = [];
for (const file of files) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  const where = relative(ROOT, file);
  for (const [name, re] of PATTERNS) if (re.test(text)) problems.push(`${where}: ${name}`);
  for (const s of secrets)
    if (text.includes(s.value)) problems.push(`${where}: value of ${s.key} (${s.value.length} chars)`);
}

report(`no app code (${files.length} files, ${secrets.length} app env values compared)`, problems);
