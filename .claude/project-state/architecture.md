# Architecture

- **Build:** Astro 7 static output, `build.format: 'file'` (pages are `privacy.html` etc.; Cloudflare Pages serves them at `/privacy`), `trailingSlash: 'never'`, `inlineStylesheets: 'never'`, `vite.build.assetsInlineLimit: 0` (no inline scripts or data-URI assets, so the CSP stays strict).
- **Styling:** `src/styles/tokens.css` holds every token as a custom property; colours use `light-dark()` with `color-scheme` on `:root` (system by default; `data-theme` forces light/dark). Components use Astro scoped styles; shared brand vocabulary (glyph colours, wordmark assembly, seal, loader) is in `brand.css`.
- **Theme:** `src/scripts/theme.js` is inlined in `<head>` (hash in `_headers`): reads `localStorage['aftertaste-theme']`, sets `data-theme`, updates `theme-color` metas and the toggle's `aria-pressed`, and handles toggle clicks by delegation. Adds `html.js` for progressive enhancement.
- **Legal:** content collection `legal` (`src/content.config.ts`, glob loader over `src/content/legal/*.md`), rendered by `src/pages/[legal].astro`... see feature-status.md for the final routing.
- **Headers/redirects:** `public/_headers` (CSP, HSTS, security headers, caching), `public/_redirects` (trailing slashes, aliases). `www` → apex needs a Cloudflare Redirect Rule (Pages `_redirects` cannot match hosts).
