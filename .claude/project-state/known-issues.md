# Known issues and open items

- **Legal TODOs (from the app repo; synced @ `95d7fbb`):** privacy: effective date; Google content sentence (section 4); backup retention period (section 8); legal bases and rights wording (section 10); AI section (13, intentionally blank); how changes are announced (14). Terms: effective date; liability cap amount (section 9). Resolve in the app repo, then `npm run sync:legal`.
- **Hero screenshot is a placeholder** rendered from tokens (`src/assets/screenshots/home-placeholder.png`). The phone shows the light-theme screen in dark mode too.
- **Play badge:** hidden during the beta; returns in the hero when `site.playStoreUrl` is set, with Google's official badge artwork.
- **D1 not set up yet:** `wrangler.toml` has a placeholder `database_id` (and an assumed project `name`, `aftertaste-web`). A deploy with the placeholder fails; the owner must create the database first (docs/DEV-GUIDE.md "Beta list: Cloudflare setup").
- **Preview deploys share the production beta list** unless a preview database is configured.
- **No-JS sign-ups skip the minimum-time check** (by design; honeypot, rate limit and validation still apply).
- **Beta-list addendum on `/privacy` is site-authored**; fold it into the app repo's policy. Note also that the synced policy's intro says "for iOS and Android" while the site says Android only (app repo wording).
- **Diary entries are placeholders** (`src/config/diary.ts`, `sample: true`), labelled on the page.
- **`www.theaftertaste.app` → apex** needs a Cloudflare Bulk Redirect plus a proxied `www` DNS record (`_redirects` cannot match hostnames); steps in README "Domain".
- **`hello@theaftertaste.app` must receive mail** (e.g. Cloudflare Email Routing) before launch.
- **Legal contact resolved:** the app repo's legal drafts (commit `95d7fbb`) use `hello@theaftertaste.app`; synced, no old-domain rewrites needed.
- **`.well-known/assetlinks.json`** absent on purpose: needs the release signing certificate SHA-256 fingerprint.
- **Node 22.23.5** (2026-11-11, security release) can replace 22.23.4 once it is 14 days old (2026-11-25).
- **Sample content:** place names in the demos (Hill Road Momos, Banyan Tree Dhaba, Little Ladoo Bakery, Saffron & Salt, Mosaic Café, Hill Road Bakehouse, Clock Tower Tea Stall), the sample receipts, the diary placeholders and the taste-report numbers and friend names (Ronnie, Meera, Kabir) are invented examples; the demo says so.
- **Full-page screenshots** must set `content-visibility: visible` on `.defer-render` (the audit script does), or Chrome leaves offscreen sections blank in the capture. Real browsing is unaffected.
