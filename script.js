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
  const giftDialog = document.getElementById('gift-dialog');
  document.querySelectorAll('[data-open-gift]').forEach(function (button) { button.addEventListener('click', function () { if (typeof giftDialog.showModal === 'function') giftDialog.showModal(); }); });
  giftDialog.querySelector('.dialog-close').addEventListener('click', function () { giftDialog.close(); });
  const timeline = document.querySelector('.timeline');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (timeline && 'IntersectionObserver' in window && !reduceMotion) {
    const entries = timeline.querySelectorAll('article');
    const observer = new IntersectionObserver(function (changes) {
      changes.forEach(function (change) {
        if (change.isIntersecting) {
          change.target.classList.add('is-visible');
          observer.unobserve(change.target);
        }
      });
    }, {threshold:0.15});
    entries.forEach(function (entry, index) {
      entry.style.setProperty('--reveal-delay', (index % 4 * 100) + 'ms');
      observer.observe(entry);
    });
    timeline.classList.add('reveal-ready');
  }
  const scene = document.querySelector('.parallax-scene');
  if (scene && !reduceMotion) {
    const art = scene.querySelector('.parallax-art');
    const frame = scene.querySelector('.parallax-frame');
    let scheduled = false;
    function updateParallax() {
      scheduled = false;
      const bounds = scene.getBoundingClientRect();
      const distance = Math.max(1, bounds.height + window.innerHeight);
      const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / distance));
      art.style.transform = 'translate3d(0,' + ((progress - 0.5) * 12).toFixed(2) + '%,0) scale(1.15)';
      frame.style.transform = 'translate3d(0,' + ((progress - 0.5) * -24).toFixed(2) + 'px,0)';
    }
    function scheduleParallax() { if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateParallax); } }
    window.addEventListener('scroll', scheduleParallax, {passive:true});
    window.addEventListener('resize', scheduleParallax);
    scheduleParallax();
  }
})();
