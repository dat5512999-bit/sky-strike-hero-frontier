(function (ns) {
  'use strict';
  const TYPES = ['strawberry','banana','grape','pineapple'];
  class SkillSystem {
    constructor(random) { this.random=random||Math.random; this.reset(); }
    reset() { this.timers={ spread:0, rapid:0 }; this.levels={ spread:0, rapid:0, shield:0, bomb:0 }; this.spawnTimer=5; this.lastPickup=''; }
    has(skill) { return this.timers[skill] > 0; }
    level(skill) { return this.levels[skill] || 0; }
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
      let label=''; let color='#ffffff';
      if(powerUp.type==='strawberry') { this.levels.spread=Math.min(3,this.levels.spread+1); this.timers.spread=Math.max(this.timers.spread,ns.config.skills.spreadSeconds+this.levels.spread*2); label='🍓 散射 Lv.'+this.levels.spread; color='#ff4f72'; }
      if(powerUp.type==='banana') { this.levels.rapid=Math.min(3,this.levels.rapid+1); this.timers.rapid=Math.max(this.timers.rapid,ns.config.skills.rapidSeconds+this.levels.rapid*2); label='🍌 連射 Lv.'+this.levels.rapid; color='#ffd84f'; }
      if(powerUp.type==='grape') { this.levels.shield=Math.min(3,this.levels.shield+1); context.player.shieldHits=Math.min(3,context.player.shieldHits+1); label='🍇 護盾 Lv.'+this.levels.shield; color='#a978ff'; }
      if(powerUp.type==='pineapple') {
        this.levels.bomb=Math.min(3,this.levels.bomb+1);
        context.enemyBullets.forEach(function(b){ b.active=false; });
        const damage=this.levels.bomb===1?3:(this.levels.bomb===2?6:999);
        context.enemies.forEach(function(enemy){ if(enemy.active && enemy.takeDamage(damage)) context.onDestroyed(enemy,false); });
        label='🍍 清場 Lv.'+this.levels.bomb; color='#ffad3d';
      }
      return { label:label, color:color };
    }
    status(player) {
      const labels=[];
      if(this.has('spread')) labels.push('🍓L'+this.levels.spread+' '+Math.ceil(this.timers.spread)+'s');
      if(this.has('rapid')) labels.push('🍌L'+this.levels.rapid+' '+Math.ceil(this.timers.rapid)+'s');
      if(player && player.shieldHits) labels.push('🍇L'+this.levels.shield+' '+player.shieldHits+'層');
      return labels.length ? labels.join(' · ') : '技能：等待果實';
    }
  }
  ns.systems.SkillSystem=SkillSystem;
})(globalThis.SkyStrike);
