(function (ns) {
  'use strict';
  class Effects {
    constructor(random) { this.random=random||Math.random; this.flashes=[]; this.particles=[]; this.banner=null; this.trauma=0; }
    clear() { this.flashes.length=0; this.particles.length=0; this.banner=null; this.trauma=0; }
    burst(x, y, color, strength) {
      const power=strength||1;
      this.flashes.push({x:x,y:y,color:color,age:0,life:.32,size:power});
      const count=Math.round(14+power*8);
      for(let i=0;i<count;i+=1){
        const angle=this.random()*Math.PI*2; const speed=(55+this.random()*190)*power;
        this.particles.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,color:i%4===0?'#ffffff':color,age:0,life:.34+this.random()*.48,size:1.2+this.random()*3.2*power,drag:.91+this.random()*.05});
      }
      this.trauma=Math.min(10,this.trauma+2.8*power);
    }
    hit(x,y,color){
      for(let i=0;i<6;i+=1){const angle=this.random()*Math.PI*2;this.particles.push({x:x,y:y,vx:Math.cos(angle)*(35+this.random()*75),vy:Math.sin(angle)*(35+this.random()*75),color:color,age:0,life:.18+this.random()*.16,size:1+this.random()*2,drag:.86});}
    }
    announce(text, color) { this.banner = { text:text, color:color||'#ffffff', age:0, life:1.7 }; }
    update(dt) {
      this.flashes.forEach(function (fx) { fx.age += dt; });
      this.flashes = this.flashes.filter(function (fx) { return fx.age < fx.life; });
      this.particles.forEach(function(p){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(p.drag,dt*60);p.vy*=Math.pow(p.drag,dt*60);});
      this.particles=this.particles.filter(function(p){return p.age<p.life;});
      this.trauma=Math.max(0,this.trauma-dt*15);
      if (this.banner) { this.banner.age += dt; if (this.banner.age >= this.banner.life) this.banner = null; }
    }
    offset(){return this.trauma>.1?{x:(this.random()-.5)*this.trauma,y:(this.random()-.5)*this.trauma}:{x:0,y:0};}
    draw(ctx) {
      ctx.save(); ctx.globalCompositeOperation='lighter';
      this.particles.forEach(function(p){const t=p.age/p.life;ctx.globalAlpha=(1-t)*.92;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=7;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(1-t*.55),0,Math.PI*2);ctx.fill();});
      ctx.restore();
      this.flashes.forEach(function (fx) {
        const t = fx.age / fx.life;
        ctx.save();
        ctx.globalCompositeOperation='lighter'; ctx.globalAlpha = 1 - t;
        const core=ctx.createRadialGradient(fx.x,fx.y,0,fx.x,fx.y,18+fx.size*16);core.addColorStop(0,'#ffffff');core.addColorStop(.18,fx.color);core.addColorStop(1,'transparent');ctx.fillStyle=core;ctx.fillRect(fx.x-40,fx.y-40,80,80);
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 5 * (1 - t);
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, 7 + t * (34+fx.size*12), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      if (this.banner) {
        const t=this.banner.age/this.banner.life;
        const alpha=Math.min(1,t*5,(1-t)*3); const y=ns.config.height*.32-(1-alpha)*9;
        ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='rgba(1,8,15,.78)';ctx.fillRect(58,y-28,364,56);ctx.strokeStyle=this.banner.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(82,y-27);ctx.lineTo(398,y-27);ctx.moveTo(82,y+27);ctx.lineTo(398,y+27);ctx.stroke();ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.font='800 23px "Segoe UI","Microsoft JhengHei",sans-serif';ctx.fillStyle='#ffffff';ctx.shadowColor=this.banner.color;ctx.shadowBlur=12;ctx.fillText(this.banner.text,ns.config.width/2,y);ctx.restore();
      }
    }
  }
  ns.systems.Effects = Effects;
})(globalThis.SkyStrike);
