(function () {
  var stamp = document.querySelector('[data-thanks]');
  var options = document.querySelectorAll('[data-support]');
  var wrap = document.querySelector('[data-copy-wrap]');
  var btn = document.querySelector('[data-copy-upi]');
  var live = document.querySelector('[data-copy-status]');
  var sheet = document.querySelector('[data-bmc-dialog]');
  var bondin = null;
  var bondinLoading = false;
  var timer;

  // The thank-you stamp: shown (and pressed, unless reduced motion) after a support option is used.
  function thank() {
    if (!stamp) return;
    stamp.hidden = false;
    var s = stamp.querySelector('.stamp');
    if (!s) return;
    s.classList.remove('is-pressed');
    void s.offsetWidth;
    s.classList.add('is-pressed');
  }

  // Buy Me a Coffee: its widget page in our own dialog, set up on the first tap only.
  function openSheet() {
    var frame = sheet.querySelector('iframe');
    if (!frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-src'));
    sheet.showModal();
  }
  if (sheet && typeof sheet.showModal === 'function') {
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) sheet.close();
    });
    sheet.querySelector('[data-bmc-close]').addEventListener('click', function () {
      sheet.close();
    });
    sheet.addEventListener('close', thank);
  }

  // Bondin: its script is loaded only now, then its modal checkout opens from our own button.
  function openBondin(link) {
    function show() {
      bondinLoading = false;
      if (!bondin) {
        bondin = document.createElement('bondin-support');
        bondin.setAttribute('username', link.getAttribute('data-bondin-user'));
        bondin.hidden = true;
        bondin.addEventListener('bondin:close', function () {
          link.focus();
          thank();
        });
        document.body.appendChild(bondin);
      }
      bondin.open();
    }
    if (window.customElements.get('bondin-support')) return show();
    if (bondinLoading) return;
    bondinLoading = true;
    var script = document.createElement('script');
    script.src = link.getAttribute('data-bondin-script');
    script.async = true;
    script.onload = show;
    script.onerror = function () {
      bondinLoading = false;
      window.location.assign(link.href); // the plain link is the fallback
    };
    document.head.appendChild(script);
  }

  function onTap(link) {
    return function (e) {
      var plain = e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      var kind = link.getAttribute('data-embed');
      if (!plain && kind === 'bmc' && sheet && typeof sheet.showModal === 'function') {
        e.preventDefault();
        openSheet();
      } else if (!plain && kind === 'bondin' && window.customElements) {
        e.preventDefault();
        openBondin(link);
      } else {
        thank();
      }
    };
  }
  for (var i = 0; i < options.length; i++) options[i].addEventListener('click', onTap(options[i]));

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
