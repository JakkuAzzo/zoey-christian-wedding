(function () {
  'use strict';
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  const count = document.getElementById('guest-count');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('change', function () {
    const attending = form.elements.namedItem('attendance').value === 'yes';
    document.getElementById('attending-details').hidden = !attending;
    count.required = attending;
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const data = {
      code: form.elements.namedItem('code').value.trim().toLowerCase(),
      attendance: form.elements.namedItem('attendance').value,
      names: form.elements.namedItem('names').value.trim(),
      count: form.elements.namedItem('count').value,
      children: form.elements.namedItem('children').value.trim(),
      dietary: form.elements.namedItem('dietary').value.trim(),
      access: form.elements.namedItem('access').value.trim()
    };
    const error = window.rsvpValidation.validate(data);
    if (error) { status.textContent = error; return; }
    button.disabled = true;
    status.textContent = 'Sending your response…';
    try {
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js');
      const { getFirestore, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js');
      const config = {apiKey:'AIzaSyCOP3mZ1fZnPvnJAwahonwh7_ztiBjdR80',authDomain:'zoey-and-christian-wedding.firebaseapp.com',projectId:'zoey-and-christian-wedding',appId:'1:119049313978:web:cd224bc1e2145d82dcac83'};
      const app = getApps()[0] || initializeApp(config);
      if (!navigator.onLine) throw new Error('offline');
      await setDoc(doc(getFirestore(app), 'rsvps', data.code), {
        attendance: data.attendance, names: data.names,
        count: data.attendance === 'yes' ? Number(data.count) : 0,
        children: data.attendance === 'yes' ? data.children : '',
        dietary: data.attendance === 'yes' ? data.dietary : '',
        access: data.attendance === 'yes' ? data.access : '', submittedAt: serverTimestamp()
      });
      form.hidden = true;
      status.textContent = 'Thank you! Your response has been received.';
    } catch (error) {
      console.error('RSVP submission failed', error.code || error.message);
      status.textContent = 'We couldn’t send your response. Check your invitation code and internet connection, or contact the couple if you have already replied.';
      button.disabled = false;
    }
  });
})();
