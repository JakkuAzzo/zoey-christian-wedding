const fs = require('fs');
const {initializeTestEnvironment, assertSucceeds, assertFails} = require('@firebase/rules-unit-testing');
const {doc, collection, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp} = require('firebase/firestore');
(async () => {
  const env = await initializeTestEnvironment({projectId:'demo-wedding-organiser', firestore:{rules:fs.readFileSync(process.env.WEDDING_RULES_FILE, 'utf8')}});
  const code = 'a'.repeat(32);
  const data = {attendance:'yes',names:'Example Guest',count:2,children:'',dietary:'',access:'',submittedAt:serverTimestamp()};
  try {
    await env.withSecurityRulesDisabled(async ctx => {
      await setDoc(doc(ctx.firestore(),'invitations',code),{label:'Example'});
      await setDoc(doc(ctx.firestore(),'messages','message1'),{name:'Example',message:'Congratulations',createdAt:new Date()});
    });
    const organiser = env.authenticatedContext('8eUvB9M8YVSNdtOQAbTYucJB4yH3').firestore();
    const outsider = env.authenticatedContext('unrelated-account').firestore();
    const guest = env.unauthenticatedContext().firestore();
    await assertSucceeds(setDoc(doc(guest,'rsvps',code),data));
    await assertFails(getDocs(collection(guest,'rsvps')));
    await assertFails(updateDoc(doc(guest,'rsvps',code),{names:'Changed'}));
    await assertFails(deleteDoc(doc(guest,'rsvps',code)));
    await assertSucceeds(getDocs(collection(organiser,'rsvps')));
    await assertSucceeds(updateDoc(doc(organiser,'rsvps',code),{names:'Corrected Guest'}));
    await assertFails(updateDoc(doc(organiser,'rsvps',code),{count:99}));
    await assertFails(updateDoc(doc(outsider,'rsvps',code),{names:'Changed'}));
    await assertSucceeds(setDoc(doc(organiser,'rsvps','manual-record'),data));
    await assertSucceeds(deleteDoc(doc(organiser,'rsvps','manual-record')));
    await assertFails(setDoc(doc(outsider,'rsvps','manual-record'),data));
    await assertSucceeds(getDocs(collection(organiser,'messages')));
    await assertFails(getDocs(collection(outsider,'messages')));
    const gift = {giver:'Example',description:'Voucher',createdAt:serverTimestamp()};
    await assertSucceeds(setDoc(doc(organiser,'gifts','gift1'),gift));
    await assertSucceeds(getDocs(collection(organiser,'gifts')));
    await assertFails(getDocs(collection(guest,'gifts')));
    await assertFails(setDoc(doc(outsider,'gifts','gift2'),gift));
    await assertFails(deleteDoc(doc(outsider,'gifts','gift1')));
    await assertSucceeds(deleteDoc(doc(organiser,'gifts','gift1')));
    console.log('Organiser rules: RSVP changes, messages and gifts restricted to organiser; guest RSVP creation still works.');
  } finally { await env.cleanup(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
