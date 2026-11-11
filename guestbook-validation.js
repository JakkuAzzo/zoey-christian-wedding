(function (root) {
  'use strict';
  function validateMessage(input) {
    if (input.code.trim() && !/^[a-f0-9]{32}$/.test(input.code.trim().toLowerCase())) return 'Please enter a valid 32-character invitation code, or leave it blank.';
    if (!input.name.trim() || input.name.trim().length > 80) return 'Please enter a name of up to 80 characters.';
    if (!input.message.trim() || input.message.trim().length > 500) return 'Please enter a message of up to 500 characters.';
    return null;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {validateMessage};
  root.guestbookValidation = {validateMessage};
})(typeof globalThis !== 'undefined' ? globalThis : this);
