(function(ns){
  'use strict';
  class Hero{
    constructor(x,y){const cfg=ns.config.hero;this.x=x;this.y=y;this.targetX=x;this.targetY=y;this.health=cfg.maxHealth;this.maxHealth=cfg.maxHealth;this.cooldown=0;this.novaCooldown=0;this.facing=0;this.active=true;}
    setTarget(x,y){this.targetX=ns.utils.clamp(x,25,ns.config.width-25);this.targetY=ns.utils.clamp(y,55,ns.config.height-25);}
    update(dt,monsters,projectiles){const cfg=ns.config.hero;const dx=this.targetX-this.x,dy=this.targetY-this.y,distance=Math.hypot(dx,dy);if(distance>2){const move=Math.min(distance,cfg.speed*dt);this.x+=dx/distance*move;this.y+=dy/distance*move;this.facing=Math.atan2(dy,dx);}this.cooldown-=dt;this.novaCooldown=Math.max(0,this.novaCooldown-dt);if(this.cooldown<=0){const target=monsters.filter(function(m){return m.active&&ns.utils.distance(this,m)<=cfg.range;},this).sort(function(a,b){return b.progress()-a.progress();})[0];if(target){this.facing=Math.atan2(target.y-this.y,target.x-this.x);projectiles.push(new ns.entities.Projectile(this,target,{damage:cfg.damage,color:'#8fffc4',speed:520}));this.cooldown=cfg.interval;}}}
    castNova(monsters,onKill){const cfg=ns.config.hero;if(this.novaCooldown>0)return false;monsters.forEach(function(monster){if(monster.active&&ns.utils.distance(this,monster)<=cfg.novaRange){monster.applySlow(.38,2.4);if(monster.takeDamage(cfg.novaDamage)&&onKill)onKill(monster);}},this);this.novaCooldown=cfg.novaCooldown;return true;}
    draw(ctx,art){if(!(art&&art.drawUnit(ctx,'hero',this.x,this.y,88))){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle='#e8ddbd';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(18,18);ctx.lineTo(-18,18);ctx.closePath();ctx.fill();ctx.restore();}
      ctx.save();ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(this.x-28,this.y+27,56,5);ctx.fillStyle='#65efb2';ctx.fillRect(this.x-28,this.y+27,56*(this.health/this.maxHealth),5);ctx.restore();}
  }
  ns.entities.Hero=Hero;
})(globalThis.TowerFrontier);
