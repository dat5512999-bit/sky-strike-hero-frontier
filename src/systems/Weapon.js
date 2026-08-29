(function (ns) {
  'use strict';
  class Weapon {
    constructor() {
      this.cooldown = 0;
      this.fireInterval = ns.config.weapon.fireInterval;
      this.shotCount = 0;
    }

    reset() { this.cooldown = 0; this.shotCount = 0; }

    update(dt, owner, bullets, skills) {
      this.cooldown -= dt;
      if (this.cooldown <= 0 && owner.active) {
        const angles = skills && skills.has('spread') ? [-0.22, 0, 0.22] : [0];
        angles.forEach(function (angle) {
          bullets.push(new ns.entities.Bullet(owner.x, owner.y - owner.height / 2, {
            variant: this.shotCount % 2,
            vx: Math.sin(angle) * ns.config.bullet.speed,
            vy: -Math.cos(angle) * ns.config.bullet.speed
          }));
        }, this);
        this.shotCount += 1;
        this.cooldown += skills && skills.has('rapid') ? 0.075 : this.fireInterval;
      }
    }
  }
  ns.systems.Weapon = Weapon;
})(globalThis.SkyStrike);
