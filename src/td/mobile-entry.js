(function () {
  'use strict';
  // A landscape viewport lets the browser map every touch and canvas coordinate.
  // Keep one live game frame through rotation; never recreate it on resize.
  if (typeof window === 'undefined') return;
  if (window.top !== window.self || !matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) > 700) return;
  const target = new URL('td-mobile.html', location.href);
  target.search = location.search;
  target.hash = location.hash;
  location.replace(target.href);
})();
