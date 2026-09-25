(function(ns){
  'use strict';
  const TYPES={
    wildDragon:{name:'荒野翡翠龍',color:'#70b975',speed:55,health:260,reward:32,radius:24,baseDamage:2,armor:2,armorType:'arcane'},
    halberdier:{name:'叛軍長戟衛',color:'#baae7d',speed:49,health:175,reward:23,radius:18,baseDamage:2,armor:3,armorType:'heavy'},
    treant:{name:'腐化銀葉樹靈',color:'#769966',speed:38,health:240,reward:27,radius:24,baseDamage:2,armor:2,armorType:'arcane'},
    fallenKnight:{name:'失誓日耀騎士',color:'#b9a566',speed:61,health:185,reward:26,radius:20,baseDamage:2,armor:3,armorType:'heavy'},
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
    ,nagaSiltImp:{name:'淤泥小妖',color:'#62cfc4',speed:88,health:72,reward:14,radius:14,baseDamage:1,armorType:'light',storyStatus:'CONCEPT'}
    ,nagaShellbreaker:{name:'鹽甲破殼者',color:'#5fcbc4',speed:42,health:242,reward:28,radius:24,baseDamage:2,armor:4,armorType:'heavy',combatRole:'siege',attackRange:46,attackDamage:11,attackInterval:1.85,storyStatus:'CONCEPT'}
    ,nagaSiltwaterDemonlord:{name:'濁潮小魔王',color:'#2eb2bd',speed:35,health:860,reward:145,radius:30,baseDamage:5,armor:4,armorType:'arcane',combatRole:'boss',attackRange:90,attackDamage:15,attackInterval:1.7,storyStatus:'CONCEPT'}
    ,goblinScavenger:{name:'蒸汽拾荒地精',color:'#cf9c58',speed:102,health:88,reward:17,radius:14,baseDamage:1,armor:1,armorType:'light'}
    ,goblinSapper:{name:'爆罐地精工兵',color:'#e0ab5e',speed:58,health:126,reward:24,radius:17,baseDamage:1,armorType:'arcane',combatRole:'hunter',attackRange:138,attackDamage:8,attackInterval:2.3}
    ,orcBanner:{name:'裂牙戰旗獸人',color:'#d9624e',speed:50,health:198,reward:31,radius:20,baseDamage:2,armor:2,armorType:'heavy'}
    ,orcSkullcrusher:{name:'巖鎧碎顱獸人',color:'#9a6653',speed:36,health:300,reward:38,radius:25,baseDamage:3,armor:5,armorType:'heavy',combatRole:'siege',attackRange:48,attackDamage:13,attackInterval:1.9}
    ,frostRimeStalker:{name:'霜痕掠行者',color:'#9fdbef',speed:94,health:110,reward:21,radius:16,baseDamage:1,armorType:'light'}
    ,frostRimePriest:{name:'霜骨祭司',color:'#b4d8f2',speed:48,health:152,reward:29,radius:18,baseDamage:1,armorType:'arcane',combatRole:'hunter',attackRange:150,attackDamage:9,attackInterval:2.5}
  };
  class Monster{
    constructor(type,wave,path,modifiers){
      const preset=TYPES[type]||TYPES.grunt,mods=modifiers||{};const earlyWaves=Math.min(Math.max(0,wave-1),14),lateWaves=Math.max(0,wave-15),scale=1+earlyWaves*.105+lateWaves*.07,healthRate=(mods.enemyHealth||1)*(1+(mods.healthGrowth||0)*Math.max(0,wave-1));
      Object.assign(this,preset);this.type=type;this.wave=wave;this.path=path||ns.config.path;this.x=this.path[0].x;this.y=this.path[0].y;this.index=1;
      this.modifiers=Object.assign({},mods);this.health=Math.round(this.health*scale*healthRate);this.maxHealth=this.health;this.displayHealth=this.health;this.barrier=Math.round((this.barrier||0)*scale*healthRate);this.maxBarrier=this.barrier;this.reward=Math.max(1,Math.round(this.reward*(1+(wave-1)*.025)*(mods.bountyScale||1)));this.speed*=mods.enemySpeed||1;this.damageMultiplier=mods.enemyDamage||1;this.baseDamage=Math.max(1,Math.round(this.baseDamage*(mods.enemyDamage||1)));this.active=true;this.leaked=false;this.slowFactor=1;this.slowTimer=0;this.moveAura=1;this.temporaryArmor=0;this.hitFlash=0;this.hitKickX=0;this.hitKickY=0;this.hitKickTime=0;this.hitKickDuration=0;this.walkDistance=0;this.walkPhase=0;this.frame=0;this.state='walk';this.facing=0;this.visualHeading=0;this.routeHeading=0;this.hitTime=0;this.deathTime=0;this.attackCooldown=.6;this.attackWindup=0;this.attackVisualTime=0;this.attackVisualDuration=0;this.attackVisualRelease=0;this.combatTarget=null;this.abilityCooldown=this.combatRole==='boss'?5:0;this.abilityWindup=0;this.abilityRadius=126+(this.combatRole==='boss'?Math.max(0,Math.floor(wave/5)-3)*4:0);this.bossPhase=1;this.phaseTriggered={2:false,3:false};this.enraged=false;this.traitCooldown=1.4;
      // Absolute distance on the shared route.  It lets the update loop keep a
      // readable convoy without adding collision, pushing or a second path.
      this.routeLength=this.path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-this.path[i].x,p.y-this.path[i].y),0);this.routeDistance=0;this.visualLane=0;this.visualStagger=0;this.hovered=false;
    }
    update(dt,hero,defenders,maxAdvance){
      if(!this.active)return;this.displayHealth+=(this.health-this.displayHealth)*Math.min(1,dt*11);this.hitTime=Math.max(0,this.hitTime-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);this.criticalFlash=Math.max(0,(this.criticalFlash||0)-dt);this.hitKickTime=Math.max(0,(this.hitKickTime||0)-dt);if(this.hitKickTime<=0){this.hitKickX=0;this.hitKickY=0;}this.slowTimer=Math.max(0,this.slowTimer-dt);if(this.slowTimer<=0)this.slowFactor=1;
      const heroFactor=hero&&hero.active&&ns.utils.distance(this,hero)<46?.78:1;
      // An ordinary swing remains readable but no longer freezes the whole march.
      // Only a telegraphed boss ability, roots and freezes can fully halt a route.
      const attackBrace=Math.max(0,this.attackWindup,this.attackVisualDuration-this.attackVisualTime);
      const attackStride=attackBrace>0?(this.combatRole==='boss'?.76:.91):1;
      const movingDt=this.abilityWindup>0?0:dt*attackStride,limit=Number.isFinite(maxAdvance)?Math.max(0,maxAdvance):Infinity,pressure=this.mapPressure;let movement=this.speed*(this.rootTime>0?0:1)*this.slowFactor*(this.moveAura||1)*heroFactor;
      // Control can erase most, but never all, of the wind bonus. Existing root
      // remains a short stop rather than becoming a map-specific exception.
      if(pressure&&!(this.rootTime>0)){movement*=pressure.speedMultiplier;if(this.slowTimer>0&&this.slowFactor<1)movement=Math.max(this.speed*pressure.controlFloor,movement);}
      let remaining=Math.min(movement*movingDt,limit);
      const stride=this.type==='runner'||this.type==='direwolf'?74:this.type==='brute'?80:64;let travelled=0;
      while(remaining>0&&this.active){const target=this.path[this.index];if(!target){this.active=false;this.leaked=true;break;}const distance=Math.hypot(target.x-this.x,target.y-this.y);if(distance>0){const dx=target.x-this.x;this.routeHeading=Math.atan2(target.y-this.y,dx);if(Math.abs(dx)>.1)this.facing=dx<0?Math.PI:0;}
      if(distance<=remaining){travelled+=distance;this.x=target.x;this.y=target.y;this.index+=1;remaining-=distance;}else{travelled+=remaining;this.x+=(target.x-this.x)/distance*remaining;this.y+=(target.y-this.y)/distance*remaining;remaining=0;}}
      this.routeDistance+=travelled;this.walkDistance+=travelled;
      // Slow effects shorten each visible step instead of leaving a sprite pose
      // frozen for several frames. Position and attack timing still use real travel.
      if(travelled>0){const delta=Math.atan2(Math.sin(this.routeHeading-this.visualHeading),Math.cos(this.routeHeading-this.visualHeading)),turn=Math.min(Math.abs(delta),dt*12);this.visualHeading+=Math.sign(delta)*turn;this.walkPhase+=Math.min(dt*8,travelled/stride*8/Math.sqrt(Math.max(.25,Math.min(1,this.slowFactor))));}
      if((!this.frostStatus?.window||this.frostStatus.deep)&&this.attackVisualTime<this.attackVisualDuration)this.attackVisualTime=Math.min(this.attackVisualDuration,this.attackVisualTime+dt);
      const attacking=this.attackWindup>0||this.attackVisualTime<this.attackVisualDuration;
      this.state=this.abilityWindup>0?'cast':attacking?'attack':this.hitTime>0&&(travelled<1||this.hitTime>.13)?'hit':travelled>0?'walk':'idle';
      if(this.state==='attack'){
        const age=this.attackVisualTime,release=this.attackVisualRelease;
        this.frame=age<release*.45?0:age<release?1:age<release+.09?2:3;
      }else if(this.state==='cast')this.frame=Math.min(3,Math.floor((1.1-this.abilityWindup)/1.1*4));
      else if(this.state==='hit')this.frame=Math.min(3,Math.floor((.24-this.hitTime)/.06));
      else this.frame=this.state==='walk'?Math.floor(this.walkPhase)%8:0;
    }
    setRouteDistance(value){
      let remaining=Math.max(0,value||0),travelled=0;this.x=this.path[0].x;this.y=this.path[0].y;this.index=1;
      while(remaining>0&&this.index<this.path.length){const target=this.path[this.index],distance=Math.hypot(target.x-this.x,target.y-this.y);if(distance<=remaining){this.x=target.x;this.y=target.y;this.index+=1;remaining-=distance;travelled+=distance;}else{this.x+=(target.x-this.x)/distance*remaining;this.y+=(target.y-this.y)/distance*remaining;travelled+=remaining;remaining=0;}}
      this.routeDistance=travelled;this.walkDistance=travelled;this.walkPhase=travelled/(this.type==='runner'||this.type==='direwolf'?74:this.type==='brute'?80:64)*8;
      const next=this.path[this.index];if(next){const dx=next.x-this.x;this.visualHeading=this.routeHeading=Math.atan2(next.y-this.y,dx);if(Math.abs(dx)>.1)this.facing=dx<0?Math.PI:0;}
      return this;
    }
    updateDeath(dt){if(this.state!=='death')return;this.deathTime+=dt;this.frame=Math.min(3,Math.floor(this.deathTime/.16));}

    effectiveHealth(){return this.health+(this.barrier||0);}
    takeDamage(amount,source){if(!this.active)return false;const vulnerable=this.vulnerability&&(!source||source.owner!==this.vulnerability.owner)?this.vulnerability.rate:0,rate=1+(this.frostStatus?.window>0&&this.frostStatus.deep?(ns.config.frostRules?.deepVulnerability||0):0)+vulnerable+(this.shockTime>0?.1:0),armor=Math.max(0,(this.armor||0)+(this.temporaryArmor||0)+(this.mapPressure?.armorBonus||0)-((source&&source.armorPierce)||0));let damage=Math.max(1,amount*rate-armor);if(this.barrier>0){const absorbed=Math.min(this.barrier,damage);this.barrier-=absorbed;damage-=absorbed;}if(damage>0)this.health-=damage;this.hitFlash=.1;if(this.hitTime<=0){this.hitTime=.24;this.state='hit';this.frame=0;}if(this.health<=0){this.health=0;this.active=false;this.state='death';this.deathTime=0;this.frame=0;return true;}return false;}
    applySlow(factor,time){this.slowFactor=Math.min(this.slowFactor,factor);this.slowTimer=Math.max(this.slowTimer,time);}
    remainingDistance(){return Math.max(0,this.routeLength-this.routeDistance);}
    progress(){if(ns.config.routes&&ns.config.routes.length>1)return -this.remainingDistance();if(!ns.config.mapId||ns.config.mapId==='classic')return this.index+this.x/10000;const a=this.path[this.index-1],b=this.path[this.index];if(!a||!b)return this.path.length;const length=Math.hypot(b.x-a.x,b.y-a.y);return this.index-1+(length?1-Math.hypot(b.x-this.x,b.y-this.y)/length:0);}
    setHitKick(x,y,duration){this.hitKickX=x||0;this.hitKickY=y||0;this.hitKickDuration=Math.max(.01,duration||.12);this.hitKickTime=this.hitKickDuration;}
    visualPosition(){const ratio=this.hitKickDuration?Math.max(0,Math.min(1,this.hitKickTime/this.hitKickDuration)):0;return{x:this.x+(this.hitKickX||0)*ratio,y:this.y+(this.hitKickY||0)*ratio};}
    static minimumHeadway(front,back){return Math.max(34,((front&&front.radius)||16)+((back&&back.radius)||16))*1.18;}
    static compareForDraw(a,b){return Number(a.combatRole==='boss')-Number(b.combatRole==='boss')||a.visualPosition().y-b.visualPosition().y;}
    showsHealthBar(){return !!(this.vulnerability&&this.vulnerability.time>0)||!!(this.plagueDot&&this.plagueDot.time>0)||this.combatRole==='boss'||this.elite===true||this.hovered||this.hitFlash>0||this.health<this.maxHealth||(this.maxBarrier>0&&this.barrier<this.maxBarrier);}
    drawHealthBar(ctx){if(!this.active||!this.showsHealthBar())return;const visual=this.visualPosition(),boss=this.combatRole==='boss',width=boss?88:this.radius*2,barY=visual.y-({grunt:82,runner:76,direwolf:77,raider:87,revenant:91,brute:102,warder:105,shaman:92,healer:94,commander:109,boss:128,nagaSiltwaterDemonlord:128}[this.type]||this.radius+18),left=visual.x-width/2;ctx.save();ctx.fillStyle='rgba(8,7,12,.88)';ctx.fillRect(left-1,barY-1,width+2,boss?8:7);ctx.fillStyle='#701f24';ctx.fillRect(left,barY,width*Math.max(0,this.health/this.maxHealth),5);ctx.globalAlpha=.78;ctx.fillStyle=boss?'#f4a45c':this.color;ctx.fillRect(left,barY,width*Math.max(0,this.displayHealth/this.maxHealth),5);ctx.globalAlpha=1;if(this.maxBarrier){ctx.fillStyle='#70c9ff';ctx.fillRect(left,barY-3,width*Math.max(0,this.barrier/this.maxBarrier),2);}if(boss){ctx.strokeStyle='#f3cb79';ctx.lineWidth=1;ctx.strokeRect(left-2,barY-2,width+4,9);}if(ns.systems.CombatFeedbackSystem)ns.systems.CombatFeedbackSystem.drawCorrosionBadge(ctx,this,left+width+5,barY);ctx.restore();}
    draw(ctx,art){
      const sizes={grunt:58,runner:58,direwolf:62,raider:67,revenant:66,brute:78,shaman:64,boss:108};const size=sizes[this.type]||58;
      const visual=this.visualPosition(),drawBody=()=>{if(!(art&&art.drawMonster&&art.drawMonster(ctx,this))&&!(art&&art.drawUnit(ctx,this.type,this.x,this.y,size))){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(0,0,this.radius,0,Math.PI*2);ctx.fill();ctx.restore();}};
      // Render-only afterimage: route, collision and targeting coordinates remain x/y.
      if(this.hitKickTime>0&&this.state!=='death'){ctx.save();ctx.globalAlpha=.13+.12*Math.min(1,this.hitKickTime/(this.hitKickDuration||.12));ctx.translate(-(visual.x-this.x),-(visual.y-this.y));drawBody();ctx.restore();}
      ctx.save();ctx.translate(visual.x-this.x+(this.criticalFlash>0?Math.sin(this.criticalFlash*100)*2:0),visual.y-this.y);
      ctx.save();if(this.state==='death')ctx.globalAlpha=Math.max(0,Math.min(1,(1-this.deathTime)/.35));
      drawBody();
      ctx.restore();if(this.state==='death'){ctx.restore();return;}
      ctx.save();if(this.abilityWindup>0){const pulse=.45+Math.sin(this.abilityWindup*18)*.18;ctx.globalAlpha=pulse;ctx.fillStyle='rgba(255,54,70,.16)';ctx.strokeStyle='#ff4658';ctx.lineWidth=4;ctx.beginPath();ctx.arc(this.x,this.y,this.abilityRadius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe1b0';ctx.font='900 13px Segoe UI';ctx.textAlign='center';ctx.fillText('戰爭踐踏！',this.x,this.y-this.radius-26);}if(this.enraged){ctx.strokeStyle='#ff475b';ctx.shadowColor='#ff243e';ctx.shadowBlur=14;ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.radius+8,0,Math.PI*2);ctx.stroke();}if(this.hitFlash>0){ctx.globalAlpha=this.hitFlash*5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(this.x,this.y,this.radius+4,0,Math.PI*2);ctx.fill();}
      ctx.restore();ctx.restore();
    }
  }
  const drawBase=Monster.prototype.draw;
  Monster.prototype.draw=function(ctx,art){
    drawBase.call(this,ctx,art);
    if(!this.active||this.attackWindup<=0||!this.combatTarget?.active)return;
    const x=this.x,y=this.y,angle=Math.atan2(this.combatTarget.y-y,this.combatTarget.x-x),size=(this.radius||16)+10;
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.lineWidth=3;ctx.strokeStyle='#071319';ctx.fillStyle='#ffe5a5';
    ctx.beginPath();ctx.moveTo(size-8,0);ctx.lineTo(size-17,-8);ctx.lineTo(size+3,0);ctx.lineTo(size-17,8);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore();
    ctx.save();ctx.fillStyle='#071319';ctx.fillRect(x-11,y-(this.radius||16)-28,22,19);ctx.strokeStyle='#ffe5a5';ctx.lineWidth=2;ctx.strokeRect(x-11,y-(this.radius||16)-28,22,19);ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('攻',x,y-(this.radius||16)-14);ctx.restore();
  };
  const takeMonsterDamage=Monster.prototype.takeDamage;
  Monster.prototype.takeDamage=function(amount,source){if(this.evolutionTrial&&source?.owner&&source.owner!==this.trialOwner)return false;return takeMonsterDamage.call(this,amount,source);};
  Monster.TYPES=TYPES;ns.entities.Monster=Monster;
})(globalThis.TowerFrontier);
