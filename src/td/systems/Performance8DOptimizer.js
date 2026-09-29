(function(ns){
  'use strict';
  const Game=ns.TDGame;
  if(!Game||Game.prototype.performance8DPatched)return;
  // D4: convoy updates run for every simulation sub-step. Reusing one small
  // ordering buffer removes per-step array allocation without changing target,
  // spacing, update order, or elapsed simulation time.
  Game.prototype.updateMonsterConvoy=function(dt){
    const active=this.convoyOrder||(this.convoyOrder=[]);active.length=0;
    for(const monster of this.monsters)if(monster.active)active.push(monster);
    if(ns.config.routes&&ns.config.routes.length>1){
      active.sort((a,b)=>a.remainingDistance()-b.remainingDistance());
      const aheadByPath=new Map();let sharedAhead=null;
      for(const monster of active){
        const remaining=monster.remainingDistance(),front=aheadByPath.get(monster.path);let advance=Infinity;
        for(const leader of [front,sharedAhead])if(leader&&leader.active)advance=Math.min(advance,Game.prototype.convoyAdvanceLimit.call(this,leader,monster));
        monster.update(dt,this.hero,null,advance);
        if(monster.leaked&&!monster.leakHandled){monster.leakHandled=true;this.report.recordLeak(monster.baseDamage);this.baseHealth=Math.max(0,this.baseHealth-monster.baseDamage);this.flash('城門受損 -'+monster.baseDamage,'#ff416d');}
        if(monster.active){aheadByPath.set(monster.path,monster);if(monster.remainingDistance()<=ns.config.sharedLength)sharedAhead=monster;}
      }
      return;
    }
    active.sort((a,b)=>(b.routeDistance||0)-(a.routeDistance||0));let ahead=null;
    for(const monster of active){
      const maxAdvance=Game.prototype.convoyAdvanceLimit.call(this,ahead,monster);monster.update(dt,this.hero,null,maxAdvance);
      if(monster.leaked&&!monster.leakHandled){monster.leakHandled=true;this.report.recordLeak(monster.baseDamage);this.baseHealth=Math.max(0,this.baseHealth-monster.baseDamage);this.flash('城門受損 -'+monster.baseDamage,'#ff416d');}
      if(monster.active)ahead=monster;
    }
  };
  const position=Game.prototype.positionSelectionActions;
  Game.prototype.positionSelectionActions=function(){
    const now=globalThis.performance?.now?.()??Date.now(),selected=this.build&&this.build.selected;
    if(selected&&now-(this.lastSelectionActionLayout||0)<50)return;
    if(selected)this.lastSelectionActionLayout=now;
    return position.apply(this,arguments);
  };
  Game.prototype.performance8DPatched=true;
})(globalThis.TowerFrontier);
