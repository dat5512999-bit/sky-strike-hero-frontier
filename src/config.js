(function (ns) {
  'use strict';
  ns.config = Object.freeze({
    width: 480,
    height: 720,
    player: { width: 38, height: 52, speed: 720, maxHealth: 3, invulnerableSeconds: 1.1 },
    bullet: { width: 6, height: 18, speed: 680, damage: 1 },
    enemy: { width: 38, height: 42, speed: 125, health: 2, score: 100 },
    weapon: { fireInterval: 0.19 },
    spawner: { initialInterval: 1.1, minimumInterval: 0.52, rampSeconds: 75 },
    colors: { cyan: '#54e8ff', yellow: '#ffd05a', red: '#ff496d', white: '#eefcff' }
  });
})(globalThis.SkyStrike);
