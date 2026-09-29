(function(ns){
  'use strict';
  const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
  const SOUTHERN_FIELDS={
    'evo-dwarf':{damage:13,attackType:'chaos',slow:.64,armor:[0,3,5]},
    'evo-dragonkin':{damage:17,attackType:'magic',mark:true,style:'lightning'},
    'evo-egypt':{damage:12,attackType:'magic',slow:.72,mark:true}
  };
  // Shared combat contracts for evolved attacks; no independent update loop.
  class HeroEvolutionCombat{
    static rank(hero){return ns.systems.HeroEvolutionSystem.rank(hero);}
    static marked(enemy,hero){return enemy.evolutionMark>0&&enemy.evolutionMarkOwner===hero;}
    static mark(enemy,hero,time=7){enemy.evolutionMark=Math.max(finite(enemy.evolutionMark),ns.utils.clamp(finite(time),0,12));enemy.evolutionMarkOwner=hero;}
    static controlled(enemy){return enemy.rootTime>0||enemy.slowTimer>0&&enemy.slowFactor<1||enemy.frostStatus?.window>0;}
    static damageRate(enemy,source){
      const hero=source?.owner;if(!hero?.classType||!hero.evolution?.rank)return 1;
      const rank=this.rank(hero),marked=this.marked(enemy,hero);
      if(['hunter','naga'].includes(hero.classType)&&marked)return rank===2?1.3:1.2;
      if(hero.classType==='rogue'&&marked&&source.evolutionSkill)return rank===2?1.4:1.25;
      if(hero.classType==='chief'&&hero.evolutionAvatarTime>0)return enemy.combatRole==='boss'?1.65:1.2;
      if(hero.classType==='arcanist'&&this.controlled(enemy))return rank===2?1.35:1.2;
      if(hero.classType==='frostland'&&marked&&source.shatter>0&&enemy.frostStatus?.window>0)return 1.3;
      if(hero.classType==='dwarf')return(enemy.evolutionArmorBreak>0&&enemy.evolutionArmorTime>0?(rank===2?1.25:1.15):1)*(hero.evolutionAvatarTime>0?(rank===2?1.4:1.25):1);
      if(hero.classType==='dragonkin'&&source.attackType==='magic')return(marked?(rank===2?1.28:1.18):1)*(hero.evolutionAvatarTime>0?(rank===2?1.35:1.22):1);
      if(hero.classType==='egypt')return(marked&&enemy.maxHealth>0&&enemy.health/enemy.maxHealth<.5?(rank===2?1.28:1.18):1)*(hero.evolutionAvatarTime>0?(rank===2?1.28:1.18):1);
      return 1;
    }
    static afterHit(enemy,source,damage,monsters){
      const hero=source?.owner;if(!hero?.evolution?.rank||damage<=0)return;
      if(hero.classType==='goblin'&&this.rank(hero)===2&&source.evolutionSkill&&!source.evolutionDischarge){hero.evolution.energy=Math.min(100,(hero.evolution.energy||0)+8);}
      if(!enemy.active)this.onDeath(hero,enemy,monsters);
    }
    static onDeath(hero,enemy,monsters){
      if(!hero?.evolution?.rank||enemy.evolutionDeathHandled||enemy.evolutionTrial||enemy.evolutionTraining)return;
      enemy.evolutionDeathHandled=true;const rank=this.rank(hero),marked=this.marked(enemy,hero);
      const near=(monsters||[]).filter(m=>m.active&&m!==enemy&&ns.utils.distance(m,enemy)<=130).sort((a,b)=>ns.utils.distance(a,enemy)-ns.utils.distance(b,enemy)).slice(0,6);
      if(marked&&(rank===2&&['hunter','naga'].includes(hero.classType)||hero.classType==='rogue'))for(const m of near.slice(0,3))this.mark(m,hero,6);
      if(marked&&rank===2&&hero.classType==='dragonkin')for(const m of near.slice(0,2))this.mark(m,hero,6);
      if(hero.classType==='frostland'&&rank===2&&enemy.frostStatus?.window>0)for(const m of near)ns.systems.FrostStatusSystem.apply(m,45);
    }
    static updateEnemy(enemy,dt){
      dt=Math.max(0,finite(dt));
      if(enemy.evolutionMark>0){enemy.evolutionMark=Math.max(0,enemy.evolutionMark-dt);if(!enemy.evolutionMark)enemy.evolutionMarkOwner=null;}
      if(enemy.evolutionArmorTime>0){enemy.evolutionArmorTime=Math.max(0,enemy.evolutionArmorTime-dt);if(!enemy.evolutionArmorTime)enemy.evolutionArmorBreak=0;}
    }
    static weaken(enemy,amount,time){enemy.evolutionArmorBreak=Math.max(finite(enemy.evolutionArmorBreak),ns.utils.clamp(finite(amount),0,12));enemy.evolutionArmorTime=Math.max(finite(enemy.evolutionArmorTime),ns.utils.clamp(finite(time),0,12));}
    static displace(enemy,distance){
      if(enemy.evolutionTrial||enemy.evolutionTraining||typeof enemy.setRouteDistance!=='function')return;
      const resistance=enemy.combatRole==='boss'?.25:1;
      enemy.setRouteDistance(Math.max(0,(enemy.routeDistance||0)-distance*resistance));enemy.attackWindup=0;
    }
    static field(hero,type,power,options={}){
      if(!Number.isFinite(power)||power<=0||!Number.isFinite(hero.x)||!Number.isFinite(hero.y))return false;
      const field=Object.assign({x:hero.x,y:hero.y,time:7,tick:0,type,power,radius:100,maxTargets:12},options);
      if(!Number.isFinite(field.x)||!Number.isFinite(field.y))return false;
      field.time=ns.utils.clamp(finite(field.time,7),0,12);field.tick=0;field.radius=ns.utils.clamp(finite(field.radius,100),1,300);field.maxTargets=ns.utils.clamp(Math.floor(finite(field.maxTargets,12)),1,16);
      hero.fields=(hero.fields||[]).filter(f=>f.type!==type);hero.fields.push(field);return true;
    }
    static pulse(hero,field,dt,monsters,onKill,onHit){
      if(!field.type.startsWith('evo-'))return false;
      if(!hero.active||!Number.isFinite(field.power)||field.power<=0||!Number.isFinite(field.time)||!Number.isFinite(field.x)||!Number.isFinite(field.y)||!Number.isFinite(field.radius)){field.time=0;return true;}
      const elapsed=Math.min(Math.max(0,finite(dt)),Math.max(0,field.time));field.time-=elapsed;field.tick=Math.max(0,finite(field.tick))+elapsed;
      if(field.tick<.5)return true;field.tick=0;
      // One present-time pulse per update, never replay a background backlog.
      const progress=m=>typeof m.progress==='function'?finite(m.progress()):finite(m.routeDistance),targets=(monsters||[]).filter(m=>m?.active&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Number.isFinite(m.health)&&ns.utils.distance(field,m)<=field.radius).sort((a,b)=>progress(b)-progress(a)).slice(0,Math.max(1,Math.min(16,finite(field.maxTargets,12))));
      const profile=SOUTHERN_FIELDS[field.type],rank=field.rank===2?2:1;
      for(const m of targets){
        if(!m.active)continue;
        if(profile){
          if(profile.slow)m.applySlow(profile.slow,.7);
          if(profile.armor)this.weaken(m,profile.armor[rank],.75);
          if(profile.mark)this.mark(m,hero,3);
          const shot=new ns.entities.Projectile(hero,m,{damage:profile.damage*field.power,attackType:profile.attackType,color:ns.systems.HeroRoster.get(hero.classType).color,style:profile.style||'energy',canHitAir:true,evolutionSkill:true});shot.hit(monsters,onKill,onHit);continue;
        }
        if(['evo-hunter','evo-naga','evo-rogue','evo-bull'].includes(field.type))m.applySlow(field.type==='evo-naga'?.35:field.type==='evo-bull'?.46:.5,.75);
        if(field.type==='evo-hunter')this.weaken(m,3,.8);
        if(['evo-hunter','evo-naga','evo-rogue'].includes(field.type))this.mark(m,hero,4);
        const shot=new ns.entities.Projectile(hero,m,{damage:12*field.power,attackType:field.type==='evo-hunter'?'pierce':'magic',color:ns.systems.HeroRoster.get(hero.classType).color,style:field.type==='evo-naga'?'maelstrom':field.type==='evo-bull'?'bull-hammer':'energy',canHitAir:true,evolutionSkill:true,frost:field.type==='evo-frostland'?24:0});
        shot.hit(monsters,onKill,onHit);
      }
      return true;
    }
    static summon(hero,ctx,kind,count,options={}){
      const summons=ctx.summons||(ctx.summons=[]),existing=summons.filter(s=>s.active&&s.owner===hero&&s.evolutionKind===kind);
      for(const s of existing)s.active=false;
      for(let i=0;i<count;i++)summons.push(new ns.entities.EvolutionCompanion(hero,Object.assign({kind,offsetX:(i-(count-1)/2)*32,rank:this.rank(hero)},options)));
    }
  }
  ns.systems.HeroEvolutionCombat=HeroEvolutionCombat;
})(globalThis.TowerFrontier);
