'use strict';

const CACHE_NAME = 'sky-strike-v0.24.0';
const ASSETS = [
  './src/td/systems/TDDifficultySystem.js', './src/td/systems/EnemyTraitSystem.js',
  './', './index.html', './styles.css', './td.html', './td.css', './manifest.webmanifest', './assets/icons/game-icon.svg',
  './src/namespace.js', './src/config.js', './src/utils/math.js',
  './src/skins/SkinRegistry.js', './src/skins/SkinPacks.js',
  './src/entities/Bullet.js', './src/entities/EnemyBullet.js', './src/entities/Player.js', './src/entities/Enemy.js', './src/entities/Boss.js', './src/entities/PowerUp.js',
  './src/systems/Weapon.js', './src/systems/Collision.js', './src/systems/Spawner.js', './src/systems/GameState.js', './src/systems/Effects.js', './src/systems/BattlefieldRenderer.js', './src/systems/DifficultySystem.js', './src/systems/SkillSystem.js', './src/systems/ChallengeSystem.js', './src/systems/StageDirector.js', './src/systems/SupportSystem.js', './src/systems/InputController.js',
  './src/Game.js', './src/main.js',
  './assets/td/enemy-grunt-actions-v1.png', './assets/td/enemy-runner-actions-v1.png', './assets/td/enemy-brute-actions-v1.png', './assets/td/faction-towers-v1.png', './assets/td/hero-actions-v1.png', './assets/td/forest-valley-v1.png', './assets/td/towers-atlas-v1.png', './assets/td/units-atlas-v1.png', './assets/td/frontier-keep-v1.png', './assets/td/human-td-battlefield-v2.png', './assets/td/ranger-actions-v1.png', './assets/td/arcanist-actions-v1.png', './assets/td/rogue-actions-v1.png',
  './src/td/namespace.js', './src/td/config.js', './src/td/systems/ArtSystem.js', './src/td/systems/ProfessionSystem.js', './src/td/systems/PathSystem.js', './src/td/systems/LayoutSystem.js', './src/td/systems/NavigationSystem.js', './src/td/systems/CommandSystem.js', './src/td/systems/WaveCatalog.js', './src/td/systems/EconomySystem.js', './src/td/systems/CombatFeedbackSystem.js', './src/td/systems/TowerSkillSystem.js', './src/td/systems/ShopSystem.js', './src/td/entities/Summon.js', './src/td/entities/Monster.js', './src/td/systems/EnemyCombatSystem.js', './src/td/entities/Projectile.js', './src/td/entities/CombatUnit.js', './src/td/entities/Building.js', './src/td/systems/HeroRoster.js', './src/td/entities/Hero.js', './src/td/systems/WaveSystem.js', './src/td/systems/BuildSystem.js', './src/td/TDGame.js', './src/td/main.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE_NAME; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(function (response) {
      if (!response || response.status !== 200 || response.type === 'opaque') return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      return response;
    }).catch(function () { return caches.match(event.request); }));
});
