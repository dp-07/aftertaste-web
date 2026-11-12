# Decisions

## 2026-11-12 — Website v1 foundation

- **Astro 7.4.4 + plain CSS, no UI framework.** Static pages with a few interactive moments; Astro components cover it with zero framework runtime.
- **Node 22.23.4.** Astro 7.4.4 requires Node >= 22.23.4; 22.23.4 (2026-10-20) is the newest 22.x at least 14 days old. 22.23.5 (2026-11-11, security release) can be adopted once it is 14 days old.
- **TypeScript 6.0.3, not 7.0.2.** `@astrojs/check` 0.9.12 supports `^5 || ^6` and `typescript-eslint` 8.72.1 supports `<6.1.0`.
- **Whole tree at least 14 days old.** Installed with `npm install --before=2026-10-29T00:00:00Z`, so transitive packages obey the same rule as direct ones.
- **`@astrojs/markdown-remark` is a direct dependency.** Astro 7 deprecates `markdown.remarkPlugins`; the replacement is `markdown.processor: unified({...})` from this package (an optional peer of astro).
- **No `motion` library.** Every effect is CSS (keyframes, scroll-driven animations, View Transitions) plus a few lines of IntersectionObserver. The app's springs are its press easing `cubic-bezier(0.3, 1.3, 0.5, 1)`, which CSS reproduces exactly; a spring engine would add JS for no visible gain.
- **Colours via `light-dark()`.** One declaration per token with both values side by side, mirroring the app's light/dark token table; `data-theme` sets `color-scheme` to force a theme.
- **Fonts subset with fonttools 4.55.0** (a local tool, not a dependency): Latin + ₹. DM Mono and Prata lack ₹, so the mono stack falls back to DM Sans for it. Metric-matched local fallbacks (`size-adjust`, ascent/descent overrides measured against Georgia, Arial, Courier New) keep the swap from shifting layout.
- **Root commit on `work-branch`.** The repo was empty; committing there keeps `main` untouched for the human.
- **Astro telemetry disabled** in npm scripts (`ASTRO_TELEMETRY_DISABLED=1`), in keeping with the no-tracking stance.
