/**
 * Site-wide facts. Everything here comes from the app repo's legal docs
 * (docs/legal/*) and store listing draft (docs/store/listing.md); change it
 * here, not in components.
 */
export const site = {
  name: 'Aftertaste',
  url: 'https://theaftertaste.app',
  locale: 'en-IN',
  tagline: 'Your personal food memory',
  description:
    'Aftertaste is a private food diary for Android. Log the places you eat at and every dish you order, with a photo and a rating, and know what to order next time.',
  contactEmail: 'hello@theaftertaste.app',
  /**
   * Google Play listing URL. While null (private beta), the site shows no Play
   * badge at all and every call to action points at the beta form. Set it at
   * launch to bring the badge back in the hero (and add Google's official
   * badge artwork, see docs/DEV-GUIDE.md "Add the Play badge").
   */
  playStoreUrl: null as string | null,
  /** The beta sign-up form posts here (functions/api/beta.ts, same origin). */
  betaEndpoint: '/api/beta',
  /** In-page anchor of the "Save your seat" form on the landing page. */
  betaAnchor: '/#join',
  themeColor: { light: '#F4EFE6', dark: '#16130F' },
} as const;

export const mailto = (subject?: string) =>
  `mailto:${site.contactEmail}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
