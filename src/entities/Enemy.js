(function (ns) {
  'use strict';
  class Enemy {
    constructor(x, y, options) {
      const cfg = ns.config.enemy;
      const opts = options || {};
      this.x = x;
      this.y = y;
      this.width = opts.width || cfg.width;
      this.height = opts.height || cfg.height;
      this.speed = opts.speed || cfg.speed;
      this.health = opts.health || cfg.health;
      this.scoreValue = opts.score || cfg.score;
      this.type = opts.type || 'normal';
      this.time = 0;
      this.fireCooldown = 1 + Math.random();
      this.maxHealth = this.health;
      this.active = true;
      this.destroyed = false;
    }

    update(dt, context) {
      this.time += dt;
      const player = context && context.player;
      if (this.type === 'swift') {
        this.y += this.speed * dt;
        this.x += Math.sin(this.time * 9) * 85 * dt;
      } else if (this.type === 'tracker') {
        this.y += this.speed * dt;
        if (player) this.x = ns.utils.moveToward(this.x, player.x, 72 * dt);
      } else if (this.type === 'gunner' || this.type === 'elite') {
        if (this.y < (this.type === 'elite' ? 115 : 145)) this.y += this.speed * dt;
        else this.x += Math.sin(this.time * (this.type === 'elite' ? 1.8 : 2.5)) * (this.type === 'elite' ? 48 : 34) * dt;
        this.fireCooldown -= dt;
        if (this.fireCooldown <= 0 && player && context.enemyBullets) {
          this.shootAt(player, context.enemyBullets);
          this.fireCooldown = this.type === 'elite' ? 1.05 : 1.7;
        }
      } else {
        this.y += this.speed * dt;
      }
      this.x = ns.utils.clamp(this.x, this.width / 2, ns.config.width - this.width / 2);
      if (this.y - this.height / 2 > ns.config.height + 20) this.active = false;
    }

    shootAt(player, bullets) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const speed = this.type === 'elite' ? 205 : 180;
      const offsets = this.type === 'elite' ? [-0.2, 0, 0.2] : [0];
      offsets.forEach(function (offset) {
        bullets.push(new ns.entities.EnemyBullet(this.x, this.y + this.height / 2, Math.cos(angle + offset) * speed, Math.sin(angle + offset) * speed));
      }, this);
    }

    takeDamage(amount) {
      if (!this.active) return false;
      this.health -= amount;
      if (this.health <= 0) {
        this.health = 0;
        this.active = false;
        this.destroyed = true;
        return true;
      }
      return false;
    }

    draw(ctx) {
      ns.skins.draw('enemy', ctx, this);
      if (this.type !== 'normal') {
        const colors = { swift:'#ffd34f', tracker:'#65efb2', gunner:'#ff8b42', elite:'#b67cff' };
        ctx.save(); ctx.translate(this.x,this.y); ctx.strokeStyle=colors[this.type]; ctx.lineWidth=this.type==='elite'?4:2; ctx.shadowColor=colors[this.type]; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(0,0,Math.max(this.width,this.height)/2+4,0,Math.PI*2); ctx.stroke(); ctx.restore();
      }
    }
  }
  ns.entities.Enemy = Enemy;
})(globalThis.SkyStrike);
