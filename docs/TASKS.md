# Tasks

Backlog and launch checklist. Owner is **human** (the site owner) or **Claude**. Status as of 2026-11-13. Live status also lives in `.claude/project-state/`. Related: [PRD](PRD.md), [DEV-GUIDE](DEV-GUIDE.md), [RULES](RULES.md).

Target launch: **23 Nov 2026** (owner-stated).

## Open placeholders

| Item                          | Owner                                             | Status                  | Notes                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero screenshot               | human supplies; Claude swaps in                   | open (placeholder)      | `src/assets/screenshots/home-placeholder.png` is rendered from tokens. Steps: [DEV-GUIDE](DEV-GUIDE.md#replace-the-hero-screenshot).                                                                      |
| D1 beta list setup            | human (Cloudflare); Claude commits the ID if sent | **open, blocks deploy** | Create `aftertaste-beta`, put its ID (and the Pages project `name`) in `wrangler.toml`, run the migration, add the `RATE_LIMIT_SALT` secret. Steps: [DEV-GUIDE](DEV-GUIDE.md#beta-list-cloudflare-setup). |
| Diary entries and photos      | human supplies photos and logs; Claude wires in   | open (6 placeholders)   | `src/config/diary.ts` (`TODO(diary)`), photos in `src/assets/diary/` with alt text. Steps: [DEV-GUIDE](DEV-GUIDE.md#add-diary-photos).                                                                    |
| Beta list in the app's policy | human (in the app repo); Claude re-syncs          | open                    | The `/privacy` addendum (`#beta-list`) is site-authored. Fold it into the app repo's policy, then remove the addendum (`TODO(legal)` in `src/pages/privacy.astro`).                                       |
| Play listing URL and badge    | human supplies URL; Claude implements             | blocked on live listing | Set `playStoreUrl`, add Google's official badge, update FAQ. Steps: [DEV-GUIDE](DEV-GUIDE.md#add-the-play-badge-and-listing-url).                                                                         |
| `assetlinks.json` fingerprint | human supplies; Claude adds file and header rule  | blocked                 | Needs the app's package name and the release-signing SHA-256 (Play Console → App integrity). Not needed for launch unless App Links are wanted.                                                           |
| Legal TODOs                   | human (in the app repo); Claude re-syncs          | open: 8 visible         | See below.                                                                                                                                                                                                |

### Legal name in the legal text

Decision (owner): the legal name **Paras D Prasad** appears only in the legal documents, where required (privacy "Who is responsible", terms intro). The app repo's drafts still say "Paras Dev Prasad". Owner: change both to "Paras D Prasad" in the app repo; then Claude runs `npm run sync:legal`. Until then `check:no-name` warns on `/privacy` and `/terms`. Everywhere else the name is banned by the same gate.

### Legal TODOs (synced from the app repo @ `95d7fbb`)

Resolve in the app repo, then `npm run sync:legal`. The pages show a Draft banner until none remain.

- **Privacy (6):** effective date; Google content sentence (section 4); backup retention period (8); legal bases and rights wording (10); AI section (13, intentionally blank, but still shown as a "To do" note); how changes are announced (14).
- **Terms (2):** effective date; liability cap amount (9).

## Launch checklist (23 Nov 2026)

### Before launch

- [ ] Real hero screenshot in place (human, then Claude).
- [ ] D1 beta list set up and `wrangler.toml` filled in before `work-branch` deploys (human; [DEV-GUIDE](DEV-GUIDE.md#beta-list-cloudflare-setup)).
- [ ] Real "From the diary" entries and photos, or a decision to keep the labelled samples for now (human).
- [ ] Decide launch-day copy: the site stays in "still cooking" mode until `playStoreUrl` is set ([DEV-GUIDE](DEV-GUIDE.md#add-the-play-badge-and-listing-url)).
- [ ] Legal TODOs resolved and legal re-synced; Draft banner gone (human, then Claude).
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

### Phone checks (human, real Android phone)

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
| Delete the beta list six months after launch (`DELETE FROM beta_signups;`), as the privacy addendum promises                                                                                                    | human            | after launch                |
| Optional: a separate preview D1 database so preview deploys do not write to the real list                                                                                                                       | human + Claude   | optional                    |
| The taste report is teased as "coming later": the privacy policy must describe it (the app's AI section is blank) before it ships                                                                               | human (app repo) | open, before the feature    |
