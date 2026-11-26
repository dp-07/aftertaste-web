# App sync report, 2026-11-26

- App range: `57cb5cb` (last features sync) … `d6360ba` (app `work-branch`, checkout clean, = the sprint merge). 45 commits since `57cb5cb`; 23 since the 2026-11-24 check (`7f76e4b`).
- Website task branch: `task/sync-app-20261126`.
- Outcome: **partially synced.** AUTO and BUILD items applied; the AI taste report and the privacy policy stay STOP items (unchanged from 2026-11-24, with one new fact below).

## Summary

| Area                     | Drift                                                                                                                                                     | Class |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Tokens / SPEC            | SPEC still v1.12 (sprint additions + v1.11.1 backdrop). No colour, type or space token changed; `brand.json` identical                                    | AUTO  |
| Typography and fonts     | None (no font package change)                                                                                                                             | —     |
| Icons                    | None for the site (the app adds a custom sparkle for the taste report only)                                                                               | —     |
| Brand assets             | None (icon.png, favicon.svg, brand.json checksums identical to the ledger)                                                                                | —     |
| Tagline                  | "Your personal food memory" → "Taste you don't want to forget." (Login, About)                                                                            | BUILD |
| Today's pick             | Redesigned as a sheet over Home; always on (Profile switch and app-open pop-up removed); Another pick; Save removed; carousel swipeable                   | BUILD |
| Home add-place entry     | The "+ Add place" FAB is replaced by the mushroom menu ("Log a place", "Today's pick", "Your taste report"); Search's empty state lists Near you + manual | BUILD |
| Receipt                  | Place receipt: LOGGED stamp top-right beside the wordmark (−8°, smaller), footer "UNTIL THE NEXT BITE". Taste receipt has no stamp (taste report only)    | BUILD |
| Search speed / ordering  | Debounce, cache, nearest-first results. `places-search` changes are **not deployed** and nothing was run on a device                                      | none  |
| Profile layout           | Edit / sign-out icon buttons; Support and taste report cards at the bottom. The site never described these                                                | none  |
| AI taste report          | Now documented in the app as live on dev and prod and tested (`7429336`); site teaser still says "it isn't built yet"                                     | STOP  |
| Legal                    | `docs/legal/privacy-policy.md` last changed at `c4d9e81` (same as 2026-11-24); terms unchanged                                                            | STOP  |
| Support / payment config | None                                                                                                                                                      | —     |
| App metadata             | Tagline only (above). Name, platforms, status unchanged                                                                                                   | —     |

## 1. Tokens and SPEC (AUTO)

- `src/ui-v1/tokens.ts` sha256 `96ad7229…` → `4200f035…`. The diff is comments plus new constants (`LETTER_CHROMA_BOOST`, `LETTER_OPACITY_WEIGHT`) and `backdropLetterOpacity` values; none is mirrored by the site (the doodle originates on the site and keeps its own 0.08 / 0.14).
- Ledger correction: the stored web checksum for `src/styles/tokens.css` (`a8d039bb…`) did not match the file, which has not changed since 2026-11-17. The ledger now holds the file's real hash (`2bbe9044…`).

## 2. BUILD changes applied

### Tagline

- `src/config/site.ts`, so the hero, footer, `<title>` (lower-cased, trailing full stop dropped), OG alt text and JSON-LD follow. `public/site.webmanifest` description, `scripts/render-og.mjs` (home and default OG images re-rendered), PRD and CLAUDE.md updated. The site's apostrophe is typographic (’); the app's is straight.

### Section 04, Today's pick

- Replica `TodaysPickCard.astro` rebuilt to the v1.12 sheet: raised rounded sheet, grab handle, close button, rounded photo with TODAY'S PICK pill, rating chip and pill page indicator, Prata name, mono "Category • City", reason chip, Open place / Not today, Another pick. The printed card, stamp and paper pattern are gone, and the unused `PaperPattern` component was removed (the `--pattern-opacity` token stays for parity).
- Copy now says: tap the mushroom on Home; photos and the why; open it, say not today, or ask for another pick; same place all day; tries not to repeat a place for two weeks. Removed claims that are no longer true: "save it", "at most once a day", "off any time in Profile".
- Checked against `todaysPick.ts` (`REPEAT_WINDOW_DAYS` 14, "avoiding the repeat window where possible"), `todaysPickStore.ts` (always on, same pick per local date) and `TodaysPickSheet.tsx` / `TodaysPickCard.tsx`.
- No new signature motion; the replica is static.

### Section 05, Near you

- "Tap Add place…" → "Tap Log a place…" (the FAB is gone; Home's entry is the mushroom menu's "Log a place" tag). Near you remains in Add Place and is also in Search's empty state.

### Receipt (sections 08 and 09)

- `Receipt.astro`: stamp moved into the header row beside the wordmark and "TASTE DIARY" (in flow), left-aligned header, footer "UNTIL THE NEXT BITE" (was "THANKS FOR TASTING"). `Stamp.astro` logged variant now −8°, 12 px word, 2 px rule. `ReceiptFeature.astro` keyframes follow (−8°). Both receipts in "Every meal counts" pick this up.

### Not claimed on purpose

- Search speed and nearest-first ordering (server side not deployed, not run on a device), the mushroom menu's "Your taste report" tag, Profile header changes.

## 3. STOP items (not applied)

### AI taste report

- New since 2026-11-24: the app's `feature-status.md` now records the report as **live on dev and prod and tested on the app** (`7429336`), which resolves the status conflict of the last report. Reason 2 still applies: it is a data-use feature, and describing it (and removing "it isn't built yet") is a privacy claim that needs the human and the policy sync.
- Current site state: section 12 still says the report "isn't built yet" and that the privacy policy will explain it before it ships. That is now stale. Until the policy is synced it is the safer wording, but it should not stay long.
- Proposal (unchanged): a "More in Aftertaste" line ("An optional taste report, off until you turn it on"), the FAQ "Does Aftertaste use AI?" drawn only from the policy §8, and rewrite section 12 as available once the human approves. `taste-report` in `sync/feature-map.json` stays `parked` with a note.

### Privacy policy

- App policy unchanged since `c4d9e81` (new §8 AI taste report, Anthropic as a processor, effective date 23 December 2026, renumbering). Site still stamped `2d33417`.
- Proposal, after the human's review: `npm run sync:legal` verbatim; fix the two "Privacy policy, section 8" links in `src/pages/support.astro` (the section is now 9); decide how to show an effective date that is in the future; re-run `check:no-name` and links; update the ledger's legal checksums.

## 4. Verification

- `npm run gates`: all 13 pass (build, astro check, eslint, prettier, html-validate, links, seo, csp, js budget, contrast, payments links, no app code, no personal name).
- axe: 0 violations on `/`, `/privacy`, `/terms`, `/support`, `/coffee`, `/404`, light and dark, 375 and 1440 px; keyboard checks pass.
- Lighthouse (mobile / desktop): every page 100 / 100 / 100 / 100 except mobile `/` performance 99 (LCP 1.81 s, CLS 0, TBT 85 ms); all script targets met (LCP < 2.0 s, CLS < 0.05).
- `test:beta` not run: no beta-list change.
- Screenshots of the changed sections (#todays-pick, #receipt) at 320, 375, 768 and 1440 px, light and dark, self-reviewed: no horizontal overflow. The first pass found the receipt's LOGGED stamp overlapping the wordmark at 320 px; fixed by shrinking the wordmark with a container query (18 px minimum), as the app does, and re-checked.

## 5. Ledger

`last_checked` 2026-11-26; `last_synced` moved to `d6360ba` for tokens, features, app metadata; legal stays at `2d33417`. Feature map updated for `platforms-and-status`, `log-place`, `todays-pick`, `receipt`, `taste-report`.
