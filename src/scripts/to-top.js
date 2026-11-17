(function () {
  var btn = document.querySelector('[data-to-top]');
  if (!btn) return;
  var shown = false;
  function update() {
    var next = window.scrollY > window.innerHeight * 0.6;
    if (next === shown) return;
    shown = next;
    btn.toggleAttribute('data-show', next);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
  btn.addEventListener('click', function () {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  });
})();
