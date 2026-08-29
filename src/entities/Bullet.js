(function (ns) {
  'use strict';
  class Bullet {
    constructor(x, y, options) {
      const cfg = ns.config.bullet;
      const opts = options || {};
      this.x = x;
      this.y = y;
      this.width = opts.width || cfg.width;
      this.height = opts.height || cfg.height;
      this.speed = opts.speed || cfg.speed;
      this.damage = opts.damage || cfg.damage;
      this.variant = Number.isInteger(opts.variant) ? opts.variant : 0;
      this.vx = Number.isFinite(opts.vx) ? opts.vx : 0;
      this.vy = Number.isFinite(opts.vy) ? opts.vy : -this.speed;
      this.rotation = Math.atan2(this.vx, -this.vy);
      this.active = true;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.y + this.height < 0 || this.x < -40 || this.x > ns.config.width + 40) this.active = false;
    }

    draw(ctx) {
      ns.skins.draw('bullet', ctx, this);
    }
  }
  ns.entities.Bullet = Bullet;
})(globalThis.SkyStrike);
