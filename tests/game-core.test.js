'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const files = [
  'src/namespace.js', 'src/config.js', 'src/utils/math.js',
  'src/entities/Bullet.js', 'src/entities/Player.js', 'src/entities/Enemy.js',
  'src/entities/Boss.js', 'src/entities/PowerUp.js',
  'src/systems/Weapon.js', 'src/systems/Collision.js',
  'src/systems/Spawner.js', 'src/systems/GameState.js', 'src/systems/Effects.js'
];

function loadGameCore() {
  const context = vm.createContext({ console });
  context.globalThis = context;
  files.forEach((file) => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file }));
  return context.SkyStrike;
}

test('玩家目標位置被限制在遊戲邊界內', () => {
  const ns = loadGameCore();
  const player = new ns.entities.Player(240, 560);
  player.setTarget(-100, 9999);
  assert.equal(player.targetX, 25);
  assert.equal(player.targetY, 688);
});

test('玩家平滑移動，不會瞬間傳送到遠端目標', () => {
  const ns = loadGameCore();
  const player = new ns.entities.Player(240, 560);
  player.setTarget(400, 200);
  player.update(0.1);
  assert.equal(player.x, 312);
  assert.equal(player.y, 488);
});

test('武器依射速自動生成單發子彈', () => {
  const ns = loadGameCore();
  const player = new ns.entities.Player(240, 560);
  const weapon = new ns.systems.Weapon();
  const bullets = [];
  weapon.update(0.01, player, bullets);
  assert.equal(bullets.length, 1);
  assert.equal(bullets[0].x, player.x);
  weapon.update(0.05, player, bullets);
  assert.equal(bullets.length, 1);
});

test('兩發子彈可擊破普通敵機且只計分一次', () => {
  const ns = loadGameCore();
  const enemy = new ns.entities.Enemy(100, 100);
  let destroyed = 0;
  const onDestroyed = () => { destroyed += 1; };
  ns.systems.Collision.resolvePlayerBullets([new ns.entities.Bullet(100, 100)], [enemy], onDestroyed);
  assert.equal(enemy.health, 1);
  assert.equal(destroyed, 0);
  ns.systems.Collision.resolvePlayerBullets([new ns.entities.Bullet(100, 100)], [enemy], onDestroyed);
  assert.equal(enemy.active, false);
  assert.equal(destroyed, 1);
});

test('玩家受擊後有短暫無敵，生命為零時死亡', () => {
  const ns = loadGameCore();
  const player = new ns.entities.Player(100, 100);
  assert.equal(player.takeDamage(1), true);
  assert.equal(player.health, 2);
  assert.equal(player.takeDamage(1), false);
  player.update(2);
  player.takeDamage(2);
  assert.equal(player.health, 0);
  assert.equal(player.active, false);
});

test('生成器會隨遊戲時間逐步縮短生成間隔', () => {
  const ns = loadGameCore();
  const spawner = new ns.systems.Spawner(() => 0.5);
  const initial = spawner.currentInterval();
  spawner.elapsed = ns.config.spawner.rampSeconds;
  assert.ok(spawner.currentInterval() < initial);
  const enemies = [];
  spawner.timer = 0;
  spawner.update(0.016, enemies);
  assert.equal(enemies.length, 1);
  assert.equal(enemies[0].x, ns.config.width / 2);
});
