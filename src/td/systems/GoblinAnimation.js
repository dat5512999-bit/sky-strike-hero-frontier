(function(ns){
  'use strict';
  const DURATIONS={goblinEngineer:.38,goblinGunner:.44,goblinRiveter:.48,goblinRecycler:.46,goblinMech:.58};
  class GoblinAnimation{
    static queue(unit,targets,options){
      unit.goblinAction={age:0,duration:Math.min(DURATIONS[unit.type]||.44,unit.config().interval*.8),released:false,targets:targets.slice(),options:{...options}};
    }
    static update(unit,dt,monsters,projectiles){
      const action=unit.goblinAction;if(!action)return;
      if(!unit.active||unit.retired||unit.networkCooling||(unit.config().networkCost>=2&&!unit.networkPowered)){unit.goblinAction=null;return;}
      action.age+=dt;
      if(!action.released&&action.age>=action.duration*.48){
        action.released=true;
        for(const target of action.targets)if(target.active&&monsters.includes(target)&&ns.utils.distance(unit,target)<=unit.config().range+20)
          projectiles.push(new ns.entities.Projectile(unit,target,action.options));
      }
      if(action.age>=action.duration)unit.goblinAction=null;
    }
    static frame(unit){
      const action=unit.goblinAction;
      if(action){const phase=action.age/action.duration;return phase<.35?1:phase<.76?2:3;}
      return unit.state==='walk'?Math.floor(unit.frameClock||0)%2?1:0:0;
    }
  }
  GoblinAnimation.DURATIONS=DURATIONS;ns.systems.GoblinAnimation=GoblinAnimation;
})(globalThis.TowerFrontier);
