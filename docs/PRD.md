# Product requirements: theaftertaste.app

The public website for **Aftertaste**, a private food diary, a native app for Android and iOS ("Your personal food memory"). Live at <https://theaftertaste.app>. Related: [ARCHITECTURE](ARCHITECTURE.md), [RULES](RULES.md), [DESIGN](DESIGN.md), [TASKS](TASKS.md).

## Purpose

1. Tell people what Aftertaste is, be honest that it is **still cooking** (private beta, not yet downloadable), and collect a first-party **beta list**. At launch, get people to the Google Play listing.
2. Host the pages the app and Google Play need: the **privacy policy**, **terms**, **support** and an account-deletion URL.
3. Be a small, fast, private site that matches the app's brand and practises what the app promises.

The app lives in a separate repo. This site only reads brand assets, fonts, token values and legal markdown from it (see [RULES](RULES.md)).

## Audience

- People who hear about Aftertaste from a friend and want to know what it is (mostly on a phone, Android or iPhone, mostly India: the site is `en-IN`).
- Google Play reviewers and users who need the privacy policy, terms, support contact or deletion instructions.
- Friends who share diaries (the app is private and social only through shared diaries).

## Goals

- Explain the product in one scroll: log places and dishes, a Want to try list, "What should we eat?", Near you, From friends, shareable receipts.
- Make the privacy position obvious and honest ("Free. Private by default. No ads, no tracking.") and consistent with the legal pages.
- Look like the app: the "tactile editorial" direction in [DESIGN](DESIGN.md).
- Meet the quality bar below on every page.

## Non-goals

- **No analytics, cookies, trackers or third-party requests.** Fonts and assets are self-hosted. Cloudflare Web Analytics is documented but off (README "Analytics").
- **No app code, config, secrets or git history** from the app repo.
- No accounts or CMS. The one form is the beta list, posted to our own Cloudflare Pages Function and stored in our own Cloudflare D1 database: no form services, no captcha, no third-party scripts ([ARCHITECTURE](ARCHITECTURE.md#beta-list-pages-functions-and-d1)).
- No implication that the app can be downloaded before launch.
- No web app promises. Aftertaste is a native app for **Android and iOS**; both are still cooking (iOS is parked for now), so the site names both platforms and promises neither a date.
- No blog, pricing, testimonials or stock photography.

## Pages and sections

| Route      | Source                                              | Intent                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`        | `src/pages/index.astro` + `src/components/landing/` | Landing. Hero (wordmark, "Private beta · Android and iOS · still cooking", CTAs, phone frame) → Opener ("Sound familiar?", camera-roll collage) → 01 How it works → 02 Want to try → 03 What should we eat? (interactive demo) → 04 Near you → 05 From friends → 06 The receipt → 07 Every meal counts → 08 From the diary → 09 Your taste report (still cooking) → 10 Privacy → 11 Questions → 12 Save your seat (beta form) |
| `/privacy` | `src/content/legal/privacy.md`                      | Privacy policy, synced from the app repo; section 13 covers the website beta list (`#13-website-beta-list`). `#delete-your-data` is the stable account-deletion anchor for Google Play.                                                                                                                                                                                                                                       |
| `/terms`   | `src/content/legal/terms.md`                        | Terms of use, synced from the app repo.                                                                                                                                                                                                                                                                                                                                                                                       |
| `/support` | `src/pages/support.astro`                           | Contact email and the four common questions (delete account, what friends see, location, export). `#delete-account` is also a Play deletion URL.                                                                                                                                                                                                                                                                              |
| `/404`     | `src/pages/404.astro`                               | Branded not-found page (`noindex`, not in the sitemap).                                                                                                                                                                                                                                                                                                                                                                       |

Every page carries a slim, dismissible beta banner ("Aftertaste is still cooking…"). `POST /api/beta` is the beta list endpoint (`functions/api/beta.ts`).

Redirect aliases (`/privacy-policy`, `/terms-of-use`, `/contact`, `/help`, `/delete-account`, …) live in `public/_redirects`.

## Calls to action

| CTA                      | Behaviour                                                                                                                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Join the beta** (hero) | Scrolls to "Save your seat" (`#join`). The banner's "Join the list" and the FAQ link there too (`/#join` from other pages).                                                                                                                                                            |
| **Save my seat** (form)  | Email (required), city and "How did you hear about us?" (optional), a consent line linking to `/privacy#13-website-beta-list`. Works without JS; with JS it is optimistic with live-region announcements. Backend in [ARCHITECTURE](ARCHITECTURE.md#beta-list-pages-functions-and-d1). |
| **See how it works**     | Secondary hero button to `#how-it-works`.                                                                                                                                                                                                                                              |
| Store badges             | Not shown during the beta. Each returns in the hero when its URL is set (`site.playStoreUrl`, `site.appStoreUrl` in `src/config/site.ts`); then use that store's official badge artwork.                                                                                               |

## Success criteria

| Area          | Target                                                                                                                                                                                                                                                                                                                       | Enforced by                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Lighthouse    | **100** in Performance, Accessibility, Best Practices, SEO, mobile and desktop (404 SEO excluded: `noindex`). Last measured result at v1: 100 across the board. `npm run audit:lighthouse` fails below 95, LCP ≥ 2.0 s or CLS ≥ 0.05, so a drop from 100 to 95–99 does not fail the script: treat it as a regression anyway. | `npm run audit:lighthouse` (manual)                            |
| Accessibility | WCAG 2.2 AA: axe-core clean in both themes at 375 and 1440 px; keyboard operable; AA contrast for every text pair.                                                                                                                                                                                                           | `npm run audit:a11y` (manual), `npm run check:contrast` (gate) |
| JS budget     | Landing ≤ 30 KB gzipped JS (currently ~2.4 KB incl. the inline theme script); `/privacy`, `/terms`, `/support`, `/404` ship no script files.                                                                                                                                                                                 | `npm run check:budget` (gate)                                  |
| Security      | Strict CSP: no inline scripts except the hashed theme script, no inline styles, no third-party hosts.                                                                                                                                                                                                                        | `npm run check:csp` (gate)                                     |
| SEO           | Unique title and description, canonical, OG image, sitemap, robots, HTTPS-only, one canonical host.                                                                                                                                                                                                                          | `npm run check:seo` (gate)                                     |
| Layout        | No horizontal overflow from 320 px; CLS < 0.05.                                                                                                                                                                                                                                                                              | Audits (manual)                                                |
| Motion        | Every animation has a static, complete reduced-motion fallback.                                                                                                                                                                                                                                                              | Review ([RULES](RULES.md))                                     |

Every change must pass `npm run gates`. Changes to the beta list must also pass `npm run test:beta` (local, end to end).

## Beta list data

- Collected: email (required), city and "how did you hear" (optional), sign-up time. No IP address, user agent or cookies.
- Purpose: invite people to the beta and announce the launch. Retention: until six months after launch, or until the person asks to be removed (`hello@theaftertaste.app`).
- Duplicates and bots get the same answer as a successful sign-up, so the form never reveals who is on the list.

## Launch

- **Target launch date: 23 Nov 2026** (stated by the owner; not recorded elsewhere in the repo).
- Launch blockers and the checklist are in [TASKS](TASKS.md): real screenshot, resolved legal TODOs, working `hello@` mailbox, `www` redirect, the D1 beta list set up, Play listing URL.
- The site stays in "still cooking" mode until launch. At launch: set `playStoreUrl` and `appStoreUrl` as each store goes live, change the hero eyebrow, banner, FAQ and footer copy, and keep the beta list until its retention ends.

## Future items

- **Store badges + listing URLs (Google Play and the App Store):** set `playStoreUrl` / `appStoreUrl`, add each store's official badge artwork, update the FAQ answers and consider `offers` in the JSON-LD (steps in [DEV-GUIDE](DEV-GUIDE.md#add-the-store-badges-and-listing-urls)).
- **Android App Links:** `public/.well-known/assetlinks.json` once the release-signing SHA-256 fingerprint exists.
- Real app screenshots (more than one, light and dark).
- Real "From the diary" entries and photos (placeholders now; [TASKS](TASKS.md)).
- The taste report is teased as "coming later"; when it is real, the privacy policy must describe it first.
- An admin export for the beta list is out of scope; export from D1 ([DEV-GUIDE](DEV-GUIDE.md#export-the-beta-list)).
- Optional cookieless Cloudflare Web Analytics, only by explicit owner decision (it changes the privacy promise).
