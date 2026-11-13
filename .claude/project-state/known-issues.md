# Known issues and open items

- **Legal:** synced @ `04039aa`, 0 TODOs.
- **Hero screenshot is a placeholder** rendered from tokens (`src/assets/screenshots/home-placeholder.png`). The phone shows the light-theme screen in dark mode too.
- **Store badges:** hidden during the beta; each returns in the hero when `site.playStoreUrl` / `site.appStoreUrl` is set, with the store's official artwork.
- **Both D1 databases need the tables**: confirm `aftertaste-beta-preview` was set up in its Console as well as production.
- **No-JS sign-ups skip the minimum-time check** (by design; honeypot, rate limit and validation still apply).
- **Privacy section 13** (beta list) does not mention the keyed, hourly hash of the network address used for rate limiting; the consent link depends on the section's numbered anchor (`#13-website-beta-list`).
- **Diary entries are placeholders** (`src/config/diary.ts`, `sample: true`), labelled on the page.
- **`www.theaftertaste.app` → apex** needs a Cloudflare Bulk Redirect plus a proxied `www` DNS record (`_redirects` cannot match hostnames); steps in README "Domain".
- **`hello@theaftertaste.app` must receive mail** (e.g. Cloudflare Email Routing) before launch.
- **Legal contact resolved:** the app repo's legal drafts (commit `95d7fbb`) use `hello@theaftertaste.app`; synced, no old-domain rewrites needed.
- **`.well-known/assetlinks.json`** absent on purpose: needs the release signing certificate SHA-256 fingerprint.
- **Node 22.23.5** (2026-11-11, security release) can replace 22.23.4 once it is 14 days old (2026-11-25).
- **Sample content:** place names in the demos (Hill Road Momos, Banyan Tree Dhaba, Little Ladoo Bakery, Saffron & Salt, Mosaic Café, Hill Road Bakehouse, Clock Tower Tea Stall), the sample receipts, the diary placeholders and the taste-report numbers and friend names (Ronnie, Meera, Kabir) are invented examples; the demo says so.
- **Full-page screenshots** must set `content-visibility: visible` on `.defer-render` (the audit script does), or Chrome leaves offscreen sections blank in the capture. Real browsing is unaffected.
