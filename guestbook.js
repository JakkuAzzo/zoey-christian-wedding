(function () {
  'use strict';
  const form = document.getElementById('guestbook-form');
  const status = document.getElementById('guestbook-status');
  const feed = document.getElementById('guestbook-feed');
  const feedStatus = document.getElementById('guestbook-feed-status');
  const button = form.querySelector('button[type="submit"]');
  let store, api;
  function showMessages(snapshot) {
    feed.replaceChildren();
    if (snapshot.empty) { feedStatus.textContent = 'Be the first to leave a message.'; return; }
    feedStatus.textContent = '';
    snapshot.forEach(function (item) {
      const data = item.data();
      const card = document.createElement('article'); card.className = 'message-card';
      const quote = document.createElement('p'); quote.className = 'message-text'; quote.textContent = data.message;
      const name = document.createElement('p'); name.className = 'message-name'; name.textContent = '— ' + data.name;
      card.append(quote, name); feed.append(card);
    });
  }
  function start() {
    if (!window.weddingGuest) return;
    store = window.weddingGuest.db; api = window.weddingGuest.api;
    api.onSnapshot(api.query(api.collection(store,'messages'),api.orderBy('createdAt','desc'),api.limit(50)), showMessages, function () {
      feedStatus.textContent = 'Messages are unavailable right now. Please try again later.';
    });
  }
  document.addEventListener('wedding-guest-ready', start, {once:true});
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const data = {code:form.elements.namedItem('message-code').value.trim().toLowerCase(),name:form.elements.namedItem('message-name').value.trim(),message:form.elements.namedItem('message-text').value.trim()};
    const error = window.guestbookValidation.validateMessage(data);
    if (error) { status.textContent = error; return; }
    if (!store || !api || !navigator.onLine) { status.textContent = 'The message board is unavailable. Please check your connection and try again.'; return; }
    button.disabled = true; status.textContent = 'Posting your message…';
    try {
      const ref = api.doc(api.collection(store,'messages'));
      const batch = api.writeBatch(store);
      batch.set(ref,{name:data.name,message:data.message,createdAt:api.serverTimestamp()});
      batch.set(api.doc(store,'message_proofs',ref.id),{code:data.code});
      batch.set(api.doc(store,'message_uses',data.code),{messageId:ref.id});
      await batch.commit();
      form.reset(); form.elements.namedItem('message-code').value = window.weddingGuest.code; status.textContent = 'Thank you! Your message is now on the board.';
    } catch (error) {
      status.textContent = 'We couldn’t post your message. Check your invitation code and internet connection, or contact the couple if your invitation has already been used to post.';
    } finally { button.disabled = false; }
  });
})();
