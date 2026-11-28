# Web revamp recon (Phase 0), 2026-11-27

Branch `task/web-revamp-20261127` off `work-branch` @ `9842211`. Measured on a production build (`dist/`) served by `scripts/serve-dist.mjs`, Chrome, reduced motion, `.defer-render` forced visible.

## Skills

- `frontend-design`: **not available in this session** (not in the skill list). Not loaded.
- `brand-design`: loaded. The brand is already locked (Brand v1, App UI v1.12), so only its anti-slop check and web UI notes apply. No new identity elements.

## Home today

| Width  | Height    | Words in `<main>` |
| ------ | --------- | ----------------- |
| 375 px | 18,326 px | 1,779             |
| 1440px | 14,711 px | 1,779             |

Target: home at 375 px ≤ 6,108 px (one third).

Sections at 375 px, in order:

| #   | id                 | Height | Words | Headline                                                 |
| --- | ------------------ | ------ | ----- | -------------------------------------------------------- |
| —   | hero               | 1,264  | 62    | Aftertaste — Taste you don’t want to forget.             |
| —   | sound-familiar     | 1,085  | 73    | You remember the momos. Not the place, not the price, …  |
| 01  | how-it-works       | 1,742  | 132   | Remember every bite.                                     |
| 02  | want-to-try        | 713    | 77    | A list for the places you keep hearing about.            |
| 03  | what-should-we-eat | 674    | 70    | Can’t decide? Let it pick.                               |
| 04  | todays-pick        | 991    | 92    | Once a day, one place to think about.                    |
| 05  | near-you           | 706    | 66    | The places around you, already listed.                   |
| 06  | from-friends       | 817    | 93    | See where your friends ate this week.                    |
| 07  | gallery            | 968    | 68    | Every dish you’ve photographed, month by month.          |
| 08  | receipt            | 878    | 79    | Every visit, on paper.                                   |
| 09  | every-meal         | 1,541  | 146   | A ₹40 cutting chai and a tasting menu get the same page. |
| 10  | more               | 670    | 86    | And the small things.                                    |
| 11  | from-the-diary     | 791    | 168   | A few pages from our own diary.                          |
| 12  | taste-report       | 1,691  | 257   | Your taste report                                        |
| 13  | privacy            | 1,212  | 151   | Private by default.                                      |
| 14  | questions          | 790    | 46\*  | Good to know. (\*closed `<details>`; answers are hidden) |
| —   | coffee-note        | 128    | 6     | (link to /coffee)                                        |
| 15  | join               | 911    | 107   | Save your seat.                                          |

Other pages at 375 / 1440 px: `/support` 3,505 / 2,962 (440 words), `/coffee` 2,018 / 2,119 (158), `/privacy` 12,111 / 8,372 (2,228; legal, not touched).

## App screens to replicate (app `work-branch` @ `d6360ba`, read-only)

- **Today's pick** (`components/brand/TodaysPickCard.tsx`, `screens/home/TodaysPickSheet.tsx`): a bottom sheet on `raised` (radius xl, grab handle, ✕). Rounded photo carousel (swipeable, auto-advance 1.5 s until touched), "TODAY'S PICK" pill top-left, "★ 5.0" chip top-right, pill page indicator on `scrim`. Name in Prata (2 lines), "Category • City" in mono muted, reason as a primary InfoChip. "Open place" (primary, book-open) and "Not today" (secondary, x), then an "Another pick" text link (hidden when the pool has no other place). The site already mirrors it (`src/components/app/TodaysPickCard.astro`, static).
- **Place receipt** (`components/brand/ReceiptCard.tsx`): paper, one-line wordmark and "TASTE DIARY" left, LOGGED stamp top-right (−8°, 12 px), place + area/date, DISH / RATING rows, NOTES, TOTAL, OVERALL, barcode, "UNTIL THE NEXT BITE", zigzag edge. Mirrored in `src/components/brand/Receipt.astro`.
- **Taste report** (`screens/TasteReportScreen.tsx`, `screens/tasteReport/ReportSections.tsx`): header "Taste report · <period>" + a display headline written by the AI; "Last 30 days" number strip of `DeltaStat` tiles (Places, Dishes, New spots, Avg rating, Spend), each with an up / down / flat change (up = herb, down = muted, never red); "Your rhythm" charts (Outings per week, Spend per month, Where, What); "Taste dials" (Top cuisines, Top dishes, Flavour lean); "Highlights" tiles (Best bite, Most returned, Best value, Newest find); "The deep cuts" cards (Said vs did, Signature dish, Backlog nudge, Happiest rupee, Craving clock); "The read" (AI lines); a taste receipt ("TASTE REPORT", "TOP DISHES", "HAPPIEST RUPEE", "UNTIL THE NEXT BITE"); refresh button with N left. The site today shows a generic sample card (top cuisines + most returned), not this layout.
- **Mushroom menu** (`screens/home/MushroomMenu.tsx`): the diary seal bottom-right on Home; tap lifts the cap like a lid (−16°) and three stamp-style tags rise and fan out (tilts −2°, +3°, −4°): "Today's pick", "Log a place", "Your taste report". By instruction the site does not mention that last tag; the site's hero seal is a site navigation motif, not a replica of the menu.
- No real app screenshots were provided in this session or exist in `src/assets` (only the hand-built replicas).

## Links into the site (must keep working)

- **From the app** (`src/config/site.ts`): `/`, `/privacy`, `/terms`, `/support`, and `/coffee` on direct builds only. Store listing and legal docs: `/privacy`, `/terms`, `/privacy#delete-your-data`.
- **Manifest:** `start_url` `/`. Icons in `/icons/`.
- **`_redirects`:** `/privacy/`, `/terms/`, `/support/` trailing-slash rules; aliases `/privacy-policy`, `/terms-of-use`, `/terms-of-service`, `/contact`, `/help`, `/delete-account` → `/support#delete-account`.
- **Inside the site:** header `/#how-it-works`, beta CTA and banner `site.betaAnchor` (`/#join`), `/support#…` topic anchors, `/privacy#…` (delete-your-data, beta-list, ai-taste-report, 3-your-location, 7-discoverable-diaries…), footer `/privacy`, `/terms`, `/support`, `/coffee`, mailto.
- **Old home anchors** (shared links may point at them): `#how-it-works`, `#want-to-try`, `#what-should-we-eat`, `#todays-pick`, `#near-you`, `#from-friends`, `#gallery`, `#receipt`, `#every-meal`, `#more`, `#from-the-diary`, `#taste-report`, `#privacy`, `#questions`, `#join`. Fragments never reach the server, so `_redirects` cannot move them; a small home-page script must.

## Constraints that shape the build

- CSP: no inline scripts (except the hashed theme script) and no inline styles; scripts are bundled files. `html.js` is set by the theme script.
- JS budget gate: `/` ≤ 30 KB gz. SEO gate: every page needs a unique title and a 50–170 character description, a canonical URL, a sitemap entry and an existing OG image.
- `landing.ts` today drives stamp presses, receipt printing (scroll timeline or timed), the What-should-we-eat demo and the beta form.
