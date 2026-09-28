(function(ns){
  'use strict';
  const DURATIONS={frostWolf:.42,frostBear:.72,frostBird:.6,frostHunter:.56,frostShaman:.72,frostMammoth:.9};
  class FrostlandAnimation {
    static queue(unit,targets,options){
      const duration=Math.min(DURATIONS[unit.type]||.56,unit.config().interval*.9);
      unit.frostAction={age:0,duration,released:false,targets:targets.slice(),options:{...options}};
    }
    static update(unit,dt,monsters,projectiles){
      // A persistent visual clock must not restart when target/state changes.
      // Only frost soldiers use it; combat cooldowns remain authoritative.
      if(Object.prototype.hasOwnProperty.call(DURATIONS,unit.type)&&unit.active&&!unit.retired){
        unit.frostVisualTime=((unit.frostVisualTime||0)+Math.max(0,Number.isFinite(dt)?dt:0))%3600;
      }
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
      return {row:Object.keys(DURATIONS).indexOf(actor.type),frame:action?(action.released?(phase<.75?2:3):Math.min(1,Math.floor(phase/.225))):0,phase};
    }
    static motionPose(actor){
      const action=actor.frostAction,phase=action?Math.max(0,Math.min(1,action.age/Math.max(.001,action.duration))):0;
      const offset=Math.abs((actor.guardX??actor.x??0)*.037+(actor.guardY??actor.y??0)*.019)%1;
      const clock=(actor.frostVisualTime||0)+offset;
      const flying=actor.type==='frostBird';
      // Frames 8..10 wind up; frame 11 releases on the existing 45% damage event.
      const attackFrame=action?(action.released?3+Math.min(4,Math.floor(Math.max(0,phase-.45)/.55*5)):Math.min(2,Math.floor(phase/.45*3))):0;
      const index=action?8+attackFrame:Math.floor(clock*(flying?8:3))%8;
      const impact=action&&action.released?Math.max(0,1-Math.abs(phase-.52)/.16):0;
      return {index,phase,clock,flying,lift:flying?12+Math.sin(clock*Math.PI*2)*2.5:0,
        shadowWidth:(actor.type==='frostMammoth'?42:actor.type==='frostBear'?32:26)*(1+impact*.08),
        shadowAlpha:flying?.23:.34,impact};
    }
  }
  FrostlandAnimation.DURATIONS=DURATIONS;ns.systems.FrostlandAnimation=FrostlandAnimation;
})(globalThis.TowerFrontier);
