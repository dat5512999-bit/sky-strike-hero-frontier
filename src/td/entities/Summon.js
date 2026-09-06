(function(ns){
  'use strict';
  class Summon{
    constructor(owner,options){Object.assign(this,{owner:owner,x:owner.x+16,y:owner.y+10,active:true,time:options.duration||12,damage:options.damage||12,range:options.range||120,leash:options.leash||195,color:options.color||'#97ffe0',cooldown:.2,clock:0});}
    update(dt,monsters,projectiles){
      this.time-=dt;this.clock+=dt;this.cooldown-=dt;
      if(this.time<=0||this.owner.retired){this.active=false;return;}
      const target=monsters.filter(function(m){return m.active&&ns.utils.distance(this.owner,m)<=this.leash;},this).sort(function(a,b){return b.progress()-a.progress();})[0];
      const destination=target||this.owner,dx=destination.x-this.x,dy=destination.y-this.y,distance=Math.hypot(dx,dy);
      if(distance>(target?35:25)){const move=Math.min(distance,90*dt);this.x+=dx/distance*move;this.y+=dy/distance*move;}
      if(target&&this.cooldown<=0&&ns.utils.distance(this,target)<=this.range){projectiles.push(new ns.entities.Projectile(this.owner,target,{x:this.x,y:this.y,damage:this.damage,color:this.color,attackType:'magic',speed:360,style:'spirit'}));this.cooldown=.85;}
    }
    draw(ctx){ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=Math.min(.85,this.time/2);ctx.strokeStyle=this.color;ctx.fillStyle=this.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,9,13,5,0,0,Math.PI*2);ctx.stroke();ctx.translate(0,Math.sin(this.clock*5)*3);ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(12,3);ctx.lineTo(5,0);ctx.lineTo(0,10);ctx.lineTo(-5,0);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();ctx.fillStyle='#142130';ctx.fillRect(-5,-15,3,3);ctx.fillRect(2,-15,3,3);ctx.strokeStyle='#e7eacb';ctx.beginPath();ctx.moveTo(15,-24);ctx.lineTo(15,9);ctx.stroke();ctx.restore();}
  }
  ns.entities.Summon=Summon;
})(globalThis.TowerFrontier);
