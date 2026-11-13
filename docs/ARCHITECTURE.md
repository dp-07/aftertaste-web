# Architecture

A static Astro site with plain CSS and almost no JavaScript, deployed by Cloudflare Pages. Related: [RULES](RULES.md), [DESIGN](DESIGN.md), [DEV-GUIDE](DEV-GUIDE.md), [MEMORY](MEMORY.md).

## Build

- **Astro 7.4.4**, `output: 'static'`, TypeScript 6.0.3 strict, no UI framework. Config: [astro.config.mjs](../astro.config.mjs).
- `build.format: 'file'` and `trailingSlash: 'never'`: pages build to `dist/privacy.html` and Cloudflare Pages serves them at `/privacy`. Canonical URLs have no trailing slash.
- `inlineStylesheets: 'never'` and `vite.build.assetsInlineLimit: 0`: nothing is inlined, so the CSP needs no `unsafe-inline` and no hashes beyond the theme script.
- `site: 'https://theaftertaste.app'`; everything absolute derives from it.
- Node 22.23.4 ([.nvmrc](../.nvmrc)); Astro refuses to build on anything older.

## Folder structure

```
astro.config.mjs        build, sitemap, markdown processor
brand/                  copied app icon source (do not edit)
docs/                   these docs
public/                 _headers, _redirects, robots.txt, icons, OG images, manifest, font licences
scripts/                gates, sync, font subsetting, OG/icon rendering, local server, audits
src/
  assets/               subset woff2 fonts, placeholder screenshot
  components/
    brand/              Wordmark, Glyph, SealMark, Stamp, Receipt, PhoneFrame, Loader, FoodMark
    ui/                 Button, InkLink, Icon, ThemeToggle, PlayBadge, Rating, DietaryMark
    landing/            Hero, HowItWorks, Spread, DecisionDemo, ReceiptFeature, Privacy, Faq
    app/                replicas of app UI rows/cards used as demos
    LegalPage.astro, SiteHeader.astro, SiteFooter.astro
  config/site.ts        name, URL, contact email, Play URL (null = "Coming soon")
  content/legal/        synced legal markdown (never edit by hand)
  content.config.ts     `legal` collection schema
  layouts/BaseLayout.astro
  lib/remark-legal.mjs  remark plugin for the legal pages
  pages/                index, privacy, terms, support, 404
  scripts/              theme.js (inline), landing.ts (the one module)
  styles/               tokens.css, fonts.css, base.css, brand.css
.claude/project-state/  live status and decisions (not duplicated here)
```

## How pages, components, styles and tokens fit

- Every page wraps its content in [BaseLayout.astro](../src/layouts/BaseLayout.astro): head (title, description, canonical, OG/Twitter, icons, manifest, theme script, font preloads, optional JSON-LD), skip link, header, `<main id="main">`, footer.
- Pages compose components. The landing page ([index.astro](../src/pages/index.astro)) is Hero → HowItWorks → `Spread` sections → ReceiptFeature → Privacy → Faq. `/privacy` and `/terms` are thin pages around `LegalPage.astro`.
- **Styles:** global CSS is imported by the layout in this order: [fonts.css](../src/styles/fonts.css) (self-hosted faces and metric-matched fallbacks), [tokens.css](../src/styles/tokens.css) (every custom property), [base.css](../src/styles/base.css) (reset, type roles, links, focus, layout primitives, view transitions, print), [brand.css](../src/styles/brand.css) (glyph colours, wordmark, seal, loader). Everything else is an Astro **scoped** style inside its component. A class passed to a child component must be targeted with `:global()`.
- **Tokens** are the app's values as CSS custom properties; colours use `light-dark()` so both themes sit side by side. Components use tokens, never literal colours. See [DESIGN](DESIGN.md#tokens).
- **Config:** change site facts (email, Play URL, tagline) in [src/config/site.ts](../src/config/site.ts), not in components.
- **Icons:** Feather via `feather-icons`, inlined at build by `ui/Icon.astro`.

## Legal sync pipeline

The app repo is the source of truth for `docs/legal/privacy-policy.md` and `docs/legal/terms.md`.

1. `APP_REPO_PATH=/path/to/app npm run sync:legal` ([scripts/sync-legal.mjs](../scripts/sync-legal.mjs)) reads those two files (read-only) and writes `src/content/legal/privacy.md` and `terms.md`.
2. **Link rewriting:** links to the site's earlier domain (`theaftertaste.in`, with or without `www`/scheme) are rewritten to `https://theaftertaste.app`. The count is recorded as `siteLinksRewritten` and the script warns so the source can be fixed. Wording is never changed, and the contact email is not rewritten (it is policy text).
3. **Source commit stamp:** frontmatter records `source`, `sourceCommit` (full SHA of the last commit touching that file), `sourceUpdated`, `syncedAt`, and `sourceDirty: true` if the app copy had uncommitted changes. The schema is in [content.config.ts](../src/content.config.ts). `LegalPage.astro` shows "Last updated" and "Version" from it.
4. At build, [remark-legal.mjs](../src/lib/remark-legal.mjs) drops the internal `<!-- draft-notes … -->` comment and the H1, turns a trailing `{#id}` on a heading into its anchor (so `/privacy#delete-your-data` is stable), and wraps each `[TODO: …]` in a highlighted "To do" note while logging `[legal-todo]` build warnings. A "Draft" banner shows while TODOs remain.
5. `smartypants` is off so quotes match the source.

## SEO, social cards, sitemap, robots, JSON-LD

- Per-page title, description, canonical (omitted on `noindex` pages), `og:*` and `twitter:*` tags come from `BaseLayout` props. Locale is `en-IN`.
- OG images: four 1200 × 630 PNGs in `public/og/` (`home`, `legal`, `support`, `default`), rendered by `npm run og` with Chrome and committed.
- Sitemap: `@astrojs/sitemap` writes `sitemap-index.xml` and `sitemap-0.xml`, excluding `/404`. `public/robots.txt` allows all and points at `https://theaftertaste.app/sitemap-index.xml`.
- JSON-LD: `index.astro` passes an `Organization` and a `MobileApplication` object to the layout, which serialises them into `application/ld+json` blocks.
- Icons and manifest: `favicon.svg` (with a dark variant), `favicon.ico`, apple-touch, manifest icons (`npm run icons`), `site.webmanifest`.
- `npm run check:seo` verifies all of it plus HTTPS-only and the single canonical host.

## Headers, redirects and the CSP

- [public/_headers](../public/_headers): CSP (`default-src 'none'`; `script-src 'self'` plus the **SHA-256 of the inline theme script**; `style-src 'self'`; no third-party hosts; `frame-ancestors 'none'`; `upgrade-insecure-requests`), HSTS (`max-age=63072000; includeSubDomains; preload`), `nosniff`, referrer, permissions and cross-origin policies, and caching (immutable for `/_astro/*`, one day for `/og`, `/fonts`, `/icons`).
- The hash must match `src/scripts/theme.js` byte for byte. `npm run csp:hash` rewrites it; `npm run check:csp` fails if it drifts.
- [public/_redirects](../public/_redirects): trailing-slash cleanup and aliases (`/privacy-policy`, `/terms-of-use`, `/terms-of-service`, `/contact`, `/help`, `/delete-account`).
- `_redirects` **cannot match hostnames**, so `www` → apex is a Cloudflare Bulk Redirect (below).

## Theme system

- Colour tokens use `light-dark()`; `:root` has `color-scheme: light dark` (follows the system). `data-theme="light|dark"` on `<html>` forces one.
- [src/scripts/theme.js](../src/scripts/theme.js) is inlined in `<head>` before first paint (no flash). It reads `localStorage['aftertaste-theme']` (falls back to the system if storage is blocked), sets `data-theme`, updates the `theme-color` metas and each toggle's `aria-pressed`, handles clicks on `[data-theme-set]` by delegation, and adds `html.js`.
- `ThemeToggle.astro` (Light / Dark / System) ships no JS of its own and is hidden when scripts do not run.

## Motion implementation

Details and reduced-motion behaviour per effect are in [DESIGN](DESIGN.md#motion-inventory).

- **CSS first.** Keyframes use the app's motion tokens. No animation library ([MEMORY](MEMORY.md#why-there-is-no-motion-library)).
- **Scroll-driven receipt:** on wide and tall viewports with `animation-timeline` support, `ReceiptFeature.astro` makes the section tall with a sticky stage and a CSS view timeline (`--print`) feed the paper as you scroll. Longhand properties only ([MEMORY](MEMORY.md#the-css-minifier-breaks-scroll-driven-animations)).
- **IntersectionObserver fallback:** [landing.ts](../src/scripts/landing.ts) presses stamps when half visible, and, where scroll-driven printing does not apply, switches the receipt to a time-based print (`data-mode="time"`, same steps) once it is visible. It also drives the "What should we eat?" demo. Without JS, stamps, receipt and a sample pick are shown statically.
- **View Transitions:** cross-document `@view-transition { navigation: auto }` in `base.css` fades pages; the header has `view-transition-name: site-header`. No JS.
- All of it sits behind `prefers-reduced-motion`.

## Deployment (Cloudflare Pages)

- Production branch **`main`**; every other branch gets a preview deployment at a `*.pages.dev` URL.
- Build command `npm run build`, output `dist`, root `/`, env var `NODE_VERSION=22.23.4`. No secrets or other variables.
- Custom domain `theaftertaste.app` (apex, canonical).
- **`www` → apex** is a Cloudflare **Bulk Redirect** (list entry `www.theaftertaste.app` → `https://theaftertaste.app`, 301, with query string, subpath matching, path suffix and subdomains preserved, plus a proxied `A www → 192.0.2.1` DNS record). Full steps and the `curl` check are in the README "Domain" section.
- Zone settings that must stay off are listed in [RULES](RULES.md#privacy-and-third-parties).
- `npm run serve:dist` ([serve-dist.mjs](../scripts/serve-dist.mjs)) mimics Pages locally (clean URLs, `_headers` including the CSP, `_redirects`, 404) and is what the audits use.

## Quality tooling

`scripts/` holds the 12 gates (run by `npm run gates`), the audits (screenshots, axe, Lighthouse) and the asset generators. See [DEV-GUIDE](DEV-GUIDE.md#scripts). Live status and decisions: `.claude/project-state/`.
