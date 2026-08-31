(function(ns){
  'use strict';
  class Projectile{
    constructor(source,target,options){this.x=source.x;this.y=source.y;this.target=target;Object.assign(this,options);this.speed=this.speed||420;this.active=true;}
    update(dt,monsters,onKill){
      if(!this.active)return;const target=this.target;if(!target||!target.active){this.active=false;return;}const distance=ns.utils.distance(this,target);const move=this.speed*dt;
      if(distance<=move+target.radius){this.hit(monsters,onKill);this.active=false;return;}this.x+=(target.x-this.x)/distance*move;this.y+=(target.y-this.y)/distance*move;
    }
    hit(monsters,onKill){const self=this;const victims=this.splash?monsters.filter(function(m){return m.active&&ns.utils.distance(m,self.target)<=self.splash;}):[this.target];victims.forEach(function(monster){if(self.slow)monster.applySlow(self.slow,self.slowTime);const table=ns.config.damageMultipliers[self.attackType]||{};const damage=self.damage*(table[monster.armorType]||1);if(monster.takeDamage(damage)&&onKill)onKill(monster,self);});}
    draw(ctx){ctx.save();ctx.strokeStyle=this.color;ctx.lineWidth=3;ctx.shadowColor=this.color;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(this.x,this.y+8);ctx.lineTo(this.x,this.y);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(this.x,this.y,3.5,0,Math.PI*2);ctx.fill();ctx.restore();}
  }
  ns.entities.Projectile=Projectile;
})(globalThis.TowerFrontier);
