# Developer guide

Everything needed to run, check and change the site locally. Related: [ARCHITECTURE](ARCHITECTURE.md), [RULES](RULES.md), [MEMORY](MEMORY.md).

## Prerequisites

- **Node 22.23.4** exactly (or a later 22.x): pinned in [.nvmrc](../.nvmrc) and `engines` (`>=22.23.4 <23`). Astro 7.4.4 refuses to run on older versions. Use [nvm](https://github.com/nvm-sh/nvm).
- **npm** (bundled with Node). `.npmrc` sets `save-exact=true`.
- **Google Chrome** (optional): only for `og`, `placeholders` and the audit scripts. Expected at `/Applications/Google Chrome.app`; set `CHROME_PATH` elsewhere.
- Optional: the app repo checked out locally, only for `sync:legal` and `fonts:subset`; `pyftsubset` only for `fonts:subset`.

## First run

```sh
git clone <repo-url> aftertaste-web
cd aftertaste-web
nvm use          # reads .nvmrc → 22.23.4
npm ci
npm run dev      # http://localhost:4321
```

The dev server prints its URL (default `http://localhost:4321`). `npm run gates` then proves everything works.

## Scripts

All scripts are in [package.json](../package.json). Astro telemetry is disabled in the Astro scripts.

### Run

| Script               | What it does                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`        | Astro dev server on `http://localhost:4321` (the next free port if that is taken). It runs in the background: stop it with `npx astro dev stop`.                                     |
| `npm run build`      | Static build into `dist/`. Logs `[legal-todo]` warnings for unresolved legal TODOs.                                                                                                  |
| `npm run preview`    | `astro preview` of `dist/` on `http://localhost:4321` (4322 if taken). Run `build` first. Stop it with `npx astro preview stop`. It does **not** send the `_headers` rules.          |
| `npm run serve:dist` | Serves `dist/` like Cloudflare Pages (clean URLs, `_headers` incl. CSP, `_redirects`, 404) on port 4321 by default; `node scripts/serve-dist.mjs 5000` picks a port.                 |
| `npm run format`     | Prettier write (all files, including these docs).                                                                                                                                    |
| `npm run dev:api`    | `wrangler pages dev` on `dist/` plus `functions/` and the local D1, on `http://localhost:8788`: the only way to run the beta form locally. Build first. See [Beta list](#beta-list). |

### Gates

`npm run gates` ([scripts/gates.mjs](../scripts/gates.mjs)) runs all of these in order and stops at the first failure. The build step also fails on any build warning other than `[legal-todo]`. Run it before every commit. Most checks read `dist/`, so they need a build; `gates` builds first, but when running a check alone run `npm run build` first.

| Gate             | Script                      | Checks                                                                                            |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------- |
| build            | `npx astro build`           | Builds, no unexpected warnings                                                                    |
| astro check      | `npm run check:types`       | TypeScript and Astro diagnostics                                                                  |
| eslint           | `npm run lint`              | ESLint, zero warnings                                                                             |
| prettier         | `npm run format:check`      | Formatting of every file                                                                          |
| html-validate    | `npm run check:html`        | HTML of every built page                                                                          |
| links            | `npm run check:links`       | Internal links, assets and `#fragments` in `dist/`; relative links and files in the Markdown docs |
| seo              | `npm run check:seo`         | Sitemap, robots, titles, descriptions, canonicals, OG, HTTPS only, canonical host                 |
| csp              | `npm run check:csp`         | Inline script hashes match `_headers`, no inline styles, no third parties                         |
| js budget        | `npm run check:budget`      | Landing ≤ 30 KB gz JS; other pages ship no script files                                           |
| contrast         | `npm run check:contrast`    | WCAG contrast of text token pairs in both themes                                                  |
| no app code      | `npm run check:no-app-code` | No app identifiers or secrets; with `APP_REPO_PATH` also compares app env values                  |
| no personal name | `npm run check:no-name`     | The owner's first name is not in `dist/` (legal name allowed on the legal pages only)             |

### Sync and generators

| Script                 | What it does                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run sync:legal`   | Copies the legal markdown from the app repo into `src/content/legal/` and stamps the source commit. Needs `APP_REPO_PATH` (below).                                     |
| `npm run csp:hash`     | Rewrites the theme script's SHA-256 in `public/_headers`. Run after editing `src/scripts/theme.js`.                                                                    |
| `npm run og`           | Renders the four OG images into `public/og/` (needs Chrome).                                                                                                           |
| `npm run icons`        | Builds `favicon.ico`, apple-touch and manifest icons from `public/favicon.svg` and `brand/app-icon-1024.png`.                                                          |
| `npm run placeholders` | Re-renders the placeholder hero screenshot (needs Chrome).                                                                                                             |
| `npm run fonts:subset` | Re-subsets the fonts from the app repo's font packages. Needs `APP_REPO_PATH` and `pip install fonttools==4.55.0 brotli==1.1.0`. Outputs are committed; rarely needed. |

`scripts/.runtogether.mjs` (ad hoc) lists adjacent inline text with no space between, which reads as one word in the page text (`node scripts/.runtogether.mjs`, needs `dist/` and Chrome). `scripts/slice-screens.mjs` slices tall screenshots for reading (`node scripts/slice-screens.mjs <file.png>`). `scripts/.cls.mjs` and `scripts/.fontshift.mjs` are throwaway diagnostics for layout shift (see [MEMORY](MEMORY.md#font-loading-layout-shift)).

### Beta list (Wrangler via `npx`, pinned to `wrangler@4.156.0`)

| Script                      | What it does                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run db:migrate:local`  | Applies `migrations/` to the local D1 in `.wrangler/` (git-ignored).                                                                                         |
| `npm run db:migrate:remote` | Applies `migrations/` to the **production** D1. Needs `npx wrangler@4.156.0 login`. Owner only. For the preview database, use its Console (setup step 3).    |
| `npm run test:beta`         | End-to-end test on a throwaway local D1: API cases, stored rows, the form in Chrome with and without JS, the banner. Needs a build and Chrome. Never remote. |

The first run downloads Wrangler (about 100 MB, cached by npx afterwards).

### Audits (need Chrome and a build)

| Script                     | What it does                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run audit:screens`    | Screenshots into `reports/screens/`. Options: `--pages=/,/privacy` `--widths=375,768,1440` `--themes=light,dark` `--reduced`. Also logs console and CSP errors. |
| `npm run audit:a11y`       | axe-core (WCAG 2.x A/AA) on `/`, `/privacy`, `/terms`, `/support`, `/404`, light and dark, at 375 and 1440 px, plus keyboard checks.                            |
| `npm run audit:lighthouse` | Lighthouse 13.6.0 via `npx`, mobile and desktop, into `reports/lighthouse/`. Option: `--pages=/,/privacy`. Needs network on first run to fetch Lighthouse.      |

`reports/` is git-ignored.

### Setting the app repo path

`sync:legal` and `fonts:subset` read the app repo (never write to it). Set the variable for one command, or export it in your shell profile:

```sh
APP_REPO_PATH=/path/to/app-repo npm run sync:legal
export APP_REPO_PATH=/path/to/app-repo   # optional, for the shell session
```

`sync:legal` exits with a message if the variable is unset or the path has no `docs/legal/`.

## Preview a production build locally

```sh
npm run build
npm run serve:dist     # closest to Cloudflare Pages: clean URLs, CSP headers, redirects, 404
# or
npm run preview        # Astro's own preview server, http://localhost:4321
```

Use `serve:dist` to test the CSP and redirects, as `astro preview` does not apply `_headers`. The dev server does not run the minifier, so check scroll-driven CSS and the CSP in a built preview ([MEMORY](MEMORY.md#the-css-minifier-breaks-scroll-driven-animations)).

## Run Lighthouse and axe locally

```sh
npm run build
npm run audit:a11y          # axe, 0 violations expected
npm run audit:lighthouse    # table of scores; exits non-zero below targets
```

Both start their own `serve-dist` server on a random port, so other servers do not need stopping. Targets: 100 in every category (the script fails below 95, LCP ≥ 2.0 s or CLS ≥ 0.05). A one-off run on one page: `npm run audit:lighthouse -- --pages=/`.

## Common tasks

### Replace the hero screenshot

1. Take a portrait Home screenshot (ideally 1080 × 2340, light theme, no personal data).
2. Save it over `src/assets/screenshots/home-placeholder.png`, or add a new file and change the import at the top of [Hero.astro](../src/components/landing/Hero.astro). Update the `alt` text if the screen differs.
3. `npm run build`. Astro makes AVIF and WebP at several widths with a PNG fallback and sets width and height. A different aspect ratio needs the `.screen` `aspect-ratio` in [PhoneFrame.astro](../src/components/brand/PhoneFrame.astro) changed.
4. Remove the `TODO(screenshots)` comment in Hero.astro, run `npm run gates`, and check the page at 320 and 1440 px.

### Add the store badges and listing URLs

Aftertaste is a native app for Android and iOS. During the beta the hero shows no store badge at all.

1. In [src/config/site.ts](../src/config/site.ts) set `playStoreUrl` (`https://play.google.com/store/apps/details?id=…`) and/or `appStoreUrl` (`https://apps.apple.com/app/…`) as each store goes live. [Hero.astro](../src/components/landing/Hero.astro) renders a [StoreBadge](../src/components/ui/StoreBadge.astro) for each URL that is set.
2. Replace the text plate in `StoreBadge.astro` with each store's **official** artwork (Google's "Get it on Google Play", Apple's "Download on the App Store"), following their badge guidelines; add under `src/assets/`, render with `astro:assets`. Do not draw imitations.
3. Retire the beta copy: hero eyebrow and buttons, [BetaBanner.astro](../src/components/BetaBanner.astro), the FAQ answers "Can I use it now?", "When can I get it?" and "Is there an iPhone app?" in [Faq.astro](../src/components/landing/Faq.astro), the footer colophon, and the taste-report "(still cooking)" if it has shipped. Consider adding `offers` to the `MobileApplication` JSON-LD in [index.astro](../src/pages/index.astro) (its `operatingSystem` is already "Android, iOS").
4. `npm run gates`.

### Add diary photos

"From the diary" ([FromTheDiary.astro](../src/components/landing/FromTheDiary.astro)) reads its entries from [src/config/diary.ts](../src/config/diary.ts). They are placeholders (`sample: true`) until real ones go in.

1. Put each photo in `src/assets/diary/`: JPEG, PNG, WebP or AVIF, landscape about 4:3 (cards crop to 4:3), at least 640 px wide. Only food: no faces, receipts with card numbers, or anything personal. Strip location metadata if your camera adds it (Astro re-encodes the image, which drops EXIF, but keep originals clean anyway).
2. In `diary.ts`, edit an entry (dish, place, city, rating 1–5, a one-line note, a short date, an optional `stamp`) and set `photo: 'jhol-momo.jpg'` (the file name only) and `alt`: what is on the plate, in a sentence ("A steel bowl of jhol momos in a red sesame broth, with a spoon"). The build fails if `alt` is missing or the file does not exist.
3. Remove `sample: true` from real entries. The "Sample pages for now" note disappears when no samples remain; remove the `TODO(diary)` comment then.
4. `npm run gates`, then check the strip at 320 and 1440 px (`npm run audit:screens -- --pages=/ --widths=320,1440`). Astro emits AVIF and WebP at 320 and 640 px, lazily loaded.

## Beta list

How the backend works: [ARCHITECTURE](ARCHITECTURE.md#beta-list-pages-functions-and-d1). Rules: [RULES](RULES.md#privacy-and-third-parties).

### Run the beta form locally

`npm run dev` and `npm run serve:dist` do not run Functions: the form posts to a 404 there. Use Wrangler's Pages dev server with a local D1:

```sh
nvm use
npm run build                      # the dev server serves dist/
echo "RATE_LIMIT_SALT=$(openssl rand -hex 32)" > .dev.vars   # once; git-ignored
npm run db:migrate:local           # once, and after each new migration
npm run dev:api                    # http://localhost:8788 (form + /api/beta)
```

Rebuild (`npm run build`) after changing the site; Wrangler reloads `functions/` by itself. The local database lives in `.wrangler/` (git-ignored); delete that folder to start again. Look at it with:

```sh
npx --yes wrangler@4.156.0 d1 execute aftertaste-beta --local --command "SELECT * FROM beta_signups"
```

Locally you can send `CF-Connecting-IP` yourself to test the rate limit (in production Cloudflare sets it and it cannot be spoofed). `npm run test:beta` does all of this in a throwaway database.

### Beta list: Cloudflare setup

One-time steps for the owner; nothing here is done by Claude. **Done on 2026-11-14** for both databases. Kept for rebuilding or a new environment.

1. **Create the databases.** Cloudflare dashboard → **Storage & Databases → D1 SQL Database → Create database**: `aftertaste-beta` (production) and `aftertaste-beta-preview` (preview deployments). Pick the Asia-Pacific location hint if offered. Copy each **Database ID**.
2. **Point the config at them.** [wrangler.toml](../wrangler.toml): the top-level `[[d1_databases]]` holds the production ID, `[[env.preview.d1_databases]]` the preview ID; `name` must equal the Pages project's name (`aftertaste-web`). The IDs are identifiers, not secrets.
3. **Create the tables in each database** (choose one):
   - Dashboard: D1 → the database → **Console**, paste the whole of [migrations/console/0001_beta_list.sql](../migrations/console/0001_beta_list.sql) and run it. Use this file, not `0001_beta_list.sql`: the Console runs pasted SQL as one line, so the `--` comments in the commented file swallow everything after them ([MEMORY](MEMORY.md#the-d1-console-runs-pasted-sql-as-one-line)).
   - CLI (production): `npx --yes wrangler@4.156.0 login`, then `npm run db:migrate:remote`.
   - Check, in each Console: `SELECT name FROM sqlite_master WHERE type = 'table';` lists `beta_signups` and `beta_rate_limits`.
4. **Add the secret.** Pages project → **Settings → Variables and Secrets → Add**: type **Secret**, name `RATE_LIMIT_SALT`, value a long random string (`openssl rand -hex 32`), for **Production** and **Preview**. Never commit it.
5. **The binding.** Because `wrangler.toml` has `pages_build_output_dir`, Pages reads the D1 bindings from it: after the next deploy, **Settings → Bindings** shows `BETA_DB` (production → `aftertaste-beta`, preview → `aftertaste-beta-preview`), marked as managed by the Wrangler file. Nothing to add by hand.
6. **Check after the deploy.** On a preview URL, submit the form with your own address: "You're on the list." appears, and the row is in `aftertaste-beta-preview`, not in production. Also submit with JS disabled: the page jumps to the ticket. `curl -sI -X POST https://theaftertaste.app/api/beta` returns `415` with `cache-control: no-store`.

If the tables were created in the Console, Wrangler has no record of the migration: a later `npm run db:migrate:remote` runs `0001` itself, which is harmless because every statement is `IF NOT EXISTS`.

### Export the beta list

Exports are personal data: keep them out of the repo (`exports/` is git-ignored) and delete them when done.

- **Dashboard:** D1 → `aftertaste-beta` → **Console**, run
  `SELECT email, city, heard, created_at FROM beta_signups ORDER BY created_at;`
  and copy the rows from the results. Counts: `SELECT heard, count(*) FROM beta_signups GROUP BY heard;`.
- **CLI, as a file:**

  ```sh
  mkdir -p exports
  npx --yes wrangler@4.156.0 d1 execute aftertaste-beta --remote --json \
    --command "SELECT email, city, heard, created_at FROM beta_signups ORDER BY created_at" > exports/beta-signups.json
  npx --yes wrangler@4.156.0 d1 export aftertaste-beta --remote --table beta_signups --output exports/beta-signups.sql
  ```

### Remove someone or clear the list

- Someone asks to be removed (email to `hello@`): in the Console, `DELETE FROM beta_signups WHERE email = 'their@address.com';` (addresses are stored lower-cased). Reply to confirm.
- Retention: six months after launch, delete the list: `DELETE FROM beta_signups;` (the task is in [TASKS](TASKS.md)).
- Rate-limit rows clear themselves (rows from finished hours are deleted on the next request).

### Update the legal pages

Edit `docs/legal/privacy-policy.md` or `terms.md` **in the app repo** and commit there, then:

```sh
APP_REPO_PATH=/path/to/app-repo npm run sync:legal
npm run gates
```

The script's `TODO` count includes the `[TODO: ...]` placeholder inside the hidden draft-notes comment, so the visible count is one lower (the build log shows the visible count).

Never edit `src/content/legal/*.md` by hand. Check the `sourceCommit` in the frontmatter and the `[legal-todo]` count in the build log. Details: [ARCHITECTURE](ARCHITECTURE.md#legal-sync-pipeline).

### How to sync with the app

For any app change, from a single colour to many new features, ask Claude Code to "sync the website with the app" (the project skill [sync-with-app](../.claude/skills/sync-with-app/SKILL.md)). It needs `APP_REPO_PATH` set, with the app repo clean and on its work-branch, and it reads the app repo only.

What it does:

1. Compares tokens, fonts, icons, brand assets, features, legal, support config and app metadata with the app, and writes a drift report to `.claude/project-state/app-sync-report-<date>.md`.
2. Applies mechanical changes (AUTO) and judged site changes (BUILD, including new sections or pages for features that are done and merged in the app) on `task/sync-app-<date>`, then verifies (gates, Lighthouse, axe, screenshots) and merges into `work-branch` when everything passes.
3. Stops and reports (STOP) for legal meaning, payments, privacy claims, names, unreleased features and brand identity changes; a brand change goes to a proposal branch that is not merged.
4. Records the result in the ledger [.claude/project-state/app-sync.json](../.claude/project-state/app-sync.json) and keeps [sync/feature-map.json](../sync/feature-map.json) (each website section and FAQ entry ↔ the app feature and source file behind it) up to date.

You then review the Cloudflare preview of `work-branch` and promote to `main` through a PR.

### Add a page

1. Create `src/pages/<name>.astro` using `BaseLayout` with a unique `title`, a `description` of 50–170 characters and an `og` kind (`home`, `legal`, `support` or `default`).
2. Link it from `SiteHeader.astro` or `SiteFooter.astro` if it should be navigable.
3. Add redirects or aliases in `public/_redirects` if wanted.
4. `npm run gates`: the SEO gate requires the title, description, canonical and sitemap entry; the budget gate expects non-landing pages to ship no script files (add the path to `NO_JS` in `scripts/check-budget.mjs` if it should follow that rule).

### Change tokens

1. Edit [tokens.css](../src/styles/tokens.css). Colours are one `light-dark(light, dark)` declaration each; new values need a decision in `.claude/project-state/decisions.md`.
2. If a text colour changes, update the same values in `scripts/check-contrast.mjs` (its token copy is manual) and run `npm run check:contrast`.
3. If a brand colour changes, regenerate the OG images (`npm run og`) and placeholder (`npm run placeholders`), whose scripts hard-code values.
4. `npm run gates`, then `npm run audit:screens` in both themes.

### Edit the theme script

Edit `src/scripts/theme.js`, run `npm run csp:hash`, then `npm run gates`.

## Troubleshooting

| Symptom                                                       | Fix                                                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Node.js v22.x is not supported by Astro` (needs `>=22.23.4`) | Run `nvm use` in the repo root; check `node -v`. `nvm install` if 22.23.4 is missing. nvm's default alias can be older.                                                                                                               |
| `dist/ is missing: run npm run build first`                   | A check or audit needs a build. Run `npm run build`.                                                                                                                                                                                  |
| Fonts not loading (fallback fonts shown)                      | Check the Network tab for `/_astro/*.woff2` 404s; the files are in `src/assets/fonts/`. A restarted dev server or fresh build usually fixes a stale `.astro` cache (`rm -rf .astro`). Confirm the CSP allows `font-src 'self'`.       |
| CSP errors in the console                                     | Test with `npm run serve:dist` (the dev server sends no CSP). An inline script blocked after editing `theme.js` means the hash is stale: `npm run csp:hash`. Never add inline scripts, `<style>` or `style=` ([RULES](RULES.md#csp)). |
| `check:csp` says "inline script not in CSP"                   | Same: `npm run csp:hash`, then rebuild.                                                                                                                                                                                               |
| Stale preview (old content or styles)                         | `npm run preview` and `serve:dist` serve whatever is in `dist/`: rebuild. Hard reload the browser; the dev server may need a restart, and `rm -rf .astro` clears its cache.                                                           |
| Scroll-driven receipt works in dev but not in the built site  | CSS minifier issue: use longhand properties ([MEMORY](MEMORY.md#the-css-minifier-breaks-scroll-driven-animations)).                                                                                                                   |
| `check:links` fails on a docs link                            | The relative path or file name is wrong; docs links are checked against the files on disk.                                                                                                                                            |
| `sync:legal`: "Set APP_REPO_PATH …"                           | Point it at the app repo root (it must contain `docs/legal/`).                                                                                                                                                                        |
| Audit scripts cannot find Chrome                              | Install Google Chrome or set `CHROME_PATH` to the binary.                                                                                                                                                                             |
| Prettier fails on a Markdown file                             | `npm run format`, then re-run the gates.                                                                                                                                                                                              |
| The beta form 404s locally                                    | `npm run dev`, `preview` and `serve:dist` do not run Functions. Use `npm run dev:api` (after `npm run build`).                                                                                                                        |
| The form says "Something went wrong on our side" (503)        | The `BETA_DB` binding is missing or the tables do not exist: run `npm run db:migrate:local` (or the remote setup above). The function logs `[beta] …` to the Wrangler output or the Pages Functions log.                              |
| The form says "Lots of sign-ups from your network" (429)      | More than 10 attempts from one network this hour. Locally, wait, delete `.wrangler/`, or send a different `CF-Connecting-IP`.                                                                                                         |
| Wrangler logs "RATE_LIMIT_SALT is not set"                    | Create `.dev.vars` locally, or add the secret in the dashboard (Production and Preview). Rate limiting is weaker until then.                                                                                                          |
| A Pages deploy fails on the D1 binding                        | A `database_id` in `wrangler.toml` does not exist in the account, or `name` does not match the project. See [Beta list: Cloudflare setup](#beta-list-cloudflare-setup).                                                               |
