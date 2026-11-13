# Memory: learnings and gotchas

Durable lessons so future sessions do not repeat mistakes. Each entry: what happened → why → what to do. Decisions with dates are in `.claude/project-state/decisions.md`. Related: [RULES](RULES.md), [ARCHITECTURE](ARCHITECTURE.md).

## The CSS minifier breaks scroll-driven animations

- **What happened:** the receipt's scroll-driven print worked in dev and silently failed in the production build.
- **Why:** the CSS minifier folds `animation-timeline` into the `animation` shorthand, and browsers reject that output.
- **What to do:** write scroll-driven rules in **longhand properties** (`animation-name`, `animation-duration`, `animation-timeline`, …), as in `ReceiptFeature.astro` (there is a comment on it). After touching it, test against `npm run build` + `npm run serve:dist`, not only `npm run dev`.

## Font-loading layout shift

- **What happened:** mobile CLS was 0.17: the legal meta line rewrapped when DM Mono arrived.
- **Why:** with `'DM Sans'` second in the mono stack, the already-preloaded DM Sans stood in for DM Mono while it loaded, and its metrics differ.
- **What to do:** keep the stack order `'DM Mono', 'DM Mono fallback', 'DM Sans'` (the metric-matched fallback before DM Sans; DM Sans stays only for ₹). Keep the `size-adjust` and ascent/descent overrides in `fonts.css`. Preload only Prata 400 and DM Sans 400. The ad hoc scripts `scripts/.cls.mjs` and `scripts/.fontshift.mjs` measure shifts (needs `dist/` and Chrome).

## Layout at 320 px

- **What happened:** the phase 6 quality pass fixed horizontal overflow at 320 px and moved the hero seal to wide layouts only, because on phones and tablets it covered the app's own content in the screenshot.
- **Why:** the commit message records the fixes, not the exact root cause. The guards now in the code are `minmax(0, 1fr)` grid columns, `overflow-wrap: anywhere` on long strings (email, legal text, footer) and `overflow-x: clip` on `body`.
- **What to do:** check 320 px after any layout change (`npm run audit:screens -- --widths=320`). Note that `overflow-x: clip` can hide overflow from a plain `scrollWidth` check, so also look at the screenshots. On 2026-11-13 every page measured `scrollWidth` 320 at a 320 px viewport.

## Why `_redirects` cannot redirect `www`

- **What happened:** the first idea was a `www` → apex rule in `public/_redirects`.
- **Why:** Cloudflare Pages `_redirects` matches paths only, not hostnames.
- **What to do:** use a Cloudflare **Bulk Redirect** plus a proxied `A www → 192.0.2.1` record (steps in README "Domain"). Do not add host rules to `_redirects`.

## Why there is no motion library

- **What happened:** the app uses spring animations, which suggested a library such as `motion`.
- **Why:** the app's springs reduce to its press easing `cubic-bezier(0.3, 1.3, 0.5, 1)`, which CSS reproduces exactly. Everything else is keyframes, CSS scroll-driven animations, View Transitions and a few lines of IntersectionObserver. A library would add JS for no visible gain and press against the JS budget.
- **What to do:** use CSS. Add a library only with a decision recorded and the budget checked.

## `.app` is HSTS-preloaded

- **What happened:** the domain moved from `theaftertaste.in` to `theaftertaste.app`.
- **Why:** the whole `.app` TLD is on browsers' HSTS preload list, so `http://` never works and there is nothing to submit to the preload list.
- **What to do:** never write `http://` URLs. `check:seo` fails on any (XML namespaces excepted) and on any host other than `theaftertaste.app` / `www.theaftertaste.app`. `serve-dist.mjs` strips HSTS and `upgrade-insecure-requests` locally because they would break `http://localhost`.

## Cloudflare features that break the CSP

- **What happened:** (preventive) several Cloudflare features inject inline scripts or rewrite HTML.
- **Why:** Email Address Obfuscation, Rocket Loader, automatic Web Analytics and "JavaScript detections" add scripts the strict CSP blocks; they also break the no-third-party promise.
- **What to do:** keep them off. If analytics is ever wanted, use the manual snippet and extend the CSP deliberately (README "Analytics"). Verify production headers and the console after any zone change.

## Email links and Cloudflare Email Address Obfuscation

- **What happened:** Cloudflare's Email Address Obfuscation (Scrape Shield) can rewrite `mailto:` links and addresses into `/cdn-cgi/l/email-protection` links and inject an inline decoder script.
- **Why it matters:** the inline script is blocked by the strict CSP (no hash for it), so the links break and the console shows CSP errors.
- **What to do:** keep the setting **off** (the owner turns it off in the zone). The site does not depend on it: every email is a plain `<a href="mailto:hello@theaftertaste.app">` (the "Get notified" one adds a subject) and the address is plain text, with no JS involved. After any zone change check `curl -s https://theaftertaste.app | grep -c email-protection` is `0` and click a mail link.

## The wordmark must have real text

- **What happened:** the wordmark is drawn from letters plus food glyphs; screen readers and the page text read it as "afetat" (the glyphs have no text).
- **Why:** the visible letters were text nodes and the glyphs SVGs without names.
- **What to do:** `Wordmark.astro` renders a visually hidden "Aftertaste" and hides the drawn parts with `aria-hidden`; the drawn letters are CSS `::before` content (`data-c`), so they are also not in `textContent`. Never put the drawn letters back as text. The hero `h1` adds a hidden " — " so it reads "Aftertaste — Your personal food memory". Check with `locator.ariaSnapshot()` in Playwright and `npm run audit:a11y`.

## Run-together text

- **What happened:** adjacent inline elements with no whitespace between them read as one word in `textContent` and to some assistive tech ("Coming soon onGoogle Play", "Rated 4.6 out of 53 visits", "01How it works").
- **Why:** Astro drops whitespace between elements, and flex/grid containers hide it visually, so nothing looked wrong.
- **What to do:** put `{' '}` between such elements (flex/grid ignore it, so layout is unchanged) or a visually hidden separator (`<span class="visually-hidden"> · </span>`). Run `node scripts/.runtogether.mjs` after building to list remaining cases.

## No personal name on the site (legal name excepted)

- **What happened:** the owner's name was in the footer, JSON-LD, support copy and the synced legal text.
- **What to do:** the responsible party is "Aftertaste"; copy says "we". The one allowed exception is the legal name "Paras D Prasad" in the legal documents, which come from the app repo (never hand-edit the synced files; fix the source and re-run `sync:legal`). `npm run check:no-name` (a gate) fails on the name anywhere else in `dist/` and warns if the legal pages use a different form. The sync script needs no change: it never inspects the policy wording.

## The legal sync link rewrite

- **What happened:** the app repo's legal drafts linked to the old domain.
- **Why:** the app repo is the source of truth, so the site cannot edit the text, but the old host must not appear on the site (`check:seo`).
- **What to do:** `sync:legal` rewrites only URLs pointing at the old domain to `https://theaftertaste.app`, counts them in `siteLinksRewritten` and warns. Fix the source in the app repo too. It does **not** rewrite the contact email: that is policy wording. The current legal files had zero rewrites (contact is `hello@theaftertaste.app`).

## The default shell Node can be too old

- **What happened:** on 2026-11-13 `npm run gates` failed immediately with "Node.js v22.23.3 is not supported by Astro!". nvm's default was 22.23.3.
- **Why:** Astro 7.4.4 needs Node ≥ 22.23.4 and `.nvmrc` pins 22.23.4.
- **What to do:** run `nvm use` in the repo root first. Check `node -v`.

## Editing the theme script changes the CSP hash

- **What to do:** after any edit to `src/scripts/theme.js` (even whitespace), run `npm run csp:hash`, then `npm run build && npm run check:csp`. Prettier formats the file; hash after formatting.

## Docs are scanned by the no-app-code gate

- **What happened:** `check:no-app-code` scans every tracked or untracked non-ignored text file, Markdown included.
- **Why:** it looks for app identifiers (backend hosts and keys, app-framework imports, env-name prefixes, storage names).
- **What to do:** describe app internals generically in docs (for example "backend keys"); never paste identifiers. Docs are also checked by Prettier and by the internal link check.

## `_headers` does not apply to Pages Functions

- **What happened:** (preventive, v2) the beta endpoint is a Pages Function.
- **Why:** Cloudflare applies `public/_headers` to static assets only; Function responses get nothing from it.
- **What to do:** every Function sets its own security headers (`functions/api/beta.ts` has a `HEADERS` constant: `no-store`, a `default-src 'none'` CSP, `nosniff`, HSTS). `public/_routes.json` keeps Functions on `/api/*` only.

## `wrangler.toml` takes over the Pages bindings

- **What happened:** adding `wrangler.toml` with `pages_build_output_dir` for the D1 binding.
- **Why:** with that key, Pages treats the file as the source of truth for bindings and the compatibility date; the dashboard shows them read-only. A placeholder `database_id` makes the deploy fail.
- **What to do:** keep bindings in the file, secrets in the dashboard. Fill in the real `database_id` (and the project `name`) before a branch with this file deploys. Local dev works with the placeholder.

## Hiding the banner without a layout shift

- **What happened:** a dismissible banner above the header would push the page down on every load if a module script hid it after paint.
- **Why:** module scripts run after first paint, and other pages ship no script files at all.
- **What to do:** the inline theme script reads `aftertaste-beta-banner` from `localStorage` and adds `html.banner-off` before paint; CSS hides the banner. Any edit to `theme.js` needs `npm run csp:hash`. `test:beta` measures CLS after a dismissed reload (0).

## The timing field must not exist without JS

- **What happened:** the minimum-time check reads `elapsed_ms`. If the HTML sent it empty, every no-JS sign-up would count as "too fast" and be dropped silently.
- **What to do:** the hidden input is rendered `disabled` (disabled fields are not submitted) and the page script enables and fills it at submit. The script waits until 2.6 s have passed instead of sending early, so a quick human is never dropped. The server only checks the field when present.

## axe can catch a stamp mid-press inside `content-visibility`

- **What happened:** v2's audit flagged colour contrast on the COMING LATER stamp in dark at 1440 px only.
- **Why:** the stamp's press animation was caught part-way (partial opacity): Chrome pauses work in offscreen `content-visibility: auto` sections, and the audit scrolls fast.
- **What to do:** stamps that are labels rather than verdicts are static (no `press`). If a pressed stamp flags in the audit, check whether it is mid-animation before changing colours.

## Local `CF-Connecting-IP` is client-controlled

- **What happened:** `wrangler pages dev` accepts a `CF-Connecting-IP` header from the client.
- **Why:** there is no Cloudflare edge locally; in production Cloudflare sets the header and clients cannot override it.
- **What to do:** use it in tests to give each case its own network (as `test:beta` does). Never trust it as an identity locally.

## Prata has no ₹

- **What happened:** "A ₹40 cutting chai…" is a Prata headline; Prata and DM Mono lack U+20B9.
- **What to do:** wrap the ₹ in a span set in DM Sans (`.rupee` in `EveryMeal.astro`). Mono text already falls back to DM Sans via the font stack.

## Smaller gotchas

- **Scoped styles and child components:** a class passed to a child component needs `:global()` in the parent's scoped style.
- **`content-visibility` and full-page screenshots:** Chrome leaves offscreen `.defer-render` sections blank in full-page captures. `audit-screens.mjs` sets `content-visibility: visible` for them; do the same in ad hoc scripts.
- **TypeScript 6.0.3, not 7:** `@astrojs/check` and `typescript-eslint` do not support 7 yet.
- **Astro 7 markdown:** `markdown.remarkPlugins` is deprecated; the repo uses `markdown.processor: unified({...})` from `@astrojs/markdown-remark` (a direct dependency).
- **html-validate `valid-id` is relaxed:** Astro's heading slugs start with digits (`3-your-location`), valid in HTML5.
- **Dependency dates:** install with `npm install --before=<date 14 days ago>`; a plain `npm install` can pull a transitive version younger than 14 days.
- **Placeholder screenshot is light-only:** the phone shows the light theme in dark mode too.
- **Playwright and `javaScriptEnabled: false`:** `page.evaluate` (and axe injection) hangs in such a context. Test no-JS flows with clicks and visibility checks only, as `test:beta` does.
- **ESM ignores `NODE_PATH`:** an ad hoc script outside the repo cannot `import 'playwright-core'`; use `createRequire('<repo>/package.json')`.
- **`main` is already promoted:** at 2026-11-13 `origin/main` and `work-branch` pointed at the same commit (`7b20e7c`), so the project-state note "main does not exist yet" is stale.
