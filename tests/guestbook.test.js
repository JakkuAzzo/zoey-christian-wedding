const test = require('node:test');
const assert = require('node:assert/strict');
const {validateMessage} = require('../guestbook-validation.js');
const valid = {code:'0123456789abcdef0123456789abcdef',name:'A guest',message:'Congratulations to you both!'};
test('accepts a name, message and invitation code', () => assert.equal(validateMessage(valid), null));
test('requires a valid invitation code', () => assert.match(validateMessage({...valid,code:'bad'}), /code/i));
test('requires a name and message', () => {
 assert.match(validateMessage({...valid,name:' '}), /name/i);
 assert.match(validateMessage({...valid,message:' '}), /message/i);
});
test('limits public messages and names', () => {
 assert.match(validateMessage({...valid,name:'a'.repeat(81)}), /name/i);
 assert.match(validateMessage({...valid,message:'a'.repeat(501)}), /message/i);
});
