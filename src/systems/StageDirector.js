(function (ns) {
  'use strict';
  class StageDirector {
    constructor() { this.totalWaves=100; this.reset(); }
    reset() { this.wave=1; this.phase='combat'; this.timer=this.waveDuration(); this.bossSpawned=false; this.bossDefeated=false; this.completed=false; }
    chapter() { return Math.ceil(this.wave/10); }
    sector() { return Math.ceil(this.wave/5); }
    isBossWave(wave) { return (wave||this.wave)%5===0; }
    isMajorBoss() { return this.wave%10===0; }
    waveDuration() { return Math.min(18,12+Math.ceil(this.wave/10)*.5); }
    shouldSpawn() { return !this.completed&&!this.isBossWave()&&this.phase==='combat'&&this.timer>0; }
    canRunChallenge() { return !this.completed&&!this.isBossWave()&&this.phase==='combat'; }
    update(dt, context) {
      if(this.completed)return;
      if(this.isBossWave()){
        if(!this.bossSpawned){
          context.enemies.push(new ns.entities.Boss(this.wave,ns.difficulty.current()));
          this.bossSpawned=true;this.phase='boss';
          context.effects.announce((this.isMajorBoss()?'章節霸主':'戰區 Boss')+' · 第 '+this.wave+' 波','#ff5f88');
        } else if(this.bossDefeated&&!context.enemies.some(function(enemy){return enemy.active&&enemy.type==='boss';})) this.advance(context);
        return;
      }
      if(this.phase==='combat'){
        this.timer=Math.max(0,this.timer-dt);
        if(this.timer<=0)this.phase='clear';
      }
      if(this.phase==='clear'&&!context.enemies.some(function(enemy){return enemy.active;}))this.advance(context);
    }
    onEnemyDestroyed(enemy){if(enemy&&enemy.type==='boss')this.bossDefeated=true;}
    rewardFor(clearedWave){if(clearedWave===1)return'mirror';if(clearedWave===3)return'familiar';if(clearedWave>5&&clearedWave%5===0)return clearedWave%10===0?'familiar':'mirror';return'';}
    advance(context){
      const cleared=this.wave; const reward=this.rewardFor(cleared);
      if(reward){const item=new ns.entities.PowerUp(context.player.x,Math.max(90,context.player.y-170),reward);item.speed=58;context.powerUps.push(item);}
      context.enemyBullets.forEach(function(bullet){bullet.active=false;});
      if(cleared>=this.totalWaves){this.completed=true;this.phase='complete';context.effects.announce('遠征完成 · 100 波制霸','#ffe178');return;}
      this.wave+=1;this.phase='combat';this.timer=this.waveDuration();this.bossSpawned=false;this.bossDefeated=false;
      context.effects.announce('WAVE '+this.wave+' / '+this.totalWaves+(this.isBossWave()?' · BOSS':''),this.isBossWave()?'#ff5f88':ns.skins.current().accent);
    }
    status(){
      if(this.completed)return'遠征完成 100/100';
      if(this.isBossWave())return'WAVE '+this.wave+'/100 · '+(this.isMajorBoss()?'章節霸主':'BOSS');
      const suffix=this.phase==='clear'?' · 清除殘敵':' · '+Math.ceil(this.timer)+'s';
      return'WAVE '+this.wave+'/100 · CH.'+this.chapter()+suffix;
    }
  }
  ns.systems.StageDirector=StageDirector;
})(globalThis.SkyStrike);
