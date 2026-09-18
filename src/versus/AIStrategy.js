(function(ns){
  'use strict';
  const PROFILES={fortress:{name:'堡壘反攻',order:['tower','infantry','tower','ranger'],lane:'balanced'},rush:{name:'單線快攻',order:['infantry','infantry','ranger','tower'],lane:'focus'},economy:{name:'補給爭奪',order:['ranger','infantry','tower','siege'],lane:'balanced'},split:{name:'雙線壓迫',order:['infantry','ranger','infantry','tower'],lane:'alternate'},feint:{name:'誘敵轉線',order:['infantry','tower','siege','ranger'],lane:'feint'}};
  class AIStrategy{
    constructor(random){this.random=random||Math.random;const ids=Object.keys(PROFILES);this.id=ids[Math.floor(this.random()*ids.length)];this.profile=PROFILES[this.id];this.clock=2;this.index=0;this.builds=0;this.pending=null;}
    lane(match){if(this.profile.lane==='alternate')return this.builds%2?'upper':'lower';if(this.profile.lane==='focus')return this.random()<.78?'upper':'lower';if(this.profile.lane==='feint')return match.elapsed<240?'upper':'lower';const upper=match.units.filter(u=>u.side==='player'&&u.lane==='upper').length,lower=match.units.filter(u=>u.side==='player'&&u.lane==='lower').length;return upper>lower?'upper':'lower';}
    update(dt,match){if(this.pending){match.moveWorker('enemy',this.pending.x,ns.config.lanes[this.pending.lane]-58);if(match.build('enemy',this.pending.type,this.pending.x,this.pending.lane)){this.builds+=1;this.pending=null;this.clock=7+this.random()*6;}return;}this.clock-=dt;if(this.clock>0)return;this.pending={type:this.profile.order[this.index++%this.profile.order.length],lane:this.lane(match),x:1080-Math.floor(this.random()*4)*55};}
  }
  AIStrategy.PROFILES=PROFILES;ns.systems.AIStrategy=AIStrategy;
})(globalThis.FrontierVersus);
