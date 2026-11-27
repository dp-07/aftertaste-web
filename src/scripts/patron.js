(function () {
  var stamp = document.querySelector('[data-thanks]');
  var options = document.querySelectorAll('[data-support]');
  var wrap = document.querySelector('[data-copy-wrap]');
  var btn = document.querySelector('[data-copy-upi]');
  var live = document.querySelector('[data-copy-status]');
  var timer;

  // The thank-you stamp: shown (and pressed, unless reduced motion) after any option is tapped.
  function thank() {
    if (!stamp) return;
    stamp.hidden = false;
    var s = stamp.querySelector('.stamp');
    if (!s) return;
    s.classList.remove('is-pressed');
    void s.offsetWidth;
    s.classList.add('is-pressed');
  }
  for (var i = 0; i < options.length; i++) options[i].addEventListener('click', thank);

  if (!wrap || !btn || !btn.dataset.upiId || !live || !navigator.clipboard) return;
  wrap.classList.add('ready');
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(btn.dataset.upiId).then(
      function () {
        live.textContent = 'UPI ID copied';
        thank();
        clearTimeout(timer);
        timer = setTimeout(function () {
          live.textContent = '';
        }, 4000);
      },
      function () {
        live.textContent = 'Could not copy. Please try again.';
      },
    );
  });
})();
