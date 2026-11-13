# Decisions

## 2026-11-12 — Website v1 foundation

- **Astro 7.4.4 + plain CSS, no UI framework.** Static pages with a few interactive moments; Astro components cover it with zero framework runtime.
- **Node 22.23.4.** Astro 7.4.4 requires Node >= 22.23.4; 22.23.4 (2026-10-20) is the newest 22.x at least 14 days old. 22.23.5 (2026-11-11, security release) can be adopted once it is 14 days old.
- **TypeScript 6.0.3, not 7.0.2.** `@astrojs/check` 0.9.12 supports `^5 || ^6` and `typescript-eslint` 8.72.1 supports `<6.1.0`.
- **Whole tree at least 14 days old.** Installed with `npm install --before=2026-10-29T00:00:00Z`, so transitive packages obey the same rule as direct ones.
- **`@astrojs/markdown-remark` is a direct dependency.** Astro 7 deprecates `markdown.remarkPlugins`; the replacement is `markdown.processor: unified({...})` from this package (an optional peer of astro).
- **No `motion` library.** Every effect is CSS (keyframes, scroll-driven animations, View Transitions) plus a few lines of IntersectionObserver. The app's springs are its press easing `cubic-bezier(0.3, 1.3, 0.5, 1)`, which CSS reproduces exactly; a spring engine would add JS for no visible gain.
- **Colours via `light-dark()`.** One declaration per token with both values side by side, mirroring the app's light/dark token table; `data-theme` sets `color-scheme` to force a theme.
- **Fonts subset with fonttools 4.55.0** (a local tool, not a dependency): Latin + ₹. DM Mono and Prata lack ₹, so the mono stack falls back to DM Sans for it. Metric-matched local fallbacks (`size-adjust`, ascent/descent overrides measured against Georgia, Arial, Courier New) keep the swap from shifting layout.
- **Root commit on `work-branch`.** The repo was empty; committing there keeps `main` untouched for the human.
- **Astro telemetry disabled** in npm scripts (`ASTRO_TELEMETRY_DISABLED=1`), in keeping with the no-tracking stance.

## 2026-11-12 — Quality pass (phase 6)

- **Accessible colour roles (WCAG AA) using existing values only.** Some of the app's pairings fall below AA on the web: paprika small text on oat (4.49:1), cream on dark-mode paprika buttons (3.56:1), herb on herbSoft (3.73:1), paprika stamp ink on dark raised (4.10:1). New roles in tokens.css, no new colours: `--primary-ink` (light uses the app's primaryPressed #A8361F), `--btn-bg` / `--btn-bg-hover` (dark uses #A8361F / #C2412D), `--herb-ink` (light uses the brand olive stamp ink #4E6B2F), `--stamp-paper` (dark uses surface), `--todo-ink`. Icons, meters, markers and large numerals keep `--primary` (3:1 thresholds). `npm run check:contrast` (a gate) checks every pair in both themes. `--faint` is never used for text. Worth considering for the app too.
- **Mono font stack order.** `'DM Mono', 'DM Mono fallback', 'DM Sans'`: with DM Sans second, the preloaded DM Sans stood in for DM Mono while it loaded and the legal meta line rewrapped (CLS 0.17 on mobile). DM Sans still supplies ₹.
- **`content-visibility: auto` on below-the-fold landing sections** (not the sticky receipt section). Mobile Lighthouse went from 93 (TBT 296 ms, LCP render delay 800 ms) to 100 (TBT ~0, LCP 1.66 s).
- **Hero seal only on wide layouts**: on phones and tablets it covered the app's own content in the screenshot.
- **Header home link** takes its accessible name from the wordmark ("Aftertaste"), so the name matches the visible text (WCAG 2.5.3).
- **Scroll-driven CSS is written in longhands**: the CSS minifier folds `animation-timeline` into the `animation` shorthand, which browsers reject.
- **html-validate `valid-id` is relaxed**: Astro's heading slugs start with digits (`3-your-location`), which is valid HTML5.

## 2026-11-12 — Domain moves to theaftertaste.app

- **Canonical URL `https://theaftertaste.app`, contact `hello@theaftertaste.app`** (human decision). `.app` is HSTS-preloaded, so HTTPS only; `check:seo` now fails on any `http://` URL (XML namespaces excepted) or any site host other than `theaftertaste.app` / `www.theaftertaste.app`.
- **www → apex via Cloudflare Bulk Redirects**, per Cloudflare's Pages guide; `_redirects` cannot match hostnames.
- **`sync:legal` rewrites links to the old domain** onto the canonical URL and records the count (`siteLinksRewritten`). It does not rewrite the legal contact email: that is policy wording and must change in the app repo.

## 2026-11-13 — Website v2: private beta and the beta list

- **"Still cooking" until launch.** No Play badge while `site.playStoreUrl` is null (the component and config stay for launch); every CTA points at the beta form.
- **Banner state in the inline theme script.** Hiding a dismissed banner before first paint is the only way to avoid a layout shift, and non-landing pages ship no script files. Cost: the theme script's CSP hash changes with it.
- **First-party beta list on Cloudflare Pages Functions + D1** (free tier), not a form service: no third-party requests, data stays in our account. `public/_routes.json` limits Function invocations to `/api/*`.
- **Wrangler via `npx`, pinned to 4.156.0** (2026-10-29, the newest release at least 14 days old), not a dependency: like Lighthouse, it is a tool, and it is large. The Workers types used by the function are declared locally (no `@cloudflare/workers-types`).
- **`wrangler.toml` holds the D1 binding** (Pages then reads bindings from it); the secret `RATE_LIMIT_SALT` stays in the dashboard. The `database_id` is not a secret.
- **Rate limit: 10 attempts per network per hour**, counted in D1 under `HMAC-SHA256(salt, hour | IP)`. Generous because Indian mobile carriers put many users behind one IP (CGNAT). The raw IP is never stored; buckets rotate hourly; finished hours are deleted on the next request.
- **Minimum time enforced only when JS ran.** Without JS there is no trustworthy timer (no cookies, no server-rendered token on a static page), so no-JS sign-ups rely on the honeypot, rate limit and validation. The page script waits rather than send early.
- **Generic success for duplicates, honeypot hits and too-fast submissions**, so the endpoint never reveals who is on the list.
- **No-JS outcomes via `:target`.** The function 303s to `/#joined` and `/#join-*`; CSS shows the message. No extra pages.
- **Optimistic UI with confirmed stamp.** The ticket appears at once; the SEAT SAVED stamp lands only on confirmation, and the live region announces only "Saving…" and the real outcome.
- **Privacy addendum on `/privacy`** (site-authored, clearly labelled) until the app repo's policy covers the beta list. Retention: until six months after launch or until removal is requested.
- **One new motion moment:** the opener's place name fading on scroll (scroll-driven mask via `@property`). The COMING LATER stamp is static (a label, not a verdict).
- **New sample place:** "Clock Tower Tea Stall" (invented, like the other demo places).

## 2026-11-14 — v2 approval round

- **Android and iOS.** Aftertaste is a native app for both platforms, both still cooking (iOS parked). The site never says "Android only"; JSON-LD `operatingSystem` is "Android, iOS"; the store-badge config covers both (`playStoreUrl`, `appStoreUrl`), hidden until launch URLs exist. `PlayBadge` became `StoreBadge` (`store="play" | "appStore"`).
- **Separate preview database.** `aftertaste-beta-preview` is bound under `[env.preview]` so preview deployments never write to the real list.
- **Console copy of the migration.** `migrations/console/0001_beta_list.sql` (no comments, one statement per line) because the D1 Console runs pasted SQL as one line. Kept at the owner's requested path although Wrangler then lists it as a migration too (idempotent, so harmless).
- **The temporary `/privacy` addendum is removed**: the app repo's policy now has section 13 "Website beta list"; the consent link points at `#13-website-beta-list`.

## 2026-11-14 — Console SQL moved out of Wrangler's way

- `migrations/console/0001_beta_list.sql` (was `migrations/0001_beta_list.console.sql`): Wrangler applies every `.sql` directly in `migrations/`, not subfolders, so the console copy is no longer listed as a migration.
