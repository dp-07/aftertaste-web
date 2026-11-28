# Web revamp report, 2026-11-27

Branch `task/web-revamp-20261127` off `work-branch` @ `9842211`. Pushed, **not merged** (waits for "approved"). Recon: `web-revamp-recon-20261127.md`. Decisions: `decisions.md` 2026-11-27.

## Before and after

Measured on a production build, Chrome, reduced motion, deferred sections forced visible.

| Page            | 375 px before | 375 px after | 1440 px after | Words before | Words after |
| --------------- | ------------- | ------------ | ------------- | ------------ | ----------- |
| `/`             | 18,326        | 3,899 (21%)  | 3,489         | 1,779        | 273         |
| `/log`          | —             | 3,232        | 2,804         | —            | 215         |
| `/today`        | —             | 3,336        | 2,797         | —            | 253         |
| `/receipt`      | —             | 2,627        | 2,617         | —            | 152         |
| `/taste-report` | —             | 3,238        | 2,617         | —            | 348         |
| `/support`      | 3,505         | 4,258        | 3,733         | 440          | 484 (+FAQ)  |

Home sections at 375 px after: hero 843 px (45 words), Three small habits 509 (48), Have a look around 679 (54), Private by default 261 (23), Save your seat 854 (103, the form and its notes). The taste report page is the wordiest by design: the four data blocks quote policy §8 and were not shortened.

## Page map

- `/` — hero (h1 = wordmark + tagline), `#how-it-works`, `#features`, `#privacy`, `#join`.
- `/log` — head (search or type in), `#near-you`, `#rate`, `#gallery`.
- `/today` — head (Today's pick), `#pick-for-me`, `#want-to-try`, `#from-friends`.
- `/receipt` — head (printer), `#every-meal`.
- `/taste-report` — head (replica), `#how-its-made`, `#your-data`.
- `/support` gains `#questions` (the FAQ). `/privacy`, `/terms`, `/coffee`, `/404` unchanged apart from the header.

## Cut or merged

Cut: "Sound familiar?" opener; "From the diary" strip and `src/config/diary.ts`; "More in Aftertaste" index (Menu and booking, Tried, Search a place or a craving); home coffee note; hero phone frame and placeholder screenshot; six-promise privacy section (now one line); numbered running heads on home; the scroll-driven receipt and the Opener's name fade (their sections went). Merged: Want to try, What should we eat?, From friends → `/today`; Near you, Gallery → `/log`; Every meal counts → `/receipt` (one chai receipt); FAQ → `/support`.

## Interactions and fallbacks

| Interaction   | Behaviour                                                                                                                                                                                             | No JS                                         | Reduced motion                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------ |
| Hero seal     | Mouse hover on the seal or tap lifts the lid −16°, three stamp tags fan out (Log a place, Today's pick, The receipt); Escape closes and returns focus; leaving the area closes unless focus is inside | Lid open, tags are plain links                | Lid stays shut, tags fade      |
| Today's pick  | Photos swipe (scroll-snap) or scroll with arrow keys; indicator follows; Another pick cycles three sample places, fades, announces                                                                    | First place, swipe still works, button hidden | Instant swap, no smooth scroll |
| Receipt       | Prints in four steps when a third is in view, LOGGED stamp lands, 3 px thud                                                                                                                           | Printed and stamped                           | Printed and stamped            |
| Taste report  | Numbers count up once, 900 ms, when half in view; screen readers get one sentence per tile                                                                                                            | Final numbers                                 | Final numbers                  |
| Scroll reveal | 1.5 rem rise on steps, teasers, blocks (CSS `view()`), never a fade                                                                                                                                   | Static                                        | Static                         |
| Teaser hover  | Card lifts 2 px, art tilts −3°                                                                                                                                                                        | —                                             | No movement                    |
| Header menus  | Native `<details>`; one open at a time, Escape, outside click (inline theme script)                                                                                                                   | Open and close natively                       | —                              |

Not built: a custom cursor (judged not tasteful enough for the accessibility cost).

## Links and redirects

- App links `/`, `/privacy`, `/terms`, `/support`, `/coffee`: unchanged. `/privacy#delete-your-data`, `/support#delete-account`, `/support#what-friends-see`: unchanged (links gate).
- Old home anchors move via `moved-anchors.ts` (see decisions); `#how-it-works`, `#privacy`, `#join` stay on home. `/#join` (beta banner, header, every page's Next up) still works.
- `_redirects`: trailing-slash rules for the four pages; `/todays-pick` → `/today`, `/receipts` → `/receipt`, `/faq` → `/support#questions`; all old aliases kept.

## /taste-report facts → policy lines (privacy policy @ `c4d9e81`)

| Site text                                                                                                                                                                                      | Policy                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A monthly look at how you eat; your go-to dishes, your rhythm, your best-value bite                                                                                                            | §8 para 1                                                                                                                                                                                          |
| Off until you turn it on                                                                                                                                                                       | §8 para 1 ("off until you turn it on")                                                                                                                                                             |
| Our own code works out every number from your diary; an AI model only writes the short lines around them                                                                                       | §8 para 1                                                                                                                                                                                          |
| Sent: dish names (labelled with a cuisine, a dish type and flavours) plus calculated statistics; places only as placeholders like "place 1"                                                    | §8 "What is sent to the AI"                                                                                                                                                                        |
| Never sent: notes, photos, place names, addresses, cities, map positions, device location, visit dates, name, email, account ID, anything about other people                                   | §8 "What is never sent"                                                                                                                                                                            |
| Anthropic, through its Claude API, as our service provider; by default not used to train its models; limited retention under its API policy, longer only to enforce its usage policy or by law | §8 "Who receives it" (and §5)                                                                                                                                                                      |
| Latest report kept until a newer one replaces it, you turn the feature off or delete your account                                                                                              | §8 "What we keep", bullet 1                                                                                                                                                                        |
| Turning it off in Profile deletes the current report and dish labels straight away                                                                                                             | §8 "Turning it off"                                                                                                                                                                                |
| Replica numbers and headline                                                                                                                                                                   | Sample, labelled "sample" and "made-up numbers"; layout from the app's `TasteReportScreen` (number strip labels Places, Dishes, New spots, Avg rating, Spend; Highlights Best bite, Most returned) |

Not mentioned, per instruction: search speed, nearest-first results, the app menu's "Your taste report" tag.

## Verification

See the final report in the session; summary: 13 gates pass; axe 0 violations (10 pages × light/dark × 375/1440 = 40 runs) plus keyboard checks (seal, theme, Features menu, Pick for me, Another pick, photo track, banner); screenshots 320/375/768/1440 × light/dark for the five changed pages, 0 overflow, 0 console errors; Lighthouse below.
