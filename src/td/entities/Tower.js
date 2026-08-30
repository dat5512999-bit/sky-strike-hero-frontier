(function(ns){
  'use strict';
  class Tower{
    constructor(type,x,y){const cfg=ns.config.towers[type];this.type=type;this.x=x;this.y=y;this.level=1;this.cooldown=.2;this.totalSpent=cfg.cost;this.aim=-Math.PI/2;}
    config(){const cfg=ns.config.towers[this.type];const power=1+(this.level-1)*.42;return Object.assign({},cfg,{damage:cfg.damage*power,range:cfg.range+(this.level-1)*10,interval:cfg.interval*Math.pow(.9,this.level-1)});}
    update(dt,monsters,projectiles){this.cooldown-=dt;if(this.cooldown>0)return;const cfg=this.config();const candidates=monsters.filter(function(monster){return monster.active&&ns.utils.distance(this,monster)<=cfg.range;},this).sort(function(a,b){return b.progress()-a.progress();});const target=candidates[0];if(!target)return;this.aim=Math.atan2(target.y-this.y,target.x-this.x);projectiles.push(new ns.entities.Projectile(this,target,{damage:cfg.damage,color:cfg.color,slow:cfg.slow,slowTime:cfg.slowTime,splash:cfg.splash,speed:this.type==='cannon'?300:450}));this.cooldown=cfg.interval;}
    upgradeCost(){return this.level>=3?0:55+this.level*35;}
    upgrade(){const cost=this.upgradeCost();if(!cost)return 0;this.level+=1;this.totalSpent+=cost;return cost;}
    sellValue(){return Math.floor(this.totalSpent*.7);}
    draw(ctx,selected){const cfg=this.config();ctx.save();ctx.translate(this.x,this.y);if(selected){ctx.strokeStyle=cfg.color;ctx.globalAlpha=.18;ctx.fillStyle=cfg.color;ctx.beginPath();ctx.arc(0,0,cfg.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.8;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;}
      ctx.fillStyle='#453629';ctx.beginPath();ctx.arc(0,8,26,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a38558';ctx.fillRect(-17,-11,34,27);ctx.fillStyle='#d2bc83';ctx.fillRect(-13,-16,8,8);ctx.fillRect(5,-16,8,8);
      ctx.rotate(this.aim);ctx.fillStyle=cfg.color;ctx.shadowColor=cfg.color;ctx.shadowBlur=9;ctx.fillRect(0,-5,31,10);ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.fillStyle='#fff4bd';ctx.font='700 11px Segoe UI';ctx.textAlign='center';ctx.fillText('L'+this.level,this.x,this.y+40);ctx.restore();}
  }
  ns.entities.Tower=Tower;
})(globalThis.TowerFrontier);
