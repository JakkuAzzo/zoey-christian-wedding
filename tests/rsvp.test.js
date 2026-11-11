const test = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('../rsvp-validation.js');
const valid = { code: '0123456789abcdef0123456789abcdef', attendance: 'yes', names: 'Alex Example', count: '2', children: 'Sam Example, age 8', dietary: '', access: '' };
test('accepts a valid invitation and response', () => assert.equal(validate(valid), null));
test('requires an unguessable invitation code', () => assert.match(validate({...valid, code:'bad'}), /invitation code/i));
test('requires names and a sensible total for attending guests', () => {
 assert.match(validate({...valid, names:''}), /names/i);
 assert.match(validate({...valid, count:'0'}), /total/i);
 assert.match(validate({...valid, count:'2.5'}), /total/i);
});
test('accepts a decline without guest counts', () => assert.equal(validate({...valid, attendance:'no', count:'', children:''}), null));
test('rejects overly long sensitive details', () => assert.match(validate({...valid, dietary:'x'.repeat(1001)}), /too long/i));
