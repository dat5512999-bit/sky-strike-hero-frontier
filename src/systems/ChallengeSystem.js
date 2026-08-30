(function (ns) {
  'use strict';
  class ChallengeSystem {
    constructor(){ this.reset(); }
    reset(){ this.active=null; this.cooldown=13; this.sequence=0; }
    update(dt,context){
      if(!this.active){ this.cooldown-=dt; if(this.cooldown<=0) this.start(context); return; }
      this.active.time=Math.max(0,this.active.time-dt);
      if(this.active.type==='survive' && this.active.time<=0) this.complete(context);
      else if(this.active.type==='hunt' && this.active.time<=0) this.fail(context);
    }
    start(context){
      const mode=ns.difficulty.current();
      const hunt=this.sequence%2===0; this.sequence+=1;
      this.active=hunt ? {type:'hunt',time:9,target:Math.max(3,Math.round(5*mode.challengeScale)),progress:0} : {type:'survive',time:10};
      context.effects.announce(hunt?'特殊事件 · 限時獵殺':'特殊事件 · 無傷考驗','#ffd34f');
    }
    onKill(context){ if(this.active&&this.active.type==='hunt'){this.active.progress+=1;if(this.active.progress>=this.active.target)this.complete(context);} }
    onPlayerDamaged(context){ if(this.active&&this.active.type==='survive')this.fail(context); }
    complete(context){
      const reward=new ns.entities.PowerUp(context.player.x,Math.max(75,context.player.y-150),'dragonfruit'); reward.speed=62; context.powerUps.push(reward);
      context.effects.announce('事件完成 · 龍果獎勵','#ff75d8'); this.active=null; this.cooldown=ns.difficulty.current().challengeInterval;
    }
    fail(context){ context.effects.announce('事件失敗 · 再接再厲','#ff6b6b'); this.active=null; this.cooldown=Math.max(8,ns.difficulty.current().challengeInterval*.7); }
    status(){
      if(!this.active)return '';
      if(this.active.type==='hunt')return '⚔ 限時獵殺 '+this.active.progress+'/'+this.active.target+' · '+Math.ceil(this.active.time)+'s';
      return '◇ 無傷考驗 · '+Math.ceil(this.active.time)+'s';
    }
  }
  ns.systems.ChallengeSystem=ChallengeSystem;
})(globalThis.SkyStrike);
