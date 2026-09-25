(function(ns){
  'use strict';
  // Keep the combat simulation aligned with wall time without allowing an
  // unbounded catch-up loop after a hidden tab or a heavily overloaded frame.
  class FrameTimingSystem{
    constructor(lastTime=null){this.lastTime=lastTime;this.pending=0;this.discarded=0;}
    clear(timestamp){this.lastTime=timestamp;this.pending=0;}
    next(timestamp,speed,active=true){
      if(!Number.isFinite(this.lastTime)||this.lastTime===null){this.lastTime=timestamp;return{steps:0,step:0,realMs:0,backlogMs:0,discardedMs:this.discarded*1000};}
      const elapsed=Math.max(0,(timestamp-this.lastTime)/1000);this.lastTime=timestamp;
      if(!active){this.pending=0;return{steps:0,step:0,realMs:elapsed*1000,backlogMs:0,discardedMs:this.discarded*1000};}
      const rate=Math.max(1,Math.min(3,speed||1))*2,bounded=Math.min(elapsed,.1);
      this.discarded+=(elapsed-bounded)*rate;
      const incoming=this.pending+bounded*rate;
      this.pending=Math.min(incoming,.4);this.discarded+=incoming-this.pending;
      // A 15 FPS frame at ×3 requests 12 small steps. Keep that pace possible
      // while retaining the existing backlog cap for more severe overloads.
      const simulated=Math.min(this.pending,12/30),steps=simulated>0?Math.ceil(simulated/(1/30)-1e-9):0;
      this.pending=Math.max(0,this.pending-simulated);
      return{steps,step:steps?simulated/steps:0,realMs:elapsed*1000,backlogMs:this.pending*1000,discardedMs:this.discarded*1000};
    }
  }
  // Observe lost simulation time over a window, so an isolated long frame
  // (for example, returning from another tab) cannot change player speed.
  class SpeedLoadGuard{
    constructor(){this.reset();}
    reset(){this.effectiveSpeed=3;this.sampleMs=0;this.lostMs=0;this.stableMs=0;this.lastDiscardedMs=null;}
    speed(requested){return requested===3?this.effectiveSpeed:requested;}
    observe(plan,requested,active){
      const previous=this.speed(requested);
      const discarded=Number(plan.discardedMs)||0,delta=Math.max(0,discarded-(this.lastDiscardedMs??discarded));
      this.lastDiscardedMs=discarded;
      if(requested!==3||!active||plan.realMs>250){this.sampleMs=0;this.lostMs=0;this.stableMs=0;return false;}
      const elapsed=Math.max(0,Number(plan.realMs)||0);
      if(this.effectiveSpeed===3){
        this.sampleMs+=elapsed;this.lostMs+=delta;
        if(this.sampleMs>=1500){
          if(this.lostMs>=250)this.effectiveSpeed=2;
          this.sampleMs=0;this.lostMs=0;
        }
      }else{
        // ×3 needs at least ~15 FPS. Require headroom before trying it again.
        this.stableMs=elapsed>0&&elapsed<=55&&delta<1?this.stableMs+elapsed:0;
        if(this.stableMs>=6000){this.effectiveSpeed=3;this.stableMs=0;}
      }
      return previous!==this.speed(requested);
    }
  }
  ns.systems.FrameTimingSystem=FrameTimingSystem;
  ns.systems.SpeedLoadGuard=SpeedLoadGuard;
})(globalThis.TowerFrontier);
