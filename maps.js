(function () {
  'use strict';
  const locations = [
    {id:'ceremony-map', center:[51.4606347,-0.1170681], zoom:16, marker:true},
    {id:'reception-map', center:[51.3948400,-0.1048700], zoom:15, marker:false}
  ];
  function render(location) {
    const target = document.getElementById(location.id);
    if (!target || target.dataset.loaded) return;
    target.dataset.loaded = 'true';
    if (!window.L) { target.textContent = 'Map unavailable. Use the link below to open the map.'; return; }
    const map = window.L.map(target, {scrollWheelZoom:false}).setView(location.center,location.zoom);
    map.attributionControl.setPrefix(false);
    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19, keepBuffer:0,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    if (location.marker) window.L.circleMarker(location.center,{radius:7,color:'#550b1b',fillColor:'#78172b',fillOpacity:1,weight:2}).addTo(map).bindPopup('Lambeth Town Hall');
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const location = locations.find(function (item) { return item.id === entry.target.id; });
          if (location) render(location);
          observer.unobserve(entry.target);
        }
      });
    }, {rootMargin:'100px'});
    locations.forEach(function (item) { const target = document.getElementById(item.id); if (target) observer.observe(target); });
  } else locations.forEach(render);
})();
