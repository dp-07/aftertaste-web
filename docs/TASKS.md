# Tasks

Backlog and launch checklist. Owner is **human** (the site owner) or **Claude**. Status as of 2026-11-13. Live status also lives in `.claude/project-state/`. Related: [PRD](PRD.md), [DEV-GUIDE](DEV-GUIDE.md), [RULES](RULES.md).

Target launch: **23 Nov 2026** (owner-stated).

## Open placeholders

| Item                          | Owner                                            | Status                   | Notes                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero screenshot               | human supplies; Claude swaps in                  | open (placeholder)       | `src/assets/screenshots/home-placeholder.png` is rendered from tokens. Steps: [DEV-GUIDE](DEV-GUIDE.md#replace-the-hero-screenshot).                                                                               |
| D1 beta list setup            | human                                            | **done** (2026-11-14)    | `aftertaste-beta` (production) and `aftertaste-beta-preview` (preview) exist, IDs in `wrangler.toml`, tables created in the Console, `RATE_LIMIT_SALT` set.                                                        |
| Diary entries and photos      | human supplies photos and logs; Claude wires in  | open (6 placeholders)    | `src/config/diary.ts` (`TODO(diary)`), photos in `src/assets/diary/` with alt text. Steps: [DEV-GUIDE](DEV-GUIDE.md#add-diary-photos).                                                                             |
| Beta list in the app's policy | human (in the app repo); Claude re-syncs         | **done** (@ `04039aa`)   | Section 13 "Website beta list"; the site's temporary addendum is gone. It does not mention the hashed network address used for rate limiting (see known follow-ups).                                               |
| Store listing URLs and badges | human supplies URLs; Claude implements           | blocked on live listings | Google Play and the App Store: set `playStoreUrl` / `appStoreUrl`, add each store's official badge, update the FAQ. Steps: [DEV-GUIDE](DEV-GUIDE.md#add-the-store-badges-and-listing-urls). iOS is parked for now. |
| `assetlinks.json` fingerprint | human supplies; Claude adds file and header rule | blocked                  | Needs the app's package name and the release-signing SHA-256 (Play Console → App integrity). Not needed for launch unless App Links are wanted.                                                                    |
| Legal TODOs                   | human (in the app repo); Claude re-syncs         | **done** (@ `04039aa`)   | 0 TODOs, no Draft banner. See below.                                                                                                                                                                               |

### Legal text

Synced from the app repo @ `04039aa` (2026-11-13): **0 TODOs** in both documents, no Draft banner. The legal name appears only as "Paras D Prasad" (privacy "Who is responsible", terms intro); `check:no-name` reports no warnings. Section 13 of the privacy policy covers the website beta list.

## Launch checklist (23 Nov 2026)

### Before launch

- [ ] Real hero screenshot in place (human, then Claude).
- [x] D1 beta list set up (production and preview databases) and `wrangler.toml` filled in (human, 2026-11-14).
- [ ] Real "From the diary" entries and photos, or a decision to keep the labelled samples for now (human).
- [ ] Decide launch-day copy: the site stays in "still cooking" mode until the store URLs are set ([DEV-GUIDE](DEV-GUIDE.md#add-the-store-badges-and-listing-urls)).
- [x] Legal TODOs resolved and legal re-synced; Draft banner gone (2026-11-14).
- [ ] `npm run gates` passes on `work-branch` (Claude).
- [ ] Human promotes `work-branch` → `main` (human only). Production deploys from `main`.

### Cloudflare (human)

- [ ] Pages project: production branch `main`, build `npm run build`, output `dist`, `NODE_VERSION=22.23.4`.
- [ ] Custom domain `theaftertaste.app` added; HTTPS works.
- [ ] `www` → apex Bulk Redirect (list entry, rule, proxied `A www → 192.0.2.1`). Check: `curl --head -i https://www.theaftertaste.app/privacy` returns `301` and `location: https://theaftertaste.app/privacy`.
- [ ] Zone settings off: Email Address Obfuscation, Rocket Loader, automatic Web Analytics, JavaScript detections. "Always Use HTTPS" on.
- [ ] Response headers on production include the CSP and HSTS (`curl -I https://theaftertaste.app`), and the browser console shows no CSP errors.
- [ ] `https://theaftertaste.app/sitemap-index.xml` and `/robots.txt` load.
- [ ] Beta form works on production with and without JS; the row appears in the D1 Console; **Settings → Bindings** shows `BETA_DB`; the `RATE_LIMIT_SALT` secret exists for Production and Preview.

### Email

- [ ] Cloudflare Email Routing on, `hello@theaftertaste.app` forwards to a real inbox.
- [ ] **Test:** send a mail to `hello@` from another account and confirm it arrives; then click the email link in the footer and confirm the mail app opens. Removal requests for the beta list arrive here.

### Phone checks (human, a real Android phone; an iPhone too when iOS resumes)

- [ ] Landing in Chrome: light and dark, System follows the phone setting, theme toggle persists after reload.
- [ ] Hero, "What should we eat?" demo and receipt animation work; with "Remove animations" on, everything is static and complete.
- [ ] No horizontal scroll; text readable; taps comfortable.
- [ ] `/privacy`, `/terms`, `/support`, a bad URL (404) look right; `/privacy#delete-your-data` and `/support#delete-account` land on the right section.
- [ ] Link previews (OG image) look right when shared in a chat.

### Google Play listing (human)

- [ ] Privacy policy URL `https://theaftertaste.app/privacy`; account-deletion URL `https://theaftertaste.app/privacy#delete-your-data` (or `/support#delete-account`).
- [ ] Once the listing is live: Play URL and badge task above.

## Known follow-ups

| Item                                                                                                                                                                                                            | Owner            | Status                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------- |
| Adopt Node 22.23.5 (security release of 2026-11-11) in `.nvmrc`, `engines`, README and Pages `NODE_VERSION`: only once it is 14 days old (2026-11-25), so after launch                                          | Claude           | open                        |
| The app's AA contrast gaps ([DESIGN](DESIGN.md#contrast-deviations-from-the-app)): paprika small text, cream on dark paprika, herb on herbSoft, paprika stamp on dark raised. Consider the web roles in the app | human (app repo) | open                        |
| Hero phone shows the light-theme screenshot in dark mode; consider a dark screenshot when real ones exist                                                                                                       | Claude           | open, after real screenshot |
| Add `offers` to the `MobileApplication` JSON-LD when the listing is live                                                                                                                                        | Claude           | open, after Play URL        |
| Re-run `npm run audit:a11y` and `npm run audit:lighthouse` after real screenshot and legal changes                                                                                                              | Claude           | open                        |
| Verify the production Cloudflare setup end to end (not verifiable from this repo)                                                                                                                               | human            | open                        |
| Delete the beta list six months after launch (`DELETE FROM beta_signups;`), as the privacy policy (section 13) promises                                                                                         | human            | after launch                |
| Confirm both D1 databases (production and preview) have the tables: `SELECT name FROM sqlite_master WHERE type = 'table';` in each Console                                                                      | human            | open                        |
| Privacy section 13 does not mention the keyed, hourly hash of the network address kept briefly for rate limiting (no IP is stored). Consider one sentence in the app repo's policy, then re-sync                | human (app repo) | open                        |
| The taste report is teased as "coming later": the privacy policy must describe it (it has no AI section now) before it ships                                                                                    | human (app repo) | open, before the feature    |
