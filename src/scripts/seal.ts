// The hero's sealed mushroom (src/components/landing/HeroSeal.astro). An
// enhancement: without it the lid is open and the tags are plain links.
// Tap or click toggles; a mouse hovering the seal opens it and leaving the
// whole seal-and-tags area closes it (unless focus is inside); Escape
// closes and returns focus to the seal. State lives in data-open and
// aria-expanded; CSS does all the motion.

const root = document.querySelector<HTMLElement>('[data-seal]');
const btn = root?.querySelector<HTMLButtonElement>('[data-seal-btn]');

if (root && btn) {
  let leaveTimer = 0;
  // A mouse opens the seal on hover; a click that follows straight after must
  // not snap it shut again, so a click within this window keeps it open.
  let hoverOpenedAt = -Infinity;
  const set = (open: boolean) => {
    window.clearTimeout(leaveTimer);
    root.toggleAttribute('data-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  const isOpen = () => root.hasAttribute('data-open');

  btn.addEventListener('click', () => {
    if (isOpen() && performance.now() - hoverOpenedAt < 1200) return;
    set(!isOpen());
  });

  btn.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || isOpen()) return;
    hoverOpenedAt = performance.now();
    set(true);
  });
  // Hover opens from the seal itself; moving up onto the tags keeps it open.
  root.addEventListener('pointerenter', () => window.clearTimeout(leaveTimer));
  root.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' || !isOpen()) return;
    // A short grace period, so a quick dip outside does not slam the lid.
    leaveTimer = window.setTimeout(() => {
      if (!root.contains(document.activeElement)) set(false);
    }, 350);
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      set(false);
      btn.focus();
    }
  });

  root.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !root.contains(next)) set(false);
  });
}

export {};
