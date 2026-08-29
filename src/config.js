(function (ns) {
  'use strict';
  ns.config = Object.freeze({
    width: 480,
    height: 720,
    player: { width: 38, height: 52, speed: 720, maxHealth: 3, invulnerableSeconds: 1.1 },
    bullet: { width: 6, height: 18, speed: 680, damage: 1 },
    enemy: { width: 38, height: 42, speed: 125, health: 2, score: 100 },
    weapon: { fireInterval: 0.19 },
    spawner: { initialInterval: 1.05, minimumInterval: 0.38, rampSeconds: 75, threatStepSeconds: 12, maxThreat: 5 },
    skills: { guaranteedInterval: 12, dropChance: 0.16, spreadSeconds: 10, rapidSeconds: 8 },
    colors: { cyan: '#54e8ff', yellow: '#ffd05a', red: '#ff496d', white: '#eefcff' }
  });
})(globalThis.SkyStrike);
