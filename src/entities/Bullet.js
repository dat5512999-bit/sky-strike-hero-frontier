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
      this.active = true;
    }

    update(dt) {
      this.y -= this.speed * dt;
      if (this.y + this.height < 0) this.active = false;
    }

    draw(ctx) {
      ctx.save();
      ctx.shadowColor = ns.config.colors.cyan;
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.fillStyle = ns.config.colors.cyan;
      ctx.fillRect(this.x - 1, this.y + this.height / 2, 2, 8);
      ctx.restore();
    }
  }
  ns.entities.Bullet = Bullet;
})(globalThis.SkyStrike);
