# Current state (2026-11-13)

- **Site:** static Astro site for https://theaftertaste.app (contact `hello@theaftertaste.app`), deployed by Cloudflare Pages from `main`. Target launch 23 Nov 2026 (owner-stated). At 2026-11-13 `origin/main` and `origin/work-branch` both pointed at `7b20e7c` (v1 merged). Whether the Cloudflare project is connected is not verifiable from this repo: see the launch checklist in `docs/TASKS.md`.
- **Branches:** `task/website-v1` is merged. `task/website-docs` (this docs task) is local, awaiting "approved".
- **Docs:** `docs/` (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY, DEV-GUIDE) is the source of truth for rules and architecture; this folder keeps live status and decisions.
- **Gates:** `npm run gates` (12 gates; see docs/DEV-GUIDE.md). All pass. Audits: axe 0 violations; Lighthouse 100 in every category on mobile and desktop (404 SEO excluded: noindex).
- **Legal:** synced from the app repo @ `95d7fbb` (2026-11-12): privacy 6 and terms 2 visible TODOs; contact `hello@theaftertaste.app`. Draft banner shows until resolved.
- **Placeholders:** hero screenshot (rendered), Play badge ("Coming soon", `site.playStoreUrl` = null), no `assetlinks.json`.
