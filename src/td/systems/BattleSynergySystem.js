(function(ns){
  'use strict';
  // Composition hooks over the existing Projectile / Summon / onKill pipeline.
  // Deployment anchors never move; charge and fly-by coordinates are visual only.
  class BattleSynergySystem{
    constructor(game){this.game=game;this.reset();}
    reset(){this.souls=0;this.clock=0;this.auraTick=-1;this.fields=[];this.visuals=[];}
    static prepare(owner,target,cfg,options){
      Object.assign(options,{armorPierce:cfg.armorPierce,arcaneMark:cfg.arcaneMark,natureMark:cfg.natureMark,vulnerability:cfg.vulnerability,natureExplosion:cfg.natureExplosion,arcaneBounce:cfg.arcaneBounce,plague:cfg.plague,soulHarvest:cfg.soulHarvest});
      if(cfg.kingdomBounce)Object.assign(options,{chain:Math.min(5,owner.level+2),chainRange:112,shock:owner.level>=3,style:'lightning'});
      if(cfg.charge){options.lineEnd={x:target.x+(target.x-owner.x)*.4,y:target.y+(target.y-owner.y)*.4};options.lineStart={x:owner.x,y:owner.y};options.holyFire=owner.level>=2;options.speed=1100;options.style='flame';}
      if(cfg.charge||cfg.flyby)owner.excursion={x:options.lineEnd?options.lineEnd.x:target.x,y:options.lineEnd?options.lineEnd.y:target.y,time:.85,max:.85,fly:!!cfg.flyby};
      if(cfg.soulHarvest&&owner.synergy&&owner.synergy.souls>0){owner.synergy.souls--;options.damage*=1.8;options.splash=48;options.soulCharged=true;}
      return options;
    }
    pulse(x,y,color,radius){this.visuals.push({x,y,color,radius:radius||35,time:.45});if(this.visuals.length>100)this.visuals.shift();}
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
    onEnemyDeath(monster){
      if(monster.leaked||monster.soulHandled)return;monster.soulHandled=true;this.souls++;const collector=this.game.build.items.find(t=>!t.retired&&['crypt','soul','graveyard'].includes(t.type));if(collector&&this.game.feedback)this.game.feedback.soul(monster,collector);
      // A harvested victim is worth one additional soul, regardless of last hitter.
      if(this.game.build.items.some(t=>t.type==='soul'&&!t.retired&&ns.utils.distance(t,monster)<=t.config().range))this.souls++;
      const dot=monster.plagueDot;
      if(dot&&!dot.spread)this.game.monsters.filter(m=>m.active&&ns.utils.distance(m,monster)<=72).forEach(m=>this.infect(m,dot.owner,dot.damage,true));
      this.game.build.items.filter(t=>t.type==='crypt'&&!t.retired).forEach(t=>{t.summonCooldown=Math.max(0,t.summonCooldown-.35);});
    }
    update(dt){
      this.clock+=dt;const game=this.game;if(game.feedback)game.feedback.mobile=typeof document!=='undefined'&&document.body.dataset.layout==='mobile';const items=game.build.items.filter(t=>!t.retired&&t.active!==false);
      game.hero.synergy=this;items.forEach(t=>{t.synergy=this;t.supportDamage=0;if(t.kind==='building')t.supportHaste=0;if(t.excursion)t.excursion.time=Math.max(0,t.excursion.time-dt);});
      for(const monster of game.monsters){
        monster.arcaneMark=Math.max(0,(monster.arcaneMark||0)-dt);monster.shockTime=Math.max(0,(monster.shockTime||0)-dt);monster.rootTime=Math.max(0,(monster.rootTime||0)-dt);
        if(monster.vulnerability&&(monster.vulnerability.time-=dt)<=0)monster.vulnerability=null;
        if(monster.natureMark&&(monster.natureMark.time-=dt)<=0)monster.natureMark=null;
        const dot=monster.plagueDot;if(dot&&monster.active){dot.time-=dt;dot.tick-=dt;if(dot.tick<=0){dot.tick+=.5;this.deal(monster,dot.damage*.5,{owner:dot.owner,color:'#a0e566',secondary:true});}if(dot.time<=0)monster.plagueDot=null;}
      }
      items.forEach(source=>{
        const cfg=source.config(),near=items.filter(t=>t!==source&&ns.utils.distance(source,t)<=cfg.range);
        if(cfg.damageAura)near.filter(t=>t.kind==='unit').forEach(t=>{t.supportDamage=Math.max(t.supportDamage,cfg.damageAura);});
        if(cfg.forgeAura)near.filter(t=>t.kind==='building').forEach(t=>{t.supportDamage=Math.max(t.supportDamage,cfg.forgeAura);});
        if(cfg.natureAura)near.filter(t=>['dryad','dragon','beastmaster','grove'].includes(t.type)).forEach(t=>{t.supportDamage=Math.max(t.supportDamage,cfg.natureAura);});
        if(cfg.timeAura&&this.clock%8<3)near.forEach(t=>{t.supportHaste=Math.max(t.supportHaste||0,cfg.timeAura);});
        if(cfg.rootPulse){source.rootCooldown=(source.rootCooldown||0)-dt;if(source.rootCooldown<=0){const targets=game.monsters.filter(m=>m.active&&ns.utils.distance(source,m)<=cfg.range);if(targets.length){targets.forEach(m=>{m.rootTime=Math.max(m.rootTime||0,1.1+source.level*.1);});this.pulse(source.x,source.y,'#91e77b',cfg.range);source.rootCooldown=6;}}}
        if(source.type==='beastmaster'&&!game.summons.some(s=>s.active&&s.owner===source&&s.form==='bear'))game.summons.push(new ns.entities.Summon(source,{form:'bear',tags:['summon','nature'],duration:22,level:source.level,damage:20*(1+.3*(source.level-1)),range:48,speed:115,leash:cfg.range+100,offsetX:0,color:cfg.color}));
        if(source.type==='crypt')this.produceCrypt(source,cfg);
        if(source.type==='bombWorkshop'){source.robotCooldown=(source.robotCooldown||0)-dt;if(source.robotCooldown<=0){for(let i=0;i<(cfg.robotCount||1);i++)game.summons.push(new ns.entities.Summon(source,{form:cfg.heavyRobot?'heavyBomb':'bomb',launchDelay:i*.16,tags:['summon','mechanical'],duration:18,damage:cfg.robotDamage*(1+.22*(source.level-1)),splash:cfg.robotSplash,range:23,leash:cfg.range+100,speed:cfg.heavyRobot?80:130,offsetX:0,level:source.level,color:'#ffb467'}));source.robotCooldown=cfg.summonInterval;this.pulse(source.x,source.y,'#ffba71',25);}}
      });
      game.summons.forEach(s=>{if(s.form==='bear'&&s.owner.level!==s.level){s.level=s.owner.level;s.damage=20*(1+.3*(s.level-1));}s.supportDamage=0;items.forEach(t=>{const cfg=t.config();if(cfg.summonAura&&s.tags.includes('summon')&&ns.utils.distance(t,s)<=cfg.range)s.supportDamage=Math.max(s.supportDamage,cfg.summonAura);if(cfg.natureAura&&s.tags.includes('nature')&&ns.utils.distance(t,s)<=cfg.range)s.supportDamage=Math.max(s.supportDamage,cfg.natureAura);});});
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
        const clone=new ns.entities.Projectile(p.owner,p.target,Object.assign({},p,{x:tower.x,y:tower.y,reflected:true,refractionChecked:true,damage:p.damage*.65}));game.projectiles.push(clone);this.pulse(tower.x,tower.y,'#c2daff',23);
      });
    }
    static lineDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
    draw(ctx){
      ctx.save();this.fields.slice(0,this.game.feedback&&this.game.feedback.mobile?16:32).forEach(f=>{ctx.globalAlpha=.4;ctx.strokeStyle='#ffb347';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(f.a.x,f.a.y);ctx.lineTo(f.b.x,f.b.y);ctx.stroke();});
      this.visuals.forEach(v=>{ctx.globalAlpha=v.time/.45;ctx.strokeStyle=v.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(v.x,v.y,v.radius*(1-v.time/.6),v.radius*.42,0,0,Math.PI*2);ctx.stroke();});
      this.game.monsters.filter(m=>m.active).slice(0,100).forEach(m=>ns.systems.CombatFeedbackSystem.drawStatus(ctx,m,this.clock));ctx.restore();
    }
  }
  ns.systems.BattleSynergySystem=BattleSynergySystem;
})(globalThis.TowerFrontier);
