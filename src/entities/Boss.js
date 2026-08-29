(function (ns) {
  'use strict';
  // Phase 6 extension point. Intentionally not instantiated in Phase 1.
  class Boss extends ns.entities.Enemy {}
  ns.entities.Boss = Boss;
})(globalThis.SkyStrike);
