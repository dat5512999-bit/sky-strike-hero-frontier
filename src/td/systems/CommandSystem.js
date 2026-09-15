(function(ns){
  'use strict';
  class CommandSystem{
    constructor(){this.mode='move';}
    arm(mode){if(!['move','attackMove'].includes(mode))return false;this.mode=mode;return true;}
    issue(unit,x,y,navigation,buildings){if(!unit||unit.kind!=='unit')return false;const destination=navigation.clampPoint({x:x,y:y}),path=navigation.findPath(unit,destination,buildings);if(!path.length)return false;const accepted=unit.issueCommand(this.mode,destination,path);this.mode='move';return accepted;}
    stop(unit){if(!unit||unit.kind!=='unit')return false;const accepted=unit.stop();this.mode='move';return accepted;}
    hold(unit){if(!unit||unit.kind!=='unit')return false;const accepted=unit.holdPosition();this.mode='move';return accepted;}
    reset(){this.mode='move';}
  }
  ns.systems.CommandSystem=CommandSystem;
})(globalThis.TowerFrontier);
