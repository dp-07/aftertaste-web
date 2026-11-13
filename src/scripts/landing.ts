// Landing-page behaviour. Everything here is an enhancement: without it the
// page shows every stamp, the receipt and a sample pick, statically.

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

/** Stamps marked data-press are pressed once, when half visible (data-press="manual" ones are pressed by their owner). */
function pressStamps() {
  const stamps = document.querySelectorAll<HTMLElement>('[data-press]:not([data-press="manual"])');
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

type JoinOutcome = 'ok' | 'invalid' | 'limited' | 'error';

/**
 * "Save your seat": submits in the background and shows the ticket at once
 * (optimistic); the stamp presses when the server confirms, otherwise the
 * form returns with the message. Native validation runs first.
 */
function joinBeta() {
  const card = document.querySelector<HTMLElement>('[data-join]');
  const form = card?.querySelector<HTMLFormElement>('[data-join-form]');
  const q = <T extends HTMLElement>(sel: string) => card?.querySelector<T>(sel) ?? null;
  const ticket = q('[data-join-ticket]');
  const title = q('[data-join-title]');
  const body = q('[data-join-body]');
  const live = q('[data-join-live]');
  const elapsed = q<HTMLInputElement>('[data-join-elapsed]');
  const email = q<HTMLInputElement>('#join-email');
  const stamp = ticket?.querySelector<HTMLElement>('[data-press]');
  if (!card || !form || !ticket || !title || !body || !live || !elapsed || !email || !stamp) return;

  // The server ignores sign-ups sent faster than a person could (2.5 s after
  // load); a quick human is held back instead of being dropped.
  const started = performance.now();
  const MIN_MS = 2600;

  // Arrived from a no-JS submission (or a reload of one): the ticket is shown by :target.
  if (location.hash === '#joined') stamp.classList.add('is-pressed');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (card.dataset.state === 'saving') return;
    const address = email.value.trim();
    // Drop any #join-* fragment from a no-JS attempt so :target cannot contradict the state.
    if (location.hash.startsWith('#join')) history.replaceState(null, '', location.pathname + location.search);

    card.dataset.state = 'saving';
    stamp.classList.remove('is-pressed');
    title.textContent = 'Saving your seat…';
    body.textContent = `Writing ${address} into the book.`;
    ticket.focus();
    live.textContent = 'Saving your seat…';

    const wait = MIN_MS - (performance.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    elapsed.disabled = false;
    elapsed.value = String(Math.round(performance.now() - started));
    const data = new URLSearchParams();
    for (const [k, v] of new FormData(form)) if (typeof v === 'string') data.append(k, v);
    elapsed.disabled = true;

    let outcome: JoinOutcome = 'error';
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) outcome = 'ok';
      else if (json.error === 'invalid' || json.error === 'limited') outcome = json.error;
    } catch {
      // Offline or an unexpected response: the generic error.
    }

    if (outcome === 'ok') {
      card.dataset.state = 'saved';
      title.textContent = 'You’re on the list.';
      body.textContent = `We’ll email ${address} when there’s a seat for you.`;
      stamp.classList.add('is-pressed');
      live.textContent = `You’re on the list. We’ll email ${address} when there’s a seat for you.`;
      form.reset();
      email.removeAttribute('aria-invalid');
      return;
    }

    card.dataset.state = outcome;
    const note = q(`#join-${outcome}`);
    live.textContent = note?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    if (outcome === 'invalid') {
      email.setAttribute('aria-invalid', 'true');
      email.setAttribute('aria-describedby', 'join-invalid');
      email.focus();
    } else {
      note?.focus();
    }
  });
}

pressStamps();
printReceipt();
decisionDemo();
joinBeta();
