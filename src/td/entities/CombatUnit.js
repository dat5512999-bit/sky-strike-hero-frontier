(function(ns){
  'use strict';
  class CombatUnit{
    constructor(type,x,y){const cfg=ns.config.units[type];this.kind='unit';this.type=type;this.x=x;this.y=y;this.targetX=x;this.targetY=y;this.level=1;this.cooldown=.18;this.totalSpent=cfg.cost;this.facing=-Math.PI/2;this.state='idle';this.frame=0;this.frameClock=0;this.attackTimer=0;this.commandPulse=0;}
    config(){const cfg=ns.config.units[this.type];const power=1+(this.level-1)*.38;return Object.assign({},cfg,{damage:cfg.damage*power,range:cfg.range+(this.level-1)*9,interval:cfg.interval*Math.pow(.92,this.level-1),shots:this.type==='hunter'&&this.level>=3?(this.level>=5?3:2):1,splash:cfg.splash?cfg.splash+(this.level-1)*5:0,bountyBonus:cfg.bountyBonus?cfg.bountyBonus+(this.level-1)*.08:0});}
    setState(state){if(this.state===state)return;this.state=state;this.frame=0;this.frameClock=0;}
    animate(dt){const fps={idle:2.8,walk:8,attack:10,hit:8,death:6}[this.state]||4;this.frameClock+=dt*fps;this.frame=Math.floor(this.frameClock)%4;}
    setTarget(x,y){this.targetX=ns.utils.clamp(x,28,ns.config.width-28);this.targetY=ns.utils.clamp(y,58,ns.config.height-28);this.commandPulse=.42;return true;}
    isMoving(){return Math.hypot(this.targetX-this.x,this.targetY-this.y)>3;}
    update(dt,monsters,projectiles){const cfg=this.config();this.cooldown-=dt;this.attackTimer=Math.max(0,this.attackTimer-dt);this.commandPulse=Math.max(0,this.commandPulse-dt);const dx=this.targetX-this.x,dy=this.targetY-this.y,distance=Math.hypot(dx,dy);if(distance>3){const move=Math.min(distance,cfg.speed*dt);this.x+=dx/distance*move;this.y+=dy/distance*move;this.facing=Math.atan2(dy,dx);if(move<distance){this.setState('walk');this.animate(dt);return;}this.x=this.targetX;this.y=this.targetY;}
      const candidates=monsters.filter(function(monster){return monster.active&&ns.utils.distance(this,monster)<=cfg.range;},this).sort(function(a,b){return b.progress()-a.progress();});const target=candidates[0];if(target){this.facing=Math.atan2(target.y-this.y,target.x-this.x);if(this.cooldown<=0){candidates.slice(0,cfg.shots).forEach(function(enemy){projectiles.push(new ns.entities.Projectile(this,enemy,{damage:cfg.damage,color:cfg.color,splash:cfg.splash,attackType:cfg.attackType,bountyBonus:cfg.bountyBonus,speed:this.type==='arcanist'?320:480}));},this);this.cooldown=cfg.interval;this.attackTimer=Math.min(.38,cfg.interval*.65);this.setState('attack');}else if(this.attackTimer<=0)this.setState('idle');}else this.setState('idle');this.animate(dt);
    }
    upgradeCost(){if(this.level>=5)return null;return{gold:45+this.level*40,merit:this.level>=3?this.level-2:0};}
    upgrade(){const cost=this.upgradeCost();if(!cost)return null;this.level+=1;this.totalSpent+=cost.gold;return cost;}
    sellValue(){return Math.floor(this.totalSpent*.7);}
    draw(ctx,selected,art){const cfg=this.config();if(selected){ctx.save();ctx.globalAlpha=.13;ctx.fillStyle=cfg.color;ctx.beginPath();ctx.arc(this.x,this.y,cfg.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.95;ctx.strokeStyle='#63ff72';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(this.x,this.y+18,25,10,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      if(!(art&&art.drawCombatUnit(ctx,this))){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle=cfg.color;ctx.beginPath();ctx.arc(0,-12,15,0,Math.PI*2);ctx.fill();ctx.restore();}
      if(this.commandPulse>0){ctx.save();ctx.globalAlpha=this.commandPulse/.42;ctx.strokeStyle='#7dff85';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.targetX,this.targetY,9+(1-this.commandPulse/.42)*13,0,Math.PI*2);ctx.stroke();ctx.restore();}
      ctx.save();ctx.fillStyle='#fff4bd';ctx.strokeStyle='rgba(0,0,0,.85)';ctx.lineWidth=3;ctx.font='700 11px Segoe UI';ctx.textAlign='center';ctx.strokeText('L'+this.level,this.x,this.y+31);ctx.fillText('L'+this.level,this.x,this.y+31);ctx.restore();}
  }
  ns.entities.CombatUnit=CombatUnit;
})(globalThis.TowerFrontier);
