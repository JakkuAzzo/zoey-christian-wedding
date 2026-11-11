(function () {
  'use strict';
  const entrance = document.getElementById('entrance');
  const open = document.getElementById('open-invitation');
  const skip = document.getElementById('skip-invitation');
  function finishEntrance() {
    entrance.hidden = true;
    document.body.classList.remove('invitation-closed');
    document.querySelectorAll('header, main, footer').forEach(function (element) { element.inert = false; });
    document.querySelector('main').focus({preventScroll:true});
  }
  document.querySelector('main').setAttribute('tabindex', '-1');
  document.body.classList.add('invitation-closed');
  document.querySelectorAll('header, main, footer').forEach(function (element) { element.inert = true; });
  open.focus();
  open.addEventListener('click', function () {
    entrance.classList.add('opening');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(finishEntrance, reduced ? 0 : 850);
  }, {once:true});
  skip.addEventListener('click', finishEntrance);
  const timer = document.getElementById('countdown');
  function updateCountdown() {
    const values = window.weddingCountdown.remaining(new Date());
    for (const [unit, value] of Object.entries(values)) timer.querySelector('[data-unit="' + unit + '"]').textContent = String(value).padStart(2, '0');
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
})();
