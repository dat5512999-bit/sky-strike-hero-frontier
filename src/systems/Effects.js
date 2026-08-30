(function (ns) {
  'use strict';
  class Effects {
    constructor() { this.flashes = []; this.banner = null; }
    clear() { this.flashes.length = 0; this.banner = null; }
    burst(x, y, color) { this.flashes.push({ x: x, y: y, color: color, age: 0, life: 0.22 }); }
    announce(text, color) { this.banner = { text:text, color:color||'#ffffff', age:0, life:1.7 }; }
    update(dt) {
      this.flashes.forEach(function (fx) { fx.age += dt; });
      this.flashes = this.flashes.filter(function (fx) { return fx.age < fx.life; });
      if (this.banner) { this.banner.age += dt; if (this.banner.age >= this.banner.life) this.banner = null; }
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
      if (this.banner) {
        const t=this.banner.age/this.banner.life;
        ctx.save(); ctx.globalAlpha=Math.min(1,(1-t)*2); ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='800 25px "Segoe UI", sans-serif'; ctx.fillStyle=this.banner.color; ctx.shadowColor='#000'; ctx.shadowBlur=10;
        ctx.fillText(this.banner.text,ns.config.width/2,ns.config.height*.34); ctx.restore();
      }
    }
  }
  ns.systems.Effects = Effects;
})(globalThis.SkyStrike);
