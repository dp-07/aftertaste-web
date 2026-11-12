# Product requirements: theaftertaste.app

The public website for **Aftertaste**, a private food diary for Android ("Your personal food memory"). Live at <https://theaftertaste.app>. Related: [ARCHITECTURE](ARCHITECTURE.md), [RULES](RULES.md), [DESIGN](DESIGN.md), [TASKS](TASKS.md).

## Purpose

1. Tell people what Aftertaste is and get them to the Google Play listing when it exists.
2. Host the pages the app and Google Play need: the **privacy policy**, **terms**, **support** and an account-deletion URL.
3. Be a small, fast, private site that matches the app's brand and practises what the app promises.

The app lives in a separate repo. This site only reads brand assets, fonts, token values and legal markdown from it (see [RULES](RULES.md)).

## Audience

- People who hear about Aftertaste from a friend and want to know what it is (mostly on a phone, mostly Android, mostly India: the site is `en-IN`).
- Google Play reviewers and users who need the privacy policy, terms, support contact or deletion instructions.
- The owner and friends of the diary (the app is private and social only through shared diaries).

## Goals

- Explain the product in one scroll: log places and dishes, a Want to try list, "What should we eat?", Near you, From friends, shareable receipts.
- Make the privacy position obvious and honest ("Free. Private by default. No ads, no tracking.") and consistent with the legal pages.
- Look like the app: the "tactile editorial" direction in [DESIGN](DESIGN.md).
- Meet the quality bar below on every page.

## Non-goals

- **No analytics, cookies, trackers or third-party requests.** Fonts and assets are self-hosted. Cloudflare Web Analytics is documented but off (README "Analytics").
- **No app code, config, secrets or git history** from the app repo.
- No accounts, forms, backend or CMS: static pages only. "Get notified" is a `mailto:`.
- No iOS or web app promises: Android only.
- No blog, pricing, testimonials or stock photography.

## Pages and sections

| Route      | Source                                              | Intent                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`        | `src/pages/index.astro` + `src/components/landing/` | Landing. Hero (wordmark, tagline, CTAs, phone frame) → 01 How it works → 02 Want to try → 03 What should we eat? (interactive demo) → 04 Near you → 05 From friends → 06 The receipt → Privacy promise → FAQ |
| `/privacy` | `src/content/legal/privacy.md`                      | Privacy policy, synced from the app repo. `#delete-your-data` is the stable account-deletion anchor for Google Play.                                                                                         |
| `/terms`   | `src/content/legal/terms.md`                        | Terms of use, synced from the app repo.                                                                                                                                                                      |
| `/support` | `src/pages/support.astro`                           | Contact email and the four common questions (delete account, what friends see, location, export). `#delete-account` is also a Play deletion URL.                                                             |
| `/404`     | `src/pages/404.astro`                               | Branded not-found page (`noindex`, not in the sitemap).                                                                                                                                                      |

Redirect aliases (`/privacy-policy`, `/terms-of-use`, `/contact`, `/help`, `/delete-account`, …) live in `public/_redirects`.

## Calls to action

| CTA                            | Behaviour                                                                                                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Coming soon on Google Play** | A disabled-looking plate, not a link, no Google artwork, while `site.playStoreUrl` is `null` (`src/config/site.ts`). Becomes a link when the URL is set; then swap in Google's official badge. |
| **Get notified**               | `mailto:hello@theaftertaste.app` with a prefilled subject. The contact mailbox must receive mail before launch (see [TASKS](TASKS.md)).                                                        |

## Success criteria

| Area          | Target                                                                                                                                                                                                                                                                                                                       | Enforced by                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Lighthouse    | **100** in Performance, Accessibility, Best Practices, SEO, mobile and desktop (404 SEO excluded: `noindex`). Last measured result at v1: 100 across the board. `npm run audit:lighthouse` fails below 95, LCP ≥ 2.0 s or CLS ≥ 0.05, so a drop from 100 to 95–99 does not fail the script: treat it as a regression anyway. | `npm run audit:lighthouse` (manual)                            |
| Accessibility | WCAG 2.2 AA: axe-core clean in both themes at 375 and 1440 px; keyboard operable; AA contrast for every text pair.                                                                                                                                                                                                           | `npm run audit:a11y` (manual), `npm run check:contrast` (gate) |
| JS budget     | Landing ≤ 30 KB gzipped JS (currently ~1.5 KB incl. the inline theme script); `/privacy`, `/terms`, `/support`, `/404` ship no script files.                                                                                                                                                                                 | `npm run check:budget` (gate)                                  |
| Security      | Strict CSP: no inline scripts except the hashed theme script, no inline styles, no third-party hosts.                                                                                                                                                                                                                        | `npm run check:csp` (gate)                                     |
| SEO           | Unique title and description, canonical, OG image, sitemap, robots, HTTPS-only, one canonical host.                                                                                                                                                                                                                          | `npm run check:seo` (gate)                                     |
| Layout        | No horizontal overflow from 320 px; CLS < 0.05.                                                                                                                                                                                                                                                                              | Audits (manual)                                                |
| Motion        | Every animation has a static, complete reduced-motion fallback.                                                                                                                                                                                                                                                              | Review ([RULES](RULES.md))                                     |

Every change must pass `npm run gates`.

## Launch

- **Target launch date: 23 Nov 2026** (stated by the owner; not recorded elsewhere in the repo).
- Launch blockers and the checklist are in [TASKS](TASKS.md): real screenshot, resolved legal TODOs, working `hello@` mailbox, `www` redirect, Play listing URL.

## Future items

- **Play badge + listing URL:** set `playStoreUrl`, add Google's official badge artwork, update the FAQ answer and consider `offers` in the JSON-LD (steps in [DEV-GUIDE](DEV-GUIDE.md#add-the-play-badge-and-listing-url)).
- **Android App Links:** `public/.well-known/assetlinks.json` once the release-signing SHA-256 fingerprint exists.
- Real app screenshots (more than one, light and dark).
- Optional cookieless Cloudflare Web Analytics, only by explicit owner decision (it changes the privacy promise).
