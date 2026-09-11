(function(ns){
  'use strict';
  class EnemyCombatSystem{
    damageFor(monster,multiplier){return Math.max(1,Math.round((monster.attackDamage||0)*(1+(monster.wave-1)*.035)*(monster.damageMultiplier||1)*(multiplier||1)));}
    validTargets(monster,hero,defenders){
      if(monster.combatRole==='siege')return(defenders||[]).filter(unit=>unit.active&&ns.utils.distance(monster,unit)<=monster.attackRange);
      if(monster.combatRole==='hunter')return hero&&hero.active&&ns.utils.distance(monster,hero)<=monster.attackRange?[hero]:[];
      if(monster.combatRole==='boss')return[hero].concat(defenders||[]).filter(target=>target&&target.active&&ns.utils.distance(monster,target)<=monster.attackRange);
      return[];
    }
    strike(monster,target,multiplier,hooks,kind){
      if(!target||!target.active)return false;const damage=target.takeDamage(this.damageFor(monster,multiplier));if(!damage)return false;
      if(hooks&&hooks.onHit)hooks.onHit(target,damage,monster,kind||'attack');
      if(!target.active&&hooks&&hooks.onDefeated)hooks.onDefeated(target,monster);
      return true;
    }
    phase(monster,monsters,hooks){
      if(monster.type!=='boss')return;
      const ratio=monster.health/monster.maxHealth,next=ratio<=.33?3:ratio<=.66?2:1;
      if(next<=monster.bossPhase)return;monster.bossPhase=next;
      if(next===2&&!monster.phaseTriggered[2]){
        monster.phaseTriggered[2]=true;const reinforcements=[],types=monster.wave>=30?['runner','commander','healer','runner']:monster.wave>=25?['runner','brute','commander']:monster.wave>=20?['runner','commander','runner']:['runner','runner'];
        types.forEach(function(type,index){const unit=new ns.entities.Monster(type,monster.wave,monster.path,monster.modifiers);unit.x=monster.x+(index-(types.length-1)/2)*28;unit.y=monster.y+12;unit.index=monster.index;unit.reward=Math.max(1,Math.round(unit.reward*.5));reinforcements.push(unit);});
        reinforcements.forEach(unit=>monsters.push(unit));if(hooks&&hooks.onBossPhase)hooks.onBossPhase(monster,2,reinforcements);
      }
      if(next===3&&!monster.phaseTriggered[3]){monster.phaseTriggered[3]=true;monster.enraged=true;monster.speed*=1.2;if(hooks&&hooks.onBossPhase)hooks.onBossPhase(monster,3,[]);}
    }
    bossAbility(dt,monster,hero,defenders,hooks){
      if(monster.type!=='boss')return false;
      if(monster.abilityWindup>0){const before=monster.abilityWindup;monster.abilityWindup=Math.max(0,monster.abilityWindup-dt);if(before>0&&monster.abilityWindup<=0){const targets=[hero].concat(defenders||[]).filter(target=>target&&target.active&&ns.utils.distance(monster,target)<=monster.abilityRadius);targets.forEach(target=>this.strike(monster,target,monster.bossPhase===3?1.55:1.25,hooks,'stomp'));monster.abilityCooldown=monster.bossPhase===3?4.5:7;if(hooks&&hooks.onAbility)hooks.onAbility(monster,targets);}return true;}
      monster.abilityCooldown-=dt;if(monster.abilityCooldown<=0){monster.abilityWindup=1.1;monster.combatTarget=null;monster.attackWindup=0;if(hooks&&hooks.onWarning)hooks.onWarning(monster,'戰爭踐踏',monster.abilityRadius);return true;}return false;
    }
    attack(dt,monster,hero,defenders,hooks){
      if(!monster.combatRole)return;monster.attackCooldown-=dt;
      if(monster.attackWindup>0){const before=monster.attackWindup;monster.attackWindup=Math.max(0,monster.attackWindup-dt);if(before>0&&monster.attackWindup<=0){const target=monster.combatTarget;if(target&&target.active&&ns.utils.distance(monster,target)<=monster.attackRange+24)this.strike(monster,target,1,hooks,'attack');monster.combatTarget=null;monster.attackCooldown=(monster.attackInterval||2)*(monster.enraged?.65:1);}return;}
      const target=this.validTargets(monster,hero,defenders).sort((a,b)=>ns.utils.distance(monster,a)-ns.utils.distance(monster,b))[0];if(target&&monster.attackCooldown<=0){monster.combatTarget=target;monster.attackWindup=monster.combatRole==='hunter'?.55:.36;monster.facing=Math.atan2(target.y-monster.y,target.x-monster.x);if(hooks&&hooks.onWarning&&monster.combatRole==='hunter')hooks.onWarning(monster,'虛空箭',0);}
    }
    update(dt,monsters,hero,defenders,hooks){
      monsters.slice().forEach(monster=>{if(!monster.active)return;this.phase(monster,monsters,hooks);if(this.bossAbility(dt,monster,hero,defenders,hooks))return;this.attack(dt,monster,hero,defenders,hooks);});
    }
  }
  ns.systems.EnemyCombatSystem=EnemyCombatSystem;
})(globalThis.TowerFrontier);
