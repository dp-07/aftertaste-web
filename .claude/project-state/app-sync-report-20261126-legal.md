# Legal and taste report sync, 2026-11-26 (human-approved, NOT merged)

Branch `task/sync-legal-taste-report-20261126`, off `work-branch`. Not merged because of the effective-date conflict below.

## Effective date: conflict, needs a decision

- The app's policy body (`docs/legal/privacy-policy.md` @ `c4d9e81`) says, line 9: `**Effective date:** 23 December 2026`, and line 11: `The AI taste report section (section 8) applies from 25 November 2026.`
- The site renders that body verbatim; legal text is never hand-edited. Showing "the day this branch is promoted to main" would mean editing line 9 or printing a second date that contradicts it. Not done. The synced page shows 23 December 2026.
- Options: (a) change the date in the app repo and re-sync; (b) accept 23 December 2026; (c) approve a site-side rule for editing that line.

## Synced

- `npm run sync:legal`: privacy `c4d9e81`, terms unchanged (`04039aa`, only `syncedAt`).
- `support.astro`: two links "section 8" -> "section 9" (anchor `#delete-your-data` kept). `Privacy.astro` comments renumbered.

## Section 12 text and sources (all from the policy, section 8 unless noted)

| Site text                                                                                                                                     | Source                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| A monthly look at how you eat; off until you turn it on                                                                                       | s8 para 1                  |
| go-to dishes, rhythm, best-value bite                                                                                                         | s8 para 1                  |
| our code works out every number; an AI model only writes the short lines around them                                                          | s8 para 1                  |
| Sent: dish names (to label cuisine, dish type, flavours); calculated statistics; places only as placeholders like "place 1"                   | s8 "What is sent"          |
| Never sent: notes, photos, place names, addresses, cities, map positions, device location, visit dates, name, email, account ID, other people | s8 "What is never sent"    |
| Anthropic, Claude API, service provider                                                                                                       | s8 "Who receives it"; s5   |
| By default does not use the data to train; limited retention under its API policy, longer only to enforce usage policy or by law              | s8 "Who receives it"       |
| Latest report kept until replaced, feature turned off, or account deleted                                                                     | s8 "What we keep" bullet 1 |
| Turning it off in Profile deletes the current report and dish labels straight away                                                            | s8 "Turning it off"        |

Not included: weekly refresh, the three-refresh limit, queue and log retention, export, and the menu's "Your taste report" tag.

## Unsure

- Menu tag omitted: the app docs record no released build with the mushroom menu (sprint "not run on a device").
- The policy says "monthly look" but also "refreshes once a week"; the app's feature-status says the weekly cron is not scheduled. The site says monthly only.
- The sample card's "Must-try dishes" stat was removed (not found in the report screen); "Top cuisines" and "Most returned" exist in the app.
- `src/pages/coffee.astro` still says tips fund "The taste report"; payments copy, left alone.
- COMING LATER stamp and "(still cooking)" heading removed from section 12.

## Checks

All 13 gates pass; axe 0 violations (all pages, light/dark, 375/1440); screenshots of #taste-report at 320 and 1440, light and dark, no overflow.
