(function(ns){
  'use strict';
  // Composition hooks over the existing Projectile / Summon / onKill pipeline.
  // Deployment anchors never move; charge and fly-by coordinates are visual only.
  class BattleSynergySystem{
    constructor(game){this.game=game;if(game.hero)game.hero.synergy=this;this.reset();}
    reset(){this.souls=0;this.clock=0;this.winter=null;this.frostChainBudget=0;this.frostVisuals=[];this.auraTick=-1;this.fields=[];this.visuals=[];}
    // Keep the strongest haste and the object that granted it together.  Combat
    // consumes supportHaste while the selection panel consumes supportHasteSource;
    // separating them was the reason real buffs looked like they did nothing.
    applyHaste(target,rate,source){if(rate>=(target.supportHaste||0)){target.supportHaste=rate;target.supportHasteSource=source;}}
    flagRate(target){
      if(!target||target.active===false||target.retired||(target!==this.game.hero&&target.kind!=='unit'))return 0;
      let rate=0,best=null;
      for(const source of this.game.build.items){if(source.retired||source.active===false||!ns.config.buildings[source.type]?.damageAura)continue;const cfg=source.config();if(ns.utils.distance(source,target)<=cfg.range&&cfg.damageAura>rate){rate=cfg.damageAura;best=source;}}
      target.flagSource=best;target.flagRate=rate;
      return rate;
    }
    static damageRate(target){return Math.max(target.supportDamage||0,target.synergy?target.synergy.flagRate(target):0);}
    static attackStats(target){const total=(target.combatConfig?target.combatConfig():target.config()).damage,rate=BattleSynergySystem.damageRate(target),base=total/(1+rate);return {base,bonus:total-base,total};}
    static drawFlag(ctx,target){
      const synergy=target.synergy,rate=synergy&&synergy.flagRate(target);if(!rate)return;
      const selected=synergy.game.build.selected,bright=selected&&selected.type==='battleflag'&&!selected.retired&&ns.utils.distance(selected,target)<=selected.config().range;
      ctx.save();ctx.strokeStyle='#f5d571';ctx.fillStyle='#f5d571';ctx.globalAlpha=bright?.9:.38;ctx.lineWidth=bright?3:2;
      ctx.beginPath();ctx.ellipse(target.x,target.y+16,31,12,0,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.ellipse(target.x,target.y+16,24,8,0,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;ctx.font='bold 14px Segoe UI';ctx.textAlign='center';ctx.fillText('⚑',target.x+32,target.y+31);ctx.restore();
    }
    static prepare(owner,target,cfg,options){
      Object.assign(options,{armorPierce:cfg.armorPierce,arcaneMark:cfg.arcaneMark,natureMark:cfg.natureMark,vulnerability:cfg.vulnerability,natureExplosion:cfg.natureExplosion,arcaneBounce:cfg.arcaneBounce,plague:cfg.plague,soulHarvest:cfg.soulHarvest,bonusVsHeavy:cfg.bonusVsHeavy,executeThreshold:cfg.executeThreshold,executeMultiplier:cfg.executeMultiplier});
      if(cfg.kingdomBounce)Object.assign(options,{chain:Math.min(5,owner.level+2),chainRange:112,shock:owner.level>=3,style:'lightning'});
      if(cfg.charge){options.lineEnd={x:target.x+(target.x-owner.x)*.4,y:target.y+(target.y-owner.y)*.4};options.lineStart={x:owner.x,y:owner.y};options.holyFire=owner.level>=2;options.speed=1100;options.style='flame';}
      if(cfg.charge||cfg.flyby)owner.excursion={x:options.lineEnd?options.lineEnd.x:target.x,y:options.lineEnd?options.lineEnd.y:target.y,time:.85,max:.85,fly:!!cfg.flyby};
      if(cfg.soulHarvest&&owner.synergy&&owner.synergy.souls>0){owner.synergy.souls--;options.damage*=1.8;options.splash=48;options.soulCharged=true;}
      if(cfg.soulSlam&&owner.synergy&&owner.synergy.souls>=3){owner.synergy.souls-=3;options.damage*=1.5;options.splash=(options.splash||0)+20;options.soulCharged=true;}
      if(owner.drumEmpowered){
        const bursts={orc:{damage:1.25,splash:15},centaur:{chain:1},boarRider:{damage:1.3,splash:20},minotaur:{damage:1.35,splash:26},shaman:{chain:1}},burst=bursts[owner.type];
        if(burst){options.damage*=burst.damage||1;options.splash=(options.splash||0)+(burst.splash||0);options.chain=(options.chain||0)+(burst.chain||0);options.drumBurst=true;}
        owner.drumEmpowered=false;
      }
      if(ns.systems.FrostStatusSystem)ns.systems.FrostStatusSystem.prepare(owner,cfg,options);
      return options;
    }
    pulse(x,y,color,radius){if(this.game.feedback?.reducedFx)return;this.visuals.push({x,y,color,radius:radius||35,time:.45});if(this.visuals.length>100)this.visuals.shift();}
    hit(monster,damage,source){
      if(!source||damage<=0)return;const owner=source.owner;if(!source.vfxResolved){source.vfxResolved=true;if(source.splash&&this.game.feedback)this.game.feedback.explosion(source.target||monster,source.splash,source.color,source.style);}
      if(!source.secondary&&monster.active){
        if(source.arcaneMark)monster.arcaneMark=5;
        if(source.vulnerability)monster.vulnerability={time:4,rate:source.vulnerability,owner};
        if(source.shock)monster.shockTime=3;
        if(source.plague)this.infect(monster,owner,source.damage*.22,false);
        if(source.natureMark&&!monster.natureMark)monster.natureMark={time:6,hits:0,owner,damage:source.damage};
        else if(monster.natureMark){const mark=monster.natureMark;mark.hits++;mark.time=6;if(mark.hits>=3){monster.natureMark=null;this.burst(monster,mark.owner,mark.damage*1.4,52,'#9eea85');}}
        if(source.natureExplosion&&monster.natureMark){this.burst(monster,owner,source.damage*.8,65,'#78efaa');}
      }
      if(source.holyFire&&!source.fieldCreated){source.fieldCreated=true;this.fields.push({a:source.lineStart,b:source.lineEnd,owner,damage:source.damage*.18,time:2,tick:0});}
    }
    infect(monster,owner,damage,spread){if(!monster.active)return;const old=monster.plagueDot;if(!old||old.damage<damage)monster.plagueDot={time:4,tick:0,owner,damage,spread:!!spread};else old.time=4;}
    burst(center,owner,damage,radius,color){
      this.pulse(center.x,center.y,color,radius);if(this.game.feedback)this.game.feedback.explosion(center,radius,color,'nature');
      this.game.monsters.filter(m=>m.active&&ns.utils.distance(m,center)<=radius).forEach(m=>this.deal(m,damage,{owner,color,secondary:true}));
    }
    deal(monster,damage,source){if(!monster.active)return;const before=monster.effectiveHealth(),killed=monster.takeDamage(damage,source);this.game.onHit(monster,before-monster.effectiveHealth(),false,source);if(killed)this.game.onKill(monster,source);}
    onEnemyDeath(monster,source){
      if(ns.systems.FrostStatusSystem&&!monster.soulHandled)ns.systems.FrostStatusSystem.death(this,monster,source);
      if(monster.leaked||monster.soulHandled)return;monster.soulHandled=true;this.souls++;const collector=this.game.build.items.find(t=>!t.retired&&['crypt','soul','graveyard'].includes(t.type));if(collector&&this.game.feedback)this.game.feedback.soul(monster,collector);
      // A harvested victim is worth one additional soul, regardless of last hitter.
      if(this.game.build.items.some(t=>t.type==='soul'&&!t.retired&&ns.utils.distance(t,monster)<=t.config().range))this.souls++;
      const dot=monster.plagueDot;
      if(dot&&!dot.spread)this.game.monsters.filter(m=>m.active&&ns.utils.distance(m,monster)<=72).forEach(m=>this.infect(m,dot.owner,dot.damage,true));
      this.game.build.items.filter(t=>t.type==='crypt'&&!t.retired).forEach(t=>{t.summonCooldown=Math.max(0,t.summonCooldown-.35);});
    }
    update(dt){
      if(ns.systems.FrostStatusSystem){this.frostChainBudget=ns.config.frostRules.chainBudget;ns.systems.FrostStatusSystem.updateBattle(this,dt);}
      ns.systems.FrostlandVFX?.update(this,dt);
      this.clock+=dt;const game=this.game;if(game.feedback)game.feedback.mobile=typeof document!=='undefined'&&document.body.dataset.layout==='mobile';const items=game.build.items.filter(t=>!t.retired&&t.active!==false);
      game.hero.synergy=this;game.hero.supportHaste=0;game.hero.supportHasteSource=null;items.forEach(t=>{t.synergy=this;t.supportDamage=0;t.supportDamageSource=null;t.supportHaste=t.kind==='unit'?(t.towerSupportHaste||0):0;t.supportHasteSource=t.kind==='unit'?(t.towerSupportHasteSource||null):null;if(t.excursion)t.excursion.time=Math.max(0,t.excursion.time-dt);});
      for(const monster of game.monsters){
        if(ns.systems.FrostStatusSystem)ns.systems.FrostStatusSystem.update(monster,dt);
        monster.arcaneMark=Math.max(0,(monster.arcaneMark||0)-dt);monster.shockTime=Math.max(0,(monster.shockTime||0)-dt);monster.rootTime=Math.max(0,(monster.rootTime||0)-dt);
        if(monster.vulnerability&&(monster.vulnerability.time-=dt)<=0)monster.vulnerability=null;
        if(monster.natureMark&&(monster.natureMark.time-=dt)<=0)monster.natureMark=null;
        const dot=monster.plagueDot;if(dot&&monster.active){dot.time-=dt;dot.tick-=dt;if(dot.tick<=0){dot.tick+=.5;this.deal(monster,dot.damage*.5,{owner:dot.owner,color:'#a0e566',secondary:true});}if(dot.time<=0)monster.plagueDot=null;}
      }
      items.forEach(source=>{
        const cfg=source.config(),near=items.filter(t=>t!==source&&ns.utils.distance(source,t)<=cfg.range);
        // Battle flags are queried live by both combat and presentation.
        if(cfg.commandHaste)near.filter(t=>t.kind==='unit').forEach(t=>{this.applyHaste(t,cfg.commandHaste,source);if(game.report)game.report.recordSupport(source,'coverageSeconds',dt);});
        if(cfg.forgeAura)near.filter(t=>t.kind==='building').forEach(t=>{if(cfg.forgeAura>=t.supportDamage){t.supportDamage=cfg.forgeAura;t.supportDamageSource=source;}if(game.report)game.report.recordSupport(source,'coverageSeconds',dt);});
        if(cfg.natureAura)near.filter(t=>['dryad','dragon','beastmaster','grove'].includes(t.type)).forEach(t=>{if(cfg.natureAura>=t.supportDamage){t.supportDamage=cfg.natureAura;t.supportDamageSource=source;}if(game.report)game.report.recordSupport(source,'coverageSeconds',dt);});
        if(cfg.timeAura&&this.clock%8<3)near.forEach(t=>{this.applyHaste(t,cfg.timeAura,source);if(game.report)game.report.recordSupport(source,'coverageSeconds',dt);});
        if(cfg.ancestralAura)near.filter(t=>t.kind==='unit'&&['orc','centaur','boarRider','minotaur','shaman'].includes(t.type)).forEach(t=>{if(cfg.ancestralAura>=t.supportDamage){t.supportDamage=cfg.ancestralAura;t.supportDamageSource=source;}if(game.report)game.report.recordSupport(source,'coverageSeconds',dt);});
        if(cfg.nagaHaste)near.concat(game.hero&&game.hero.classType==='naga'&&ns.utils.distance(source,game.hero)<=cfg.range?[game.hero]:[]).filter(t=>(t===game.hero&&t.classType==='naga')||(t.kind==='unit'&&ns.config.units[t.type]?.naga)).forEach(t=>{this.applyHaste(t,cfg.nagaHaste,source);if(game.report)game.report.recordSupport(source,'coverageSeconds',dt);});
        if(cfg.drumPulse){source.drumCooldown=(source.drumCooldown===undefined?1:source.drumCooldown)-dt;if(source.drumCooldown<=0){near.filter(t=>t.kind==='unit'&&['orc','centaur','boarRider','minotaur','shaman'].includes(t.type)).forEach(t=>{t.tribalFrenzy=Math.max(t.tribalFrenzy||0,cfg.drumDuration);t.commandPulse=cfg.drumDuration;t.drumEmpowered=true;});source.drumCooldown=cfg.drumPulse;source.skillPulse=1;this.pulse(source.x,source.y,'#ff6a42',cfg.range);}}
        if(cfg.rootPulse){source.rootCooldown=(source.rootCooldown||0)-dt;if(source.rootCooldown<=0){const targets=game.monsters.filter(m=>m.active&&ns.utils.distance(source,m)<=cfg.range);if(targets.length){const duration=1.1+source.level*.1;targets.forEach(m=>{m.rootTime=Math.max(m.rootTime||0,duration);});if(game.report)game.report.recordSupport(source,'controlSeconds',duration*targets.length);this.pulse(source.x,source.y,'#91e77b',cfg.range);source.rootCooldown=6;}}}
        if(source.type==='beastmaster'&&!game.summons.some(s=>s.active&&s.owner===source&&s.form==='bear'))game.summons.push(new ns.entities.Summon(source,{form:'bear',tags:['summon','nature'],duration:22,level:source.level,damage:20*(1+.3*(source.level-1)),range:48,speed:115,leash:cfg.range+100,offsetX:-62,offsetY:46,color:cfg.color}));
        if(source.type==='crypt')this.produceCrypt(source,cfg);
        if(source.type==='bombWorkshop'){source.robotCooldown=(source.robotCooldown||0)-dt;if(source.robotCooldown<=0){for(let i=0;i<(cfg.robotCount||1);i++)game.summons.push(new ns.entities.Summon(source,{form:cfg.heavyRobot?'heavyBomb':'bomb',launchDelay:i*.16,tags:['summon','mechanical'],duration:18,damage:cfg.robotDamage*(1+.22*(source.level-1)),splash:cfg.robotSplash,range:23,leash:cfg.range+100,speed:cfg.heavyRobot?80:130,offsetX:0,level:source.level,color:'#ffb467'}));source.robotCooldown=cfg.summonInterval;this.pulse(source.x,source.y,'#ffba71',25);}}
      });
      game.summons.forEach(s=>{if(s.form==='bear'&&s.owner.level!==s.level){s.level=s.owner.level;s.damage=20*(1+.3*(s.level-1));}s.supportDamage=0;s.supportDamageSource=null;items.forEach(t=>{const cfg=t.config();if(cfg.summonAura&&s.tags.includes('summon')&&ns.utils.distance(t,s)<=cfg.range&&cfg.summonAura>=s.supportDamage){s.supportDamage=cfg.summonAura;s.supportDamageSource=t;if(game.report)game.report.recordSupport(t,'coverageSeconds',dt);}if(cfg.natureAura&&s.tags.includes('nature')&&ns.utils.distance(t,s)<=cfg.range&&cfg.natureAura>=s.supportDamage){s.supportDamage=cfg.natureAura;s.supportDamageSource=t;if(game.report)game.report.recordSupport(t,'coverageSeconds',dt);}});});
      if(Math.floor(this.clock/2)!==this.auraTick){this.auraTick=Math.floor(this.clock/2);if(game.feedback)items.concat(game.summons).filter(t=>t.supportDamage>0||t.supportHaste>0).slice(0,16).forEach(t=>game.feedback.aura(t,t.tags?'#bb9aec':'#e1d89a'));}
      this.fields.forEach(f=>{f.time-=dt;f.tick-=dt;if(f.tick<=0){f.tick+=.4;game.monsters.filter(m=>m.active&&BattleSynergySystem.lineDistance(m,f.a,f.b)<28).forEach(m=>this.deal(m,f.damage*.4,{owner:f.owner,color:'#ffd06a',secondary:true}));}});
      this.fields=this.fields.filter(f=>f.time>0);this.visuals.forEach(v=>{v.time-=dt;});this.visuals=this.visuals.filter(v=>v.time>0);
    }
    produceCrypt(source,cfg){
      const rank=ns.systems.TowerSkillSystem.rank(source.kills),cap=(cfg.summonCapBase||2)+(rank>=3?1:0)+(cfg.summonCap||0);
      if(source.summonCooldown>0||this.game.summons.filter(s=>s.active&&s.owner===source).length>=cap)return;
      const empowered=this.souls>0;if(empowered)this.souls--;
      this.game.summons.push(new ns.entities.Summon(source,{form:'crypt',tags:['summon','undead'],duration:cfg.summonDuration,damage:cfg.summonDamage*(1+.2*(source.level-1))*(empowered?1.5:1),range:cfg.summonRange,speed:cfg.summonSpeed,leash:cfg.range+cfg.summonLeashBonus,level:source.level,color:empowered?'#f2b1ff':cfg.color}));
      source.summonCooldown=Math.max(6,cfg.summonInterval-rank)*(empowered?.65:1);source.skillPulse=.6;
    }
    refract(){
      const game=this.game,towers=game.build.items.filter(t=>t.type==='moonwell'&&!t.retired);
      game.projectiles.slice().forEach(p=>{if(p.refractionChecked)return;p.refractionChecked=true;if(p.reflected||p.secondary||p.attackType!=='magic'||!p.owner||!p.target||!p.target.active)return;
        const tower=towers.find(t=>ns.utils.distance(t,p.owner)<=t.config().range);if(!tower||Math.random()>=tower.config().refractChance)return;
        const clone=new ns.entities.Projectile(p.owner,p.target,Object.assign({},p,{x:tower.x,y:tower.y,reflected:true,refractionChecked:true,damage:p.damage*.65}));game.projectiles.push(clone);if(game.report)game.report.recordSupport(tower,'reflections',1);this.pulse(tower.x,tower.y,'#c2daff',23);
      });
    }
    static lineDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
    draw(ctx){
      ns.systems.FrostlandVFX?.draw(ctx,this);
      if(ns.systems.FrostStatusSystem){this.game.monsters.filter(m=>m.active).slice(0,100).forEach(m=>ns.systems.FrostStatusSystem.draw(ctx,m));if(this.winter){ctx.save();ctx.fillStyle='rgba(105,190,210,.07)';ctx.fillRect(0,0,ns.config.width,ns.config.height);ctx.fillStyle='#d2fff1';ctx.font='bold 16px sans-serif';ctx.fillText('❄ 寒冬合獵 '+this.winter.time.toFixed(1)+'s',20,45);ctx.restore();}}
      ctx.save();this.fields.slice(0,this.game.feedback&&this.game.feedback.mobile?16:32).forEach(f=>{ctx.globalAlpha=.4;ctx.strokeStyle='#ffb347';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(f.a.x,f.a.y);ctx.lineTo(f.b.x,f.b.y);ctx.stroke();});
      this.visuals.forEach(v=>{ctx.globalAlpha=v.time/.45;ctx.strokeStyle=v.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(v.x,v.y,v.radius*(1-v.time/.6),v.radius*.42,0,0,Math.PI*2);ctx.stroke();});
      const statusBadges=[];this.game.monsters.filter(m=>m.active).slice(0,100).forEach(m=>ns.systems.CombatFeedbackSystem.drawStatus(ctx,m,this.clock,statusBadges));ctx.restore();
    }
  }
  ns.systems.BattleSynergySystem=BattleSynergySystem;
})(globalThis.TowerFrontier);
