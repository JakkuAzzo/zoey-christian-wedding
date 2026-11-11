(function () {
  'use strict';
  const form = document.getElementById('guestbook-form');
  if (!form) return;
  const status = document.getElementById('guestbook-status');
  const feed = document.getElementById('guestbook-feed');
  const feedStatus = document.getElementById('guestbook-feed-status');
  const button = form.querySelector('button[type="submit"]');
  const carousel = document.querySelector('.love-carousel');
  const slide = document.getElementById('love-carousel-slide');
  const controls = document.querySelector('.love-carousel-controls');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let store, api, messages = [], current = 0, rotation, rotationPaused = false;
  function diamond() {
    const badge = document.createElement('span'); badge.className = 'verified-diamond';
    badge.textContent = '◆'; badge.setAttribute('role', 'img'); badge.setAttribute('aria-label', 'Invitation code verified'); badge.setAttribute('title', 'Invitation code verified');
    return badge;
  }
  function drawCarousel(animate) {
    if (!slide) return;
    slide.replaceChildren();
    if (!messages.length) { const empty = document.createElement('p'); empty.textContent = 'Be the first to leave a message.'; slide.append(empty); controls.hidden = true; return; }
    current = (current + messages.length) % messages.length;
    const item = messages[current];
    const quote = document.createElement('blockquote'); quote.textContent = item.message;
    const name = document.createElement('p'); name.textContent = '— ' + item.name;
    if (item.verified === true) name.append(diamond());
    slide.append(quote, name); controls.hidden = messages.length < 2;
    document.getElementById('love-position').textContent = (current + 1) + ' / ' + messages.length;
    slide.classList.remove('is-changing');
    if (animate && !reducedMotion.matches) { void slide.offsetWidth; slide.classList.add('is-changing'); }
  }
  function pause() { if (rotation) { window.clearInterval(rotation); rotation = null; } }
  function resume() { pause(); if (messages.length > 1 && !rotationPaused && !reducedMotion.matches && !document.hidden && !carousel.matches(':hover') && !carousel.contains(document.activeElement)) rotation = window.setInterval(function () { current++; drawCarousel(true); }, 6000); }
  if (carousel) {
    document.getElementById('love-prev').addEventListener('click', function () { current--; drawCarousel(true); });
    document.getElementById('love-next').addEventListener('click', function () { current++; drawCarousel(true); });
    const pauseButton = document.getElementById('love-pause');
    function syncPauseButton() { pauseButton.hidden = reducedMotion.matches; pauseButton.textContent = rotationPaused ? 'Play' : 'Pause'; pauseButton.setAttribute('aria-pressed', String(rotationPaused)); }
    pauseButton.addEventListener('click', function () { rotationPaused = !rotationPaused; syncPauseButton(); resume(); });
    syncPauseButton();
    carousel.addEventListener('mouseenter', pause); carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('focusin', pause); carousel.addEventListener('focusout', function () { window.setTimeout(resume, 0); });
    document.addEventListener('visibilitychange', resume);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', function () { syncPauseButton(); resume(); });
  }
  function showMessages(snapshot) {
    feed.replaceChildren();
    messages = snapshot.docs.map(function (item) { return item.data(); });
    current = 0;
    feedStatus.textContent = messages.length ? '' : 'Be the first to leave a message.';
    messages.forEach(function (data) {
      const card = document.createElement('article'); card.className = 'message-card';
      const quote = document.createElement('p'); quote.className = 'message-text'; quote.textContent = data.message;
      const name = document.createElement('p'); name.className = 'message-name'; name.textContent = '— ' + data.name;
      if (data.verified === true) name.append(diamond());
      card.append(quote, name); feed.append(card);
    });
    if (carousel) { drawCarousel(false); resume(); }
  }
  async function start() {
    try {
      const {initializeApp, getApps} = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js');
      api = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js');
      const config = {apiKey:'AIzaSyCOP3mZ1fZnPvnJAwahonwh7_ztiBjdR80',authDomain:'zoey-and-christian-wedding.firebaseapp.com',projectId:'zoey-and-christian-wedding',appId:'1:119049313978:web:cd224bc1e2145d82dcac83'};
      const app = getApps().find(item => item.name === 'wedding-public') || initializeApp(config, 'wedding-public');
      store = api.getFirestore(app);
      api.onSnapshot(api.query(api.collection(store,'public_messages'),api.orderBy('createdAt','desc'),api.limit(50)), showMessages, function () {
        feedStatus.textContent = 'Messages are unavailable right now. Please try again later.';
        if (slide) slide.textContent = 'Messages are unavailable right now.';
      });
    } catch (_) { feedStatus.textContent = 'Messages are unavailable right now. Please try again later.'; if (slide) slide.textContent = 'Messages are unavailable right now.'; }
  }
  document.addEventListener('wedding-guest-ready', function () {
    const section = document.getElementById('private-guestbook');
    if (!section || !window.weddingGuest) return;
    const guestApi = window.weddingGuest.api;
    guestApi.onSnapshot(guestApi.query(guestApi.collection(window.weddingGuest.db,'messages'),guestApi.orderBy('createdAt','desc'),guestApi.limit(50)), function (snapshot) {
      const target = document.getElementById('private-guestbook-feed'); target.replaceChildren();
      section.hidden = snapshot.empty;
      snapshot.forEach(function (item) {
        const data = item.data(); const card = document.createElement('article'); card.className = 'message-card';
        const quote = document.createElement('p'); quote.className = 'message-text'; quote.textContent = data.message;
        const name = document.createElement('p'); name.className = 'message-name'; name.textContent = '— ' + data.name;
        card.append(quote, name); target.append(card);
      });
    }, function () { section.hidden = false; document.getElementById('private-guestbook-feed').textContent = 'Earlier messages are unavailable right now.'; });
  }, {once:true});
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const data = {code:form.elements.namedItem('message-code').value.trim().toLowerCase(),name:form.elements.namedItem('message-name').value.trim(),message:form.elements.namedItem('message-text').value.trim()};
    const error = window.guestbookValidation.validateMessage(data);
    if (error) { status.textContent = error; return; }
    if (!store || !api || !navigator.onLine) { status.textContent = 'The message board is unavailable. Please check your connection and try again.'; return; }
    button.disabled = true; status.textContent = 'Posting your message…';
    try {
      const ref = api.doc(api.collection(store,'public_messages'));
      const batch = api.writeBatch(store);
      batch.set(ref,{name:data.name,message:data.message,verified:!!data.code,createdAt:api.serverTimestamp()});
      if (data.code) batch.set(api.doc(store,'public_message_proofs',ref.id),{code:data.code});
      await batch.commit();
      form.reset();
      if (window.weddingGuest) form.elements.namedItem('message-code').value = window.weddingGuest.code;
      status.textContent = 'Thank you! Your message is now public on the website.';
    } catch (_) {
      status.textContent = data.code ? 'We couldn’t post your message. Check your invitation code and connection, or leave the code blank.' : 'We couldn’t post your message. Check your connection and try again.';
    } finally { button.disabled = false; }
  });
  start();
})();
