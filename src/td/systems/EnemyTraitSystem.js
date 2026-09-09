(function(ns){
  'use strict';
  class EnemyTraitSystem{
    update(dt,monsters,hooks){
      monsters.forEach(monster=>{monster.moveAura=1;monster.temporaryArmor=0;});
      monsters.filter(monster=>monster.active&&monster.type==='commander').forEach(commander=>{
        monsters.forEach(monster=>{if(monster.active&&ns.utils.distance(commander,monster)<=118){monster.moveAura=Math.max(monster.moveAura,1.18);monster.temporaryArmor=Math.max(monster.temporaryArmor,1);}});
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
