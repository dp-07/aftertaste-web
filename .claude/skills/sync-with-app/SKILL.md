---
name: sync-with-app
description: Assess whether the Aftertaste website is in sync with the Aftertaste app (design tokens, typography, fonts, icons, brand assets, features, legal docs, support/payment config, platform and status wording) and update the website safely if it isn't. Use when asked to "sync the website with the app", "check website drift", or after app releases, theme/typography/icon changes, new features, or legal updates.
---

# Sync the website with the app

## Inputs
- APP_REPO: the app repo path — read from the env var APP_REPO_PATH (the same one sync:legal uses). If unset, STOP and ask.
- The app repo is READ-ONLY. Never write to it, switch its branch, stash, or change its working tree.

## Guardrails (always)
1. Never copy app source code, config, secrets, env files or git history. Allowed from the app: token VALUES, font files + licences, brand assets (SVG/PNG), legal markdown (via sync:legal), and individual config VALUES the website already mirrors (UPI ID, BMC URL, store URLs, platform list).
2. Never touch `main`. Work on `task/sync-app-<YYYYMMDD>` from the latest origin/work-branch.
3. Follow docs/RULES.md and docs/DESIGN.md: strict CSP, no third parties, JS budget, no AI slop, copy voice, the personal-name rule (only "Paras D Prasad" on /privacy and /terms), the payments rule (no /coffee, buymeacoffee.com or upi:// on /privacy, /terms, /support; no pn= in UPI links), "still cooking" status until launch.
4. Never present a feature as available unless the app marks it done AND merged (feature-status.md + the code on the app's work-branch). Parked or in-progress features may only appear as "coming later", and only with human approval.
5. Pre-authorised merge: you MAY merge into work-branch and push without asking ONLY if (a) every change is in the AUTO or CAREFUL class below and (b) all gates, Lighthouse and axe targets pass. Otherwise STOP and report.

## Step 1 — Preflight
- The website working tree is clean; `git fetch --all --prune`; work-branch is up to date. The app repo checkout is clean and on its work-branch (if not, STOP and ask the human to check it out — do not change it yourself).
- Read .claude/project-state/app-sync.json (the ledger). Note the app commit range since the last sync: `git -C $APP_REPO log --oneline <last_synced>..HEAD`.

## Step 2 — Assess (no changes yet)
Compare, area by area, and record each difference with evidence (file, old value, new value):
1. Tokens: app src/ui-v1/tokens.ts (+ design/app-ui-v1/SPEC.md version and changelog) vs src/styles/tokens.css — colours (light/dark), type roles, spacing, radius, motion. Respect documented website deviations (e.g. stricter contrast) — don't revert them.
2. Typography and fonts: font families, weights and files (checksums) vs the website's self-hosted woff2 subsets + licences.
3. Icons: the app's icon family and any new icons used in features the site shows.
4. Brand assets: design/aftertaste-v1/ (wordmark, glyphs, seal, stamps, receipt, app icon, loader) checksums vs the website's copies; the app icon/favicon set.
5. Features: the app's .claude/project-state/feature-status.md, current-state.md and recent changelog vs the website's sections and FAQ — features added, renamed, removed or changed in behaviour; platform list; status (beta / launched).
6. Legal: the app's docs/legal/* last commit vs the website's synced source stamp.
7. Support and payments config: UPI ID, BMC URL, store URLs (Play/App Store), contact email, domain.
8. App metadata: app name, tagline, version, platforms.
Write the drift report to .claude/project-state/app-sync-report-<YYYYMMDD>.md with each item classified:
- AUTO (safe, mechanical): token values, font files, brand asset files, legal sync, config values, platform wording, version strings.
- CAREFUL (judgement, within existing structure): updating copy in EXISTING sections/FAQ for features that are done and merged; removing claims about features the app removed; renaming features.
- STOP (needs the human): new pages or sections, layout/design-direction changes, anything about parked or unreleased features, any change involving names, payments, privacy claims or legal meaning, any conflict with RULES.md, anything you're unsure about.
If there is no drift: update the ledger's "last checked" fields only, commit, merge and push (pre-authorised), and report "in sync".

## Step 3 — Apply
- Apply AUTO items mechanically; run npm run sync:legal for legal drift; re-render OG images if text/brand changed; regenerate CSP hashes if inline scripts changed (npm run csp:hash).
- Apply CAREFUL items conservatively: smallest copy change that keeps the site accurate, in the existing voice; never invent capabilities; check every claim against the app's code/docs.
- Do NOT apply STOP items: list them with a proposed change.

## Step 4 — Verify
- npm run gates (all), npm run test:beta, check:contrast, check:payments, Lighthouse (100 targets; mobile LCP on / < 2.0 s; CLS < 0.05), axe (0 violations), screenshots of changed pages at 375 and 1440 px in light and dark — review them against DESIGN.md.
- Fix regressions you introduced. If a target can't be met, STOP (no merge).

## Step 5 — Merge and record
- If pre-authorised (Guardrail 5): merge the task branch into work-branch with --no-ff, push both. Never touch main.
- Update .claude/project-state/app-sync.json: the synced app commit per area, the SPEC version, checksums, date, and the report filename. Update docs/MEMORY.md with any new gotcha, and TASKS.md with STOP items.

## Step 6 — Report
Summary: in sync / synced / stopped; each drift item with its class and what was done; gate, Lighthouse and axe results; STOP items with proposals; commits; "Promote work-branch → main when you're happy (PR on GitHub)".
