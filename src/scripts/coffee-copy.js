(function () {
  var wrap = document.querySelector('[data-copy-wrap]');
  var btn = document.querySelector('[data-copy-upi]');
  var live = document.querySelector('[data-copy-status]');
  if (!wrap || !btn || !btn.dataset.upiId || !live || !navigator.clipboard) return;
  wrap.classList.add('ready');
  var timer;
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(btn.dataset.upiId).then(
      function () {
        live.textContent = 'UPI ID copied';
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
