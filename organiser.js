(function () {
  'use strict';
  // Turn on only after Google sign-in, its support contact, authorised domain,
  // and the exact organisers' verified Google accounts have been configured.
  const READY = false;
  const signInButton = document.getElementById('sign-in');
  const signOutButton = document.getElementById('sign-out');
  const signInArea = document.getElementById('sign-in-area');
  const status = document.getElementById('auth-status');
  const dashboard = document.getElementById('dashboard');
  const list = document.getElementById('response-list');
  const listStatus = document.getElementById('list-status');
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  let rows = [], auth, unsubscribe;
  if (!READY) return;
  document.getElementById('setup-message').textContent = 'Sign in with the Google account approved by the wedding organisers.';
  signInButton.hidden = false;
  function textElement(tag, value, className) {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    return element;
  }
  function render() {
    const totals = window.organiserData.summarise(rows);
    for (const [name, value] of Object.entries(totals)) document.getElementById('summary-' + name).textContent = value;
    list.replaceChildren();
    const filtered = rows.filter(function (row) { return window.organiserData.matches(row, search.value, filter.value); });
    listStatus.textContent = filtered.length ? '' : (rows.length ? 'No responses match your search.' : 'No responses have been received yet.');
    filtered.forEach(function (row) {
      const card = document.createElement('article'); card.className = 'response-card';
      card.append(textElement('h3', row.names || 'Unnamed response'));
      const meta = row.attendance === 'yes' ? 'Attending · ' + row.count + ' guest' + (row.count === 1 ? '' : 's') : 'Not attending';
      card.append(textElement('p', meta, 'response-meta'));
      const details = document.createElement('dl');
      [['Children and ages', row.children], ['Dietary requirements', row.dietary], ['Accessibility and seating', row.access], ['Submitted', row.submittedAt && typeof row.submittedAt.toDate === 'function' ? row.submittedAt.toDate().toLocaleString('en-GB', {timeZone:'Europe/London'}) : '']].forEach(function (pair) {
        if (pair[1]) { details.append(textElement('dt', pair[0]), textElement('dd', String(pair[1]))); }
      });
      card.append(details); list.append(card);
    });
  }
  search.addEventListener('input', render); filter.addEventListener('change', render);
  async function start() {
    try {
      const {initializeApp, getApps} = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js');
      const {getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut} = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js');
      const {getFirestore, collection, onSnapshot} = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js');
      const config = {apiKey:'AIzaSyCOP3mZ1fZnPvnJAwahonwh7_ztiBjdR80',authDomain:'zoey-and-christian-wedding.firebaseapp.com',projectId:'zoey-and-christian-wedding',appId:'1:119049313978:web:cd224bc1e2145d82dcac83'};
      const app = getApps()[0] || initializeApp(config);
      auth = getAuth(app);
      signInButton.addEventListener('click', async function () {
        status.textContent = '';
        try { await signInWithPopup(auth, new GoogleAuthProvider()); }
        catch (error) { status.textContent = 'Sign-in could not be completed. Please try again.'; }
      });
      signOutButton.addEventListener('click', function () { signOut(auth); });
      onAuthStateChanged(auth, function (user) {
        if (unsubscribe) { unsubscribe(); unsubscribe = null; }
        rows = []; list.replaceChildren(); dashboard.hidden = true; signInArea.hidden = false;
        if (!user) return;
        status.textContent = 'Checking access…';
        unsubscribe = onSnapshot(collection(getFirestore(app), 'rsvps'), function (snapshot) {
          status.textContent = ''; signInArea.hidden = true; dashboard.hidden = false;
          document.getElementById('signed-in-as').textContent = 'Signed in as ' + (user.email || 'organiser');
          rows = snapshot.docs.map(function (doc) { return doc.data(); });
          rows.sort(function (a,b) { return (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0); });
          render();
        }, function () {
          dashboard.hidden = true; signInArea.hidden = false;
          status.textContent = 'This Google account does not have organiser access. Please contact the wedding organisers.';
          signOut(auth);
        });
      });
    } catch (error) { status.textContent = 'The organiser area could not be loaded. Please check your connection and try again.'; }
  }
  start();
})();
