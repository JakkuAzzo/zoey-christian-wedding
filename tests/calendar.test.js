const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('calendar options use the same London wedding day and displayed schedule', () => {
  const root = path.join(__dirname, '..');
  const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const calendar = fs.readFileSync(path.join(root, 'assets/zoey-christian-wedding.ics'), 'utf8');
  const link = page.match(/href="(https:\/\/calendar\.google\.com\/calendar\/render\?[^\"]+)"/);
  assert.ok(link, 'Google Calendar link exists');
  const url = new URL(link[1].replaceAll('&amp;', '&'));
  assert.equal(url.searchParams.get('dates'), '20270219T120000Z/20270219T223000Z');
  assert.equal(url.searchParams.get('ctz'), 'Europe/London');
  assert.match(calendar, /\r\nDTSTART:20270219T120000Z\r\n/);
  assert.match(calendar, /\r\nDTEND:20270219T223000Z\r\n/);
  assert.match(calendar, /\r\nEND:VCALENDAR\r\n$/);
});
