(function(ns){
  'use strict';
  const DURATIONS={frostWolf:.42,frostBear:.72,frostBird:.6,frostHunter:.56,frostShaman:.72,frostMammoth:.9};
  class FrostlandAnimation {
    static queue(unit,targets,options){
      const duration=Math.min(DURATIONS[unit.type]||.56,unit.config().interval*.9);
      unit.frostAction={age:0,duration,released:false,targets:targets.slice(),options:{...options}};
    }
    static update(unit,dt,monsters,projectiles){
      const action=unit.frostAction;if(!action)return;
      if(!unit.active||unit.retired){unit.frostAction=null;return;}
      action.age+=dt;
      if(!action.released&&action.age>=action.duration*.45){
        action.released=true;
        for(const target of action.targets)if(target.active&&monsters.includes(target)&&ns.utils.distance(unit,target)<=unit.config().range+20){
          projectiles.push(new ns.entities.Projectile(unit,target,action.options));
          ns.systems.FrostlandVFX?.emit(unit.synergy,'attack',unit,{target:{x:target.x,y:target.y},unitType:unit.type,color:unit.config().color});
        }
      }
      if(action.age>=action.duration)unit.frostAction=null;
    }
    static pose(actor,hero=false){
      if(hero){const row={idle:0,walk:1,attack:2,cast:3}[actor.state]||0;return {row,frame:Math.max(0,Math.min(3,actor.frame||0)),phase:row>=2?Math.max(0,Math.min(1,actor.animationTime/(row===3?.56:.36))):0};}
      const action=actor.frostAction,phase=action?Math.min(1,action.age/action.duration):0;
      return {row:Object.keys(DURATIONS).indexOf(actor.type),frame:action?Math.min(3,Math.floor(phase*4)):0,phase};
    }
  }
  FrostlandAnimation.DURATIONS=DURATIONS;ns.systems.FrostlandAnimation=FrostlandAnimation;
})(globalThis.TowerFrontier);
