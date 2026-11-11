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
    window.setTimeout(finishEntrance, reduced ? 0 : 1900);
  }, {once:true});
  skip.addEventListener('click', finishEntrance);
  const timer = document.getElementById('countdown');
  function updateCountdown() {
    const values = window.weddingCountdown.remaining(new Date());
    for (const [unit, value] of Object.entries(values)) timer.querySelector('[data-unit="' + unit + '"]').textContent = String(value).padStart(2, '0');
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  const details = document.getElementById('details-panel');
  const dialog = document.getElementById('message-dialog');
  document.querySelectorAll('[data-open-details]').forEach(function (button) {
    button.addEventListener('click', function (event) { event.preventDefault(); details.classList.add('is-open'); details.setAttribute('aria-hidden','false'); details.querySelector('button').focus(); if (button.dataset.detailsTarget) document.getElementById(button.dataset.detailsTarget).scrollIntoView({block:'start'}); else details.scrollTop = 0; document.dispatchEvent(new Event('wedding-details-opened')); });
  });
  details.querySelector('.details-close').addEventListener('click', function () { details.classList.remove('is-open'); details.setAttribute('aria-hidden','true'); document.querySelector('.details-trigger').focus(); });
  document.querySelectorAll('[data-open-messages]').forEach(function (button) {
    button.addEventListener('click', function (event) { event.preventDefault(); if (typeof dialog.showModal === 'function') dialog.showModal(); });
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && details.classList.contains('is-open')) details.querySelector('.details-close').click(); });
  dialog.querySelector('.dialog-close').addEventListener('click', function () { dialog.close(); });
})();
