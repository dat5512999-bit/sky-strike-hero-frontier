(function (ns) {
  'use strict';
  const hitbox = function (entity, inset) {
    const pad = inset || 0;
    return {
      left: entity.x - entity.width / 2 + pad,
      right: entity.x + entity.width / 2 - pad,
      top: entity.y - entity.height / 2 + pad,
      bottom: entity.y + entity.height / 2 - pad
    };
  };

  const overlaps = function (a, b, insetA, insetB) {
    const aa = hitbox(a, insetA);
    const bb = hitbox(b, insetB);
    return aa.left < bb.right && aa.right > bb.left && aa.top < bb.bottom && aa.bottom > bb.top;
  };

  class Collision {
    static resolvePlayerBullets(bullets, enemies, onDestroyed, onHit) {
      bullets.forEach(function (bullet) {
        if (!bullet.active) return;
        for (let i = 0; i < enemies.length; i += 1) {
          const enemy = enemies[i];
          if (enemy.active && overlaps(bullet, enemy, 0, 3)) {
            bullet.active = false;
            const destroyed = enemy.takeDamage(bullet.damage);
            if (destroyed) onDestroyed(enemy);
            else if (onHit) onHit(enemy, bullet);
            break;
          }
        }
      });
    }

    static resolvePlayerEnemies(player, enemies, onHit) {
      if (!player.active) return;
      enemies.forEach(function (enemy) {
        if (enemy.active && overlaps(player, enemy, 8, 5)) {
          if (player.takeDamage(1)) {
            enemy.active = false;
            onHit(enemy);
          }
        }
      });
    }

    static resolveEnemyBullets(player, bullets, onHit) {
      if (!player.active) return;
      bullets.forEach(function (bullet) {
        if (bullet.active && overlaps(player, bullet, 9, 0)) {
          bullet.active = false;
          if (player.takeDamage(bullet.damage)) onHit(bullet);
        }
      });
    }

    static resolvePlayerPowerUps(player, powerUps, onCollect) {
      powerUps.forEach(function (powerUp) {
        if (powerUp.active && overlaps(player, powerUp, 5, 2)) {
          powerUp.active = false;
          onCollect(powerUp);
        }
      });
    }
  }

  ns.systems.Collision = Collision;
  ns.systems.overlaps = overlaps;
})(globalThis.SkyStrike);
