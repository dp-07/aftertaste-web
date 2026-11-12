# CLAUDE.md

Context for Claude Code working in this repository. Keep it in sync: when you change something described here, update the section and `.claude/project-state/`.

## Overview

The public website for **Aftertaste**, a private food diary for Android ("Your personal food memory"), served at **https://theaftertaste.app** (apex is canonical; `www` redirects to it via a Cloudflare Bulk Redirect). `.app` is an HSTS-preloaded TLD: never generate `http://` links (`check:seo` enforces HTTPS-only and the single canonical host). Contact: `hello@theaftertaste.app`. Static Astro site deployed by **Cloudflare Pages from `main`**. Pages: `/` (landing), `/privacy`, `/terms`, `/support`, and a branded `404`.

The app lives in a separate repo (`DishDiary`, package `bitemarks`). This repo is public.

## Hard rules

- **Never copy app code, config, secrets or history into this repo.** No app source (`src/**` of the app), no `app.config.js`, no `.env*` values, no Supabase/Google/RevenueCat keys or project refs, no git history. Allowed from the app repo: brand assets (SVG, icon PNGs), font files with their OFL licences, design-token _values_, and the legal markdown (via `npm run sync:legal`). `npm run check:no-app-code` enforces this.
- **Never write to the app repo.** Read it only (path given by `APP_REPO_PATH`).
- Pin every dependency to an exact version published at least 14 days earlier. Install with `npm install --before=<date 14 days ago>` so the transitive tree is equally old; record versions in `decisions.md`.
- No analytics, cookies, trackers or third-party requests. Fonts and assets are self-hosted. Optional Cloudflare Web Analytics is documented in the README and is off.
- No "AI slop": no gradient blobs, glassmorphism, stock photos, emoji, three-icon feature rows, testimonial carousels, or fade-up-on-everything. Copy is warm, short, specific and sentence case. Banned words: unlock, elevate, seamless, revolutionize, delve, supercharge, game-changer, "in today's fast-paced world", effortlessly, all-in-one.
- Every animation has a `prefers-reduced-motion` fallback that is static and complete.
- CSP: no inline scripts except the theme script (hashed in `public/_headers`), no inline styles, no `style=` attributes. `npm run check:csp` enforces it.

## Stack

- Astro 7.4.4 (static output, `build.format: 'file'`, `trailingSlash: 'never'`), TypeScript 6.0.3 strict, no UI framework.
- Plain CSS: tokens in `src/styles/tokens.css` (custom properties, `light-dark()`), `base.css`, `brand.css`, `fonts.css`, plus Astro scoped styles. No Tailwind or CSS frameworks.
- Fonts: Prata 400, DM Sans 400/500/600, DM Mono 400/500 (OFL), subset woff2 in `src/assets/fonts/` (`npm run fonts:subset`), licences in `public/fonts/`.
- Icons: Feather (the app's icon set) via `feather-icons`, inlined at build by `src/components/ui/Icon.astro`. Star rating glyphs are a plain SVG star (the app uses Ionicons for those).
- JS: the inline theme script on every page; the landing page adds one small module (`src/scripts/landing.ts`). No `motion` library (CSS covers every effect; see decisions).
- Node 22.23.4 (`.nvmrc`). Astro telemetry is disabled in the npm scripts.

## Layout

- `src/config/site.ts` — name, URL, contact email, owner, Play Store URL (null = "Coming soon").
- `src/layouts/BaseLayout.astro` — head (SEO, OG/Twitter, icons, theme script, font preloads), skip link, header, footer.
- `src/components/brand/` — Wordmark, Glyph, SealMark, Stamp, Receipt, PhoneFrame, Loader.
- `src/components/ui/` — Button, Icon, ThemeToggle, PlayBadge.
- `src/components/landing/` — landing sections and app-UI replicas.
- `src/content/legal/` — synced legal markdown (do not edit by hand; edit in the app repo and re-sync).
- `src/lib/remark-legal.mjs` — strips draft notes and the H1, applies `{#id}` heading anchors, highlights `[TODO: …]` and logs `[legal-todo]` build warnings.
- `public/` — `_headers`, `_redirects`, `robots.txt`, icons, manifest, OG images, font licences.
- `scripts/` — gates, sync, font subsetting, OG/icon rendering, local server, audits.

## Commands

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run gates` — build (no warnings except `[legal-todo]`), `astro check`, eslint, prettier, html-validate, internal links, SEO, CSP, JS budget, no-app-code. Run before every commit.
- `APP_REPO_PATH=… npm run sync:legal` — copy the legal markdown from the app repo and record its commit.
- `npm run serve:dist` — serve `dist/` like Cloudflare Pages (clean URLs, `_headers`, 404).
- `npm run audit:screens`, `npm run audit:a11y`, `npm run audit:lighthouse` — screenshots, axe, Lighthouse (need Google Chrome).

## Git workflow

Mirrors the app repo: `task/<name>` → `work-branch` (Claude, only after the human replies "approved") → `main` (human only; that is the production deploy).

- Claude never commits to, merges into or pushes `main`.
- One `task/<short-kebab-name>` per task, from the latest `work-branch`. Local checkpoint commits per phase; push and merge only after "approved". Merge with `--no-ff`, run `npm run gates`, push `work-branch`.
- No force-push, no rewriting pushed history, no branch deletion, never discard uncommitted work. On a merge conflict, stop and report.
- Commit messages are conventional and descriptive.
