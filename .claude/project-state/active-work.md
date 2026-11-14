# Active work: website v2 (`task/website-v2`) — approved 2026-11-14, merged into `work-branch`

Branched from `origin/work-branch` @ `fb4d0b4` (v1, docs and fixes-1 merged). Local checkpoint commits only; push and merge wait for the human's "approved".

## Scope

1. **Status "still cooking":** hero eyebrow "Private beta · still cooking", CTA "Join the beta" (→ `#join`), no Play badge while `playStoreUrl` is null (config kept), dismissible banner on every page (state in the inline theme script, no layout shift), FAQ "Can I use it now?" and a new "When can I get it?", footer "Made in India · Private beta · © 2026 Aftertaste".
2. **Personal name:** unchanged rule and gate (legal name on `/privacy` and `/terms` only; Organization JSON-LD, no Person).
3. **Beta list:** `JoinBeta.astro` + `functions/api/beta.ts` + D1 (`migrations/0001_beta_list.sql`, `wrangler.toml`, `public/_routes.json`). Progressive enhancement, honeypot, minimum time, HMAC-keyed hourly rate limit, size/type/origin limits, generic answers, no IPs. CSP `form-action 'self'`. `/privacy` addendum. `npm run test:beta`.
4. **New sections:** Opener (camera roll, the one new motion: the name fades on scroll), 07 Every meal counts, 08 From the diary (placeholders), 09 Your taste report (still cooking).
5. **Docs:** PRD, DESIGN, ARCHITECTURE, RULES, TASKS, MEMORY, DEV-GUIDE, README, CLAUDE.md, this folder.

## Next

Done on 2026-11-14 after the owner set up D1 (production and preview databases, tables via the Console, `RATE_LIMIT_SALT`): `wrangler.toml` filled in, `migrations/console/0001_beta_list.sql` added, Android and iOS wording, legal re-synced @ `04039aa` (addendum removed), then pushed and merged with `--no-ff`. Next: the human promotes `work-branch` → `main`.

## v1 (merged): recon, token mapping, phase log

The app → CSS token mapping below is still referenced by `src/styles/tokens.css` and the README.

Branch `task/website-v1` from `work-branch` (root commit `3fa6519`; the repo had no commits, so `main` does not exist yet and is created by the human when promoting `work-branch`). Local phase commits only; push/merge wait for the human's "approved".

### Phase 0 recon: findings

Read-only reads of the app repo (`DishDiary`, branch `work-branch`, legal docs at `f19f50e`):

- **Product:** Aftertaste (display name; package identifiers stay `bitemarks`). Private food diary. At v1 the site said Android only; since 2026-11-14 it is a native app for Android and iOS, both still cooking. Not yet on Google Play or the App Store.
- **Owner / contact:** an individual in India (named in the earlier legal drafts; the site publishes no personal name). Governing law: India, courts at Dehradun.
- **Tagline:** "Your personal food memory" (LoginScreen). Store taglines: "Remember every good bite." Store short description: "Your private food diary: places, dishes, photos and what to eat next."
- **Feature names (app copy):** Want to try, Tried, What should we eat?, Pick for me, Another, From your Want to try, One of your favourites, Loved by {name}, Near you, From friends, Visit logged, LOGGED stamp, RECOMMENDED · WOULD RETURN, MUST-TRY, TRIED, Export my data, Delete account, share my diary (discoverable).
- **Icons:** Feather is the app icon set; Ionicons only for star/heart glyphs. No emoji as icons. Website uses `feather-icons` SVGs (MIT) inlined at build time.
- **Fonts:** Prata 400 (display), DM Sans 400/500/600 (UI), DM Mono 400/500 (mono role, receipt). All SIL OFL 1.1 (`@expo-google-fonts/*/LICENSE_FONT`). DM Mono and Prata have no ₹ (U+20B9); DM Sans does, so the mono stack falls back to DM Sans for ₹.
- **Legal:** `docs/legal/privacy-policy.md`, `terms.md` are drafts with `[TODO: …]` markers, an HTML `<!-- draft-notes … /draft-notes -->` comment (internal, must not be published) and a `{#delete-your-data}` heading id (Play's account-deletion URL target).
- **Brand pack:** `design/aftertaste-v1/` (locked v1, v1.1 icon = stacked wordmark). Glyph SVGs (full / simple / dark), seal, stamps, loaders, favicon source, app icon PNGs.
- **Not copied:** any app source (`src/**`), config, `.env*`, git history. Components are re-implemented for the web from the visual spec (SPEC.md, brand README), not translated from app code.

### Token mapping (app → CSS custom properties, `src/styles/tokens.css`)

Colours use `light-dark(<light>, <dark>)` so each token's two values sit side by side; `color-scheme` on `:root` picks the branch (system by default, forced by `data-theme`).

| App token (`src/ui-v1/tokens.ts`)               | CSS                                                   | Light                           | Dark                                    |
| ----------------------------------------------- | ----------------------------------------------------- | ------------------------------- | --------------------------------------- |
| bg                                              | `--bg`                                                | #F4EFE6                         | #16130F                                 |
| surface                                         | `--surface`                                           | #FBF8F2                         | #1F1B16                                 |
| raised                                          | `--raised`                                            | #FFFDF9                         | #29241E                                 |
| line / lineStrong                               | `--line` / `--line-strong`                            | #E4DCCD / #CFC4B1               | #3A332B / #4D453B                       |
| text / muted / faint                            | `--text` / `--muted` / `--faint`                      | #1F1B16 / #665E53 / #746B60     | #F4EFE6 / #B3A999 / #958C7E             |
| primary / primaryPressed                        | `--primary` / `--primary-pressed`                     | #C2412D / #A8361F               | #E0573D / #A8361F                       |
| onPrimary / primarySoft                         | `--on-primary` / `--primary-soft`                     | #FFF8F0 / #F3DED6               | #FFF8F0 / #3A2219                       |
| herb / herbSoft                                 | `--herb` / `--herb-soft`                              | #5E7F3A / #E4EAD6               | #8DAA5E / #26301C                       |
| mustard / danger / brown                        | `--mustard` / `--danger` / `--brown`                  | #C99A2E / #B42318 / #8A5A3B     | #E0B54E / #F5786E / #B98A63             |
| scrim                                           | `--scrim`                                             | rgba(31,27,22,.45)              | rgba(0,0,0,.6)                          |
| brand receipt paper/text/meta/rule (brand.json) | `--paper` `--paper-ink` `--paper-meta` `--paper-rule` | #FFFDF8 #1F1B16 #5E5548 #B9AE9F | same (a physical object, as in the app) |
| stamp.logged                                    | `--stamp-logged`                                      | #C2412D                         | #C2412D (on paper)                      |
| food glyph colours (brand.json `food`)          | `--g-*`                                               | light glyph files               | `-dark` glyph files                     |

| App type role                      | CSS               | Value (app) | Web (fluid, 320 → 1440 px)                               |
| ---------------------------------- | ----------------- | ----------- | -------------------------------------------------------- |
| display (Prata)                    | `--fs-display`    | 32/38       | clamp 2 → 3.75 rem, lh 1.1 (section heads)               |
| title (Prata)                      | `--fs-title`      | 24/30       | clamp 1.5 → 2 rem, lh 1.25                               |
| cardTitle (Prata)                  | `--fs-card-title` | 20/26       | 1.25 rem, lh 1.3                                         |
| heading (DM Sans 600)              | `--fs-heading`    | 18/24       | 1.125 rem, lh 1.33                                       |
| button (DM Sans 500)               | `--fs-button`     | 16/20       | 1 rem, lh 1.25                                           |
| body (DM Sans 400)                 | `--fs-body`       | 16/24       | clamp 1 → 1.125 rem, lh 1.5                              |
| bodySmall                          | `--fs-body-sm`    | 14/20       | 0.875 rem, lh 1.43                                       |
| label (DM Sans 500, upper, 1.2 px) | `--fs-label`      | 12/16       | 0.75 rem, tracking 0.1 em                                |
| mono (DM Mono)                     | `--fs-mono`       | 13/18       | 0.8125 rem, lh 1.38                                      |
| Wordmark (hero)                    | `--fs-wordmark`   | 44 (Login)  | clamp 4 → 10 rem; glyphs 0.865 em, simple glyphs ≤ 32 px |

| App                                                                                         | CSS                                                                                                        |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| spacing s4…s40                                                                              | `--s-4` … `--s-40` (px values) + fluid `--space-section`, `--gutter` (20 px → 48 px; app screenPadding 20) |
| radius sm/md/lg/xl/pill 8/14/20/28/999                                                      | `--r-sm` `--r-md` `--r-lg` `--r-xl` `--r-pill`                                                             |
| sizes controlHeight 52, minTouchTarget 44, chipHeight 40, iconTile 36                       | `--control-h` `--touch` `--chip-h` `--icon-tile`                                                           |
| elevation light: 0 2 8 rgba(31,27,22,.1); dark: 1 px `line` border                          | `--elevation` (shadow in light, `0 0 0 1px var(--line)` in dark)                                           |
| motion fast/base/slow 120/200/320 ms                                                        | `--dur-fast` `--dur-base` `--dur-slow`                                                                     |
| Easing.out(cubic)                                                                           | `--ease-out` cubic-bezier(0.33, 1, 0.68, 1)                                                                |
| brand easing enter/standard/press                                                           | `--ease-enter` (0.22,1,0.36,1), `--ease-standard` (0.45,0,0.25,1), `--ease-press` (0.3,1.3,0.5,1)          |
| pressScale 0.97, stagger 40 ms (max 8), enter translateY 8                                  | `--press-scale`, `--stagger`, `--enter-y`                                                                  |
| stampPress 700 ms: 1.7/−2° → 0.94/−8° @60% → 1/−8°, ink ripple at 420 ms (1 → 1.3, .35 → 0) | `@keyframes stamp-press`, `stamp-ripple` (VerdictStamp rotation −4° per SPEC v1.7)                         |
| receiptPrint steps −1, −0.74, −0.46, −0.16, 0 (360 ms move / 200 ms pause)                  | `@keyframes receipt-feed` (scroll-driven; time-based fallback uses the same steps)                         |
| reveal (DecisionCard): scale 1.08 → 1, rotate −3° → 0, fade, slow                           | `@keyframes reveal`                                                                                        |
| food-cycle loader 3.2 s loop, ring 8 s                                                      | `@keyframes` on the 404 page and the demo's pick                                                           |

### Plan

1. **Foundation:** Astro 7 static, TS strict, tokens.css, self-hosted subset woff2 (+ metric-matched fallbacks to avoid CLS), theme system (inline hashed head script; Light/Dark/System toggle), layout primitives, CLAUDE.md + project-state, gate scripts.
2. **Brand components:** Wordmark (static + assemble animation, inline SVG glyphs coloured by tokens), SealMark, Stamp (verdict + LOGGED), Receipt, PhoneFrame, Button, InkLink, ThemeToggle, Icon (Feather), Loader.
3. **Landing:** hero, how it works (3 spreads), features (Want to try, What should we eat? demo, Near you, From friends, The receipt), privacy promise, FAQ, footer.
4. **Legal + support + 404:** content collection from `src/content/legal/*.md`, `npm run sync:legal` (APP_REPO_PATH, records source commit), TODO highlighting + build warnings, TOC, print styles.
5. **SEO/platform:** meta, OG PNGs (rendered by a script, committed), JSON-LD, sitemap, robots, icons/manifest, `_headers` (CSP with the theme script hash), `_redirects`.
6. **Quality:** all gates, Playwright screenshots (375/768/1440, light/dark), Lighthouse + axe, fixes.
7. **Docs:** README, project-state, final report.

Decisions taken here are recorded in `decisions.md`.

### Progress

- Phase 0: done.
- Phase 1: done. Gates: build, astro check, eslint, prettier, html-validate pass; links/seo fail only on pages and icons added in phases 4–5.
- Phase 2: done (Stamp, Receipt, PhoneFrame, InkLink, DietaryMark, Rating, placeholder screenshot).
- Phase 3: done. Landing page with all sections and signature motion; JS 1.5 KB gz. Found and fixed: the CSS minifier folds animation-timeline into the animation shorthand (invalid), so scroll-driven rules use longhands.
- Phase 4: done. Legal pages from synced markdown (privacy @ f19f50e, terms @ 12c754a), 8 intentional [legal-todo] warnings, support, 404. Legal/support/404 ship no script files.
- Phase 5: done. Favicons (svg with dark variant, ico), apple-touch, manifest icons, mask icon, OG images (home/legal/support/default), JSON-LD, sitemap, robots. All 10 gates pass.
- Phase 6: done. 11 gates pass; axe 0 violations (5 pages × 2 themes × 2 widths); keyboard checks pass; Lighthouse 100/100/100/100 mobile and desktop on /, /privacy, /terms, /support (404: 100/100/100, SEO excluded: noindex). Screenshots reviewed at 320/375/768/1024/1440/1920, light/dark, reduced motion.
- Phase 7: done. README, CLAUDE.md, project-state. Next: on "approved", push `task/website-v1`, merge into `work-branch` with --no-ff, run `npm run gates`, push `work-branch`. The human promotes `work-branch` → `main`.
- Domain change (2026-11-12): canonical https://theaftertaste.app, contact hello@theaftertaste.app. All gates and audits re-run and passing; zero "theaftertaste.in" in the repo.
- Legal re-synced @ 95d7fbb (hello@theaftertaste.app); gates pass. Approved: pushing and merging.
