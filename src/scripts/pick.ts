// Today's pick replica (src/components/app/TodaysPickCard.astro). An
// enhancement: without it the first sample place shows, its photos still swipe
// (scroll-snap), and the "Another pick" button is hidden.
// - The page indicator follows the photo in view.
// - "Another pick" moves to the next sample place, fades it in (opacity only)
//   and announces the new name politely.

for (const card of document.querySelectorAll<HTMLElement>('[data-pick-card]')) {
  const picks = [...card.querySelectorAll<HTMLElement>('[data-pick-panel]')];
  const status = card.querySelector<HTMLElement>('[data-pick-status]');
  let current = 0;

  for (const pick of picks) {
    const track = pick.querySelector<HTMLElement>('[data-track]');
    const dots = [...pick.querySelectorAll<HTMLElement>('[data-dot]')];
    if (!track || dots.length === 0) continue;
    let frame = 0;
    track.addEventListener(
      'scroll',
      () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
          dots.forEach((d, n) => d.classList.toggle('on', n === i));
        });
      },
      { passive: true },
    );
  }

  card.querySelector<HTMLButtonElement>('[data-another]')?.addEventListener('click', () => {
    const from = picks[current]!;
    current = (current + 1) % picks.length;
    const to = picks[current]!;
    from.hidden = true;
    from.querySelector<HTMLElement>('[data-track]')?.setAttribute('tabindex', '-1');
    to.hidden = false;
    const track = to.querySelector<HTMLElement>('[data-track]');
    track?.setAttribute('tabindex', '0');
    if (track) track.scrollLeft = 0;
    to.classList.remove('is-entering');
    void to.offsetWidth;
    to.classList.add('is-entering');
    const name = to.querySelector('[data-pick-name]')?.textContent?.trim() ?? '';
    if (status) status.textContent = `Another pick: ${name}`;
  });
}

export {};
