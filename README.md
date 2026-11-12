# theaftertaste.in

The website for **Aftertaste**, a private food diary for Android: “Your personal food memory”.

A static [Astro](https://astro.build) site with plain CSS, deployed by Cloudflare Pages from `main`. No analytics, cookies or third-party requests: fonts and assets are self-hosted.

| Page                 | Source                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `/`                  | `src/pages/index.astro` (sections in `src/components/landing/`)                                        |
| `/privacy`, `/terms` | `src/pages/privacy.astro`, `terms.astro` → `src/components/LegalPage.astro` → `src/content/legal/*.md` |
| `/support`           | `src/pages/support.astro`                                                                              |
| 404                  | `src/pages/404.astro`                                                                                  |

## Local development

Requirements: **Node 22.23.4** (`nvm use` reads `.nvmrc`). Google Chrome is needed only for the render and audit scripts.

```sh
nvm use
npm ci
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run serve:dist # serve dist/ like Cloudflare Pages (clean URLs, _headers incl. CSP, 404)
```

## Scripts

| Script                     | What it does                                                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run gates`            | Every gate, in order, stopping at the first failure: build (no warnings except `[legal-todo]`), `astro check`, ESLint, Prettier, html-validate, internal links, SEO, CSP, JS budget, contrast, no-app-code. Run before every commit. |
| `npm run check:*`          | The gates one at a time (`types`, `html`, `links`, `seo`, `csp`, `budget`, `contrast`, `no-app-code`). `lint` and `format:check` too.                                                                                                |
| `npm run sync:legal`       | Copies the legal markdown from the app repo (see below).                                                                                                                                                                             |
| `npm run og`               | Renders the Open Graph images into `public/og/` (needs Chrome).                                                                                                                                                                      |
| `npm run icons`            | Builds `favicon.ico`, the apple-touch and manifest icons from `public/favicon.svg` and `brand/app-icon-1024.png`.                                                                                                                    |
| `npm run placeholders`     | Re-renders the placeholder app screenshot (needs Chrome).                                                                                                                                                                            |
| `npm run csp:hash`         | Updates the theme script's hash in `public/_headers` after editing `src/scripts/theme.js`.                                                                                                                                           |
| `npm run fonts:subset`     | Re-subsets the fonts (needs `APP_REPO_PATH` and `pip install fonttools==4.55.0 brotli==1.1.0`).                                                                                                                                      |
| `npm run audit:screens`    | Screenshots at 375/768/1440 in light and dark into `reports/screens/` (`--pages=`, `--widths=`, `--themes=`, `--reduced`).                                                                                                           |
| `npm run audit:a11y`       | axe-core (WCAG 2.2 A/AA rules) on every page in both themes, plus keyboard checks of the demo and the theme toggle.                                                                                                                  |
| `npm run audit:lighthouse` | Lighthouse 13.6.0 (via `npx`, not a dependency), mobile and desktop, into `reports/lighthouse/`. Targets: ≥ 95 in every category, LCP < 2.0 s, CLS < 0.05.                                                                           |

The audit scripts use the system Chrome at `/Applications/Google Chrome.app`; set `CHROME_PATH` elsewhere.

## Deployment (Cloudflare Pages)

Connect the GitHub repo in Cloudflare Pages with:

| Setting                | Value                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| Production branch      | `main`                                                           |
| Framework preset       | Astro (or None)                                                  |
| Build command          | `npm run build`                                                  |
| Build output directory | `dist`                                                           |
| Root directory         | `/`                                                              |
| Environment variable   | `NODE_VERSION` = `22.23.4` (the build image also reads `.nvmrc`) |

No secrets or other environment variables are needed. Preview deployments of other branches get public `*.pages.dev` URLs.

**Domain.** Add `theaftertaste.in` (apex, canonical) and `www.theaftertaste.in` as custom domains. `_redirects` cannot match hostnames, so add a Cloudflare **Redirect Rule** (free): when hostname equals `www.theaftertaste.in`, redirect to `https://theaftertaste.in${path}` with status 301, preserving the query string.

**Zone settings to keep off**, because they inject scripts or rewrite HTML and would break the CSP: Email Address Obfuscation (Scrape Shield), Rocket Loader, Web Analytics automatic setup, and any “JavaScript detections” challenge. Keep “Always Use HTTPS” on.

**Headers and redirects** live in `public/_headers` (CSP, HSTS, `nosniff`, referrer and permissions policies, `frame-ancestors 'none'`, immutable caching for fingerprinted `/_astro/*` files) and `public/_redirects` (trailing slashes, friendly aliases such as `/delete-account`). HSTS is sent with `includeSubDomains; preload`; submitting the domain to hstspreload.org is a separate, deliberate step (it covers every subdomain and is slow to undo).

## Updating the legal pages

The app repo is the source of truth for `privacy-policy.md` and `terms.md`. Edit them there, then:

```sh
APP_REPO_PATH=/path/to/DishDiary npm run sync:legal
npm run gates
```

The script only reads the app repo. It writes `src/content/legal/privacy.md` and `terms.md` with frontmatter recording the source path, commit and date (shown on the page as “Last updated” and “Version”). Do not edit those files by hand.

While the source contains `[TODO: …]` markers, each one is shown on the page as a highlighted “To do” note under a “Draft” banner, and every build logs a `[legal-todo]` warning. The `<!-- draft-notes … -->` comment is never published. Heading anchors such as `{#delete-your-data}` are kept, so `/privacy#delete-your-data` is a stable link (Google Play asks for an account-deletion URL; `/support#delete-account` or `/delete-account` also work).

## Screenshots

`src/assets/screenshots/home-placeholder.png` is a **placeholder**: a rendering of the app's Home screen from its tokens and copy (`npm run placeholders`). Replace it with a real screenshot:

1. Take a portrait screenshot of the app's Home screen (ideally 1080 × 2340, light theme, no personal data).
2. Save it over `src/assets/screenshots/home-placeholder.png`, or add a new file and change the import in `src/components/landing/Hero.astro`. Update the `alt` text there if the screen shows something different.
3. `npm run build`. Astro makes AVIF and WebP at five widths with a PNG fallback and sets width and height, so nothing shifts. A different aspect ratio needs the `.screen` `aspect-ratio` in `src/components/brand/PhoneFrame.astro` changed to match.

`PhoneFrame` takes any `ImageMetadata`, so more screenshots can be added the same way.

## Play badge

`src/config/site.ts` → `playStoreUrl` is `null`, so the hero shows a quiet, disabled-looking “Coming soon on Google Play” plate (not a link, no Google artwork) next to “Get notified” (a mailto to the contact email). When the listing is live:

1. Set `playStoreUrl` to the listing URL (`https://play.google.com/store/apps/details?id=…`). The plate becomes a link.
2. Replace the plate in `src/components/ui/PlayBadge.astro` with Google's official “Get it on Google Play” badge artwork, following Google's badge guidelines (download the badge, add it under `src/assets/`, render it with `astro:assets`). The site must not imitate the badge with its own drawing.
3. Update the FAQ answer “When can I get it?” in `src/components/landing/Faq.astro`, and consider adding `offers` to the `MobileApplication` JSON-LD in `src/pages/index.astro`.

## Android App Links (not set up)

`.well-known/assetlinks.json` is intentionally absent: it needs the app's package name and the SHA-256 fingerprint of its release signing certificate (from Play Console, App integrity). When ready, add `public/.well-known/assetlinks.json` and a `/.well-known/*` `Content-Type: application/json` rule in `_headers`.

## Analytics (optional, off)

The site has no analytics, and the landing page says so (“not on this website either”). If you decide to add **Cloudflare Web Analytics** (cookieless):

1. Enable it for the Pages project, using the manual JS snippet rather than automatic injection.
2. Add the snippet's script to `BaseLayout.astro`, and extend the CSP in `public/_headers`: `script-src … https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com`.
3. Change the privacy promise in `src/components/landing/Privacy.astro` and check the privacy policy says the same.

## Fonts and brand assets

- Prata, DM Sans and DM Mono (SIL OFL 1.1), subset to Latin + ₹ in `src/assets/fonts/`, licences in `public/fonts/`. The two above-the-fold faces (Prata 400, DM Sans 400) are preloaded; metric-matched local fallbacks prevent layout shift.
- Brand values come from the app repo's locked brand pack (`design/aftertaste-v1/`) and App UI v1.8.1 tokens (`design/app-ui-v1/SPEC.md`). `src/styles/tokens.css` holds them as custom properties; `.claude/project-state/active-work.md` has the mapping. `brand/` holds the copied app icon source.

## Rules

See `CLAUDE.md`. In short: never copy app code, config or secrets here (`npm run check:no-app-code` checks; with `APP_REPO_PATH` set it also compares the app's env values without printing them); pin dependencies to versions at least 14 days old; no trackers; every animation has a reduced-motion fallback.
