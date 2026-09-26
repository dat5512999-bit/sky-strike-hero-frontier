(function(ns){
  'use strict';
  class EnemyTraitSystem{
    update(dt,monsters,hooks){
      const hero=hooks&&hooks.hero,sightRadius=hero&&hero.equipment?[0,130,165,200][hero.equipment.sightstone||0]||0:0;
      monsters.forEach(monster=>{monster.moveAura=1;monster.temporaryArmor=0;monster.controlResistance=monster.bossWardTime>0?.35:0;if(monster.concealed&&hero&&hero.active&&sightRadius>0&&ns.utils.distance(hero,monster)<=sightRadius)monster.reveal();});
      monsters.filter(monster=>monster.active&&monster.type==='commander').forEach(commander=>{
        monsters.forEach(monster=>{if(monster.active&&ns.utils.distance(commander,monster)<=118){monster.moveAura=Math.max(monster.moveAura,1.18);monster.temporaryArmor=Math.max(monster.temporaryArmor,1);}});
      });
      monsters.filter(monster=>monster.active&&monster.type==='orcBanner').forEach(banner=>{
        monsters.forEach(monster=>{if(monster.active&&ns.utils.distance(banner,monster)<=112)monster.temporaryArmor=Math.max(monster.temporaryArmor,2);});
      });
      monsters.filter(monster=>monster.active&&monster.type==='frostRimePriest').forEach(priest=>{
        monsters.forEach(monster=>{if(monster.active&&ns.utils.distance(priest,monster)<=108)monster.controlResistance=Math.max(monster.controlResistance,.32);});
      });
      monsters.filter(monster=>monster.active&&monster.type==='healer').forEach(healer=>{
        healer.traitCooldown=Math.max(0,(healer.traitCooldown||1.4)-dt);if(healer.traitCooldown>0)return;
        const targets=monsters.filter(monster=>monster.active&&monster.health<monster.maxHealth&&ns.utils.distance(healer,monster)<=125).sort((a,b)=>a.health/a.maxHealth-b.health/b.maxHealth).slice(0,4);
        targets.forEach(target=>{const before=target.health;target.health=Math.min(target.maxHealth,target.health+Math.max(5,Math.round(target.maxHealth*.055)));if(hooks&&hooks.onHeal&&target.health>before)hooks.onHeal(healer,target,target.health-before);});healer.traitCooldown=3.2;
      });
    }
  }
  ns.systems.EnemyTraitSystem=EnemyTraitSystem;
})(globalThis.TowerFrontier);
