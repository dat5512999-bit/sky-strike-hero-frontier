(function (ns) {
  'use strict';
  class Player {
    constructor(x, y) {
      const cfg = ns.config.player;
      this.x = x;
      this.y = y;
      this.targetX = x;
      this.targetY = y;
      this.width = cfg.width;
      this.height = cfg.height;
      this.speed = cfg.speed;
      this.maxHealth = cfg.maxHealth;
      this.health = cfg.maxHealth;
      this.invulnerableFor = 0;
      this.shieldHits = 0;
      this.lastDamageBlocked = false;
      this.rotation = 0;
      this.engineTime = 0;
      this.active = true;
    }

    setTarget(x, y) {
      const marginX = this.width / 2 + 6;
      const marginY = this.height / 2 + 6;
      this.targetX = ns.utils.clamp(x, marginX, ns.config.width - marginX);
      this.targetY = ns.utils.clamp(y, marginY, ns.config.height - marginY);
    }

    update(dt) {
      const step = this.speed * dt;
      const previousX=this.x;
      this.x = ns.utils.moveToward(this.x, this.targetX, step);
      this.y = ns.utils.moveToward(this.y, this.targetY, step);
      const bank=step>0?(this.x-previousX)/step:0;
      this.rotation += (ns.utils.clamp(bank,-1,1)*.16-this.rotation)*Math.min(1,dt*10);
      this.engineTime+=dt;
      this.invulnerableFor = Math.max(0, this.invulnerableFor - dt);
    }

    takeDamage(amount) {
      if (!this.active || this.invulnerableFor > 0) return false;
      this.lastDamageBlocked = false;
      if (this.shieldHits > 0) {
        this.shieldHits -= 1;
        this.lastDamageBlocked = true;
        this.invulnerableFor = 0.35;
        return true;
      }
      this.health = Math.max(0, this.health - amount);
      this.invulnerableFor = ns.config.player.invulnerableSeconds;
      if (this.health === 0) this.active = false;
      return true;
    }

    draw(ctx) {
      if (this.invulnerableFor > 0 && Math.floor(this.invulnerableFor * 12) % 2 === 0) return;
      ns.skins.draw('player', ctx, this);
      if (this.shieldHits > 0) {
        ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.engineTime*.7);ctx.strokeStyle='#c597ff';ctx.lineWidth=2.5;ctx.shadowColor='#b07cff';ctx.shadowBlur=15;ctx.setLineDash([18,8]);ctx.beginPath();ctx.arc(0,0,34+Math.sin(this.engineTime*4)*1.5,0,Math.PI*2);ctx.stroke();ctx.rotate(-this.engineTime*1.5);ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(0,0,29,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    }
  }
  ns.entities.Player = Player;
})(globalThis.SkyStrike);
