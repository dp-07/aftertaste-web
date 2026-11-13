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

| Script               | What it does                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`        | Astro dev server on `http://localhost:4321` (the next free port if that is taken). It runs in the background: stop it with `npx astro dev stop`.                            |
| `npm run build`      | Static build into `dist/`. Logs `[legal-todo]` warnings for unresolved legal TODOs.                                                                                         |
| `npm run preview`    | `astro preview` of `dist/` on `http://localhost:4321` (4322 if taken). Run `build` first. Stop it with `npx astro preview stop`. It does **not** send the `_headers` rules. |
| `npm run serve:dist` | Serves `dist/` like Cloudflare Pages (clean URLs, `_headers` incl. CSP, `_redirects`, 404) on port 4321 by default; `node scripts/serve-dist.mjs 5000` picks a port.        |
| `npm run format`     | Prettier write (all files, including these docs).                                                                                                                           |

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

### Add the Play badge and listing URL

1. In [src/config/site.ts](../src/config/site.ts) set `playStoreUrl` to `https://play.google.com/store/apps/details?id=…`. The "Coming soon" plate becomes a link.
2. In [PlayBadge.astro](../src/components/ui/PlayBadge.astro) replace the plate with Google's **official** "Get it on Google Play" badge artwork (follow Google's badge guidelines; add under `src/assets/`, render with `astro:assets`). Do not draw an imitation.
3. Update the FAQ answer "When can I get it?" in [Faq.astro](../src/components/landing/Faq.astro) and consider adding `offers` to the `MobileApplication` JSON-LD in [index.astro](../src/pages/index.astro).
4. `npm run gates`.

### Update the legal pages

Edit `docs/legal/privacy-policy.md` or `terms.md` **in the app repo** and commit there, then:

```sh
APP_REPO_PATH=/path/to/app-repo npm run sync:legal
npm run gates
```

The script's `TODO` count includes the `[TODO: ...]` placeholder inside the hidden draft-notes comment, so the visible count is one lower (the build log shows the visible count).

Never edit `src/content/legal/*.md` by hand. Check the `sourceCommit` in the frontmatter and the `[legal-todo]` count in the build log. Details: [ARCHITECTURE](ARCHITECTURE.md#legal-sync-pipeline).

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
