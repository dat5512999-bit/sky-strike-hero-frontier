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
      this.active = true;
    }

    update(dt) {
      this.y -= this.speed * dt;
      if (this.y + this.height < 0) this.active = false;
    }

    draw(ctx) {
      ns.skins.draw('bullet', ctx, this);
    }
  }
  ns.entities.Bullet = Bullet;
})(globalThis.SkyStrike);
