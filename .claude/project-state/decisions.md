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
- **The temporary `/privacy` addendum is removed**: the app repo's policy now has section 13 "Website beta list"; the consent link points at `#beta-list`.

## 2026-11-14 — Console SQL moved out of Wrangler's way

- `migrations/console/0001_beta_list.sql` (was `migrations/0001_beta_list.console.sql`): Wrangler applies every `.sql` directly in `migrations/`, not subfolders, so the console copy is no longer listed as a migration.

## 2026-11-14 — Legal re-sync @ ad07126

- The app repo's section 13 now has the explicit id `{#beta-list}` and the rate-limiting sentence; the site re-synced and the consent link uses `/privacy#beta-list` (no longer the numbered slug).

## 2026-11-14 — Legal re-sync @ 2d33417

- Section 13 timing wording softened in the app repo (the code changes every hour and old codes are deleted automatically), matching the function, which clears finished hours on the next request. Site re-synced; `#beta-list` still resolves.

## 2026-11-14 — Coffee page (`/coffee`)

- **Buy Me a Coffee and UPI on one page,** out of the nav, in the sitemap. Linked from the landing page (after the FAQ) and the footer, never from `/privacy`, `/terms`, `/support` (Play payment policy; enforced by `check:payments`).
- **UPI link has no `pn` and no amount.** Only the ID value comes from the app repo.
- **QR generated at build** with `qrcode-generator@2.0.4` (devDependency, published 2025-08-07, zero dependencies, installed with `--before=2026-10-31`).
- **Second inline-script hash** for the Copy button; `csp:hash` rewrites both hashes.
- **Colours:** the QR card uses the literals `#fff` and `#16130f` in both themes (must stay scannable); no other new colours.

## 2026-11-14 — Tokens aligned to App UI v1.9

- Adopted the app's v1.9 values for roles the site shares: `--muted` (light), `--faint` (both), `--primary-ink` (dark), `--primary-pressed` (dark), `--danger` (dark). `--herb-ink` and `--stamp-paper` already matched.
- Kept stricter: `--btn-bg` dark #A8361F (app `primaryFill` #C2412D in dark). No new colours were introduced.

## 2026-11-17 — App sync: suggestions batch 1 (app @ 57cb5cb, App UI v1.10)

- **Two new spreads:** 04 Today’s pick (a token-built replica of the app’s card) and 07 Gallery (On this day strip, month section, mosaic). Smaller features go into a new **10 More in Aftertaste** index (menu and booking, Tried, search a place or a craving). Sections re-numbered 01–15.
- **Booking privacy stated wherever booking appears** (index line and a new FAQ), per the human’s instruction; checked against the app’s owner-only table and storage policies. Menu-photo visibility is not mentioned until the privacy policy covers it.
- **Paper pattern adopted only inside the Today’s pick card**, not page-wide: the editorial frame stays flat oat with hairlines, and LCP/CLS are untouched. New token `--pattern-opacity: 0.1` (the app’s `balanced` preset); no new colours.
- **New stamp variant** `todaysPick` (TODAY’S PICK), as in the app’s v1.10.
- **Web deviation:** the Gallery replica puts “1 year ago” under each photo, not on the scrim (cream on the scrim is below AA).
- **Legal held back (STOP):** the policy does not yet cover menu photos, booking details or the fuller export; proposals in `app-sync-report-20261117.md`.

## 2026-11-17 — /coffee tweaks and a page-wide doodle background

- **UPI ID hidden, copy-only.** `/coffee` shows a "Copy UPI ID" button instead of the ID; the value lives in a `data-upi-id` attribute and `coffee-copy.js` reads it (CSP hash re-generated). The ID is still in the `upi://` link and the QR, as before.
- **QR behind a toggle.** A native `<details>` styled as a secondary button, so it works without JS and needs no new script.
- **Page-wide doodle layer (owner request), a deliberate exception to "no page-wide pattern".** `body::before` masks `src/assets/doodle-tile.svg` in `--muted` at `--doodle-opacity` 0.14 (new tokens `--doodle-opacity`, `--doodle-size`; no new colour). 0.14 is the highest opacity at which `text`, `muted` and `primary-ink` pass AA on the composite; 0.16 failed, so `check:contrast` now carries three `bgDoodle` pairs. "Web themed" was read as themed to the Aftertaste food diary, not generic web or tech art; the tile reuses the brand cap and adds simple food and diary line art.
- **Footer sentence:** "Buy Me a Coffee" is now an external ink link (`rel="noopener"`, opens in a new tab), the same plain-link treatment as the main button.

## 2026-11-17 — Quieter doodle in light mode, sticky header

- **Doodle ink is per theme** (`--doodle-ink` via `light-dark(color-mix(...))`, replacing `--doodle-opacity`): 8% `--muted` in light, 14% in dark. At 14% the light version distracted from small text; dark was right. `check:contrast` carries per-theme composites.
- **The site header is sticky** (`position: sticky`, opaque `--bg`, hairline below, fixed height `--header-h` 3.75rem (60 px, tightened from 4.75rem; wordmark 32 px), z-index 50 under the skip link). The beta banner above it still scrolls away. In-page sticky blocks (legal and support contents, landing "Privacy" and "Every meal" copy, the receipt section) and `scroll-padding-top` are offset by `--header-h`.

## 2026-11-17 — Header styling

- **Cream paper strip with a double ledger rule.** `SiteHeader` uses `--surface` (not `--bg`) and a `3px double --line-strong` bottom border, echoing the app's cards. Hover and current-page links get a `--primary-soft` pill (`--text` on it is already a gated pair); the current page also gets a small `--primary` dot instead of the underline.
- **"Join the beta" pill in the header** (`--btn-bg`, links to `site.betaAnchor`), shown only when the header is at least 52rem wide so it never crowds the wordmark, links and theme toggle. Narrow screens keep the beta banner's link. No new colours.

## 2026-11-17 — Shorter landing copy with light slang

- **Owner asked for less text and a Gen Z / Gen Alpha flavour.** The hero blurb and the body text under every landing section heading (02-14, plus Save your seat) were cut to one short lead and one short line each, with a few slang touches ("Lowkey tragic", "Free recs, basically", "Come with receipts", "Main character energy", "nothing sus"). Headings, FAQ answers, the form's consent and error text, and the app-feature names are unchanged. Privacy promises were shortened without changing what they claim (each still matches its policy section). Recorded as a voice rule in RULES "Copy".

## 2026-11-17 — The hero screenshot follows the site theme

- **Two screenshots, one frame.** `PhoneFrame` takes `src` (light) and `srcDark`. System theme: one `<picture>` whose dark `<source>` carries `media="(prefers-color-scheme: dark)"`, so only the matching image is fetched and it keeps the hero's high priority. A manual toggle against the system theme swaps in a lazy second `<picture>` with CSS (`:root[data-theme]` inside a `prefers-color-scheme` query), downloaded only if shown. No JS added, so the CSP hashes and JS budget are untouched.
- **`npm run placeholders` renders both** from the app's light and dark tokens and the brand's light and `-dark` glyph colours. Real screenshots replace both files (README "Screenshots").

## 2026-11-17 — More doodles

- **Doodle tile grows to 520 px** (`--doodle-size` clamp(340px, 42vw, 520px), so each doodle keeps its on-screen size) and holds 22 objects instead of 14: added burger, churros, takeaway noodle box, momo, chai glass, cinnamon roll (the brand's "e"), verdict stamp, bookmark, camera, dice and a dashed route. Food from the site's own sample copy and the app's own motifs; no lettering, one ink. Density stays close to before so light mode does not get louder.

## 2026-11-17 — Back-to-top button

- **A fixed bottom-right button on every page**, shown after scrolling about 60% of a screen. The button is the brand seal (the owner chose it over a paprika disc with an up-pointing mushroom) bare (no background disc or shadow), with a "Back to top" label on hover and focus; it sits inset from the corner (gutter from the right, 2.5 rem from the bottom). No new colours: `--text`, `--bg` (label).
- **Small inline script, hashed.** `src/scripts/to-top.js` joins the theme and /coffee scripts in `public/_headers` (`npm run csp:hash` hashes all three). No script file ships, so the no-JS budget for legal, support and 404 is unchanged. Without JS the button stays hidden.

## 2026-11-27 — Web revamp: short home, feature pages, interactive replicas

Owner feedback: one very long page, crammed, too many words, not intuitive. Branch `task/web-revamp-20261127`; recon in `web-revamp-recon-20261127.md`.

- **Information architecture.** Home = hero (status line, wordmark + tagline as the one h1, one line, call to action, the sealed mushroom) → "Three small habits" (#how-it-works) → feature teaser row (#features) → one privacy line (#privacy) → the beta form (#join). Feature pages, each with one h1 and two to four short blocks: `/log` (search or type in a place, Near you, rate a dish, Gallery), `/today` (Today's pick, Pick for me, Want to try, From friends: the ways the app helps you choose), `/receipt` (the receipt, every meal counts), `/taste-report` (replica, how it is made, the four data blocks from policy §8). The FAQ moves to `/support#questions`. One list, `src/config/features.ts`, drives the header menu, teasers, hero tags, footer of each page ("Next up") and old-anchor moves.
- **Cut or merged.** Cut: "Sound familiar?" opener (the hero line carries the problem), "From the diary" strip and `src/config/diary.ts` (placeholder photos; site-only editorial), "More in Aftertaste" index (Menu and booking, Tried, Search a craving: smaller features; Tried survives in the Want to try line), the coffee note on home (the footer keeps /coffee), the hero phone frame with the placeholder screenshot (`PhoneFrame` kept for real screenshots), numbered running heads on home. Merged: Want to try, What should we eat? and From friends into `/today`; Near you and Gallery into `/log`; Every meal counts into `/receipt` (one chai receipt instead of two); the six home privacy promises into one line plus the policy link.
- **Header.** Wordmark, a Features menu (four rows with one line each), Privacy, the beta pill and the theme toggle; on narrow screens a single Menu sheet (features, Privacy, Support, the beta button, the theme toggle). Both are native `<details>`; one-open-at-a-time, Escape, outside click and close-on-link live in the inline theme script so legal, support and 404 pages still ship no script files. Cream strip and double ledger rule kept.
- **Old anchors.** Fragments never reach the server, so `src/scripts/moved-anchors.ts` on the home page maps `#todays-pick`, `#want-to-try`, `#what-should-we-eat`, `#from-friends`, `#near-you`, `#gallery`, `#receipt`, `#every-meal`, `#more`, `#taste-report`, `#questions` to their new pages (`location.replace`); `#how-it-works`, `#privacy` and `#join` stay on home; `#sound-familiar` and `#from-the-diary` land on home. Without JS a visitor stays on home, which links everywhere. `_redirects` gains trailing-slash rules for the new pages and `/todays-pick`, `/receipts`, `/faq`.
- **Interactions (one each, no new dependency, all CSS or small vanilla modules).** Hero seal: hover (mouse, on the seal) or tap lifts the lid −16° and three stamp tags fan out (−2°, +3°, −4°, staggered) linking to Log a place, Today's pick, The receipt; Escape closes; without JS the lid is open and the tags are links; reduced motion keeps the lid shut and fades the tags. The taste report is not a hero tag, so the hero never shows the app menu's "Your taste report" tag (instruction 2026-11-26). Today's pick: photos are a scroll-snap track (swipe, arrow keys), "Another pick" cycles three sample places with an opacity fade and a polite announcement; without JS the first place shows and the button is hidden. Receipt: prints in the brand's four steps when a third is in view, the LOGGED stamp lands, then a 3 px thud; the hidden state is gated on `html.js` (set before first paint) so nothing flashes; reduced motion or no JS = printed and stamped. Taste report: numbers count up once (900 ms, ease-out) when half in view; final values are in the markup, numbers are aria-hidden and each tile has one sentence for screen readers. Scroll reveal: `.reveal`, CSS scroll-driven, a 1.5 rem rise only (never a fade, so an element resting half in view keeps full contrast). No custom cursor (an accessibility and taste risk for little gain).
- **Tagline and status unchanged.** "Taste you don't want to forget." exactly; "Private beta · Android and iOS · still cooking"; no download implied.
- **/today wording (owner, at approval):** "Open Today’s pick in the app" instead of "Tap the mushroom on Home" until production-direct ships the mushroom menu (TASKS).

## 2026-11-28 — `/coffee` becomes `/patron`

- **Owner request.** The tip page's route is `/patron` (`src/pages/patron.astro`); content, title and the footer's "Buy us a coffee" label are unchanged. `/coffee` and `/coffee/` 301 to `/patron` in `_redirects`, so shared links keep working. The payments rule is unchanged: `/patron` (and the old `/coffee`) is never linked from `/privacy`, `/terms` or `/support`; `check:payments` forbids both paths there.
- **App repo (not touched):** its source never links to the page; its `check:store-links` guard looks for "/coffee" and should also look for "/patron" (a change for the app repo).
- Dated history (sync reports, older decisions) keeps the old path.

## 2026-11-28 — `/patron` redesigned: three option cards, Bondin as a link (`task/web-patron-20261128`)

- **Route.** `/patron` (renamed from `/coffee`, 301 kept for `/coffee` and `/coffee/`; the released app links to `/coffee`). No internal link to `/coffee` remains in `src/`; only the redirect, the `check:payments` guard and dated history mention it.
- **Layout.** Headline plus one lede line, then three equal cards, each with a one-line "best for". "What your coffee does" list removed (it was unverified copy about where money goes). A THANK YOU stamp (`Stamp` variant `thanks`) presses after any tap; hidden without JS, no animation under reduced motion.
- **Bondin and Buy Me a Coffee: links first, checkouts on tap (owner request, same day; first built as link-only).** The owner asked for the providers' widgets. Chosen: tap-to-load, nothing third-party on page load. Bondin: `bondin.io/embed/v1.js` is injected on the first tap and `bondin-support.open()` is called from our button. Buy Me a Coffee: its `widget.prod.min.js` is **not** used (waits for DOMContentLoaded, draws a floating bubble, writes a `visited` cookie, needs inline styles); its widget page `https://buymeacoffee.com/widget/page/parasdp` (apex; `www` 301s) opens in our own `<dialog>`. Links remain the no-JS and failure fallback (script error → navigate to the link).
- **CSP/Permissions-Policy, `/patron` only.** `public/_headers` has a `/patron` block: `! Content-Security-Policy`, `! Permissions-Policy`, then a policy with `script-src … https://bondin.io`, `frame-src https://bondin.io https://buymeacoffee.com` and `payment=(self "https://bondin.io" "https://buymeacoffee.com")`. `style-src`/`connect-src` unchanged (no `unsafe-inline`; both widgets style through the CSSOM, except Bondin's hidden element's shadow `<style>`, a harmless console CSP error after the tap). `check:csp` validates both policies and the host allowlist; `serve-dist.mjs` now models Cloudflare's join/detach semantics; `update-csp-hash.mjs` updates every policy. **Unverified on Cloudflare itself:** that `!`-detach followed by a new header in the same block yields one CSP; check the preview deploy (`curl -sI`). If it does not, the browser applies the stricter intersection and the checkouts fail to open (they fall back to the plain links).
- **Known costs.** After a tap, each provider's page runs its own scripts and cookies (Buy Me a Coffee's checkout loads Stripe, Google Tag Manager and a cookie banner; Bondin's loads its own app). Neither script has SRI (Bondin's `v1.js` is unversioned). Both checkouts show the owner's name ("Support Paras" / "Paras D Prasad"), which the site itself otherwise never publishes. The privacy policy (app repo) does not mention these embeds; flagged for the human.
- **UPI link unchanged.** Same `upiUrl()` for the deep link and the QR (one source). The brief asked for the payee name in the link; it was not added, because `check:payments` and the no-personal-name rule forbid `pn=` (the UPI app shows the bank-verified name).
- **Privacy policy.** Section 5 names "Buy Me a Coffee and UPI" for the app's Support screen and does not name Bondin; terms section 7 says other versions may use "external services under their own terms". A plain outbound link on the website needs no policy change, so none was made. If the app's Support screen later adds Bondin, the app repo's policy should name it.
- **Not carried over.** `task/patron-route` also hand-edited the synced `src/content/legal/privacy.md` ("Who is responsible" line); that edit is not in this branch (legal text changes only in the app repo, then `npm run sync:legal`). Flagged for the human.
- **Script renamed** `src/scripts/coffee-copy.js` → `patron.js` (copy button plus stamp); CSP hash updated.

- **Card order and label (owner, later 2026-11-28).** Order is Bondin, Buy Me a Coffee, UPI (UPI last). The Buy Me a Coffee button reads "Buy Me a Coffee" (no "Support with"); Bondin's reads "Support with Bondin".

- **QR behind a toggle (owner, 2026-11-28).** On desktop and tablets the UPI QR opens from a "Show QR code" button (176 px, so it still scans), keeping all three cards the same height. `html.js` gates it: no JS means no toggle and a visible QR. The deep link and QR still come from `upiUrl()`.
