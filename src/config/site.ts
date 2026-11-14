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
    'Aftertaste is a private food diary for Android and iOS. Log the places you eat at and every dish you order, with a photo and a rating, and know what to order next time.',
  contactEmail: 'hello@theaftertaste.app',
  /**
   * Store listing URLs, one per platform (Aftertaste is a native app for
   * Android and iOS, both in private beta). While null, no store badge shows
   * and every call to action points at the beta form. Set each at launch to
   * bring its badge into the hero (with the store's official artwork, see
   * docs/DEV-GUIDE.md "Add the store badges and listing URLs").
   */
  playStoreUrl: null as string | null,
  appStoreUrl: null as string | null,
  /** The beta sign-up form posts here (functions/api/beta.ts, same origin). */
  betaEndpoint: '/api/beta',
  /** In-page anchor of the "Save your seat" form on the landing page. */
  betaAnchor: '/#join',
  /** Support page (/coffee): Buy Me a Coffee, plus UPI for India. Never linked from /privacy, /terms or /support. */
  buyMeACoffeeUrl: 'https://buymeacoffee.com/parasdp',
  /** UPI ID (VPA) only. The payee name is deliberately not stored: UPI apps show the bank-verified name. */
  upiId: 'dp.paras1707@oksbi',
  themeColor: { light: '#F4EFE6', dark: '#16130F' },
} as const;

export const mailto = (subject?: string) =>
  `mailto:${site.contactEmail}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** UPI pay link: no payee name (pn) and no amount, so the UPI app asks for the amount. */
export const upiUrl = () => `upi://pay?pa=${site.upiId}&cu=INR&tn=${encodeURIComponent('Coffee for Aftertaste')}`;
