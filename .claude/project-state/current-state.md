# Current state (2026-11-13)

- **Site:** static Astro site for https://theaftertaste.app (contact `hello@theaftertaste.app`), deployed by Cloudflare Pages from `main`, plus one Pages Function (`functions/api/beta.ts`) for the private-beta list in Cloudflare D1. Target launch 23 Nov 2026 (owner-stated). The app is in private beta: the site says "still cooking" and offers no download.
- **Branches:** `task/website-v1`, `task/website-docs` and `task/website-fixes-1` are merged into `work-branch`. `task/website-v2` (beta status, beta list, new sections) is local, awaiting "approved".
- **Docs:** `docs/` (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY, DEV-GUIDE) is the source of truth for rules and architecture; this folder keeps live status and decisions.
- **Gates:** `npm run gates` (12 gates) pass; `npm run test:beta` (28 end-to-end checks on a local D1) passes. Audits on v2: axe 0 violations (5 pages × 2 themes × 2 widths, plus the four form outcome states); Lighthouse 100 in every category on mobile and desktop (mobile LCP on `/` 1.81 s).
- **Legal:** synced from the app repo @ `95d7fbb` (2026-11-12): privacy 6 and terms 2 visible TODOs. `/privacy` also carries a site-authored beta-list addendum until the app's policy covers it.
- **Placeholders:** hero screenshot (rendered), diary entries (6 samples, no photos), D1 `database_id` and Pages project `name` in `wrangler.toml`, no `assetlinks.json`. The Play badge is hidden while `site.playStoreUrl` is null.
