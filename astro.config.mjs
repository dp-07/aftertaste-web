// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkLegal } from './src/lib/remark-legal.mjs';

// Static site for Cloudflare Pages. Canonical URLs have no trailing slash:
// build.format 'file' writes privacy.html, which Pages serves at /privacy.
export default defineConfig({
  // .app is an HSTS-preloaded TLD: the site is HTTPS-only, so every absolute URL is https://.
  site: 'https://theaftertaste.app',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // Every stylesheet is a file, so the CSP needs no 'unsafe-inline' for styles.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Astro inlines scripts (and Vite inlines assets) below this size; inline
      // scripts would need CSP hashes, so nothing is inlined.
      assetsInlineLimit: 0,
    },
  },
  markdown: {
    // Legal text is quoted from the app repo as written: no smart quotes.
    processor: unified({ remarkPlugins: [remarkLegal], smartypants: false }),
    syntaxHighlight: false,
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404'),
    }),
  ],
  devToolbar: { enabled: false },
});
