# Known issues and open items

- **Legal TODOs (from the app repo; synced @ `95d7fbb`):** privacy: effective date; Google content sentence (section 4); backup retention period (section 8); legal bases and rights wording (section 10); AI section (13, intentionally blank); how changes are announced (14). Terms: effective date; liability cap amount (section 9). Resolve in the app repo, then `npm run sync:legal`.
- **Hero screenshot is a placeholder** rendered from tokens (`src/assets/screenshots/home-placeholder.png`). The phone shows the light-theme screen in dark mode too.
- **Play badge:** "Coming soon" plate until `site.playStoreUrl` is set and Google's official badge artwork is added.
- **`www.theaftertaste.app` → apex** needs a Cloudflare Bulk Redirect plus a proxied `www` DNS record (`_redirects` cannot match hostnames); steps in README "Domain".
- **`hello@theaftertaste.app` must receive mail** (e.g. Cloudflare Email Routing) before launch.
- **Legal contact resolved:** the app repo's legal drafts (commit `95d7fbb`) use `hello@theaftertaste.app`; synced, no old-domain rewrites needed.
- **`.well-known/assetlinks.json`** absent on purpose: needs the release signing certificate SHA-256 fingerprint.
- **Node 22.23.5** (2026-11-11, security release) can replace 22.23.4 once it is 14 days old (2026-11-25).
- **Sample content:** place names in the demos (Hill Road Momos, Banyan Tree Dhaba, Little Ladoo Bakery, Saffron & Salt, Mosaic Café, Hill Road Bakehouse) and friend names (Ronnie, Meera, Kabir) are invented examples; the demo says so.
- **Full-page screenshots** must set `content-visibility: visible` on `.defer-render` (the audit script does), or Chrome leaves offscreen sections blank in the capture. Real browsing is unaffected.
