// WCAG contrast for the token pairs the site uses for text, in both themes.
// Values mirror src/styles/tokens.css (keep in step when a token changes). Usage: node scripts/check-contrast.mjs
const T = {
  light: {
    bg: '#F4EFE6',
    surface: '#FBF8F2',
    raised: '#FFFDF9',
    text: '#1F1B16',
    muted: '#665E53',
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
    primaryInk: '#E5715A',
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
// The paper pattern (v1.10): muted ink at --pattern-opacity over bg. Text on it is checked
// against the composite, the worst case where a glyph sits under the text.
const PATTERN_OPACITY = 0.1;
const mix = (fg, bg, a) =>
  '#' +
  [1, 3, 5]
    .map((i) => {
      const v = Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(bg.slice(i, i + 2), 16) * (1 - a));
      return v.toString(16).padStart(2, '0');
    })
    .join('');
// The page-wide doodle layer (body::before): muted ink at --doodle-opacity over bg, same worst case.
const DOODLE_OPACITY = { light: 0.08, dark: 0.14 };
for (const [scheme, t] of Object.entries(T)) {
  t.bgPattern = mix(t.muted, t.bg, PATTERN_OPACITY);
  t.bgDoodle = mix(t.muted, t.bg, DOODLE_OPACITY[scheme]);
}
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
  ['text', 'bgPattern', 4.5, 'Today’s pick name and reason on the paper pattern'],
  ['muted', 'bgPattern', 4.5, 'Today’s pick meta on the paper pattern'],
  ['primaryInk', 'bgPattern', 4.5, 'Today’s pick "Not today" on the paper pattern'],
  ['primary', 'bgPattern', 3, 'Today’s pick stamp rule on the paper pattern'],
  ['text', 'bgDoodle', 4.5, 'body text over a doodle'],
  ['muted', 'bgDoodle', 4.5, 'secondary text over a doodle'],
  ['primaryInk', 'bgDoodle', 4.5, 'kickers and links over a doodle'],
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
