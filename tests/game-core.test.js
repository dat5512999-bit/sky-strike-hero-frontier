'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const files = [
  'src/namespace.js', 'src/config.js', 'src/utils/math.js',
  'src/skins/SkinRegistry.js', 'src/skins/SkinPacks.js',
  'src/entities/Bullet.js', 'src/entities/EnemyBullet.js', 'src/entities/Player.js', 'src/entities/Enemy.js',
  'src/entities/Boss.js', 'src/entities/PowerUp.js',
  'src/systems/Weapon.js', 'src/systems/Collision.js',
  'src/systems/Spawner.js', 'src/systems/GameState.js', 'src/systems/Effects.js', 'src/systems/SkillSystem.js',
  'src/systems/InputController.js'
];

function loadGameCore() {
  const storage = new Map();
  const context = vm.createContext({ console, localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, value)
  } });
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

test('自動射擊會交替使用皮膚包的兩種子彈外觀', () => {
  const ns = loadGameCore();
  const player = new ns.entities.Player(240, 560);
  const weapon = new ns.systems.Weapon();
  const bullets = [];
  weapon.update(0.2, player, bullets);
  weapon.update(0.2, player, bullets);
  assert.deepEqual(Array.from(bullets, (bullet) => bullet.variant), [0, 1]);
  assert.equal(bullets[0].damage, bullets[1].damage);
});

test('內建 6 套皮膚可選擇且無效 ID 不會覆蓋目前選擇', () => {
  const ns = loadGameCore();
  assert.equal(ns.skins.all().length, 6);
  assert.equal(ns.skins.select('fast-food'), true);
  assert.equal(ns.skins.current().name, '歡樂速食');
  assert.equal(ns.skins.select('not-a-skin'), false);
  assert.equal(ns.skins.current().id, 'fast-food');
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

test('威脅等級每 12 秒提升並封頂為 5', () => {
  const ns = loadGameCore();
  const spawner = new ns.systems.Spawner(() => 0.1);
  assert.equal(spawner.threatLevel(), 1);
  spawner.elapsed = 25;
  assert.equal(spawner.threatLevel(), 3);
  spawner.elapsed = 999;
  assert.equal(spawner.threatLevel(), 5);
});

test('射擊敵機會瞄準玩家產生敵方子彈', () => {
  const ns = loadGameCore();
  const enemy = new ns.entities.Enemy(240, 145, { type:'gunner', health:4 });
  enemy.fireCooldown = 0;
  const bullets = [];
  enemy.update(0.016, { player:new ns.entities.Player(240,560), enemyBullets:bullets });
  assert.equal(bullets.length, 1);
  assert.ok(bullets[0].vy > 0);
});

test('草莓與香蕉果實分別啟用散射和高速連射', () => {
  const ns = loadGameCore();
  const skills = new ns.systems.SkillSystem(() => 0);
  const context = { player:new ns.entities.Player(240,560), enemies:[], enemyBullets:[], onDestroyed(){} };
  skills.collect(new ns.entities.PowerUp(0,0,'strawberry'), context);
  skills.collect(new ns.entities.PowerUp(0,0,'banana'), context);
  assert.equal(skills.has('spread'), true);
  assert.equal(skills.has('rapid'), true);
  const weapon = new ns.systems.Weapon();
  const bullets = [];
  weapon.update(0.2, context.player, bullets, skills);
  assert.equal(bullets.length, 3);
  assert.ok(bullets[0].vx < 0 && bullets[2].vx > 0);
});

test('葡萄護盾可抵擋一次傷害且不扣 HP', () => {
  const ns = loadGameCore();
  const player = new ns.entities.Player(240,560);
  player.shieldHits = 1;
  assert.equal(player.takeDamage(1), true);
  assert.equal(player.health, 3);
  assert.equal(player.shieldHits, 0);
});

test('鳳梨果實清除敵方子彈並對畫面敵人造成傷害', () => {
  const ns = loadGameCore();
  const skills = new ns.systems.SkillSystem(() => 0);
  const enemy = new ns.entities.Enemy(100,100,{health:4});
  const enemyBullet = new ns.entities.EnemyBullet(100,100,0,100);
  skills.collect(new ns.entities.PowerUp(0,0,'pineapple'), { player:new ns.entities.Player(240,560), enemies:[enemy], enemyBullets:[enemyBullet], onDestroyed(){} });
  assert.equal(enemyBullet.active, false);
  assert.equal(enemy.health, 1);
});

test('技能系統會在前五秒保證生成第一顆果實', () => {
  const ns = loadGameCore();
  const skills = new ns.systems.SkillSystem(() => 0);
  const powerUps = [];
  skills.update(5.1, powerUps);
  assert.equal(powerUps.length, 1);
  assert.equal(powerUps[0].type, 'strawberry');
});

test('敵方子彈命中玩家後失效並扣除生命', () => {
  const ns = loadGameCore();
  const player = new ns.entities.Player(240,560);
  const bullet = new ns.entities.EnemyBullet(240,560,0,100);
  let hits = 0;
  ns.systems.Collision.resolveEnemyBullets(player,[bullet],() => { hits += 1; });
  assert.equal(hits,1);
  assert.equal(player.health,2);
  assert.equal(bullet.active,false);
});

test('重複取得草莓會升至五向並在 Lv.3 強化傷害', () => {
  const ns = loadGameCore();
  const skills = new ns.systems.SkillSystem(() => 0);
  const player = new ns.entities.Player(240,560);
  const context = { player, enemies:[], enemyBullets:[], onDestroyed(){} };
  skills.collect(new ns.entities.PowerUp(0,0,'strawberry'),context);
  skills.collect(new ns.entities.PowerUp(0,0,'strawberry'),context);
  skills.collect(new ns.entities.PowerUp(0,0,'strawberry'),context);
  const bullets=[];
  new ns.systems.Weapon().update(0.2,player,bullets,skills);
  assert.equal(skills.level('spread'),3);
  assert.equal(bullets.length,5);
  assert.equal(bullets[2].damage,1.5);
});

test('Combo 每五次擊破提升倍率，受傷規則可中斷', () => {
  const ns = loadGameCore();
  const state = new ns.systems.GameState();
  for (let i=0;i<5;i+=1) state.registerKill(100);
  assert.equal(state.combo,5);
  assert.equal(state.multiplier,2);
  assert.equal(state.score,600);
  state.breakCombo();
  assert.equal(state.combo,0);
  assert.equal(state.multiplier,1);
});

test('結束遊戲會保存最高分與歷史最高 Combo', () => {
  const ns = loadGameCore();
  const state = new ns.systems.GameState();
  for (let i=0;i<7;i+=1) state.registerKill(100);
  state.end();
  const next = new ns.systems.GameState();
  assert.equal(next.highScore,state.score);
  assert.equal(next.highCombo,7);
});

test('手機拖曳使用相對位移，不會讓手指遮住或瞬移戰機', () => {
  const ns = loadGameCore();
  const anchor = { clientX: 100, clientY: 200, playerX: 240, playerY: 560 };
  const target = ns.systems.InputController.touchTarget(anchor, { clientX: 125, clientY: 175 }, { left: 0, top: 0, width: 240, height: 360 }, { width: 480, height: 720 });
  assert.deepEqual({ x: target.x, y: target.y }, { x: 290, y: 510 });
});

test('桌面指標位置可正確換算成 Canvas 座標', () => {
  const ns = loadGameCore();
  const point = ns.systems.InputController.canvasPoint({ clientX: 130, clientY: 210 }, { left: 10, top: 30, width: 240, height: 360 }, { width: 480, height: 720 });
  assert.deepEqual({ x: point.x, y: point.y }, { x: 240, y: 360 });
});
