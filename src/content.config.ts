import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Legal documents synced from the app repo by `npm run sync:legal`.
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    source: z.string(),
    sourceCommit: z.string().regex(/^[0-9a-f]{40}$/),
    sourceUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sourceDirty: z.boolean().optional(),
    /** Links to the old domain rewritten to the canonical URL by sync:legal. */
    siteLinksRewritten: z.number().int().optional(),
    syncedAt: z.string(),
  }),
});

export const collections = { legal };
