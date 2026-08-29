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
      this.x = ns.utils.moveToward(this.x, this.targetX, step);
      this.y = ns.utils.moveToward(this.y, this.targetY, step);
      this.invulnerableFor = Math.max(0, this.invulnerableFor - dt);
    }

    takeDamage(amount) {
      if (!this.active || this.invulnerableFor > 0) return false;
      this.health = Math.max(0, this.health - amount);
      this.invulnerableFor = ns.config.player.invulnerableSeconds;
      if (this.health === 0) this.active = false;
      return true;
    }

    draw(ctx) {
      if (this.invulnerableFor > 0 && Math.floor(this.invulnerableFor * 12) % 2 === 0) return;
      ns.skins.draw('player', ctx, this);
    }
  }
  ns.entities.Player = Player;
})(globalThis.SkyStrike);
