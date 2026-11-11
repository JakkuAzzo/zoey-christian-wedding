(function (root) {
  'use strict';
  // Midnight in London at the start of 19 February 2027 (GMT, UTC+0).
  const weddingDay = Date.parse('2027-02-19T00:00:00Z');
  function remaining(now) {
    let seconds = Math.max(0, Math.floor((weddingDay - now.getTime()) / 1000));
    const days = Math.floor(seconds / 86400); seconds %= 86400;
    const hours = Math.floor(seconds / 3600); seconds %= 3600;
    const minutes = Math.floor(seconds / 60); seconds %= 60;
    return { days, hours, minutes, seconds };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { remaining };
  root.weddingCountdown = { remaining };
})(typeof globalThis !== 'undefined' ? globalThis : this);
