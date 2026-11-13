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
   * Google Play listing URL. While null, the site shows a "Coming soon on
   * Google Play" badge area that is not a link. Set it when the listing is
   * live (and add Google's official badge, see README "Play badge").
   */
  playStoreUrl: null as string | null,
  notifySubject: 'Tell us when Aftertaste is on Google Play',
  themeColor: { light: '#F4EFE6', dark: '#16130F' },
} as const;

export const mailto = (subject?: string) =>
  `mailto:${site.contactEmail}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export const notifyHref = mailto(site.notifySubject);
