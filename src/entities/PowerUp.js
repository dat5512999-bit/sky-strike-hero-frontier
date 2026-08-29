(function (ns) {
  'use strict';
  class PowerUp {
    constructor(x, y, type) {
      this.x = x; this.y = y; this.type = type; this.active = true;
      this.width = 30; this.height = 30; this.speed = 92; this.time = 0;
    }
    update(dt) { this.time += dt; this.y += this.speed * dt; this.x += Math.sin(this.time * 3) * 18 * dt; if (this.y > ns.config.height + 30) this.active = false; }
    draw(ctx) {
      const colors = { strawberry:'#ff4f72', banana:'#ffd84f', grape:'#a978ff', pineapple:'#ffad3d' };
      ctx.save(); ctx.translate(this.x,this.y); ctx.shadowColor=colors[this.type]; ctx.shadowBlur=14;
      ctx.fillStyle='rgba(5,15,25,.78)'; ctx.beginPath(); ctx.arc(0,0,17,0,Math.PI*2); ctx.fill();
      if (this.type === 'strawberry') { ctx.fillStyle=colors[this.type]; ctx.beginPath(); ctx.moveTo(-10,-5); ctx.quadraticCurveTo(0,18,10,-5); ctx.quadraticCurveTo(0,-15,-10,-5); ctx.fill(); ctx.fillStyle='#62cb63'; ctx.fillRect(-7,-13,14,5); }
      if (this.type === 'banana') { ctx.strokeStyle=colors[this.type]; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(-2,-3,11,-.1,1.8); ctx.stroke(); }
      if (this.type === 'grape') { [[-6,-5],[3,-7],[-3,3],[6,2],[1,10]].forEach(function(p){ ctx.fillStyle=colors.grape; ctx.beginPath(); ctx.arc(p[0],p[1],6,0,Math.PI*2); ctx.fill(); }); ctx.fillStyle='#62cb63'; ctx.fillRect(-1,-16,4,7); }
      if (this.type === 'pineapple') { ctx.fillStyle=colors[this.type]; ctx.beginPath(); ctx.ellipse(0,3,9,13,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#8b6320'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-7,-4);ctx.lineTo(7,10);ctx.moveTo(7,-4);ctx.lineTo(-7,10);ctx.stroke(); ctx.fillStyle='#58bd5d'; ctx.fillRect(-3,-16,6,8); }
      ctx.restore();
    }
  }
  ns.entities.PowerUp = PowerUp;
})(globalThis.SkyStrike);
