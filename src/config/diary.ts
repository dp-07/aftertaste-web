/**
 * "From the diary": dishes from our own diary, shown as stamped cards on the
 * landing page (src/components/landing/FromTheDiary.astro).
 *
 * TODO(diary): every entry below is a placeholder (`sample: true`). Replace
 * them with real logs and photos: put each photo in src/assets/diary/ (JPEG,
 * PNG, WebP or AVIF, at least 640 px wide, no faces or personal details),
 * set `photo` to its file name and write `alt` describing the plate, then
 * remove `sample`. While any entry is a sample the section says so. Steps:
 * docs/DEV-GUIDE.md "Add diary photos".
 */
export interface DiaryEntry {
  dish: string;
  place: string;
  city: string;
  /** Taste rating, 1–5. */
  rating: number;
  /** One line, in the diary's voice. */
  note: string;
  /** Short date as logged, e.g. "3 Nov". */
  date: string;
  /** The verdict stamp on the card, if any. */
  stamp?: 'mustTry' | 'tried';
  /** File name in src/assets/diary/; without it the card shows a food glyph. */
  photo?: string;
  /** Required with `photo`: what is on the plate. */
  alt?: string;
  /** Food glyph standing in for a photo. */
  kind: 'mushroom' | 'sprout' | 'noodle' | 'cinnamon';
  /** Placeholder entry, not from the real diary. */
  sample?: boolean;
}

export const diary: DiaryEntry[] = [
  {
    dish: 'Jhol momo',
    place: 'Hill Road Momos',
    city: 'Dehradun',
    rating: 5,
    note: 'The broth is the point. Ask for extra chutney.',
    date: '3 Nov',
    stamp: 'mustTry',
    kind: 'mushroom',
    sample: true,
  },
  {
    dish: 'Cutting chai',
    place: 'Clock Tower Tea Stall',
    city: 'Dehradun',
    rating: 4,
    note: 'Strong, sweet, ₹20. Every single morning.',
    date: '5 Nov',
    stamp: 'tried',
    kind: 'sprout',
    sample: true,
  },
  {
    dish: 'Thukpa',
    place: 'Saffron & Salt',
    city: 'Mussoorie',
    rating: 3,
    note: 'Good, not great. The momos next door win.',
    date: '7 Nov',
    kind: 'noodle',
    sample: true,
  },
  {
    dish: 'Besan ladoo',
    place: 'Little Ladoo Bakery',
    city: 'Dehradun',
    rating: 5,
    note: 'Buy a box. Do not share the box.',
    date: '9 Nov',
    stamp: 'mustTry',
    kind: 'cinnamon',
    sample: true,
  },
  {
    dish: 'Aloo paratha',
    place: 'Banyan Tree Dhaba',
    city: 'Rishikesh',
    rating: 4,
    note: 'Worth the drive for the white butter alone.',
    date: '10 Nov',
    stamp: 'tried',
    kind: 'sprout',
    sample: true,
  },
  {
    dish: 'Cinnamon roll',
    place: 'Mosaic Café',
    city: 'Dehradun',
    rating: 4,
    note: 'Warm by 9 am, gone by 11.',
    date: '12 Nov',
    kind: 'cinnamon',
    sample: true,
  },
];
