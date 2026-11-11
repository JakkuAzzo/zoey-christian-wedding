const test = require('node:test');
const assert = require('node:assert/strict');
const {summarise, matches} = require('../organiser-data.js');
const rows = [{attendance:'yes', names:'Amira Example', count:2, children:'',dietary:'Vegetarian',access:''}, {attendance:'no',names:'Dev Example',count:0,children:'',dietary:'',access:''}];
test('counts acceptances, declines and attending guests', () => {
 assert.deepEqual(summarise(rows), {responses:2, accepted:1, declined:1, guests:2});
});
test('filters names without case sensitivity and respects attendance', () => {
 assert.equal(matches(rows[0], 'amIrA', 'yes'), true);
 assert.equal(matches(rows[0], 'amira', 'no'), false);
 assert.equal(matches(rows[1], '', 'all'), true);
});
