(function (root) {
  'use strict';
  function validate(input) {
    if (!/^[a-f0-9]{32}$/.test(input.code.trim().toLowerCase())) return 'Please enter the 32-character invitation code provided with your invitation.';
    if (!['yes', 'no'].includes(input.attendance)) return 'Please choose whether you can attend.';
    if (!input.names.trim()) return 'Please enter the full names of the guests responding.';
    if (input.names.trim().length > 500 || input.children.trim().length > 1000 || input.dietary.trim().length > 1000 || input.access.trim().length > 1000) return 'One of your answers is too long. Please shorten it and try again.';
    if (input.attendance === 'yes' && (!/^\d+$/.test(input.count) || Number(input.count) < 1 || Number(input.count) > 30)) return 'Please enter a total number of guests between 1 and 30.';
    return null;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { validate };
  root.rsvpValidation = { validate };
})(typeof globalThis !== 'undefined' ? globalThis : this);
