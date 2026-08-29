(function (ns) {
  'use strict';
  class Effects {
    constructor() { this.flashes = []; }
    clear() { this.flashes.length = 0; }
    burst(x, y, color) { this.flashes.push({ x: x, y: y, color: color, age: 0, life: 0.22 }); }
    update(dt) {
      this.flashes.forEach(function (fx) { fx.age += dt; });
      this.flashes = this.flashes.filter(function (fx) { return fx.age < fx.life; });
    }
    draw(ctx) {
      this.flashes.forEach(function (fx) {
        const t = fx.age / fx.life;
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 4 * (1 - t);
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, 8 + t * 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }
  }
  ns.systems.Effects = Effects;
})(globalThis.SkyStrike);
