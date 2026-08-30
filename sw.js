'use strict';

const CACHE_NAME = 'sky-strike-v0.7.0';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest', './assets/icons/game-icon.svg',
  './src/namespace.js', './src/config.js', './src/utils/math.js',
  './src/skins/SkinRegistry.js', './src/skins/SkinPacks.js',
  './src/entities/Bullet.js', './src/entities/EnemyBullet.js', './src/entities/Player.js', './src/entities/Enemy.js', './src/entities/Boss.js', './src/entities/PowerUp.js',
  './src/systems/Weapon.js', './src/systems/Collision.js', './src/systems/Spawner.js', './src/systems/GameState.js', './src/systems/Effects.js', './src/systems/BattlefieldRenderer.js', './src/systems/DifficultySystem.js', './src/systems/SkillSystem.js', './src/systems/ChallengeSystem.js', './src/systems/InputController.js',
  './src/Game.js', './src/main.js'
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
