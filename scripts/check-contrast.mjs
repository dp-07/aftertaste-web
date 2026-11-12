// WCAG contrast for the token pairs the site uses for text, in both themes.
// Values mirror src/styles/tokens.css (keep in step when a token changes). Usage: node scripts/check-contrast.mjs
const T = {
  light: {
    bg: '#F4EFE6',
    surface: '#FBF8F2',
    raised: '#FFFDF9',
    text: '#1F1B16',
    muted: '#6B6257',
    primary: '#C2412D',
    onPrimary: '#FFF8F0',
    primarySoft: '#F3DED6',
    herb: '#5E7F3A',
    herbSoft: '#E4EAD6',
    paper: '#FFFDF8',
    paperMeta: '#5E5548',
    brown: '#8A5A3B',
    mustardSoft: '#EEDFC0',
    primaryInk: '#A8361F',
    btnBg: '#C2412D',
    btnBgHover: '#A8361F',
    herbInk: '#4E6B2F',
    stampPaper: '#FFFDF9',
    todoInk: '#A8361F',
  },
  dark: {
    bg: '#16130F',
    surface: '#1F1B16',
    raised: '#29241E',
    text: '#F4EFE6',
    muted: '#B3A999',
    primary: '#E0573D',
    onPrimary: '#FFF8F0',
    primarySoft: '#3A2219',
    herb: '#8DAA5E',
    herbSoft: '#26301C',
    paper: '#FFFDF8',
    paperMeta: '#5E5548',
    brown: '#B98A63',
    mustardSoft: '#463B22',
    primaryInk: '#E0573D',
    btnBg: '#A8361F',
    btnBgHover: '#C2412D',
    herbInk: '#8DAA5E',
    stampPaper: '#1F1B16',
    todoInk: '#F4EFE6',
  },
};
const lum = (hex) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
// [fg, bg, min, use]
const PAIRS = [
  ['text', 'bg', 4.5, 'body text'],
  ['muted', 'bg', 4.5, 'secondary text'],
  ['muted', 'surface', 4.5, 'secondary text on cards'],
  ['text', 'surface', 4.5, 'card text'],
  ['primaryInk', 'bg', 4.5, 'kickers, section numbers, link hover'],
  ['primaryInk', 'surface', 4.5, 'labels on cards'],
  ['onPrimary', 'btnBg', 4.5, 'primary button label'],
  ['onPrimary', 'btnBgHover', 4.5, 'primary button label, hover'],
  ['todoInk', 'primarySoft', 4.5, 'legal to-do tag'],
  ['text', 'primarySoft', 4.5, 'draft banner, to-do text'],
  ['herbInk', 'herbSoft', 4.5, 'On your list chip'],
  ['herb', 'stampPaper', 4.5, 'TRIED stamp'],
  ['primary', 'stampPaper', 4.5, 'verdict stamp'],
  ['paperMeta', 'paper', 4.5, 'receipt meta'],
  ['primary', 'primarySoft', 3, 'tonal icons; large initials'],
  ['herbInk', 'herbSoft', 3, 'large initials'],
  ['brown', 'mustardSoft', 3, 'large initials'],
  ['primary', 'bg', 3, 'focus ring, icons (non-text)'],
  ['primary', 'bg', 3, 'large numerals'],
];
let fail = 0;
for (const [scheme, t] of Object.entries(T)) {
  for (const [fg, bg, min, use] of PAIRS) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`${ok ? '✓' : '✗'} ${scheme.padEnd(5)} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min}) — ${use}`);
  }
}
process.exit(fail ? 1 : 0);
