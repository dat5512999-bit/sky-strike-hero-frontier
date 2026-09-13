(function(ns){
  'use strict';
  const TYPES={
    grunt:{name:'邊境步兵',color:'#db604f',speed:55,health:74,reward:12,radius:16,baseDamage:1,armorType:'light'},
    runner:{name:'疾風獵犬',color:'#e6bb45',speed:98,health:56,reward:13,radius:13,baseDamage:1,armorType:'light'},
    brute:{name:'岩甲巨獸',color:'#8c78b8',speed:40,health:205,reward:24,radius:22,baseDamage:2,armor:2,armorType:'heavy',combatRole:'siege',attackRange:42,attackDamage:10,attackInterval:1.8},
    shaman:{name:'虛空術士',color:'#59c992',speed:51,health:124,reward:19,radius:17,baseDamage:1,armorType:'arcane',combatRole:'hunter',attackRange:145,attackDamage:7,attackInterval:2.4},
    warder:{name:'戰紋盾衛',color:'#72a7d8',speed:46,health:158,reward:23,radius:20,baseDamage:2,armor:2,armorType:'heavy',barrier:72},
    healer:{name:'血契祭司',color:'#72d58b',speed:53,health:112,reward:22,radius:16,baseDamage:1,armorType:'arcane'},
    commander:{name:'軍團旗手',color:'#e49755',speed:48,health:176,reward:28,radius:18,baseDamage:2,armor:1,armorType:'light'},
    direwolf:{name:'裂風狼群',color:'#d88d71',speed:112,health:68,reward:15,radius:14,baseDamage:1,armorType:'light'},
    raider:{name:'赤牙掠奪者',color:'#dc7950',speed:67,health:146,reward:22,radius:18,baseDamage:2,armor:1,armorType:'heavy',combatRole:'siege',attackRange:46,attackDamage:8,attackInterval:2},
    revenant:{name:'蒼燄怨靈',color:'#81dc9e',speed:60,health:123,reward:21,radius:16,baseDamage:1,armorType:'arcane',combatRole:'hunter',attackRange:132,attackDamage:6,attackInterval:2.7},
    boss:{name:'軍團戰將',color:'#ff416d',speed:33,health:790,reward:130,radius:30,baseDamage:5,armor:4,armorType:'heavy',combatRole:'boss',attackRange:88,attackDamage:14,attackInterval:1.7}
  };
  class Monster{
    constructor(type,wave,path,modifiers){
      const preset=TYPES[type]||TYPES.grunt,mods=modifiers||{};const earlyWaves=Math.min(Math.max(0,wave-1),14),lateWaves=Math.max(0,wave-15),scale=1+earlyWaves*.105+lateWaves*.07,healthRate=(mods.enemyHealth||1)*(1+(mods.healthGrowth||0)*Math.max(0,wave-1));
      Object.assign(this,preset);this.type=type;this.wave=wave;this.path=path||ns.config.path;this.x=this.path[0].x;this.y=this.path[0].y;this.index=1;
      this.modifiers=Object.assign({},mods);this.health=Math.round(this.health*scale*healthRate);this.maxHealth=this.health;this.displayHealth=this.health;this.barrier=Math.round((this.barrier||0)*scale*healthRate);this.maxBarrier=this.barrier;this.reward=Math.max(1,Math.round(this.reward*(1+(wave-1)*.025)*(mods.bountyScale||1)));this.speed*=mods.enemySpeed||1;this.damageMultiplier=mods.enemyDamage||1;this.baseDamage=Math.max(1,Math.round(this.baseDamage*(mods.enemyDamage||1)));this.active=true;this.leaked=false;this.slowFactor=1;this.slowTimer=0;this.moveAura=1;this.temporaryArmor=0;this.hitFlash=0;this.walkDistance=0;this.frame=0;this.state='walk';this.facing=0;this.hitTime=0;this.deathTime=0;this.attackCooldown=.6;this.attackWindup=0;this.combatTarget=null;this.abilityCooldown=this.type==='boss'?5:0;this.abilityWindup=0;this.abilityRadius=126+(this.type==='boss'?Math.max(0,Math.floor(wave/5)-3)*4:0);this.bossPhase=1;this.phaseTriggered={2:false,3:false};this.enraged=false;this.traitCooldown=1.4;
      const formation=Monster.nextFormationSlot++;this.visualLane=this.type==='boss'?0:[0,-1,1][formation%3];this.visualStagger=this.type==='boss'?0:[-4,2,5,-1,3,0][formation%6];this.hovered=false;
    }
    update(dt,hero,defenders){
      if(!this.active)return;this.displayHealth+=(this.health-this.displayHealth)*Math.min(1,dt*11);this.hitTime=Math.max(0,this.hitTime-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);this.slowTimer=Math.max(0,this.slowTimer-dt);if(this.slowTimer<=0)this.slowFactor=1;
      const heroFactor=hero&&hero.active&&ns.utils.distance(this,hero)<46?.78:1;const unitFactor=(defenders||[]).some(function(unit){return unit.active!==false&&ns.utils.distance(this,unit)<34;},this)?.62:1;const castFactor=this.abilityWindup>0?0:1;let remaining=this.speed*this.slowFactor*(this.moveAura||1)*Math.min(heroFactor,unitFactor)*castFactor*dt;
      const stride=this.type==='runner'||this.type==='direwolf'?74:this.type==='brute'?80:64;let travelled=0;
      while(remaining>0&&this.active){const target=this.path[this.index];if(!target){this.active=false;this.leaked=true;break;}const distance=Math.hypot(target.x-this.x,target.y-this.y);if(distance>0){const dx=target.x-this.x;if(Math.abs(dx)>.1)this.facing=dx<0?Math.PI:0;}
      if(distance<=remaining){travelled+=distance;this.x=target.x;this.y=target.y;this.index+=1;remaining-=distance;}else{travelled+=remaining;this.x+=(target.x-this.x)/distance*remaining;this.y+=(target.y-this.y)/distance*remaining;remaining=0;}}
      this.walkDistance+=travelled;this.state=this.abilityWindup>0?'cast':this.attackWindup>0?'attack':this.hitTime>0?'hit':'walk';this.frame=this.state==='hit'?Math.min(3,Math.floor((.24-this.hitTime)/.06)):Math.floor(this.walkDistance/stride*8)%8;
    }
    updateDeath(dt){if(this.state!=='death')return;this.deathTime+=dt;this.frame=Math.min(3,Math.floor(this.deathTime/.16));}

    effectiveHealth(){return this.health+(this.barrier||0);}
    takeDamage(amount){if(!this.active)return false;let damage=Math.max(1,amount-(this.armor||0)-(this.temporaryArmor||0));if(this.barrier>0){const absorbed=Math.min(this.barrier,damage);this.barrier-=absorbed;damage-=absorbed;}if(damage>0)this.health-=damage;this.hitFlash=.1;if(this.hitTime<=0){this.hitTime=.24;this.state='hit';this.frame=0;}if(this.health<=0){this.health=0;this.active=false;this.state='death';this.deathTime=0;this.frame=0;return true;}return false;}
    applySlow(factor,time){this.slowFactor=Math.min(this.slowFactor,factor);this.slowTimer=Math.max(this.slowTimer,time);}
    progress(){return this.index+this.x/10000;}
    visualPosition(){
      const path=this.path,index=Math.max(1,Math.min(this.index,path.length-1)),start=path[index-1],end=path[index];
      if(!start||!end)return{x:this.x,y:this.y};
      const direction=(a,b)=>{const length=Math.hypot(b.x-a.x,b.y-a.y)||1;return{x:(b.x-a.x)/length,y:(b.y-a.y)/length};};
      const current=direction(start,end);let tangent=current;
      const blend=(a,b,weight)=>{const x=a.x*(1-weight)+b.x*weight,y=a.y*(1-weight)+b.y*weight,length=Math.hypot(x,y)||1;return{x:x/length,y:y/length};};
      const fromStart=Math.hypot(this.x-start.x,this.y-start.y),toEnd=Math.hypot(this.x-end.x,this.y-end.y),turnDistance=42;
      if(index>1&&fromStart<turnDistance)tangent=blend(direction(path[index-2],start),current,.5+fromStart/(turnDistance*2));
      else if(index<path.length-1&&toEnd<turnDistance)tangent=blend(current,direction(end,path[index+1]),.5-toEnd/(turnDistance*2));
      const laneWidth=this.radius>=20?23:20,side=this.visualLane*laneWidth;
      return{x:this.x-tangent.y*side+tangent.x*this.visualStagger,y:this.y+tangent.x*side+tangent.y*this.visualStagger};
    }
    static compareForDraw(a,b){return Number(a.type==='boss')-Number(b.type==='boss')||a.visualPosition().y-b.visualPosition().y;}
    showsHealthBar(){return this.type==='boss'||this.elite===true||this.hovered||this.hitFlash>0||this.health<this.maxHealth||(this.maxBarrier>0&&this.barrier<this.maxBarrier);}
    drawHealthBar(ctx){if(!this.active||!this.showsHealthBar())return;const visual=this.visualPosition(),boss=this.type==='boss',width=boss?88:this.radius*2,barY=visual.y-({grunt:82,runner:76,direwolf:77,raider:87,revenant:91,brute:102,warder:105,shaman:92,healer:94,commander:109,boss:128}[this.type]||this.radius+18),left=visual.x-width/2;ctx.save();ctx.fillStyle='rgba(8,7,12,.88)';ctx.fillRect(left-1,barY-1,width+2,boss?8:7);ctx.fillStyle='#701f24';ctx.fillRect(left,barY,width*Math.max(0,this.health/this.maxHealth),5);ctx.globalAlpha=.78;ctx.fillStyle=boss?'#f4a45c':this.color;ctx.fillRect(left,barY,width*Math.max(0,this.displayHealth/this.maxHealth),5);ctx.globalAlpha=1;if(this.maxBarrier){ctx.fillStyle='#70c9ff';ctx.fillRect(left,barY-3,width*Math.max(0,this.barrier/this.maxBarrier),2);}if(boss){ctx.strokeStyle='#f3cb79';ctx.lineWidth=1;ctx.strokeRect(left-2,barY-2,width+4,9);}ctx.restore();}
    draw(ctx,art){
      const sizes={grunt:58,runner:58,direwolf:62,raider:67,revenant:66,brute:78,shaman:64,boss:108};const size=sizes[this.type]||58;
      const visual=this.visualPosition();ctx.save();ctx.translate(visual.x-this.x,visual.y-this.y);
      ctx.save();if(this.state==='death')ctx.globalAlpha=Math.max(0,Math.min(1,(1-this.deathTime)/.35));
      if(!(art&&art.drawMonster&&art.drawMonster(ctx,this))&&!(art&&art.drawUnit(ctx,this.type,this.x,this.y,size))){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(0,0,this.radius,0,Math.PI*2);ctx.fill();ctx.restore();}
      ctx.restore();if(this.state==='death'){ctx.restore();return;}
      ctx.save();if(this.abilityWindup>0){const pulse=.45+Math.sin(this.abilityWindup*18)*.18;ctx.globalAlpha=pulse;ctx.fillStyle='rgba(255,54,70,.16)';ctx.strokeStyle='#ff4658';ctx.lineWidth=4;ctx.beginPath();ctx.arc(this.x,this.y,this.abilityRadius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe1b0';ctx.font='900 13px Segoe UI';ctx.textAlign='center';ctx.fillText('戰爭踐踏！',this.x,this.y-this.radius-26);}if(this.enraged){ctx.strokeStyle='#ff475b';ctx.shadowColor='#ff243e';ctx.shadowBlur=14;ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.radius+8,0,Math.PI*2);ctx.stroke();}if(this.hitFlash>0){ctx.globalAlpha=this.hitFlash*5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(this.x,this.y,this.radius+4,0,Math.PI*2);ctx.fill();}if(this.slowTimer>0){ctx.strokeStyle='#70e7ff';ctx.shadowColor='#70e7ff';ctx.shadowBlur=8;ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y+4,this.radius+7,0,Math.PI*2);ctx.stroke();}
      ctx.restore();ctx.restore();
    }
  }
  Monster.nextFormationSlot=0;
  Monster.TYPES=TYPES;ns.entities.Monster=Monster;
})(globalThis.TowerFrontier);
