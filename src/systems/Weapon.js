(function (ns) {
  'use strict';
  class Weapon {
    constructor() {
      this.cooldown = 0;
      this.fireInterval = ns.config.weapon.fireInterval;
      this.shotCount = 0;
    }

    reset() { this.cooldown = 0; this.shotCount = 0; }

    update(dt, owner, bullets) {
      this.cooldown -= dt;
      if (this.cooldown <= 0 && owner.active) {
        bullets.push(new ns.entities.Bullet(owner.x, owner.y - owner.height / 2, { variant: this.shotCount % 2 }));
        this.shotCount += 1;
        this.cooldown += this.fireInterval;
      }
    }
  }
  ns.systems.Weapon = Weapon;
})(globalThis.SkyStrike);
