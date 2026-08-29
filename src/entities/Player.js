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
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.shadowColor = ns.config.colors.cyan;
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#c9f7ff';
      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(9, 4);
      ctx.lineTo(this.width / 2, 17);
      ctx.lineTo(12, 20);
      ctx.lineTo(7, this.height / 2);
      ctx.lineTo(-7, this.height / 2);
      ctx.lineTo(-12, 20);
      ctx.lineTo(-this.width / 2, 17);
      ctx.lineTo(-9, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1489b2';
      ctx.fillRect(-4, -10, 8, 25);
      ctx.fillStyle = '#ffb64f';
      ctx.fillRect(-9, 24, 5, 10);
      ctx.fillRect(4, 24, 5, 10);
      ctx.restore();
    }
  }
  ns.entities.Player = Player;
})(globalThis.SkyStrike);
