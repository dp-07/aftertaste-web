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
