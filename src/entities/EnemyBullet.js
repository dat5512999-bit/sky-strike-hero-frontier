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
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Math.atan2(this.vy,this.vx)+Math.PI/2);ctx.globalCompositeOperation='lighter';
      const tail=ctx.createLinearGradient(0,-18,0,8);tail.addColorStop(0,'rgba(255,30,78,0)');tail.addColorStop(1,'rgba(255,60,100,.8)');ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-4,-20);ctx.lineTo(4,-20);ctx.lineTo(2,4);ctx.lineTo(-2,4);ctx.fill();
      ctx.shadowColor='#ff395f';ctx.shadowBlur=15;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,5,3.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff395f';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,5,6.5,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }
  ns.entities.EnemyBullet = EnemyBullet;
})(globalThis.SkyStrike);
