# App sync report, 2026-11-24

- App range: `57cb5cb` (last synced) … `7f76e4b` (app work-branch = origin/work-branch, checkout clean). 22 commits, 86 files.
- Website task branch: `task/sync-app-20261124`.
- Outcome: **partially synced.** One AUTO item applied (ledger/token checksum). Two STOP items need a human decision; nothing user-visible on the site changed.

## Summary

| Area                     | Drift                                                                                                         | Class |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | ----- |
| Tokens / SPEC            | SPEC v1.10 → v1.12; additive tokens `doodleOpacity`, `backdropLetterOpacity`; no colour/type/space change     | AUTO  |
| Typography and fonts     | None                                                                                                          | —     |
| Icons                    | None                                                                                                          | —     |
| Brand assets             | None (icon.png, favicon.svg, brand.json checksums identical to the ledger)                                    | —     |
| Features                 | AI taste report (new)                                                                                         | STOP  |
| Legal                    | Privacy policy changed (new §8 AI section, Anthropic processor, effective date, renumbering); terms unchanged | STOP  |
| Support / payment config | None                                                                                                          | —     |
| App metadata             | None (`app.config.js`, `src/config` unchanged)                                                                | —     |

## 1. Tokens and SPEC (AUTO)

- `src/ui-v1/tokens.ts` sha256 `026b84d0…` → `96ad7229…` (full value in the ledger). `brand.json` unchanged (`40310c81…`).
- v1.11 (doodle backdrop + tinted letters): ported **from** the website's `doodle-tile.svg` into the app. Light opacity equals the site's `--doodle-ink` (0.08); dark is 0.11, a documented app-side choice softer than the site's 0.14. Nothing to change on the site, and the site's own value stays as is.
- v1.12 (additive): `DeltaStat`, `BarChart`, `LineChart`, `ShareBars`, `TasteDial`, `Skeleton.Block` for the taste report. App-internal components; the site mirrors none of them.
- Applied: ledger checksum and SPEC version only.

## 2. Features

### AI taste report — STOP

What the app has (on `work-branch`, read from code and docs): optional, off-by-default report; Profile card, consent screen, report screen with charts, dials, cards and a shareable taste receipt; weekly refresh; Claude Haiku 5.5 writes only the words around numbers that app code computes; export includes the report.

Why it is not applied:

1. **Status cannot be verified.** The app's `feature-status.md` still reads "awaiting approved … migration NOT applied, function NOT deployed … not run on a device". The app's `CLAUDE.md` changelog says production was deployed on 2026-11-24 and the policy applies from 25 November. These disagree, and the guardrail says a feature is available only if it is done and merged and the claim is checkable.
2. **It is a data-use feature.** Describing it makes privacy claims (what is sent to an AI provider, retention), which this skill never writes beyond a verbatim legal sync.

Proposal, once the human confirms the report is released to testers:

- Landing page: a compact line in the "More in Aftertaste" index ("An optional monthly taste report, off until you turn it on"), not a full spread, until it has shipped on a device.
- FAQ: "Does Aftertaste use AI?" Answer drawn only from the policy's §8: off by default; app code computes the numbers; the AI only writes the lines around them; what is and is not sent.
- `sync/feature-map.json`: add a `taste-report` entry (status `merged`) with the sources above.

### Everything else in the range

No other user-facing feature changed. The doodle backdrop is design-only and originates on the site. The commit that removed `test_files/` brand images is app housekeeping with no website effect.

## 3. Legal — STOP

- App `docs/legal/privacy-policy.md` last changed at `c4d9e81` (site is stamped to `2d33417`). Terms unchanged since `04039aa`.
- Changes: effective date `23 November 2026` → `23 December 2026`; a note that §8 applies from 25 November 2026; new §8 "AI taste report (optional)" (`#ai-taste-report`); Anthropic added as a service provider; deletion/export/international-processing/rights text extended; later sections renumbered (§8 → §9 and so on).
- Why STOP: it changes data-use statements and names a new processor. The app's own `feature-status.md` also says the section "needs the human's review before the website syncs".
- The site's policy is therefore **behind the app's behaviour**. Same condition as the 2026-11-17 report, now with the AI section.

Proposal, after the human's review:

1. Run `npm run sync:legal` verbatim (an AUTO step once approved).
2. Fix the two "Privacy policy, section 8" links in `src/pages/support.astro` (lines 77 and 141). The target `#delete-your-data` anchor is preserved, but the section is now **9**.
3. Decide how the site presents the effective date: the policy says 23 December 2026 while §8 applies from 25 November 2026, so the site would show a future date.
4. Check `check:no-name` and links gates, then update the ledger's legal checksums.

## 4. Verification

No site files changed other than the ledger and this report, so the build gates were not re-run. Lighthouse, axe and screenshots do not apply: no page changed.

## 5. Ledger

`last_checked` 2026-11-24; tokens area and SPEC version updated; `last_synced`, features and legal areas intentionally left at their previous commits because they are not synced.
