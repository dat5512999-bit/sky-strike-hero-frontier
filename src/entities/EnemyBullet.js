(function (ns) {
  'use strict';
  class EnemyBullet {
    constructor(x, y, vx, vy) {
      this.x = x; this.y = y; this.vx = vx; this.vy = vy;
      this.width = 10; this.height = 10; this.damage = 1; this.active = true;
    }
    update(dt) {
      this.x += this.vx * dt; this.y += this.vy * dt;
      if (this.y > ns.config.height + 30 || this.y < -30 || this.x < -30 || this.x > ns.config.width + 30) this.active = false;
    }
    draw(ctx) {
      ctx.save(); ctx.translate(this.x, this.y); ctx.shadowColor = '#ff395f'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#ff395f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.stroke(); ctx.restore();
    }
  }
  ns.entities.EnemyBullet = EnemyBullet;
})(globalThis.SkyStrike);
