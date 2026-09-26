(function(ns){
  'use strict';
  const STRATEGIES=Object.freeze({nearest:'距離最近',front:'最接近城門',lowestHealth:'血量最低',highestHealth:'血量最高',fastest:'速度最快'});
  class TargetSelector{
    static supports(strategy){return Object.prototype.hasOwnProperty.call(STRATEGIES,strategy);}
    static valid(target,source){return Boolean(target&&target.active&&!target.leaked&&target.health>0&&(!target.isTargetableBy||target.isTargetableBy(source)));}
    static rank(origin,targets,strategy,filter){
      const mode=this.supports(strategy)?strategy:'front';
      const eligible=(targets||[]).filter(target=>this.valid(target,origin)&&(!filter||filter(target)));
      const progress=target=>typeof target.progress==='function'?target.progress():0;
      const health=target=>Number(target.health)||0;
      const speed=target=>(Number(target.speed)||0)*(target.slowFactor===undefined?1:target.slowFactor)*(target.moveAura===undefined?1:target.moveAura);
      const distance=target=>ns.utils.distance(origin,target);
      return eligible.sort((a,b)=>{
        let difference=0;
        if(mode==='nearest')difference=distance(a)-distance(b);
        else if(mode==='lowestHealth')difference=health(a)-health(b);
        else if(mode==='highestHealth')difference=health(b)-health(a);
        else if(mode==='fastest')difference=speed(b)-speed(a);
        else difference=progress(b)-progress(a);
        return difference||progress(b)-progress(a)||distance(a)-distance(b);
      });
    }
    static select(origin,targets,strategy,filter){return this.rank(origin,targets,strategy,filter)[0]||null;}
  }
  TargetSelector.STRATEGIES=STRATEGIES;
  ns.systems.TargetSelector=TargetSelector;
})(globalThis.TowerFrontier);
