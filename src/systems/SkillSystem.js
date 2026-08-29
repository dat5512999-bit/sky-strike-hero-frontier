(function (ns) {
  'use strict';
  const TYPES = ['strawberry','banana','grape','pineapple'];
  class SkillSystem {
    constructor(random) { this.random=random||Math.random; this.reset(); }
    reset() { this.timers={ spread:0, rapid:0 }; this.spawnTimer=5; this.lastPickup=''; }
    has(skill) { return this.timers[skill] > 0; }
    update(dt, powerUps) {
      this.timers.spread=Math.max(0,this.timers.spread-dt); this.timers.rapid=Math.max(0,this.timers.rapid-dt);
      this.spawnTimer-=dt;
      if (this.spawnTimer<=0) { this.spawn(powerUps); this.spawnTimer=ns.config.skills.guaranteedInterval; }
    }
    spawn(powerUps, x, y) {
      const type=TYPES[Math.floor(this.random()*TYPES.length)];
      powerUps.push(new ns.entities.PowerUp(x || 45+this.random()*(ns.config.width-90), y || -25, type));
    }
    maybeDrop(enemy, powerUps) { if(this.random()<ns.config.skills.dropChance) this.spawn(powerUps,enemy.x,enemy.y); }
    collect(powerUp, context) {
      this.lastPickup=powerUp.type;
      if(powerUp.type==='strawberry') this.timers.spread=Math.max(this.timers.spread,ns.config.skills.spreadSeconds);
      if(powerUp.type==='banana') this.timers.rapid=Math.max(this.timers.rapid,ns.config.skills.rapidSeconds);
      if(powerUp.type==='grape') context.player.shieldHits=Math.min(2,context.player.shieldHits+1);
      if(powerUp.type==='pineapple') {
        context.enemyBullets.forEach(function(b){ b.active=false; });
        context.enemies.forEach(function(enemy){ if(enemy.active && enemy.takeDamage(3)) context.onDestroyed(enemy,false); });
      }
    }
    status(player) {
      const labels=[];
      if(this.has('spread')) labels.push('🍓散射 '+Math.ceil(this.timers.spread)+'s');
      if(this.has('rapid')) labels.push('🍌連射 '+Math.ceil(this.timers.rapid)+'s');
      if(player && player.shieldHits) labels.push('🍇護盾 '+player.shieldHits);
      return labels.length ? labels.join(' · ') : '技能：等待果實';
    }
  }
  ns.systems.SkillSystem=SkillSystem;
})(globalThis.SkyStrike);
