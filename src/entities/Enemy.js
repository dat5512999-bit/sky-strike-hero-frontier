(function (ns) {
  'use strict';
  class Enemy {
    constructor(x, y, options) {
      const cfg = ns.config.enemy;
      const opts = options || {};
      this.x = x;
      this.y = y;
      this.width = opts.width || cfg.width;
      this.height = opts.height || cfg.height;
      this.speed = opts.speed || cfg.speed;
      this.health = opts.health || cfg.health;
      this.scoreValue = opts.score || cfg.score;
      this.active = true;
      this.destroyed = false;
    }

    update(dt) {
      this.y += this.speed * dt;
      if (this.y - this.height / 2 > ns.config.height + 20) this.active = false;
    }

    takeDamage(amount) {
      if (!this.active) return false;
      this.health -= amount;
      if (this.health <= 0) {
        this.health = 0;
        this.active = false;
        this.destroyed = true;
        return true;
      }
      return false;
    }

    draw(ctx) {
      ns.skins.draw('enemy', ctx, this);
    }
  }
  ns.entities.Enemy = Enemy;
})(globalThis.SkyStrike);
