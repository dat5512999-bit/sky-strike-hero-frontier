(function(ns){
  'use strict';
  class Building{
    constructor(type,x,y){const cfg=ns.config.buildings[type];this.kind='building';this.type=type;this.x=x;this.y=y;this.level=1;this.cooldown=.2;this.totalSpent=cfg.cost;this.aim=-Math.PI/2;}
    config(){const cfg=ns.config.buildings[this.type];const power=1+(this.level-1)*.34;return Object.assign({},cfg,{damage:cfg.damage*power,range:cfg.range+(this.level-1)*8,interval:cfg.interval*Math.pow(.94,this.level-1),splash:cfg.splash?cfg.splash+(this.level-1)*5:0});}
    update(dt,monsters,projectiles){this.cooldown-=dt;if(this.cooldown>0)return;const cfg=this.config();const target=monsters.filter(function(monster){return monster.active&&ns.utils.distance(this,monster)<=cfg.range;},this).sort(function(a,b){return b.progress()-a.progress();})[0];if(!target)return;this.aim=Math.atan2(target.y-this.y,target.x-this.x);projectiles.push(new ns.entities.Projectile(this,target,{damage:cfg.damage,color:cfg.color,splash:cfg.splash,slow:cfg.slow,slowTime:cfg.slowTime,attackType:cfg.attackType,speed:this.type==='cannon'?280:440}));this.cooldown=cfg.interval;}
    upgradeCost(){if(this.level>=5)return null;return{gold:65+this.level*45,merit:this.level>=3?this.level-2:0};}
    upgrade(){const cost=this.upgradeCost();if(!cost)return null;this.level+=1;this.totalSpent+=cost.gold;return cost;}
    sellValue(){return Math.floor(this.totalSpent*.7);}
    draw(ctx,selected,art){const cfg=this.config();if(selected){ctx.save();ctx.globalAlpha=.13;ctx.fillStyle=cfg.color;ctx.beginPath();ctx.arc(this.x,this.y,cfg.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle=cfg.color;ctx.lineWidth=2;ctx.stroke();ctx.restore();}if(!(art&&art.drawBuilding(ctx,this.type,this.x,this.y,this.level))){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle='#88704b';ctx.fillRect(-25,-36,50,52);ctx.restore();}ctx.save();ctx.fillStyle='#fff4bd';ctx.strokeStyle='rgba(0,0,0,.85)';ctx.lineWidth=3;ctx.font='700 11px Segoe UI';ctx.textAlign='center';ctx.strokeText('L'+this.level,this.x,this.y+30);ctx.fillText('L'+this.level,this.x,this.y+30);ctx.restore();}
  }
  ns.entities.Building=Building;
})(globalThis.TowerFrontier);
