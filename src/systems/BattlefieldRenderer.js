(function (ns) {
  'use strict';
  class BattlefieldRenderer {
    constructor(random) {
      this.random = random || Math.random;
      this.time = 0;
      this.stars = [];
      this.motes = [];
      this.reset();
    }

    reset() {
      this.time = 0;
      this.stars.length = 0;
      this.motes.length = 0;
      for (let i = 0; i < 82; i += 1) {
        const depth = 0.25 + this.random() * 0.75;
        this.stars.push({ x:this.random()*ns.config.width, y:this.random()*ns.config.height, depth:depth, speed:28+depth*105, size:.45+depth*1.65 });
      }
      for (let i = 0; i < 13; i += 1) {
        this.motes.push({ x:this.random()*ns.config.width, y:this.random()*ns.config.height, radius:22+this.random()*60, speed:8+this.random()*18, alpha:.018+this.random()*.035 });
      }
    }

    update(dt) {
      this.time += dt;
      this.stars.forEach(function (star) {
        star.y += star.speed * dt;
        if (star.y > ns.config.height + 12) { star.y = -12; star.x = Math.random()*ns.config.width; }
      });
      this.motes.forEach(function (mote) {
        mote.y += mote.speed * dt;
        mote.x += Math.sin(this.time*.18+mote.radius)*3*dt;
        if (mote.y-mote.radius > ns.config.height) { mote.y=-mote.radius; mote.x=Math.random()*ns.config.width; }
      }, this);
    }

    draw(ctx, skin, threat) {
      const top = skin.background[0];
      const bottom = skin.background[1];
      const gradient = ctx.createLinearGradient(0,0,0,ns.config.height);
      gradient.addColorStop(0,top); gradient.addColorStop(.55,bottom); gradient.addColorStop(1,'#010407');
      ctx.fillStyle=gradient; ctx.fillRect(0,0,ns.config.width,ns.config.height);

      const aura = ctx.createRadialGradient(ns.config.width*.52,ns.config.height*.18,10,ns.config.width*.52,ns.config.height*.18,310);
      aura.addColorStop(0,skin.accent+'24'); aura.addColorStop(.46,skin.secondary+'0d'); aura.addColorStop(1,'transparent');
      ctx.fillStyle=aura; ctx.fillRect(0,0,ns.config.width,ns.config.height*.72);

      ctx.save(); ctx.globalCompositeOperation='screen';
      this.motes.forEach(function(mote,index){
        ctx.globalAlpha=mote.alpha; ctx.fillStyle=index%2?skin.accent:skin.secondary;
        ctx.beginPath(); ctx.ellipse(mote.x,mote.y,mote.radius,mote.radius*.32,Math.sin(index)*.5,0,Math.PI*2); ctx.fill();
      });
      this.stars.forEach(function(star){
        ctx.globalAlpha=.22+star.depth*.55; ctx.strokeStyle=skin.star; ctx.lineWidth=star.size;
        ctx.beginPath(); ctx.moveTo(star.x,star.y); ctx.lineTo(star.x,star.y+5+star.depth*13); ctx.stroke();
      });
      ctx.restore();

      ctx.save(); ctx.globalAlpha=.07+.012*(threat||1); ctx.strokeStyle=skin.accent; ctx.lineWidth=1;
      const scroll=(this.time*76)%90;
      for(let y=-90+scroll;y<ns.config.height+90;y+=90){
        ctx.beginPath(); ctx.moveTo(ns.config.width*.5-26,y); ctx.lineTo(ns.config.width*.5+26,y); ctx.stroke();
      }
      ctx.setLineDash([5,18]);
      [ns.config.width*.2,ns.config.width*.8].forEach(function(x){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,ns.config.height);ctx.stroke();});
      ctx.restore();

      const vignette=ctx.createRadialGradient(ns.config.width/2,ns.config.height*.48,150,ns.config.width/2,ns.config.height*.48,430);
      vignette.addColorStop(.45,'transparent'); vignette.addColorStop(1,'rgba(0,0,0,.62)');
      ctx.fillStyle=vignette; ctx.fillRect(0,0,ns.config.width,ns.config.height);
      const danger=Math.max(0,(threat||1)-3)*.025;
      if(danger){ctx.fillStyle='rgba(255,25,70,'+danger+')';ctx.fillRect(0,0,ns.config.width,ns.config.height);}
    }
  }
  ns.systems.BattlefieldRenderer=BattlefieldRenderer;
})(globalThis.SkyStrike);
