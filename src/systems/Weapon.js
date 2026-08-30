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
        const spreadLevel = skills && skills.has('spread') ? skills.level('spread') : 0;
        const angles = spreadLevel >= 2 ? [-0.36,-0.18,0,0.18,0.36] : (spreadLevel === 1 ? [-0.22,0,0.22] : [0]);
        angles.forEach(function (angle) {
          bullets.push(new ns.entities.Bullet(owner.x, owner.y - owner.height / 2, {
            variant: this.shotCount % 2,
            vx: Math.sin(angle) * ns.config.bullet.speed,
            vy: -Math.cos(angle) * ns.config.bullet.speed,
            damage: spreadLevel >= 3 ? 1.5 : ns.config.bullet.damage
          }));
        }, this);
        this.shotCount += 1;
        const rapidLevel = skills && skills.has('rapid') ? skills.level('rapid') : 0;
        this.cooldown += rapidLevel ? [0,0.105,0.078,0.055][rapidLevel] : this.fireInterval;
      }
    }
  }
  ns.systems.Weapon = Weapon;
})(globalThis.SkyStrike);
