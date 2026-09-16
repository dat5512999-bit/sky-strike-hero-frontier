'use strict';

const CACHE_NAME = 'sky-strike-v0.62.0';
const ASSETS = [
  './assets/td/opening/hero-hunter-selection-v1.png', './assets/td/opening/hero-arcanist-selection-v1.png', './assets/td/opening/hero-rogue-selection-v1.png', './assets/td/opening/difficulty-scenes-v1.png',
  './assets/td/opening/faction-kingdom-selection-v1.png', './assets/td/opening/faction-silverleaf-selection-v1.png', './assets/td/opening/faction-twilight-selection-v1.png',
  './assets/td/beginner-valley-v1.png', './assets/td/frontier-ground-v2.png', './assets/td/frontier-ground-v1.png', './assets/td/hero-skill-icons-v1.png',
  './src/td/maps.js', './src/td/systems/FrontierTerrain.js',
  './src/td/systems/BattlefieldCamera.js',
  './src/td/systems/MiniMapView.js',
  './td-combat.css',
  './src/td/systems/TargetSelector.js',
  './src/td/systems/TDDifficultySystem.js', './src/td/systems/EnemyTraitSystem.js', './src/td/systems/BattleReportSystem.js',
  './', './index.html', './styles.css', './td.html', './td.css', './manifest.webmanifest', './td.webmanifest', './assets/icons/game-icon.svg', './assets/icons/app-icon-192.png', './assets/icons/app-icon-512.png', './assets/icons/apple-touch-icon-180.png',
  './src/namespace.js', './src/config.js', './src/utils/math.js',
  './src/skins/SkinRegistry.js', './src/skins/SkinPacks.js',
  './src/entities/Bullet.js', './src/entities/EnemyBullet.js', './src/entities/Player.js', './src/entities/Enemy.js', './src/entities/Boss.js', './src/entities/PowerUp.js',
  './src/systems/Weapon.js', './src/systems/Collision.js', './src/systems/Spawner.js', './src/systems/GameState.js', './src/systems/Effects.js', './src/systems/BattlefieldRenderer.js', './src/systems/DifficultySystem.js', './src/systems/SkillSystem.js', './src/systems/ChallengeSystem.js', './src/systems/StageDirector.js', './src/systems/SupportSystem.js', './src/systems/InputController.js',
  './src/Game.js', './src/main.js',
  './assets/td/enemy-grunt-actions-v1.png', './assets/td/enemy-orc-grunt-actions-v2.png', './assets/td/enemy-runner-actions-v1.png', './assets/td/enemy-brute-actions-v1.png', './assets/td/enemy-shaman-actions-v1.png', './assets/td/enemy-healer-actions-v1.png', './assets/td/enemy-boss-actions-v1.png', './assets/td/faction-towers-v1.png', './assets/td/faction-towers-v2.png', './assets/td/faction-shield-v1.png', './assets/td/faction-knight-v1.png', './assets/td/faction-skeleton-v1.png', './assets/td/faction-dragon-v1.png', './assets/td/faction-treant-v1.png', './assets/td/faction-golem-v1.png', './assets/td/faction-structures-v1.png', './assets/td/war-wolf-actions-v1.png', './assets/td/arcane-elemental-actions-v1.png', './assets/td/crypt-wraith-actions-v1.png', './assets/td/graveyard-revenant-actions-v1.png', './assets/td/hero-actions-v1.png', './assets/td/hero-hunter-actions-v2.png', './assets/td/hero-rogue-actions-v2.png', './assets/td/hero-hunter-actions-unarmed-v4.png', './assets/td/hero-arcanist-actions-unarmed-v1.png', './assets/td/hero-rogue-actions-unarmed-v2.png', './assets/td/rogue-actions-unarmed-v2.png', './assets/td/forest-valley-v1.png', './assets/td/towers-atlas-v1.png', './assets/td/units-atlas-v1.png', './assets/td/frontier-keep-v1.png', './assets/td/human-td-battlefield-v2.png', './assets/td/ranger-actions-v1.png', './assets/td/arcanist-actions-v1.png', './assets/td/rogue-actions-v1.png', './assets/td/items/weapons-atlas-v5.png', './assets/td/items/class-weapons-atlas-v1.png', './assets/td/items/equipment-atlas-v1.png',
  './assets/td/faction-musketeer-actions-v1.png', './assets/td/faction-halberdier-actions-v1.png', './assets/td/faction-dryad-actions-v1.png', './assets/td/faction-moonblade-actions-v1.png', './assets/td/faction-banshee-actions-v1.png', './assets/td/faction-bone-rider-actions-v1.png', './assets/td/enemy-warder-actions-v1.png', './assets/td/enemy-commander-actions-v1.png',
  './src/td/namespace.js', './src/td/config.js', './src/td/systems/ArtSystem.js', './src/td/systems/EquipmentSystem.js', './src/td/systems/ArmorySystem.js', './src/td/systems/ProfessionSystem.js', './src/td/systems/FactionSystem.js', './src/td/systems/LootSystem.js', './src/td/systems/PathSystem.js', './src/td/systems/LayoutSystem.js', './src/td/systems/NavigationSystem.js', './src/td/systems/CommandSystem.js', './src/td/systems/WaveCatalog.js', './src/td/systems/EconomySystem.js', './src/td/systems/CombatFeedbackSystem.js', './src/td/systems/TowerEvolutionSystem.js', './src/td/systems/TowerSkillSystem.js', './src/td/systems/ShopSystem.js', './src/td/entities/Summon.js', './src/td/entities/Monster.js', './src/td/systems/EnemyCombatSystem.js', './src/td/entities/Projectile.js', './src/td/entities/CombatUnit.js', './src/td/entities/Building.js', './src/td/systems/HeroRoster.js', './src/td/systems/HeroUltimateSystem.js', './src/td/entities/Hero.js', './src/td/systems/WaveSystem.js', './src/td/systems/BuildSystem.js', './src/td/TDGame.js', './src/td/main.js'
];

// 安裝時只預存遊戲殼；頁面直接載入完整美術，成功後由 fetch handler 快取，避免安裝流程同步等待約 90 MB。
const PRECACHE = ASSETS.filter(function (asset) { return !asset.startsWith('./assets/td/'); });
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key.startsWith('sky-strike-v') && key !== CACHE_NAME; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).pathname.includes('/assets/td/')) {
    event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (response && response.ok && response.type !== 'opaque') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { return cache.put(event.request, copy); }).catch(function () { /* 儲存空間不足時仍提供線上圖片。 */ });
        }
        return response;
      });
    }));
    return;
  }
  event.respondWith(fetch(event.request).then(function (response) {
      if (!response || response.status !== 200 || response.type === 'opaque') return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { return cache.put(event.request, copy); }).catch(function () { /* 快取失敗不影響遊戲。 */ });
      return response;
    }).catch(function () { return caches.match(event.request); }));
});
