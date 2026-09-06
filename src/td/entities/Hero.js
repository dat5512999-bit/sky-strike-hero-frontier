(function(ns){
  'use strict';
  class Hero{
    constructor(x,y){const cfg=ns.config.hero;Object.assign(this,{x:x,y:y,targetX:x,targetY:y,health:cfg.maxHealth,maxHealth:cfg.maxHealth,cooldown:0,novaCooldown:0,facing:0,active:true,state:'idle',frame:0,animationTime:0,attackTimer:0,castTimer:0,pendingTarget:null,selected:false,equipment:{spear:0,rune:0,charm:0},skillCooldowns:{thunder:0,summon:0}});}
    combatConfig(){const base=ns.config.hero,power=1+this.equipment.spear*.2;return Object.assign({},base,{damage:base.damage*power,novaDamage:base.novaDamage*power,novaCooldown:base.novaCooldown*(1-this.equipment.rune*.1)});}
    beginCast(){this.castTimer=.56;this.attackTimer=0;this.pendingTarget=null;this.setState('cast');}
    castThunder(monsters,onKill,projectiles){if(this.skillCooldowns.thunder>0)return false;const targets=monsters.filter(function(m){return m.active&&ns.utils.distance(this,m)<=220;},this).sort(function(a,b){return b.progress()-a.progress();}).slice(0,4);if(!targets.length)return false;const shot=new ns.entities.Projectile(this,targets[0],{damage:55*(1+this.equipment.spear*.2),color:'#b9eaff',attackType:'magic',chain:4,chainRange:110});shot.hit(monsters,onKill);if(projectiles)projectiles.push(shot);this.skillCooldowns.thunder=12*(1-this.equipment.rune*.1);this.beginCast();return true;}
    castSummon(summons){if(this.skillCooldowns.summon>0)return false;const cap=2+(this.equipment.charm>=3?1:0),existing=summons.filter(function(unit){return unit.active&&unit.owner===this;},this).length;if(existing>=cap)return false;for(let i=existing;i<cap;i++)summons.push(new ns.entities.Summon(this,{duration:12+this.equipment.charm*3,damage:14*(1+this.equipment.charm*.2),color:'#94ffe0'}));this.skillCooldowns.summon=22*(1-this.equipment.rune*.1);this.beginCast();return true;}
    setTarget(x,y){this.targetX=ns.utils.clamp(x,25,ns.config.width-25);this.targetY=ns.utils.clamp(y,55,ns.config.height-25);}
    setState(state){if(this.state!==state){this.state=state;this.animationTime=0;}}
    update(dt,monsters,projectiles){
      const cfg=this.combatConfig();
      Object.keys(this.skillCooldowns).forEach(function(id){this.skillCooldowns[id]=Math.max(0,this.skillCooldowns[id]-dt);},this);
      this.cooldown=Math.max(0,this.cooldown-dt);this.novaCooldown=Math.max(0,this.novaCooldown-dt);
      this.castTimer=Math.max(0,this.castTimer-dt);
      if(this.attackTimer>0){const before=this.attackTimer;this.attackTimer=Math.max(0,this.attackTimer-dt);if(before>.18&&this.attackTimer<=.18){const target=this.pendingTarget;if(target&&target.active&&ns.utils.distance(this,target)<=cfg.range+20)projectiles.push(new ns.entities.Projectile(this,target,{damage:cfg.damage,color:'#8fffc4',speed:520}));this.pendingTarget=null;}}
      const dx=this.targetX-this.x,dy=this.targetY-this.y,distance=Math.hypot(dx,dy);
      if(this.castTimer>0)this.setState('cast');
      else if(this.attackTimer>0)this.setState('attack');
      else if(distance>2){const move=Math.min(distance,cfg.speed*dt);this.x+=dx/distance*move;this.y+=dy/distance*move;this.facing=Math.atan2(dy,dx);this.setState('walk');}
      else this.setState('idle');
      if(this.cooldown<=0&&this.castTimer<=0&&this.attackTimer<=0){const target=monsters.filter(function(m){return m.active&&ns.utils.distance(this,m)<=cfg.range;},this).sort(function(a,b){return b.progress()-a.progress();})[0];if(target){this.facing=Math.atan2(target.y-this.y,target.x-this.x);this.pendingTarget=target;this.attackTimer=.36;this.cooldown=cfg.interval;this.setState('attack');}}
      this.animationTime+=dt;this.frame=(this.state==='attack'||this.state==='cast')?Math.min(3,Math.floor(this.animationTime/(this.state==='cast'?.14:.09))):Math.floor(this.animationTime*(this.state==='walk'?9:3))%4;
    }
    castNova(monsters,onKill){const cfg=this.combatConfig();if(this.novaCooldown>0)return false;monsters.forEach(function(monster){if(monster.active&&ns.utils.distance(this,monster)<=cfg.novaRange){monster.applySlow(.38,2.4);if(monster.takeDamage(cfg.novaDamage)&&onKill)onKill(monster);}},this);this.novaCooldown=cfg.novaCooldown;this.castTimer=.56;this.attackTimer=0;this.pendingTarget=null;this.setState('cast');return true;}
    draw(ctx,art){
      ctx.save();ctx.strokeStyle=this.selected?'#95ffe0':'#cbb66b';ctx.lineWidth=this.selected?3:1;ctx.beginPath();ctx.ellipse(this.x,this.y+15,28,11,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      if(!(art&&art.drawHero(ctx,this))&&!(art&&art.drawUnit(ctx,'hero',this.x,this.y,88))){ctx.save();ctx.fillStyle='#8fffc4';ctx.fillRect(this.x-12,this.y-32,24,46);ctx.restore();}
      ctx.save();if(this.state==='attack'){ctx.translate(this.x,this.y-18);ctx.rotate(this.facing);ctx.globalAlpha=this.attackTimer/.36;ctx.strokeStyle='#aaffdb';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(48,0);ctx.stroke();}ctx.restore();
      ctx.save();ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(this.x-28,this.y+29,56,5);ctx.fillStyle='#65efb2';ctx.fillRect(this.x-28,this.y+29,56*(this.health/this.maxHealth),5);ctx.fillStyle='#fff1be';ctx.font='bold 10px Segoe UI';ctx.textAlign='center';ctx.fillText('英雄',this.x,this.y+46);ctx.restore();
    }
  }
  ns.entities.Hero=Hero;
})(globalThis.TowerFrontier);
