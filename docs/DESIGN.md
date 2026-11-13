# Design

The visual direction and the system behind it. Values are transcribed from the app's App UI v1.8.1 tokens and the locked brand pack; the code is the source of truth: [tokens.css](../src/styles/tokens.css), [base.css](../src/styles/base.css), [brand.css](../src/styles/brand.css). Related: [RULES](RULES.md), [ARCHITECTURE](ARCHITECTURE.md).

## Direction: tactile editorial

The app is a diary kept on paper: receipts, ink stamps, a seal, food drawn as letters. The site keeps that and adds an editorial frame: large Prata headlines, a numbered running head and hairline on every section, generous space, one quiet accent (paprika). Objects look physical: the receipt is paper and stays paper in dark mode, stamps are pressed in ink, the wordmark is built from food. There are no stock photos: where the app would show one, the site uses food glyphs (`FoodMark`). The only photos will be our own dishes in "From the diary" (`src/assets/diary/`).

The site is honest about being **still cooking**: the hero eyebrow reads "Private beta · still cooking", a slim banner sits above the header, and future features (the taste report) wear a COMING LATER stamp.

## Tokens

All tokens are CSS custom properties in [tokens.css](../src/styles/tokens.css). Use them; do not write literal colours. A new value needs a decision in `.claude/project-state/decisions.md`.

### Colour

Each colour is one `light-dark(light, dark)` declaration. `:root` follows the system; `data-theme` forces a scheme.

| Token                              | Light                     | Dark                      | Use                                         |
| ---------------------------------- | ------------------------- | ------------------------- | ------------------------------------------- |
| `--bg`                             | #F4EFE6                   | #16130F                   | Page                                        |
| `--surface`                        | #FBF8F2                   | #1F1B16                   | Cards                                       |
| `--raised`                         | #FFFDF9                   | #29241E                   | Raised elements                             |
| `--line` / `--line-strong`         | #E4DCCD / #CFC4B1         | #3A332B / #4D453B         | Hairlines                                   |
| `--text`                           | #1F1B16                   | #F4EFE6                   | Body text                                   |
| `--muted`                          | #6B6257                   | #B3A999                   | Secondary text                              |
| `--faint`                          | #9A9083                   | #7D7468                   | Decoration only, **never text**             |
| `--primary`                        | #C2412D                   | #E0573D                   | Icons, meters, markers, large numerals      |
| `--primary-ink`                    | #A8361F                   | #E0573D                   | Paprika as small text (kickers, numbers)    |
| `--btn-bg` / `--btn-bg-hover`      | #C2412D / #A8361F         | #A8361F / #C2412D         | Primary button fill                         |
| `--herb` / `--herb-ink`            | #5E7F3A / #4E6B2F         | #8DAA5E / #8DAA5E         | Herb accents; ink for small text            |
| `--mustard`, `--brown`, `--danger` | #C99A2E, #8A5A3B, #B42318 | #E0B54E, #B98A63, #F0645A | Tones                                       |
| `--paper`, `--paper-ink`           | #FFFDF8, #1F1B16          | same                      | Receipt and stamp paper (a physical object) |

### Type

| Role (CSS)                    | Face               | Size (web)                            |
| ----------------------------- | ------------------ | ------------------------------------- |
| `--fs-wordmark`               | Prata, glyphs      | clamp 4 → 10 rem                      |
| `--fs-display`                | Prata 400          | clamp 2 → 3.75 rem, lh 1.1            |
| `--fs-title`                  | Prata              | clamp 1.5 → 2 rem                     |
| `--fs-card-title`             | Prata              | 1.25 rem                              |
| `--fs-heading`                | DM Sans 600        | 1.125 rem                             |
| `--fs-body` / `--fs-lede`     | DM Sans 400        | clamp 1 → 1.125 rem / 1.125 → 1.5 rem |
| `--fs-body-sm`, `--fs-button` | DM Sans            | 0.875 rem, 1 rem (500)                |
| `--fs-label`                  | DM Sans 500, upper | 0.75 rem, tracking 0.1 em             |
| `--fs-mono`                   | DM Mono            | 0.8125 rem                            |

### Space, radius, motion

| Group     | Tokens                                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Space     | `--s-4` … `--s-40` (0.25–2.5 rem); fluid `--gutter` (20 → 48 px), `--space-section` (4.5 → 10 rem), `--space-block`; `--measure` 34 rem, `--page-max` 84 rem                         |
| Radius    | `--r-sm` 8, `--r-md` 14, `--r-lg` 20, `--r-xl` 28, `--r-pill` 999 px; `--control-h` 52, `--touch` 44                                                                                 |
| Motion    | `--dur-fast/base/slow` 120/200/320 ms; `--ease-out`, `--ease-enter`, `--ease-standard`, `--ease-press` (0.3, 1.3, 0.5, 1); `--press-scale` 0.97; `--stagger` 40 ms; `--enter-y` 8 px |
| Elevation | `--elevation`: one soft shadow in light; no shadow and a 1 px line in dark                                                                                                           |

## Contrast deviations from the app

Some of the app's colour pairings fall below WCAG AA on the web. The site adds accessible **roles** from existing app or brand values (no new colours) and keeps the app's token for non-text uses (3:1 is enough for icons, meters and large numerals).

| Pair in the app                    | Ratio | Web fix                                              |
| ---------------------------------- | ----- | ---------------------------------------------------- |
| Paprika small text on oat (light)  | 4.49  | `--primary-ink` = the app's `primaryPressed` #A8361F |
| Cream on paprika buttons (dark)    | 3.56  | `--btn-bg` = #A8361F in dark                         |
| Herb on herbSoft chip (light)      | 3.73  | `--herb-ink` = the brand's olive stamp ink #4E6B2F   |
| Paprika stamp ink on raised (dark) | 4.10  | `--stamp-paper` = `surface` in dark                  |

`npm run check:contrast` (a gate) tests every text pair in both themes. The app could adopt the same roles ([TASKS](TASKS.md)).

## Typography

- **Prata 400** (display), **DM Sans 400/500/600** (UI), **DM Mono 400/500** (receipt and metadata). SIL OFL 1.1; licences in `public/fonts/`.
- Self-hosted woff2, subset to Latin plus ₹ and the arrows used in copy ([subset-fonts.sh](../scripts/subset-fonts.sh), outputs in `src/assets/fonts/`). Prata and DM Mono have no ₹, so the mono stack falls back to DM Sans for it.
- Prata 400 and DM Sans 400 are preloaded. Metric-matched local fallbacks (`size-adjust` plus ascent/descent overrides) stop the font swap shifting layout. Mono stack order matters: [MEMORY](MEMORY.md#font-loading-layout-shift).

## Layout and fluid sizing

- Content sits in `.wrap` (max 84 rem, fluid gutter). `.grid-12` is one column below 64 rem and 12 columns above (`minmax(0, 1fr)` so content cannot force overflow).
- Type, gutter and section spacing scale with `clamp()` from 320 px to 1440 px; no breakpoints are needed for type.
- Sections open with a hairline and a running head (`01 How it works`).
- Below-the-fold sections use `.defer-render` (`content-visibility: auto`) for cheap first paint.
- No horizontal overflow from 320 px. Touch targets ≥ 44 px.

## Brand components

| Component                                                                        | Where                                             | Use it for                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Wordmark`                                                                       | [brand/](../src/components/brand/Wordmark.astro)  | The name, built from Prata letters and four food glyphs. `stacked` plus `animate` for the hero; `simple` at 32 px and below (header, footer). Set `font-size` on it.                                                                                               |
| `Glyph`                                                                          | brand/                                            | One wordmark letter (t, r, s, e). Used inside `Wordmark`; rarely directly.                                                                                                                                                                                         |
| `SealMark`                                                                       | brand/                                            | The diary seal with the mushroom. Decorative stamp on the hero phone, wide layouts only.                                                                                                                                                                           |
| `Stamp`                                                                          | brand/                                            | Ink stamps: `placeStrong` (RECOMMENDED · WOULD RETURN), `mustTry`, `tried`, `logged` (receipt), and site-only `seat` (SEAT SAVED, the beta form) and `later` (COMING LATER). Use for status or verdicts, never as decoration. `press="manual"` waits for a script. |
| `Receipt`                                                                        | brand/                                            | The visit receipt: paper, mono rows, barcode, LOGGED stamp. Used in "The receipt" and twice in "Every meal counts" (a one-line chai and an eight-course tasting menu).                                                                                             |
| `PhoneFrame`                                                                     | brand/                                            | A plain frame around a real app screenshot (portrait, ideally 1080 × 2340).                                                                                                                                                                                        |
| `Loader`                                                                         | brand/                                            | The food-cycle loader: the demo's picking state and the 404.                                                                                                                                                                                                       |
| `FoodMark`                                                                       | brand/                                            | A static food glyph standing in for a photo.                                                                                                                                                                                                                       |
| `Button`, `InkLink`, `Icon`, `ThemeToggle`, `PlayBadge`, `Rating`, `DietaryMark` | [ui/](../src/components/ui/)                      | App-faithful controls. Icons are Feather; the star is a plain SVG.                                                                                                                                                                                                 |
| `app/*`                                                                          | [app/](../src/components/app/)                    | Replicas of app rows and cards for demos. Sample data is invented and labelled as such.                                                                                                                                                                            |
| `BetaBanner`                                                                     | [components/](../src/components/BetaBanner.astro) | The slim "still cooking" notice on every page: surface strip, a paprika dot, one link, a 44 px dismiss button. Driven by the inline theme script.                                                                                                                  |

## Landing sections added in v2

| Section                               | Look                                                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Opener ("Sound familiar?", no number) | A large Prata statement beside a tilted "camera roll": a grid of food-glyph tiles and drawn screenshots (a chat, a menu, a smudged bill, a map, a payment, a note), one tile selected, its place name fading. One image to assistive tech. |
| 07 Every meal counts                  | Two `Receipt`s of very different lengths, slightly rotated, on one ruled diary page with a paprika margin rule. The headline's ₹ is set in DM Sans (Prata has no ₹).                                                                       |
| 08 From the diary                     | A sideways strip that bleeds to the window edges: paper cards (photo or glyph, dashed tear line, mono date and city, Prata dish, mono place, five taste dots, one line, a stamp). Scroll-snap, focusable region.                           |
| 09 Your taste report (still cooking)  | A dashed-border card: kicker "Taste report · sample data", COMING LATER stamp, three paprika bars with values written beside them (one series, no legend), two figures, a "made-up numbers" line.                                          |
| 12 Save your seat                     | Copy beside a surface card with the form (52 px fields on `raised`, labels above, "(optional)" in muted). Success is a paper ticket with SEAT SAVED; errors are a soft-paprika note with an icon.                                          |

## Motion inventory

Every effect has a static, complete resting state under `prefers-reduced-motion`. `base.css` also has a catch-all that collapses durations to ~0.

| Effect                                               | Implementation                                                                                                                   | Reduced motion                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Wordmark assembly (hero)                             | CSS: letters settle with a 40 ms stagger, then mushroom and sprout grow in                                                       | Wordmark is simply there                             |
| Hero tagline settle                                  | CSS keyframe after the wordmark                                                                                                  | Shown immediately                                    |
| Stamp press                                          | CSS 700 ms keyframes (1.7 → 0.94 → 1) plus ink ripple; JS adds `.is-pressed` at 50% visible (SEAT SAVED: on server confirmation) | Stamp visible, no animation; also visible without JS |
| Opener: the name slips away (v2, the one new motion) | Scroll-driven CSS: a `@property` percentage drives a mask gradient on a `view()` timeline, from readable to "Hill Ro…"           | Rests half-faded, static                             |
| Receipt printing                                     | Scroll-driven CSS view timeline on wide, tall viewports; otherwise a timed print started by `landing.ts`                         | Receipt shown fully printed and stamped              |
| "What should we eat?" pick                           | JS picks a sample (480 ms "Picking…"), CSS reveal (scale 1.08 → 1, rotate −3° → 0)                                               | Instant pick, 200 ms opacity fade                    |
| Food-cycle loader                                    | CSS: four glyphs on a 3.2 s loop, ring turns every 8 s                                                                           | Static mushroom in a static ring                     |
| Button press                                         | `transform: scale(0.97)` on `:active`                                                                                            | Opacity dip to 0.7 instead of scale                  |
| Ink-link underline                                   | Draws in on hover/focus                                                                                                          | Covered by the catch-all                             |
| Caret blink (search demo)                            | CSS `steps(1)`                                                                                                                   | Static caret                                         |
| Page transitions                                     | Cross-document `@view-transition`: 200 ms out, 320 ms in                                                                         | Not enabled                                          |

v2 rule: keep the signature motions and add at most one new motion moment per iteration. The diary strip and the beta form add none (the form reuses the stamp press).

Implementation notes are in [ARCHITECTURE](ARCHITECTURE.md#motion-implementation).

## Theme toggle

A three-way segmented control (Light / Dark / System) in the header, like the app's SegmentedControl. System is the default and follows `prefers-color-scheme` live; the choice is saved in `localStorage` (`aftertaste-theme`) and applied before first paint. The toggle needs JS and is hidden without it, in which case the site follows the system. The hero screenshot is a light-theme placeholder in both themes.

## Do and don't

| Do                                                                       | Don't                                                                |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| "Your Want to try list is yours alone."                                  | "Unlock seamless, all-in-one dining insights."                       |
| One accent (paprika) used sparingly, with real hairlines and paper       | Gradient blobs, glassmorphism, glowing orbs                          |
| A food glyph where a photo would go                                      | Stock photos of smiling people at tables                             |
| A numbered running head and one idea per section                         | A row of three icons with three-word headings                        |
| One signature motion per idea (stamp, receipt, wordmark)                 | Fade-up-on-everything                                                |
| Real quotes from the app's own copy and sample data labelled as examples | Testimonial carousels and invented reviews                           |
| Feather icons at the app's weight                                        | Emoji as icons                                                       |
| Sentence case, specific verbs, short sentences                           | Title Case Everywhere and the banned words in [RULES](RULES.md#copy) |
