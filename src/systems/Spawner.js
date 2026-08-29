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

    update(dt, enemies) {
      this.elapsed += dt;
      this.timer -= dt;
      if (this.timer <= 0) {
        const margin = ns.config.enemy.width;
        const x = margin + this.random() * (ns.config.width - margin * 2);
        enemies.push(new ns.entities.Enemy(x, -ns.config.enemy.height));
        this.timer += this.currentInterval();
      }
    }
  }
  ns.systems.Spawner = Spawner;
})(globalThis.SkyStrike);
