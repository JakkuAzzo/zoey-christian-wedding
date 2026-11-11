const fs = require('fs');
const {initializeTestEnvironment, assertSucceeds, assertFails} = require('@firebase/rules-unit-testing');
const {doc, collection, getDoc, getDocs, setDoc, updateDoc, writeBatch, serverTimestamp} = require('firebase/firestore');
(async () => {
 const env = await initializeTestEnvironment({projectId:'demo-public-wedding',firestore:{rules:fs.readFileSync(process.env.WEDDING_RULES_FILE,'utf8')}});
 const code='a'.repeat(32);
 try {
  await env.withSecurityRulesDisabled(async c => { await setDoc(doc(c.firestore(),'invitations',code),{label:'example'}); await setDoc(doc(c.firestore(),'messages','old'),{name:'Past guest',message:'Private',createdAt:new Date()}); });
  const visitor=env.unauthenticatedContext().firestore();
  const organiser=env.authenticatedContext('8eUvB9M8YVSNdtOQAbTYucJB4yH3').firestore();
  const message=(verified)=>({name:'Visitor',message:'Congratulations!',verified,createdAt:serverTimestamp()});
  await assertSucceeds(setDoc(doc(visitor,'public_messages','open'),message(false)));
  await assertSucceeds(getDocs(collection(visitor,'public_messages')));
  await assertFails(getDocs(collection(visitor,'messages')));
  await assertSucceeds(getDocs(collection(organiser,'messages')));
  await assertFails(setDoc(doc(visitor,'public_messages','fake'),message(true)));
  let fake=writeBatch(visitor);fake.set(doc(visitor,'public_messages','fake2'),message(true));fake.set(doc(visitor,'public_message_proofs','fake2'),{code:'b'.repeat(32)});await assertFails(fake.commit());
  let batch=writeBatch(visitor);batch.set(doc(visitor,'public_messages','verified'),message(true));batch.set(doc(visitor,'public_message_proofs','verified'),{code});await assertSucceeds(batch.commit());
  await assertFails(getDoc(doc(visitor,'public_message_proofs','verified')));
  await assertFails(updateDoc(doc(visitor,'public_messages','open'),{verified:true}));
  await assertFails(setDoc(doc(visitor,'public_messages','extra'),{...message(false),code}));
  await assertFails(setDoc(doc(visitor,'public_message_proofs','open'),{code}));
  console.log('Public posts work; verification requires a private valid proof; earlier messages stay private.');
 } finally {await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1});
