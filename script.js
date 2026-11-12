(function () {
  'use strict';
  const entrance = document.getElementById('entrance');
  const open = document.getElementById('open-invitation');
  const skip = document.getElementById('skip-invitation');
  const motionButton = document.getElementById('enable-motion-shine');
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
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
    let neutralTilt = null, requestingMotion = false;
    function tiltShine(event) {
      if (entrance.hidden || event.gamma == null || event.beta == null) return;
      if (!neutralTilt) neutralTilt = {gamma:event.gamma, beta:event.beta};
      const horizontal = event.gamma - neutralTilt.gamma;
      const vertical = event.beta - neutralTilt.beta;
      const angle = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * Math.PI / 180;
      updateShine(50 + (horizontal * Math.cos(angle) + vertical * Math.sin(angle)) * 2,
        50 + (vertical * Math.cos(angle) - horizontal * Math.sin(angle)) * 2);
      motionButton.hidden = true;
    }
    entrance.addEventListener('pointermove', pointerShine, {passive:true});
    entrance.addEventListener('pointerdown', pointerShine, {passive:true});
    if (typeof window.DeviceOrientationEvent !== 'undefined') {
      // On browsers with permission already granted, sensor events can start immediately.
      window.addEventListener('deviceorientation', tiltShine, {passive:true});
      window.addEventListener('orientationchange', function () { neutralTilt = null; });
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        const touchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        motionButton.hidden = !touchDevice;
        async function requestMotion() {
          if (requestingMotion || entrance.hidden) return;
          requestingMotion = true;
          try {
            const permission = await window.DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') { neutralTilt = null; motionButton.hidden = true; }
            else { motionButton.textContent = 'Motion access unavailable'; motionButton.disabled = true; }
          } catch (_) { motionButton.textContent = 'Motion access unavailable'; motionButton.disabled = true; }
          finally { requestingMotion = false; }
        }
        motionButton.addEventListener('click', requestMotion);
        entrance.addEventListener('click', function (event) {
          if (touchDevice && !motionButton.hidden && !motionButton.disabled && !event.target.closest('button, a')) requestMotion();
        }, {once:true});
      }
    }
  }

  let liftTimer, finishTimer, dissolveTimer;
  function finishEntrance() {
    if (entrance.hidden) return;
    window.clearTimeout(liftTimer); window.clearTimeout(dissolveTimer); window.clearTimeout(finishTimer);
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
  const entranceImages = ['invitation-scene-untied.png', 'invitation-scene-open.png', 'invitation-ribbon-photo.png', 'invitation-card-photo.png'].map(function (name) {
    const image = new Image();
    image.src = 'assets/' + name;
    return image;
  });
  const entranceImagesReady = Promise.all(entranceImages.map(function (image) {
    return image.decode ? image.decode().catch(function () {}) : Promise.resolve();
  }));
  open.addEventListener('click', async function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { finishEntrance(); return; }
    const prompt = entrance.querySelector('.entrance-prompt');
    prompt.textContent = 'Preparing your invitation…';
    await entranceImagesReady;
    if (entrance.hidden) return;
    entrance.classList.add('opening');
    window.scrollTo({top:0, left:0, behavior:'instant'});
    liftTimer = window.setTimeout(function () {
      if (entrance.hidden) return;
      const letter = open.querySelector('.invitation-letter');
      const bounds = letter.getBoundingClientRect();
      const card = letter.cloneNode(true);
      card.classList.add('opening-card');
      const dx = bounds.left + bounds.width / 2 - window.innerWidth / 2;
      const dy = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const sx = bounds.width / window.innerWidth;
      const sy = bounds.height / window.innerHeight;
      const drop = Math.min(80, window.innerHeight * 0.1);
      const start = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
      const lowered = 'translate(' + dx + 'px,' + (dy + drop) + 'px) scale(' + (sx * 1.1) + ',' + (sy * 1.1) + ')';
      card.style.transform = start;
      entrance.append(card);
      entrance.classList.add('card-lifted');
      if (typeof card.animate === 'function') {
        card.animate([{transform:start,offset:0,easing:'cubic-bezier(.33,0,.67,1)'},{transform:lowered,offset:0.3,easing:'cubic-bezier(.33,0,.2,1)'},{transform:'translate(0,0) scale(1,1)',offset:1}],
          {duration:2000,fill:'forwards'});
      } else {
        card.style.transition = 'transform 2s cubic-bezier(.42,0,.25,1)';
        window.requestAnimationFrame(function () { card.style.transform = 'translate(0,0) scale(1,1)'; });
      }
      dissolveTimer = window.setTimeout(function () {
        document.body.classList.remove('invitation-closed');
        entrance.classList.add('is-leaving');
      }, 1950);
    }, 1600);
    finishTimer = window.setTimeout(finishEntrance, 3950);
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
    const storyItems = Array.from(story.querySelectorAll('.section-heading, .story-copy > p'));
    const storyObserver = new IntersectionObserver(function (changes) {
      changes.forEach(function (change) {
        if (!change.isIntersecting) return;
        change.target.classList.add('is-visible');
        storyObserver.unobserve(change.target);
      });
    }, {threshold:0.1});
    const timelineObserver = new IntersectionObserver(function (changes) {
      changes.forEach(function (change) {
        if (!change.isIntersecting) return;
        change.target.classList.add('is-visible');
        timelineObserver.unobserve(change.target);
      });
    }, {threshold:0.15});
    storySchedule.classList.add('sequence-ready');
    storyItems.forEach(function (item) { storyObserver.observe(item); });
    timeline.querySelectorAll('article').forEach(function (entry) { timelineObserver.observe(entry); });
    timeline.classList.add('reveal-ready');
  }

  const scene = document.querySelector('.parallax-scene');
  let scheduleSticky = function () {};
  if (scene) {
    const sticky = document.createElement('div');
    sticky.className = 'sticky-scene';
    sticky.setAttribute('aria-hidden', 'true');
    sticky.hidden = true;
    sticky.append(scene.querySelector('.parallax-stage').cloneNode(true));
    document.body.append(sticky);
    let stickyScheduled = false;
    function updateStickyScene() {
      stickyScheduled = false;
      const bounds = scene.getBoundingClientRect();
      const hiddenByPanel = details.classList.contains('is-open') || dialog.open || giftDialog.open || calendarDialog.open;
      const compactHeight = window.innerWidth <= 700 ? 56 : 64;
      const visible = entrance.hidden && (reduceMotion ? bounds.bottom <= compactHeight : bounds.top <= 0) && !hiddenByPanel;
      sticky.hidden = !visible;
      scene.classList.toggle('is-replaced', visible);
      if (!visible) return;
      const distance = Math.max(1, bounds.height - compactHeight);
      const progress = reduceMotion ? 1 : Math.min(1, Math.max(0, -bounds.top / distance));
      sticky.style.height = (bounds.height + (compactHeight - bounds.height) * progress).toFixed(2) + 'px';
      if (!reduceMotion) {
        ['.parallax-art', '.parallax-sparkles', '.parallax-people', '.parallax-frame', '.parallax-flowers-left', '.parallax-flowers-right'].forEach(function (selector) {
          sticky.querySelector(selector).style.cssText = scene.querySelector(selector).style.cssText;
        });
        // Settle the moving foreground into the smaller frame rather than clipping it.
        const remaining = 1 - progress;
        const sceneProgress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / Math.max(1, bounds.height + window.innerHeight)));
        sticky.querySelector('.parallax-frame').style.transform = 'translate3d(0,' + ((sceneProgress - 0.5) * -24 * remaining).toFixed(2) + 'px,0)';
        sticky.querySelector('.parallax-people').style.transform = 'translate3d(-50%,' + ((sceneProgress - 0.5) * -14 * remaining).toFixed(2) + '%,0)';
        sticky.querySelectorAll('.parallax-flowers').forEach(function (flower, index) {
          flower.style.translate = '0 ' + ((sceneProgress - 0.5) * (index ? -35 : -55) * remaining).toFixed(2) + 'px';
        });
      }
    }
    function scheduleStickyScene() { if (!stickyScheduled) { stickyScheduled = true; window.requestAnimationFrame(updateStickyScene); } }
    scheduleSticky = scheduleStickyScene;
    window.addEventListener('scroll', scheduleStickyScene, {passive:true});
    window.addEventListener('resize', scheduleStickyScene);
    document.addEventListener('wedding-details-opened', scheduleStickyScene);
    details.querySelector('.details-close').addEventListener('click', scheduleStickyScene);
    document.querySelectorAll('[data-open-messages], [data-open-gift], [data-open-calendar]').forEach(function (button) { button.addEventListener('click', scheduleStickyScene); });
    [dialog, giftDialog, calendarDialog].forEach(function (item) { item.addEventListener('close', scheduleStickyScene); });
    scheduleStickyScene();
  }
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
      scheduleSticky();
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
