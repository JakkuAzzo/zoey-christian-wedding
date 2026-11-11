const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const {doc, getDoc, getDocs, collection, setDoc, writeBatch, serverTimestamp} = require('firebase/firestore');
const fs = require('fs');
const projectId = 'demo-wedding-guestbook';
const code = '11111111111111111111111111111111';
async function post(db, id, invite, extra = {}) {
  const batch = writeBatch(db);
  batch.set(doc(db,'messages',id), {name:'Test guest',message:'Congratulations!',createdAt:serverTimestamp(),...extra});
  batch.set(doc(db,'message_proofs',id), {code:invite});
  batch.set(doc(db,'message_uses',invite), {messageId:id});
  return batch.commit();
}
(async () => {
  const env = await initializeTestEnvironment({projectId,firestore:{rules:fs.readFileSync(process.env.WEDDING_RULES_FILE,'utf8')}});
  try {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(),'invitations',code), {note:'test'}));
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db,'invitations',code)));
    await assertFails(getDocs(collection(db,'rsvps')));
    await assertFails(post(db,'unknown-id','22222222222222222222222222222222'));
    await assertFails(post(db,'extra-field',code,{code}));
    await assertFails(setDoc(doc(db,'messages','standalone'),{name:'A',message:'B',createdAt:serverTimestamp()}));
    await assertSucceeds(post(db,'valid-message',code));
    const visible = await assertSucceeds(getDoc(doc(db,'messages','valid-message')));
    if (visible.data().message !== 'Congratulations!' || 'code' in visible.data()) throw new Error('Public message content or privacy mismatch');
    await assertFails(getDoc(doc(db,'message_proofs','valid-message')));
    await assertFails(getDoc(doc(db,'message_uses',code)));
    await assertFails(post(db,'second-message',code));
    await assertFails(setDoc(doc(db,'messages','valid-message'),{name:'Modified',message:'changed',createdAt:serverTimestamp()}));
    console.log('Guestbook rules passed: public read, private proof, invite check, one message per code, and immutability.');
  } finally { await env.cleanup(); }
})().catch(error => { console.error(error); process.exit(1); });
