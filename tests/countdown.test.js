const test = require('node:test');
const assert = require('node:assert/strict');
const { remaining } = require('../countdown.js');
test('counts down to midnight at the start of the wedding day in London', () => {
  assert.deepEqual(remaining(new Date('2027-02-18T22:58:57Z')), {days:0,hours:1,minutes:1,seconds:3});
});
test('never displays negative time after the wedding day begins', () => {
  assert.deepEqual(remaining(new Date('2027-02-19T01:00:00Z')), {days:0,hours:0,minutes:0,seconds:0});
});
