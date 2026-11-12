# Rules

The hard rules for this repo. They are the source of truth; `CLAUDE.md` links here. See also [ARCHITECTURE](ARCHITECTURE.md), [DESIGN](DESIGN.md), [MEMORY](MEMORY.md) for why several of these exist.

## The app repo

- **Never write to the app repo.** Read it only (path in `APP_REPO_PATH`).
- **Never copy app code, config, secrets or git history** into this repo: no app `src/**`, no `app.config.js`, no `.env*` values, no backend, Google or RevenueCat keys or project references.
- **Only these may come from the app repo:** brand assets (SVG, icon PNGs), font files with their OFL licences, design-token _values_, and the legal markdown (via `npm run sync:legal`).
- `npm run check:no-app-code` enforces this with identifier patterns. With `APP_REPO_PATH` set it also compares the app's env values (never printed). It scans docs too, so do not write app-internal identifiers into Markdown.

## Privacy and third parties

- No analytics, cookies, trackers or third-party requests. Fonts and assets are self-hosted. Astro telemetry is off in the npm scripts.
- Cloudflare Web Analytics is off. Enabling it needs a deliberate decision plus CSP and privacy-copy changes (README "Analytics").
- Keep these Cloudflare features **off** (they inject scripts or rewrite HTML and break the CSP): Email Address Obfuscation, Rocket Loader, automatic Web Analytics, "JavaScript detections".

## CSP

- Strict policy in `public/_headers`: `default-src 'none'`, scripts `'self'` plus one hash, styles `'self'`.
- **No inline scripts except the theme script**, whose SHA-256 is in `_headers`. After editing `src/scripts/theme.js` run `npm run csp:hash`.
- No inline `<style>`, no `style=` attributes, no `unsafe-inline`/`unsafe-eval`. The build is configured so Astro never inlines styles or scripts (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`).
- JSON-LD blocks are data, not scripts, and are allowed.
- `npm run check:csp` enforces all of this.

## JS budget

- Landing page: ≤ 30 KB gzipped JS (module scripts plus the inline theme script). It is ~1.5 KB today.
- `/privacy`, `/terms`, `/support`, `/404`: no script files at all (only the inline theme script).
- No UI framework and no animation library. `npm run check:budget` enforces it.

## Dependencies

- **Pin every dependency to an exact version** published at least **14 days** earlier (`.npmrc` sets `save-exact=true`).
- Install with `npm install --before=<ISO date 14 days ago>` so the transitive tree is equally old. Record the choice in `.claude/project-state/decisions.md`.
- Node is pinned in `.nvmrc` (22.23.4) and `engines`. A newer Node (for example 22.23.5) is adopted only once it is 14 days old.
- Lighthouse runs through `npx` at a pinned version and is not a dependency.

## URLs and hosts

- **HTTPS only.** `.app` is an HSTS-preloaded TLD, so `http://` links never work. Never write one (XML namespace identifiers are the only exception).
- One canonical host: `https://theaftertaste.app`. `www` redirects to it through a Cloudflare Bulk Redirect. No other site hosts.
- `npm run check:seo` fails on either mistake.

## Copy

- Warm, short, specific, sentence case. Write as one person talking to another ("Aftertaste is made by one person").
- **Banned words:** unlock, elevate, seamless, revolutionize, delve, supercharge, game-changer, "in today's fast-paced world", effortlessly, all-in-one.
- No emoji, no stock-photo language, no hype. Feature names are the app's own (Want to try, Tried, What should we eat?, Pick for me).
- Demo places and friends are invented examples, and the demo says so.
- Legal text is quoted from the app repo as written (no smart quotes, no edits). Fix wording in the app repo and re-sync.

## Design

- No "AI slop": no gradient blobs, glassmorphism, stock photos, emoji, three-icon feature rows, testimonial carousels, or fade-up-on-everything. Examples in [DESIGN](DESIGN.md#do-and-dont).
- No new colours without a decision in `.claude/project-state/decisions.md`. Use tokens, not literals.

## Accessibility and motion

- WCAG 2.2 AA: contrast (`npm run check:contrast`), visible focus, keyboard operation, accessible names that match visible text, a skip link, semantic landmarks.
- **Every animation has a `prefers-reduced-motion` fallback that is static and complete.** The base stylesheet has a catch-all, but each effect should still define its own resting state. Content must be fully readable with no JS and no motion.
- No horizontal overflow from 320 px.

## Git workflow

Mirrors the app repo: `task/<name>` → `work-branch` → `main`.

- One `task/<short-kebab-name>` per task, branched from the latest `work-branch`. Local checkpoint commits, conventional and descriptive messages.
- **Claude never pushes or merges until the human replies "approved".** After "approved": push the task branch, merge into `work-branch` with `--no-ff`, run `npm run gates`, push `work-branch`.
- **Claude never commits to, merges into or pushes `main`.** Only the human promotes `work-branch` to `main`, which is the production deploy (Cloudflare Pages).
- No force-push, no rewriting pushed history, no branch deletion, never discard uncommitted work. On a merge conflict, stop and report.

## Quality gate

**Every change must pass `npm run gates`** before commit (11 gates: build, `astro check`, ESLint, Prettier, html-validate, links, SEO, CSP, JS budget, contrast, no-app-code). Details in [DEV-GUIDE](DEV-GUIDE.md#gates).
