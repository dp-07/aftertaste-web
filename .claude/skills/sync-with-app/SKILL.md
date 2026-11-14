---
name: sync-with-app
description: Bring the Aftertaste website fully in line with the Aftertaste app — design tokens, typography, fonts, icons, brand assets, features (new, changed or removed, including new sections/pages), legal docs, support/payment config, platforms and status wording. Use for any app change, from a single colour to many new features: "sync the website with the app", "check website drift", after app releases or redesigns.
---

# Sync the website with the app

## Inputs
- APP_REPO from env APP_REPO_PATH (same as sync:legal). If unset, STOP and ask.
- The app repo is READ-ONLY: never write to it, switch its branch, stash or change its working tree.

## Guardrails (always)
1. Never copy app source code, config, secrets, env files or git history. Allowed: token VALUES, font files + licences, brand assets, legal markdown (via sync:legal), and config VALUES the website mirrors (UPI ID, BMC URL, store URLs, platform list, contact, domain).
2. Never touch `main`. Work on `task/sync-app-<YYYYMMDD>` from the latest origin/work-branch.
3. Obey docs/RULES.md and docs/DESIGN.md: strict CSP, no third parties, JS budget, no AI slop, the copy voice, the name rule (only "Paras D Prasad" on /privacy and /terms), the payments rule, "still cooking" status until launch.
4. Truthfulness: a feature is described as available ONLY if it's done AND merged in the app (feature-status.md + code on the app's work-branch). Every claim must be checkable against the app's code or docs. Never invent capabilities, numbers or testimonials.
5. Pre-authorised merge: you MAY merge into work-branch and push without asking when every change is in the AUTO or BUILD class and all verification passes. The human reviews the Cloudflare preview of work-branch and promotes to main.

## Change classes
- AUTO (mechanical): token values, fonts, brand assets, icons, legal sync, config values, platform/version strings, OG re-renders, CSP hashes.
- BUILD (autonomous, judged against DESIGN.md): copy updates; NEW sections or pages for new done-and-merged features; removing sections for removed features; reordering sections; nav/sitemap/FAQ/JSON-LD updates; following an app design-spec version change (new tokens/components mirrored in the site's own components).
- STOP (report with a proposal; do not apply): anything changing legal meaning, payments/tipping, privacy claims or data-use statements beyond a verbatim legal sync; personal names; presenting parked, in-progress or unreleased features (they may be described as "coming later" only if the human approves); a fundamental brand identity change (new name, logo or wordmark) — prepare a proposal branch but don't merge; conflicts with RULES.md; anything you can't verify.

## Step 1 — Preflight
- The website tree is clean; fetch; work-branch up to date. The app checkout is clean and on its work-branch (else STOP and ask the human — never change it).
- Read the ledger .claude/project-state/app-sync.json and sync/feature-map.json. App changes since the last sync: `git -C $APP_REPO log --oneline <last_synced>..HEAD` plus the app's changelog, feature-status and SPEC changelog.

## Step 2 — Assess (no changes yet)
Compare every area and record each difference with evidence:
1. Tokens and the SPEC version (respect documented website deviations, e.g. stricter contrast).
2. Typography and font files (checksums).
3. Icons (family + new icons the site would need).
4. Brand assets (checksums).
5. Features: build the current app feature list (name, status, one-line behaviour, source file/doc) and diff it against sync/feature-map.json → new, changed, renamed, removed, status-changed.
6. Legal source commit vs the site's stamp.
7. Support/payment/store config, contact, domain.
8. App metadata: name, tagline, version, platforms, launch status.
Write .claude/project-state/app-sync-report-<YYYYMMDD>.md with every item classified AUTO / BUILD / STOP. No drift → update the ledger's "last checked", commit, merge, push, report "in sync".

## Step 3 — Plan the website changes
- For BUILD feature changes, decide per feature, by importance (core flow > daily-use > occasional):
  - Important new feature → a full editorial spread on the landing page, following existing patterns (numbered section head, Prata headline, asymmetric spread, a token-built illustration or interactive mini-demo where it genuinely helps).
  - Several smaller features → a compact "More in Aftertaste" index section (one line each), so the page stays coherent; promote items to spreads later if they grow.
  - A feature that needs depth (settings, how-tos) → a short FAQ entry or a /support subsection; a new page only if the content can't fit, with nav/sitemap/OG updates.
  - Removed feature → remove its section/claims; renamed → rename everywhere.
- Keep the landing page's narrative order sensible (problem → how it works → features → privacy → FAQ → beta/support). Re-number sections.
- Illustrations: built only from the site's tokens and components (mock app UI, receipts, stamps, glyphs). No stock, no AI imagery, no real users' data. Real screenshots only if the human has provided them in src/assets.
- Motion: at most one new signature motion per sync, with a reduced-motion fallback; otherwise reuse existing motions.
- Large syncs: one commit per feature/area.

## Step 4 — Apply
AUTO items mechanically (sync:legal, OG re-render, csp:hash). BUILD items per the plan. Update sync/feature-map.json for every feature touched. STOP items: not applied — listed in the report with a proposed change (for brand identity changes, a proposal branch task/sync-proposal-<date>, pushed but NOT merged).

## Step 5 — Verify
npm run gates (all), test:beta, check:contrast, check:payments; Lighthouse 100 targets (mobile LCP on / < 2.0 s, CLS < 0.05) on every page incl. new ones; axe 0 violations; JS budget; screenshots of every changed page at 320, 375, 768, 1440 px in light and dark, self-reviewed against DESIGN.md (hierarchy, rhythm, no slop, no overflow). Fix what you broke. If a target can't be met, STOP (no merge).

## Step 6 — Merge and record
If pre-authorised: merge into work-branch with --no-ff, push both. Never main. Update the ledger (synced app commit per area, SPEC version, checksums, date, report file), sync/feature-map.json, docs/MEMORY.md (new gotchas), TASKS.md (STOP items), PRD.md if pages/sections changed.

## Step 7 — Report
In sync / synced / partially synced (STOP items). Per item: class and what was done; new/removed sections and pages; gate, Lighthouse and axe results; STOP items with proposals and any proposal branch; commits; "Review the Cloudflare preview of work-branch, then promote to main via a PR."
