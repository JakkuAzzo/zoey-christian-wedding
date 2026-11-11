(function () {
  'use strict';
  const signInForm = document.getElementById('sign-in-form');
  if (!signInForm) return;
  const password = document.getElementById('organiser-password');
  const signOutButton = document.getElementById('sign-out');
  const signInArea = document.getElementById('sign-in-area');
  const status = document.getElementById('auth-status');
  const dashboard = document.getElementById('dashboard');
  const list = document.getElementById('response-list');
  const listStatus = document.getElementById('list-status');
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  const dialog = document.getElementById('response-dialog');
  const form = document.getElementById('response-form');
  const formStatus = document.getElementById('response-form-status');
  const giftForm = document.getElementById('gift-form');
  const giftsStatus = document.getElementById('organiser-gifts-status');
  const messagesStatus = document.getElementById('organiser-messages-status');
  let rows = [], auth, db, api, subscriptions = [], editingId = null;
  let legacyMessages = [], publicMessages = [];
  function textElement(tag, value, className) {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    return element;
  }
  function action(label, handler) {
    const button = textElement('button', label, 'outline-button');
    button.type = 'button'; button.addEventListener('click', handler); return button;
  }
  function syncAttendance() {
    const attending = form.elements.namedItem('attendance').value === 'yes';
    document.getElementById('response-attending-fields').hidden = !attending;
    form.elements.namedItem('count').required = attending;
  }
  function openResponse(row) {
    editingId = row ? row.id : null; form.reset(); formStatus.textContent = '';
    document.getElementById('response-dialog-title').textContent = row ? 'Edit response' : 'Add response';
    ['attendance','names','count','children','dietary','access'].forEach(function (key) {
      form.elements.namedItem(key).value = row ? (row[key] ?? '') : (key === 'attendance' ? 'yes' : '');
    });
    syncAttendance(); dialog.showModal();
  }
  async function removeResponse(row) {
    if (!window.confirm('Delete the response for ' + (row.names || 'this guest') + '? This cannot be undone.')) return;
    listStatus.textContent = 'Deleting response…';
    try { await api.deleteDoc(api.doc(db, 'rsvps', row.id)); listStatus.textContent = 'Response deleted.'; }
    catch (_) { listStatus.textContent = 'Could not delete the response. Please try again.'; }
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
        if (pair[1]) details.append(textElement('dt', pair[0]), textElement('dd', String(pair[1])));
      });
      const controls = document.createElement('div'); controls.className = 'card-actions';
      controls.append(action('Edit', function () { openResponse(row); }), action('Delete', function () { removeResponse(row); }));
      card.append(details, controls); list.append(card);
    });
  }
  search.addEventListener('input', render); filter.addEventListener('change', render);
  document.getElementById('add-response').addEventListener('click', function () { openResponse(null); });
  document.getElementById('cancel-response').addEventListener('click', function () { dialog.close(); });
  form.elements.namedItem('attendance').addEventListener('change', syncAttendance);
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const fields = form.elements; const attending = fields.namedItem('attendance').value === 'yes';
    const data = {attendance:fields.namedItem('attendance').value, names:fields.namedItem('names').value.trim(), count:attending ? Number(fields.namedItem('count').value) : 0, children:attending ? fields.namedItem('children').value.trim() : '', dietary:attending ? fields.namedItem('dietary').value.trim() : '', access:attending ? fields.namedItem('access').value.trim() : ''};
    if (!data.names || (attending && (!Number.isInteger(data.count) || data.count < 1 || data.count > 30))) { formStatus.textContent = 'Enter guest names and, for attending guests, a number between 1 and 30.'; return; }
    const button = form.querySelector('button[type="submit"]'); button.disabled = true; formStatus.textContent = 'Saving…';
    try {
      if (editingId) await api.updateDoc(api.doc(db, 'rsvps', editingId), data);
      else await api.setDoc(api.doc(api.collection(db, 'rsvps')), Object.assign(data, {submittedAt:api.serverTimestamp()}));
      dialog.close();
    } catch (_) { formStatus.textContent = 'Could not save the response. Please try again.'; }
    finally { button.disabled = false; }
  });
  giftForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const giver = giftForm.elements.namedItem('giver').value.trim();
    const description = giftForm.elements.namedItem('description').value.trim();
    if (!giver || !description) { giftsStatus.textContent = 'Please enter a name and gift description.'; return; }
    const button = giftForm.querySelector('button'); button.disabled = true;
    try { await api.setDoc(api.doc(api.collection(db, 'gifts')), {giver, description, createdAt:api.serverTimestamp()}); giftForm.reset(); }
    catch (_) { giftsStatus.textContent = 'Could not save the gift. Please try again.'; }
    finally { button.disabled = false; }
  });
  function renderMessages() {
    const target = document.getElementById('organiser-messages'); target.replaceChildren();
    const items = legacyMessages.concat(publicMessages);
    messagesStatus.textContent = items.length ? '' : 'No messages have been received yet.';
    items.sort(function (a,b) { return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0); });
    items.forEach(function (item) {
      const card = document.createElement('article');
      const title = textElement('h3', item.name || 'Guest');
      if (item.verified === true) { const badge = textElement('span', '◆', 'verified-diamond'); badge.setAttribute('role', 'img'); badge.setAttribute('aria-label', 'Invitation code verified'); badge.title = 'Invitation code verified'; title.append(badge); }
      card.append(title, textElement('p', item.message || ''), textElement('p', item.isLegacy ? 'Private message from the previous guestbook' : 'Public message', 'message-visibility'));
      target.append(card);
    });
  }
  function renderGifts(snapshot) {
    const target = document.getElementById('organiser-gifts'); target.replaceChildren();
    giftsStatus.textContent = snapshot.empty ? 'No gifts have been recorded yet.' : '';
    const items = snapshot.docs.map(function (item) { return {id:item.id, ...item.data()}; });
    items.sort(function (a,b) { return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0); });
    items.forEach(function (item) {
      const card = document.createElement('article'); card.append(textElement('h3', item.giver), textElement('p', item.description));
      const controls = document.createElement('div'); controls.className = 'card-actions';
      controls.append(action('Delete gift', async function () {
        if (!window.confirm('Delete the gift recorded from ' + item.giver + '? This cannot be undone.')) return;
        try { await api.deleteDoc(api.doc(db, 'gifts', item.id)); }
        catch (_) { giftsStatus.textContent = 'Could not delete the gift. Please try again.'; }
      })); card.append(controls); target.append(card);
    });
  }
  async function start() {
    try {
      const {initializeApp, getApps} = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js');
      const {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js');
      api = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js');
      const config = {apiKey:'AIzaSyCOP3mZ1fZnPvnJAwahonwh7_ztiBjdR80',authDomain:'zoey-and-christian-wedding.firebaseapp.com',projectId:'zoey-and-christian-wedding',appId:'1:119049313978:web:cd224bc1e2145d82dcac83'};
      const app = getApps()[0] || initializeApp(config); auth = getAuth(app); db = api.getFirestore(app);
      signInForm.addEventListener('submit', async function (event) {
        event.preventDefault(); status.textContent = '';
        try { await signInWithEmailAndPassword(auth, 'dashboard@wedding.invalid', password.value); password.value = ''; }
        catch (_) { status.textContent = 'Sign-in could not be completed. Please check the password and try again.'; }
      });
      signOutButton.addEventListener('click', function () { signOut(auth); });
      onAuthStateChanged(auth, function (user) {
        subscriptions.forEach(function (stop) { stop(); }); subscriptions = [];
        rows = []; legacyMessages = []; publicMessages = []; list.replaceChildren(); document.getElementById('organiser-messages').replaceChildren(); document.getElementById('organiser-gifts').replaceChildren();
        if (dialog.open) dialog.close(); giftForm.reset(); dashboard.hidden = true; signInArea.hidden = false;
        if (!user) return;
        status.textContent = 'Checking access…';
        subscriptions.push(api.onSnapshot(api.collection(db, 'rsvps'), function (snapshot) {
          status.textContent = ''; signInArea.hidden = true; dashboard.hidden = false;
          document.getElementById('signed-in-as').textContent = 'Signed in as organiser';
          rows = snapshot.docs.map(function (item) { return {id:item.id, ...item.data()}; });
          rows.sort(function (a,b) { return (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0); }); render();
        }, function () { dashboard.hidden = true; signInArea.hidden = false; status.textContent = 'This account does not have organiser access. Please contact the wedding organisers.'; signOut(auth); }));
        subscriptions.push(api.onSnapshot(api.collection(db, 'messages'), function (snapshot) { legacyMessages = snapshot.docs.map(function (item) { return {...item.data(), isLegacy:true}; }); renderMessages(); }, function () { messagesStatus.textContent = 'Private messages could not be loaded.'; }));
        subscriptions.push(api.onSnapshot(api.collection(db, 'public_messages'), function (snapshot) { publicMessages = snapshot.docs.map(function (item) { return item.data(); }); renderMessages(); }, function () { messagesStatus.textContent = 'Public messages could not be loaded.'; }));
        subscriptions.push(api.onSnapshot(api.collection(db, 'gifts'), renderGifts, function () { giftsStatus.textContent = 'Gifts could not be loaded.'; }));
      });
    } catch (_) { status.textContent = 'The organiser area could not be loaded. Please check your connection and try again.'; }
  }
  start();
})();
