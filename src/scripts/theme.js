(function () {
  var d = document.documentElement;
  var KEY = 'aftertaste-theme';
  var BANNER_KEY = 'aftertaste-beta-banner';
  var COLORS = { light: '#F4EFE6', dark: '#16130F' };
  var pref = 'system';
  try {
    pref = localStorage.getItem(KEY) || 'system';
    // A dismissed beta banner is hidden before first paint, so nothing shifts.
    if (localStorage.getItem(BANNER_KEY) === 'dismissed') d.classList.add('banner-off');
  } catch {
    // Storage blocked: follow the system and show the banner.
  }
  var mq = matchMedia('(prefers-color-scheme: dark)');
  function apply(v) {
    pref = v === 'light' || v === 'dark' ? v : 'system';
    if (pref === 'system') d.removeAttribute('data-theme');
    else d.setAttribute('data-theme', pref);
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var own = metas[i].getAttribute('data-scheme');
      metas[i].setAttribute('content', COLORS[pref === 'system' ? own : pref]);
    }
    var btns = document.querySelectorAll('[data-theme-set]');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('aria-pressed', String(btns[j].getAttribute('data-theme-set') === pref));
    }
  }
  apply(pref);
  mq.addEventListener('change', function () {
    if (pref === 'system') apply('system');
  });
  document.addEventListener('click', function (e) {
    var t = e.target instanceof Element ? e.target : null;
    if (t && t.closest('[data-banner-dismiss]')) {
      try {
        localStorage.setItem(BANNER_KEY, 'dismissed');
      } catch {
        // Storage blocked: dismissed for this page only.
      }
      d.classList.add('banner-off');
      // The focused button is gone: continue from the start of the page content.
      var main = document.getElementById('main');
      if (main) main.focus({ preventScroll: true });
      return;
    }
    var b = t ? t.closest('[data-theme-set]') : null;
    if (!b) return;
    var v = b.getAttribute('data-theme-set');
    try {
      if (v === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, v);
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
    apply(v);
  });
  document.addEventListener('DOMContentLoaded', function () {
    apply(pref);
  });
  d.classList.add('js');
})();
