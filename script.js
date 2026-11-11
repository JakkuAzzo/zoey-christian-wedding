(function () {
  'use strict';
  const entrance = document.getElementById('entrance');
  const open = document.getElementById('open-invitation');
  const skip = document.getElementById('skip-invitation');
  const motionButton = document.getElementById('enable-motion-shine');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let shineFrame = 0, shineX = 50, shineY = 50;
    function updateShine(x, y) {
      shineX = Math.max(0, Math.min(100, x)); shineY = Math.max(0, Math.min(100, y));
      if (shineFrame) return;
      shineFrame = window.requestAnimationFrame(function () {
        entrance.style.setProperty('--shine-x', shineX.toFixed(1) + '%');
        entrance.style.setProperty('--shine-y', shineY.toFixed(1) + '%');
        shineFrame = 0;
      });
    }
    function pointerShine(event) {
      if (!entrance.hidden) updateShine(event.clientX / window.innerWidth * 100, event.clientY / window.innerHeight * 100);
    }
    function tiltShine(event) {
      if (entrance.hidden || event.gamma == null || event.beta == null) return;
      updateShine(50 + event.gamma * 1.1, 50 + (event.beta - 35) * 1.1);
    }
    entrance.addEventListener('pointermove', pointerShine, {passive:true});
    entrance.addEventListener('pointerdown', pointerShine, {passive:true});
    if (typeof window.DeviceOrientationEvent !== 'undefined') {
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        motionButton.hidden = !(navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
        motionButton.addEventListener('click', async function () {
          try {
            const permission = await window.DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') window.addEventListener('deviceorientation', tiltShine, {passive:true});
          } catch (_) { /* Pointer and touch still move the shine. */ }
          motionButton.hidden = true;
        });
      } else {
        window.addEventListener('deviceorientation', tiltShine, {passive:true});
      }
    }
  }

  function finishEntrance() {
    entrance.hidden = true;
    document.body.classList.remove('invitation-closed');
    document.querySelectorAll('header, main, footer').forEach(function (element) { element.inert = false; });
    window.scrollTo({top:0, left:0, behavior:'instant'});
    document.querySelector('main').focus({preventScroll:true});
    window.requestAnimationFrame(setupStoryAnimations);
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
  const countdownSection = document.querySelector('.countdown-transition .countdown');
  function sizeOpening() {
    document.documentElement.style.setProperty('--countdown-height', countdownSection.offsetHeight + 'px');
    document.documentElement.style.setProperty('--opening-header-height', document.querySelector('header').offsetHeight + 'px');
  }
  sizeOpening();
  window.addEventListener('resize', sizeOpening);
  if ('ResizeObserver' in window) new ResizeObserver(sizeOpening).observe(countdownSection);
  const timer = document.getElementById('countdown');
  const floatingCountdown = document.getElementById('floating-countdown');
  function updateCountdown() {
    const values = window.weddingCountdown.remaining(new Date());
    for (const [unit, value] of Object.entries(values)) {
      const formatted = String(value).padStart(2, '0');
      timer.querySelector('[data-unit="' + unit + '"]').textContent = formatted;
      floatingCountdown.querySelector('[data-floating-unit="' + unit + '"]').textContent = formatted;
    }
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
  const calendarDialog = document.getElementById('calendar-dialog');
  document.querySelector('[data-open-calendar]').addEventListener('click', function () { if (typeof calendarDialog.showModal === 'function') calendarDialog.showModal(); });
  calendarDialog.querySelector('.dialog-close').addEventListener('click', function () { calendarDialog.close(); });
  function updateFloatingCountdown() {
    const countdownBounds = countdownSection.getBoundingClientRect();
    const sceneBounds = document.getElementById('our-forever').getBoundingClientRect();
    const covered = sceneBounds.top <= countdownBounds.top + 1 && sceneBounds.bottom >= countdownBounds.bottom - 1;
    const show = entrance.hidden && (covered || countdownBounds.bottom <= 0)
      && !details.classList.contains('is-open') && !dialog.open && !giftDialog.open && !calendarDialog.open;
    floatingCountdown.classList.toggle('is-visible', show);
  }
  window.addEventListener('scroll', updateFloatingCountdown, {passive:true});
  window.addEventListener('resize', updateFloatingCountdown);
  document.addEventListener('wedding-details-opened', updateFloatingCountdown);
  details.querySelector('.details-close').addEventListener('click', updateFloatingCountdown);
  document.querySelectorAll('[data-open-messages], [data-open-gift], [data-open-calendar]').forEach(function (button) { button.addEventListener('click', updateFloatingCountdown); });
  dialog.addEventListener('close', updateFloatingCountdown);
  giftDialog.addEventListener('close', updateFloatingCountdown);
  calendarDialog.addEventListener('close', updateFloatingCountdown);
  updateFloatingCountdown();
  const timeline = document.querySelector('.timeline');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storySchedule = document.querySelector('.story-schedule');
  let storyAnimationsReady = false;
  function setupStoryAnimations() {
    if (storyAnimationsReady || !timeline || !storySchedule || !('IntersectionObserver' in window) || reduceMotion) return;
    storyAnimationsReady = true;
    const story = storySchedule.querySelector('.story');
    const storyItems = Array.from(story.querySelectorAll('.section-heading, .story-copy p'));
    const finalStoryItem = storyItems[storyItems.length - 1];
    let scheduleStarted = false;
    function revealTimeline() {
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
    function startSchedule() {
      if (scheduleStarted) return;
      scheduleStarted = true;
      window.removeEventListener('scroll', checkPassedStory);
      window.setTimeout(function () {
        revealTimeline();
        storySchedule.classList.add('schedule-visible');
      }, 1250);
    }
    function checkPassedStory() {
      if (finalStoryItem.getBoundingClientRect().bottom < 0) {
        storyItems.forEach(function (item) { item.classList.add('is-visible'); });
        storyObserver.disconnect();
        startSchedule();
      }
    }
    const storyObserver = new IntersectionObserver(function (changes) {
      changes.forEach(function (change) {
        if (!change.isIntersecting) return;
        change.target.classList.add('is-visible');
        storyObserver.unobserve(change.target);
        if (change.target === finalStoryItem) startSchedule();
      });
    }, {threshold:0.1});
    storySchedule.classList.add('sequence-ready');
    storyItems.forEach(function (item) { storyObserver.observe(item); });
    window.addEventListener('scroll', checkPassedStory, {passive:true});
    document.querySelectorAll('a[href="#schedule"]').forEach(function (link) {
      link.addEventListener('click', function () {
        storyItems.forEach(function (item) { item.classList.add('is-visible'); });
        storyObserver.disconnect();
        startSchedule();
      }, {once:true});
    });
    checkPassedStory();
  }

  const scene = document.querySelector('.parallax-scene');
  if (scene && !reduceMotion) {
    const art = scene.querySelector('.parallax-art');
    const frame = scene.querySelector('.parallax-frame');
    const people = scene.querySelector('.parallax-people');
    const flowers = scene.querySelectorAll('.parallax-flowers');
    const sparkles = scene.querySelector('.parallax-sparkles');
    const countdown = countdownSection;
    let overlap = 0;
    let scheduled = false;
    function updateParallax() {
      scheduled = false;
      const naturalTop = scene.getBoundingClientRect().top + overlap;
      overlap = Math.max(0, Math.min(window.innerHeight - naturalTop, countdown.offsetHeight));
      scene.style.marginTop = '-' + overlap.toFixed(2) + 'px';
      updateFloatingCountdown();
      const bounds = scene.getBoundingClientRect();
      const distance = Math.max(1, bounds.height + window.innerHeight);
      const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / distance));
      art.style.transform = 'translate3d(0,' + ((progress - 0.5) * 12).toFixed(2) + '%,0) scale(1.15)';
      frame.style.transform = 'translate3d(0,' + ((progress - 0.5) * -24).toFixed(2) + 'px,0)';
      people.style.transform = 'translate3d(-50%,' + ((progress - 0.5) * -14).toFixed(2) + '%,0)';
      sparkles.style.transform = 'translate3d(0,' + ((progress - 0.5) * 30).toFixed(2) + 'px,0)';
      flowers.forEach(function (flower, index) {
        flower.style.translate = '0 ' + ((progress - 0.5) * (index ? -35 : -55)).toFixed(2) + 'px';
      });
    }
    function scheduleParallax() { if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateParallax); } }
    window.addEventListener('scroll', scheduleParallax, {passive:true});
    window.addEventListener('resize', scheduleParallax);
    scheduleParallax();
  }
  const church = document.querySelector('.church-scene');
  if (church && !reduceMotion) {
    const background = church.querySelector('.church-background');
    const people = church.querySelector('.church-people');
    const frame = church.querySelector('.church-frame');
    let scheduled = false;
    function updateChurch() {
      scheduled = false;
      const bounds = church.getBoundingClientRect();
      const panel = details.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (panel.bottom - bounds.top) / Math.max(1, panel.height + bounds.height)));
      background.style.transform = 'translate3d(0,' + ((progress - .5) * 12).toFixed(2) + '%,0) scale(1.1)';
      people.style.transform = 'translate3d(-50%,' + ((progress - .5) * -12).toFixed(2) + '%,0)';
      frame.style.transform = 'translate3d(0,' + ((progress - .5) * -20).toFixed(2) + 'px,0)';
    }
    function scheduleChurch() { if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateChurch); } }
    details.addEventListener('scroll', scheduleChurch, {passive:true});
    document.addEventListener('wedding-details-opened', scheduleChurch);
    window.addEventListener('resize', scheduleChurch);
    scheduleChurch();
  }
})();
