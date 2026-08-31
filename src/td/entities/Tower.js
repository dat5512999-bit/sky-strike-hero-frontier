(function(ns){
  'use strict';
  class Tower{
    constructor(type,x,y){const cfg=ns.config.towers[type];this.type=type;this.x=x;this.y=y;this.level=1;this.cooldown=.2;this.totalSpent=cfg.cost;this.aim=-Math.PI/2;}
    config(){const cfg=ns.config.towers[this.type];const power=1+(this.level-1)*.38;return Object.assign({},cfg,{damage:cfg.damage*power,range:cfg.range+(this.level-1)*9,interval:cfg.interval*Math.pow(.92,this.level-1),shots:this.type==='hunter'&&this.level>=3?(this.level>=5?3:2):1,splash:cfg.splash?cfg.splash+(this.level-1)*5:0,bountyBonus:cfg.bountyBonus?cfg.bountyBonus+(this.level-1)*.08:0});}
    update(dt,monsters,projectiles){this.cooldown-=dt;if(this.cooldown>0)return;const cfg=this.config();const candidates=monsters.filter(function(monster){return monster.active&&ns.utils.distance(this,monster)<=cfg.range;},this).sort(function(a,b){return b.progress()-a.progress();});if(!candidates.length)return;this.aim=Math.atan2(candidates[0].y-this.y,candidates[0].x-this.x);candidates.slice(0,cfg.shots).forEach(function(target){projectiles.push(new ns.entities.Projectile(this,target,{damage:cfg.damage,color:cfg.color,splash:cfg.splash,attackType:cfg.attackType,bountyBonus:cfg.bountyBonus,speed:this.type==='arcanist'?320:480}));},this);this.cooldown=cfg.interval;}
    upgradeCost(){if(this.level>=5)return null;return{gold:45+this.level*40,merit:this.level>=3?this.level-2:0};}
    upgrade(){const cost=this.upgradeCost();if(!cost)return null;this.level+=1;this.totalSpent+=cost.gold;return cost;}
    sellValue(){return Math.floor(this.totalSpent*.7);}
    draw(ctx,selected,art){const cfg=this.config();if(selected){ctx.save();ctx.strokeStyle=cfg.color;ctx.globalAlpha=.14;ctx.fillStyle=cfg.color;ctx.beginPath();ctx.arc(this.x,this.y,cfg.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.85;ctx.lineWidth=2;ctx.stroke();ctx.restore();}
      if(!(art&&art.drawTower(ctx,this.type,this.x,this.y))){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle='#453629';ctx.beginPath();ctx.arc(0,8,26,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a38558';ctx.fillRect(-17,-11,34,27);ctx.rotate(this.aim);ctx.fillStyle=cfg.color;ctx.fillRect(0,-5,31,10);ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.restore();}
      ctx.save();ctx.fillStyle='#fff4bd';ctx.strokeStyle='rgba(0,0,0,.85)';ctx.lineWidth=3;ctx.font='700 11px Segoe UI';ctx.textAlign='center';ctx.strokeText('L'+this.level,this.x,this.y+27);ctx.fillText('L'+this.level,this.x,this.y+27);ctx.restore();}
  }
  ns.entities.Tower=Tower;
})(globalThis.TowerFrontier);
