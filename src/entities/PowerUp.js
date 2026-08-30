(function (ns) {
  'use strict';
  class PowerUp {
    constructor(x, y, type) {
      this.x = x; this.y = y; this.type = type; this.active = true;
      this.width = 30; this.height = 30; this.speed = 92; this.time = 0;
    }
    update(dt) { this.time += dt; this.y += this.speed * dt; this.x += Math.sin(this.time * 3) * 18 * dt; if (this.y > ns.config.height + 30) this.active = false; }
    draw(ctx) {
      const colors = { strawberry:'#ff4f72', banana:'#ffd84f', grape:'#a978ff', pineapple:'#ffad3d', dragonfruit:'#ff75d8', mirror:'#72e9ff', familiar:'#ffe178' };
      const color=colors[this.type]; const pulse=1+Math.sin(this.time*6)*.06;
      ctx.save();ctx.translate(this.x,this.y);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=this.type==='dragonfruit'?.22:.1;const beam=ctx.createLinearGradient(0,-75,0,75);beam.addColorStop(0,'transparent');beam.addColorStop(.5,color);beam.addColorStop(1,'transparent');ctx.fillStyle=beam;ctx.fillRect(-10,-75,20,150);ctx.restore();
      ctx.save(); ctx.translate(this.x,this.y);ctx.scale(pulse,pulse);ctx.shadowColor=color;ctx.shadowBlur=this.type==='dragonfruit'?24:16;
      ctx.save();ctx.rotate(this.time*.9);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.globalAlpha=.8;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(0,0,this.type==='dragonfruit'?23:20,0,Math.PI*2);ctx.stroke();ctx.restore();
      ctx.fillStyle='rgba(3,10,18,.9)'; ctx.beginPath(); ctx.arc(0,0,17,0,Math.PI*2); ctx.fill();
      if (this.type === 'strawberry') { ctx.fillStyle=colors[this.type]; ctx.beginPath(); ctx.moveTo(-10,-5); ctx.quadraticCurveTo(0,18,10,-5); ctx.quadraticCurveTo(0,-15,-10,-5); ctx.fill(); ctx.fillStyle='#62cb63'; ctx.fillRect(-7,-13,14,5); }
      if (this.type === 'banana') { ctx.strokeStyle=colors[this.type]; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(-2,-3,11,-.1,1.8); ctx.stroke(); }
      if (this.type === 'grape') { [[-6,-5],[3,-7],[-3,3],[6,2],[1,10]].forEach(function(p){ ctx.fillStyle=colors.grape; ctx.beginPath(); ctx.arc(p[0],p[1],6,0,Math.PI*2); ctx.fill(); }); ctx.fillStyle='#62cb63'; ctx.fillRect(-1,-16,4,7); }
      if (this.type === 'pineapple') { ctx.fillStyle=colors[this.type]; ctx.beginPath(); ctx.ellipse(0,3,9,13,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#8b6320'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-7,-4);ctx.lineTo(7,10);ctx.moveTo(7,-4);ctx.lineTo(-7,10);ctx.stroke(); ctx.fillStyle='#58bd5d'; ctx.fillRect(-3,-16,6,8); }
      if (this.type === 'dragonfruit') { ctx.fillStyle='#fff1fa'; ctx.beginPath(); ctx.ellipse(0,2,10,13,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=colors[this.type]; ctx.lineWidth=4; ctx.stroke(); [[-8,-9],[8,-7],[-10,4],[9,7],[0,14]].forEach(function(p){ctx.fillStyle='#69d66d';ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]-4,p[1]-7);ctx.lineTo(p[0]+3,p[1]-3);ctx.fill();}); }
      if (this.type === 'mirror') { ctx.strokeStyle=colors.mirror;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(11,-3);ctx.lineTo(7,12);ctx.lineTo(0,8);ctx.lineTo(-7,12);ctx.lineTo(-11,-3);ctx.closePath();ctx.stroke();ctx.fillStyle='#dffcff';ctx.fillRect(-2,-9,4,15); }
      if (this.type === 'familiar') { ctx.fillStyle='#fff5b8';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle=colors.familiar;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(4,-5);ctx.lineTo(14,0);ctx.lineTo(4,5);ctx.lineTo(0,14);ctx.lineTo(-4,5);ctx.lineTo(-14,0);ctx.lineTo(-4,-5);ctx.closePath();ctx.stroke(); }
      ctx.fillStyle='#fff';ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(-5,-7,2.2,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
  ns.entities.PowerUp = PowerUp;
})(globalThis.SkyStrike);
