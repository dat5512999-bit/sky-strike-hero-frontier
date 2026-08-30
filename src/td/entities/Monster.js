(function(ns){
  'use strict';
  const TYPES={
    grunt:{name:'荒原步兵',color:'#db604f',speed:52,health:70,reward:12,radius:16,baseDamage:1},
    runner:{name:'疾風獵犬',color:'#e6bb45',speed:92,health:52,reward:13,radius:13,baseDamage:1},
    brute:{name:'岩甲巨獸',color:'#8c78b8',speed:38,health:190,reward:24,radius:22,baseDamage:2,armor:2},
    shaman:{name:'虛空術士',color:'#59c992',speed:48,health:112,reward:19,radius:17,baseDamage:1},
    boss:{name:'深淵戰將',color:'#ff416d',speed:31,health:720,reward:130,radius:30,baseDamage:5,armor:4}
  };
  class Monster{
    constructor(type,wave,path){
      const preset=TYPES[type]||TYPES.grunt;const scale=1+(wave-1)*.105;
      Object.assign(this,preset);this.type=type;this.wave=wave;this.path=path||ns.config.path;this.x=this.path[0].x;this.y=this.path[0].y;this.index=1;
      this.health=Math.round(this.health*scale);this.maxHealth=this.health;this.reward=Math.round(this.reward*(1+(wave-1)*.025));this.active=true;this.leaked=false;this.slowFactor=1;this.slowTimer=0;this.hitFlash=0;
    }
    update(dt,hero){
      if(!this.active)return;this.hitFlash=Math.max(0,this.hitFlash-dt);this.slowTimer=Math.max(0,this.slowTimer-dt);if(this.slowTimer<=0)this.slowFactor=1;
      const intercepted=hero&&hero.active&&ns.utils.distance(this,hero)<46?.78:1;let remaining=this.speed*this.slowFactor*intercepted*dt;
      while(remaining>0&&this.active){const target=this.path[this.index];if(!target){this.active=false;this.leaked=true;break;}const distance=Math.hypot(target.x-this.x,target.y-this.y);if(distance<=remaining){this.x=target.x;this.y=target.y;this.index+=1;remaining-=distance;}else{this.x+=(target.x-this.x)/distance*remaining;this.y+=(target.y-this.y)/distance*remaining;remaining=0;}}
    }
    takeDamage(amount){if(!this.active)return false;this.health-=Math.max(1,amount-(this.armor||0));this.hitFlash=.1;if(this.health<=0){this.health=0;this.active=false;return true;}return false;}
    applySlow(factor,time){this.slowFactor=Math.min(this.slowFactor,factor);this.slowTimer=Math.max(this.slowTimer,time);}
    progress(){return this.index+this.x/10000;}
    draw(ctx){
      ctx.save();ctx.translate(this.x,this.y);ctx.shadowColor=this.color;ctx.shadowBlur=this.type==='boss'?16:7;
      ctx.fillStyle='#201a1b';ctx.beginPath();ctx.ellipse(0,10,this.radius*1.05,this.radius*.55,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=this.hitFlash>0?'#fff':this.color;ctx.beginPath();ctx.arc(0,0,this.radius,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#2b2030';ctx.beginPath();ctx.moveTo(-this.radius*.7,-this.radius*.25);ctx.lineTo(0,-this.radius*1.3);ctx.lineTo(this.radius*.7,-this.radius*.25);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff3bc';ctx.beginPath();ctx.arc(-this.radius*.35,-2,2.5,0,Math.PI*2);ctx.arc(this.radius*.35,-2,2.5,0,Math.PI*2);ctx.fill();
      if(this.slowTimer>0){ctx.strokeStyle='#70e7ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,this.radius+6,0,Math.PI*2);ctx.stroke();}
      ctx.shadowBlur=0;ctx.fillStyle='rgba(8,7,12,.8)';ctx.fillRect(-this.radius,-this.radius-13,this.radius*2,5);ctx.fillStyle=this.color;ctx.fillRect(-this.radius,-this.radius-13,this.radius*2*(this.health/this.maxHealth),5);ctx.restore();
    }
  }
  Monster.TYPES=TYPES;ns.entities.Monster=Monster;
})(globalThis.TowerFrontier);
