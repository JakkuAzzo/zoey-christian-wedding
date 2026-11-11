(function (root) {
  'use strict';
  function summarise(rows) {
    return rows.reduce(function (totals, row) {
      totals.responses++;
      if (row.attendance === 'yes') { totals.accepted++; totals.guests += Number.isInteger(row.count) ? row.count : 0; }
      if (row.attendance === 'no') totals.declined++;
      return totals;
    }, {responses:0, accepted:0, declined:0, guests:0});
  }
  function matches(row, search, attendance) {
    return (attendance === 'all' || row.attendance === attendance) && String(row.names || '').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {summarise, matches};
  root.organiserData = {summarise, matches};
})(typeof globalThis !== 'undefined' ? globalThis : this);
