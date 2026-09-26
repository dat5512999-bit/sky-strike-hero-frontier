(function(ns){
  'use strict';
  // Shared combat contracts for evolved attacks; no independent update loop.
  class HeroEvolutionCombat{
    static rank(hero){return ns.systems.HeroEvolutionSystem.rank(hero);}
    static marked(enemy,hero){return enemy.evolutionMark>0&&enemy.evolutionMarkOwner===hero;}
    static mark(enemy,hero,time=7){enemy.evolutionMark=Math.max(enemy.evolutionMark||0,time);enemy.evolutionMarkOwner=hero;}
    static controlled(enemy){return enemy.rootTime>0||enemy.slowTimer>0&&enemy.slowFactor<1||enemy.frostStatus?.window>0;}
    static damageRate(enemy,source){
      const hero=source?.owner;if(!hero?.classType||!hero.evolution?.rank)return 1;
      const rank=this.rank(hero),marked=this.marked(enemy,hero);
      if(['hunter','naga'].includes(hero.classType)&&marked)return rank===2?1.3:1.2;
      if(hero.classType==='rogue'&&marked&&source.evolutionSkill)return rank===2?1.4:1.25;
      if(hero.classType==='chief'&&hero.evolutionAvatarTime>0)return enemy.combatRole==='boss'?1.65:1.2;
      if(hero.classType==='arcanist'&&this.controlled(enemy))return rank===2?1.35:1.2;
      if(hero.classType==='frostland'&&marked&&source.shatter>0&&enemy.frostStatus?.window>0)return 1.3;
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
      if(hero.classType==='frostland'&&rank===2&&enemy.frostStatus?.window>0)for(const m of near)ns.systems.FrostStatusSystem.apply(m,45);
    }
    static updateEnemy(enemy,dt){
      if(enemy.evolutionMark>0){enemy.evolutionMark=Math.max(0,enemy.evolutionMark-dt);if(!enemy.evolutionMark)enemy.evolutionMarkOwner=null;}
      if(enemy.evolutionArmorTime>0){enemy.evolutionArmorTime=Math.max(0,enemy.evolutionArmorTime-dt);if(!enemy.evolutionArmorTime)enemy.evolutionArmorBreak=0;}
    }
    static weaken(enemy,amount,time){enemy.evolutionArmorBreak=Math.max(enemy.evolutionArmorBreak||0,amount);enemy.evolutionArmorTime=Math.max(enemy.evolutionArmorTime||0,time);}
    static displace(enemy,distance){
      if(enemy.evolutionTrial||enemy.evolutionTraining||typeof enemy.setRouteDistance!=='function')return;
      const resistance=enemy.combatRole==='boss'?.25:1;
      enemy.setRouteDistance(Math.max(0,(enemy.routeDistance||0)-distance*resistance));enemy.attackWindup=0;
    }
    static field(hero,type,power,options={}){
      hero.fields=hero.fields.filter(f=>f.type!==type);
      hero.fields.push(Object.assign({x:hero.x,y:hero.y,time:7,tick:0,type,power,radius:100,maxTargets:12},options));
    }
    static pulse(hero,field,dt,monsters,onKill,onHit){
      if(!field.type.startsWith('evo-'))return false;
      const elapsed=Math.min(Math.max(0,dt),Math.max(0,field.time));field.time-=elapsed;field.tick+=elapsed;
      if(field.tick<.5)return true;field.tick=0;
      // One present-time pulse per update, never replay a background backlog.
      const targets=monsters.filter(m=>m.active&&ns.utils.distance(field,m)<=field.radius).sort((a,b)=>b.progress()-a.progress()).slice(0,12);
      for(const m of targets){
        if(!m.active)continue;
        if(['evo-hunter','evo-naga','evo-rogue'].includes(field.type))m.applySlow(field.type==='evo-naga'?.35:.5,.75);
        if(field.type==='evo-hunter')this.weaken(m,3,.8);
        if(['evo-hunter','evo-naga','evo-rogue'].includes(field.type))this.mark(m,hero,4);
        const shot=new ns.entities.Projectile(hero,m,{damage:12*field.power,attackType:field.type==='evo-hunter'?'pierce':'magic',color:ns.systems.HeroRoster.get(hero.classType).color,style:field.type==='evo-naga'?'maelstrom':'energy',canHitAir:true,evolutionSkill:true,frost:field.type==='evo-frostland'?24:0});
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
