(function () {
  var wrap = document.querySelector('[data-copy-wrap]');
  var btn = document.querySelector('[data-copy-upi]');
  var id = document.querySelector('[data-upi-id]');
  var live = document.querySelector('[data-copy-status]');
  if (!wrap || !btn || !id || !live || !navigator.clipboard) return;
  wrap.classList.add('ready');
  var timer;
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(id.textContent.trim()).then(
      function () {
        live.textContent = 'UPI ID copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          live.textContent = '';
        }, 4000);
      },
      function () {
        live.textContent = 'Could not copy. Select the UPI ID and copy it.';
      },
    );
  });
})();
