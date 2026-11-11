const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const {doc, getDoc, getDocs, collection, setDoc, writeBatch, serverTimestamp} = require('firebase/firestore');
const fs = require('fs');
const code = '11111111111111111111111111111111';
async function post(db, id, invite) {const batch=writeBatch(db);batch.set(doc(db,'messages',id),{name:'Guest',message:'Congratulations',createdAt:serverTimestamp()});batch.set(doc(db,'message_proofs',id),{code:invite});batch.set(doc(db,'message_uses',invite),{messageId:id});return batch.commit()}
(async()=>{const env=await initializeTestEnvironment({projectId:'demo-wedding-guestbook',firestore:{rules:fs.readFileSync(process.env.WEDDING_RULES_FILE,'utf8')}});try{
 await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),'invitations',code),{label:'test'})});
 const guest=env.authenticatedContext('guest1',{firebase:{sign_in_provider:'anonymous'}}).firestore();
 const stranger=env.unauthenticatedContext().firestore();
 const other=env.authenticatedContext('guest2',{firebase:{sign_in_provider:'anonymous'}}).firestore();
 await assertFails(getDocs(collection(stranger,'messages'))); await assertFails(getDocs(collection(guest,'messages')));
 await assertFails(setDoc(doc(guest,'guest_sessions','guest1'),{code:'22222222222222222222222222222222'}));
 await assertFails(setDoc(doc(other,'guest_sessions','guest1'),{code}));
 await assertSucceeds(setDoc(doc(guest,'guest_sessions','guest1'),{code}));
 await assertFails(setDoc(doc(guest,'guest_sessions','guest1'),{code}));
 await assertFails(getDoc(doc(guest,'invitations',code)));
 await assertSucceeds(post(guest,'m1',code)); await assertFails(getDocs(collection(stranger,'messages')));
 const messages=await assertSucceeds(getDocs(collection(guest,'messages'))); if(messages.size!==1) throw Error('missing message');
 await assertFails(post(guest,'m2',code));
 console.log('Invitation gate and message privacy rules passed.');
 }finally{await env.cleanup()}})().catch(e=>{console.error(e);process.exitCode=1});
