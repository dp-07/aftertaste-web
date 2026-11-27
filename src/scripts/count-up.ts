// Taste report replica (src/components/app/TasteReportMock.astro): its numbers
// count up from zero the first time the card is half in view. An enhancement:
// the markup already holds the final values, which stay put without
// JavaScript, with reduced motion, or without IntersectionObserver. The
// numbers are aria-hidden; each tile carries its sentence for screen readers.
// Each number is a grid item as wide as its tile, on one line, so counting never
// moves anything.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const roots = document.querySelectorAll<HTMLElement>('[data-count-root]');

const format = (n: number, decimals: number, prefix: string) =>
  `${prefix}${n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

function run(root: HTMLElement) {
  const els = [...root.querySelectorAll<HTMLElement>('[data-count]')];
  const DURATION = 900;
  const start = performance.now();
  const targets = els.map((el) => ({
    el,
    to: Number(el.dataset.count),
    decimals: Number(el.dataset.decimals || 0),
    prefix: el.dataset.prefix ?? '',
  }));
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / DURATION);
    const eased = 1 - Math.pow(1 - p, 3);
    for (const t of targets) t.el.textContent = format(t.to * eased, t.decimals, t.prefix);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        run(e.target as HTMLElement);
      }
    },
    { threshold: 0.5 },
  );
  roots.forEach((r) => io.observe(r));
}

export {};
