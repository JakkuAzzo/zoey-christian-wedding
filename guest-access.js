(function () {
  'use strict';
  const gate = document.querySelector('.invitation-gate');
  const content = document.querySelector('.guest-content');
  if (!gate || !content) return;
  let pending = false;
  async function unlock(code) {
    const normalized = code.trim().toLowerCase();
    if (!/^[a-f0-9]{32}$/.test(normalized)) throw new Error('invalid');
    const {initializeApp, getApps} = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js');
    const authApi = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js');
    const dbApi = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js');
    const config = {apiKey:'AIzaSyCOP3mZ1fZnPvnJAwahonwh7_ztiBjdR80',authDomain:'zoey-and-christian-wedding.firebaseapp.com',projectId:'zoey-and-christian-wedding',appId:'1:119049313978:web:cd224bc1e2145d82dcac83'};
    const app = getApps().find(item => item.name === 'wedding-guest') || initializeApp(config, 'wedding-guest');
    const auth = authApi.getAuth(app);
    await authApi.setPersistence(auth, authApi.browserSessionPersistence);
    await auth.authStateReady();
    if (auth.currentUser) await authApi.signOut(auth);
    const credential = await authApi.signInAnonymously(auth);
    const db = dbApi.getFirestore(app);
    try { await dbApi.setDoc(dbApi.doc(db, 'guest_sessions', credential.user.uid), {code:normalized}); }
    catch (error) { await authApi.signOut(auth); throw error; }
    window.weddingGuest = {code:normalized, db:db, api:dbApi};
    document.querySelectorAll('input[name="code"],input[name="message-code"]').forEach(input => { input.value = normalized; });
    gate.hidden = true;
    content.hidden = false;
    document.dispatchEvent(new CustomEvent('wedding-guest-ready'));
  }
  gate.addEventListener('submit', async function (event) {
    event.preventDefault(); if (pending) return; pending = true;
    const status = gate.querySelector('.gate-status'); const button = gate.querySelector('button');
    button.disabled = true; status.textContent = 'Checking your invitation…';
    try { await unlock(gate.elements.namedItem('invitation').value); }
    catch (error) { status.textContent = 'We couldn’t verify that code. Please check it and try again, or contact the organisers.'; }
    finally { pending = false; button.disabled = false; }
  });
})();
