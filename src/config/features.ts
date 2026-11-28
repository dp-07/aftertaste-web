/**
 * The feature pages (web revamp 2026-11-27). One list drives the header's
 * Features menu, the home teaser row, the hero seal's tags, the footer and the
 * "next" link at the end of each feature page. Lines are short on purpose;
 * every claim is mapped in sync/feature-map.json.
 */
export interface Feature {
  href: string;
  /** Menu and tag label. */
  label: string;
  /** One line for the teaser card. */
  line: string;
}

export const features: Feature[] = [
  { href: '/log', label: 'Log a place', line: 'Places, dishes, photos and the spots near you.' },
  { href: '/today', label: 'Today’s pick', line: 'One place a day, picked from your own lists.' },
  { href: '/receipt', label: 'The receipt', line: 'Any visit, printed and ready to share.' },
  { href: '/taste-report', label: 'Taste report', line: 'A monthly look at how you eat. Off until you turn it on.' },
];

/** The feature after `href`, wrapping round. */
export const nextFeature = (href: string): Feature => {
  const i = features.findIndex((f) => f.href === href);
  return features[(i + 1) % features.length]!;
};

/**
 * Old home-page anchors (before 2026-11-27) and where they live now. The home
 * page's script moves a visitor who arrives with one of these fragments.
 */
export const movedAnchors: Record<string, string> = {
  'sound-familiar': '/',
  'want-to-try': '/today#want-to-try',
  'what-should-we-eat': '/today#pick-for-me',
  'todays-pick': '/today',
  'near-you': '/log#near-you',
  'from-friends': '/today#from-friends',
  gallery: '/log#gallery',
  receipt: '/receipt',
  'every-meal': '/receipt#every-meal',
  more: '/log',
  'from-the-diary': '/',
  'taste-report': '/taste-report',
  questions: '/support#questions',
};
