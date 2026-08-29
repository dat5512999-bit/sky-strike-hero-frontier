(function (ns) {
  'use strict';
  // Phase 3 extension point. Kept separate so item logic never enters Player.
  class PowerUp {
    constructor(x, y, type) { this.x = x; this.y = y; this.type = type; this.active = true; }
  }
  ns.entities.PowerUp = PowerUp;
})(globalThis.SkyStrike);
