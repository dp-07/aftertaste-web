// Landing-page behaviour. Everything here is an enhancement: without it the
// page shows every stamp, the receipt and a sample pick, statically.

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

/** Stamps marked data-press are pressed once, when half visible. */
function pressStamps() {
  const stamps = document.querySelectorAll<HTMLElement>('[data-press]');
  if (!('IntersectionObserver' in window)) {
    stamps.forEach((s) => s.classList.add('is-pressed'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-pressed');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.5 },
  );
  stamps.forEach((s) => io.observe(s));
}

/** The receipt prints over time where scroll-driven printing does not apply. */
function printReceipt() {
  const printer = document.querySelector<HTMLElement>('[data-printer]');
  if (!printer) return;
  const scrollDriven =
    CSS.supports('animation-timeline: view()') &&
    matchMedia('(prefers-reduced-motion: no-preference) and (width >= 48rem) and (height >= 46rem)').matches;
  if (scrollDriven || reduced.matches || !('IntersectionObserver' in window)) return;
  printer.dataset.mode = 'time';
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e?.isIntersecting) return;
      printer.classList.add('is-printing');
      io.disconnect();
    },
    { threshold: 0.35 },
  );
  io.observe(printer);
}

interface Sample {
  name: string;
  meta: string;
  reason: string;
  kind: string;
}

/** "What should we eat?" demo: a random sample that is never the last one. */
function decisionDemo() {
  const root = document.querySelector<HTMLElement>('[data-decision]');
  if (!root) return;
  const samples = JSON.parse(root.dataset.samples ?? '[]') as Sample[];
  const pick = root.querySelector<HTMLElement>('[data-pick]');
  const button = root.querySelector<HTMLButtonElement>('[data-pick-btn]');
  const label = root.querySelector<HTMLElement>('[data-pick-label]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  const field = (name: string) => root.querySelector<HTMLElement>(`[data-${name}]`);
  if (!pick || !button || !label || !status || samples.length < 2) return;

  let last = -1;
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-busy') === 'true') return;
    let i = Math.floor(Math.random() * (samples.length - 1));
    if (i >= last) i += 1;
    if (last === -1) i = Math.floor(Math.random() * samples.length);
    last = i;
    const s = samples[i]!;

    const show = () => {
      field('name')!.textContent = s.name;
      field('meta')!.textContent = s.meta;
      field('reason')!.textContent = s.reason;
      pick.dataset.kind = s.kind;
      root.classList.add('has-pick');
      pick.classList.remove('is-revealing');
      void pick.offsetWidth; // restart the reveal
      pick.classList.add('is-revealing');
      button.removeAttribute('aria-busy');
      label.textContent = 'Pick another';
      status.textContent = `Tonight: ${s.name}. ${s.meta}. ${s.reason}.`;
    };

    if (reduced.matches) return show();
    button.setAttribute('aria-busy', 'true');
    label.textContent = 'Picking…';
    window.setTimeout(show, 480);
  });
}

pressStamps();
printReceipt();
decisionDemo();
