# Known issues and open items

- **Legal TODOs (from the app repo):** privacy: effective date; Google content sentence (section 4); backup retention period (section 8); legal bases and rights wording (section 10); AI section (13, intentionally blank); how changes are announced (14). Terms: effective date; liability cap amount (section 9). Resolve in the app repo, then `npm run sync:legal`.
- **Hero screenshot is a placeholder** rendered from tokens (`src/assets/screenshots/home-placeholder.png`). The phone shows the light-theme screen in dark mode too.
- **Play badge:** "Coming soon" plate until `site.playStoreUrl` is set and Google's official badge artwork is added.
- **`www.theaftertaste.app` → apex** needs a Cloudflare Bulk Redirect plus a proxied `www` DNS record (`_redirects` cannot match hostnames); steps in README "Domain".
- **`hello@theaftertaste.app` must receive mail** (e.g. Cloudflare Email Routing) before launch.
- **App repo still uses the old domain and contact**: `docs/legal/terms.md` links to the old `.in` domain (rewritten on sync; `siteLinksRewritten: 1`), and the privacy policy and terms name `w17.paras@gmail.com` as the contact (not rewritten: it is policy wording). The app's store listing draft and `src/config/legal.ts` URLs should move to `https://theaftertaste.app` too. Update in the app repo, then `npm run sync:legal`.
- **`.well-known/assetlinks.json`** absent on purpose: needs the release signing certificate SHA-256 fingerprint.
- **Node 22.23.5** (2026-11-11, security release) can replace 22.23.4 once it is 14 days old (2026-11-25).
- **Sample content:** place names in the demos (Hill Road Momos, Banyan Tree Dhaba, Little Ladoo Bakery, Saffron & Salt, Mosaic Café, Hill Road Bakehouse) and friend names (Ronnie, Meera, Kabir) are invented examples; the demo says so.
- **Full-page screenshots** must set `content-visibility: visible` on `.defer-render` (the audit script does), or Chrome leaves offscreen sections blank in the capture. Real browsing is unaffected.
