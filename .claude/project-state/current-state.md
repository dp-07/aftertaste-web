# Current state (2026-11-12)

- **Site:** static Astro site for https://theaftertaste.app (contact `hello@theaftertaste.app`), deployed by Cloudflare Pages from `main`. `main` does not exist yet: the human creates it from `work-branch` when promoting (the repo started empty; the root commit is on `work-branch`).
- **Branches:** `work-branch` (root commit only, local), `task/website-v1` (website v1 complete through phase 7, local commits, not pushed, awaiting "approved").
- **Gates:** `npm run gates` (11 gates; see CLAUDE.md). All pass. Audits: axe 0 violations; Lighthouse 100 in every category on mobile and desktop (404 SEO excluded: noindex).
- **Legal:** synced from the app repo @ `95d7fbb` (2026-11-12): privacy 6 and terms 2 visible TODOs; contact `hello@theaftertaste.app`. Draft banner shows until resolved.
- **Placeholders:** hero screenshot (rendered), Play badge ("Coming soon", `site.playStoreUrl` = null), no `assetlinks.json`.
