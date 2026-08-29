(function (ns) {
  'use strict';
  class Spawner {
    constructor(random) {
      this.random = random || Math.random;
      this.timer = 0.8;
      this.elapsed = 0;
    }

    reset() { this.timer = 0.8; this.elapsed = 0; }

    currentInterval() {
      const cfg = ns.config.spawner;
      const progress = ns.utils.clamp(this.elapsed / cfg.rampSeconds, 0, 1);
      return cfg.initialInterval + (cfg.minimumInterval - cfg.initialInterval) * progress;
    }

    threatLevel() {
      return Math.min(ns.config.spawner.maxThreat, 1 + Math.floor(this.elapsed / ns.config.spawner.threatStepSeconds));
    }

    chooseType() {
      const level = this.threatLevel();
      const roll = this.random();
      if (level >= 5 && roll < 0.12) return 'elite';
      if (level >= 4 && roll < 0.30) return 'gunner';
      if (level >= 3 && roll < 0.52) return 'tracker';
      if (level >= 2 && roll < 0.72) return 'swift';
      return 'normal';
    }

    createEnemy(type, x) {
      const presets = {
        normal: {},
        swift: { type:'swift', speed:255, health:1, score:150 },
        tracker: { type:'tracker', speed:105, health:3, score:220 },
        gunner: { type:'gunner', speed:82, health:4, score:320 },
        elite: { type:'elite', speed:65, health:10, score:900, width:68, height:62 }
      };
      return new ns.entities.Enemy(x, -ns.config.enemy.height, presets[type]);
    }

    update(dt, enemies) {
      this.elapsed += dt;
      this.timer -= dt;
      if (this.timer <= 0) {
        const margin = ns.config.enemy.width;
        const x = margin + this.random() * (ns.config.width - margin * 2);
        enemies.push(this.createEnemy(this.chooseType(), x));
        this.timer += this.currentInterval();
      }
    }
  }
  ns.systems.Spawner = Spawner;
})(globalThis.SkyStrike);
