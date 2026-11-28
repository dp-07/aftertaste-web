# /patron redesign report (2026-11-28, `task/web-patron-20261128`)

Not an app sync: a website change. No app files were read or written. App's UPI ID and Buy Me a Coffee URL unchanged (`src/config/site.ts`); Bondin URL added (web only).

- **Redirects:** `/coffee`, `/coffee/` (and `/patron/`) → `/patron`, 301, in `public/_redirects`. No internal `/coffee` links remain in `src/`.
- **Privacy/terms:** Bondin not named in privacy section 5 (names Buy Me a Coffee and UPI for the app); terms section 7 covers "external services". A plain link needs no change, so none made. Legal text untouched.
- **UPI:** deep link and QR both from `upiUrl()`; ID `dp.paras1707@oksbi`; no `pn=` (gate).
- **Bondin / Buy Me a Coffee:** real links; with JS a tap opens the checkout in the page (Bondin script loaded on tap; Buy Me a Coffee page in our own `<dialog>`). Nothing third-party on load (verified: 0 external requests). Wider CSP on `/patron` only. Tested live in Chrome: both open, Esc/close work, stamp shows after close.
- **Gates:** `npm run gates` all pass. axe: 0 violations on `/patron`, light and dark, 375 and 1440 (full audit clean). Screenshots 320/375/768/1440 light and dark, 0 problems. Lighthouse `/patron`: 100/100/100/100 mobile and desktop, CLS 0, TBT 0.
