'use strict';

const CACHE_NAME = 'sky-strike-v0.85.11';
const ASSETS = [
 './update.html', './src/td/update-client.js',
 './goblin-polish-preview.html', './src/td/goblin-polish-preview.js', './src/td/systems/GoblinPresentation.js', './assets/td/goblin/skill-icons-v2.png', './assets/td/goblin/spell-effects-v1.png',
 './battle-polish-preview.html', './src/td/battle-polish-preview.js', './td-polish.css', './assets/td/frostland/towers-atlas-v1.png', './assets/td/frostland/skill-icons-v1.png', './assets/td/frostland/spell-effects-v1.png', './src/td/systems/FrostlandTowerArt.js', './src/td/systems/FrostlandSpellArt.js',
 './assets/td/frostland/frostland_emblem.svg', './assets/td/frostland/frostland_hero.svg',
 './assets/td/frostland/frostWolf.svg', './assets/td/frostland/frostBear.svg', './assets/td/frostland/frostBird.svg', './assets/td/frostland/frostHunter.svg', './assets/td/frostland/frostShaman.svg', './assets/td/frostland/frostMammoth.svg',
 './assets/td/frostland/frostCrystal.svg', './assets/td/frostland/frostBlizzard.svg', './assets/td/frostland/frostBallista.svg', './assets/td/frostland/frostTotem.svg', './assets/td/frostland/frostObelisk.svg', './assets/td/frostland/frostAurora.svg', './assets/td/frostland/frostGlacier.svg',
 './assets/td/frostland/frost_wolf.svg', './assets/td/frostland/frost_bear.svg', './assets/td/frostland/frost_bird.svg', './assets/td/frostland/frost_hunter.svg', './assets/td/frostland/frost_shaman.svg', './assets/td/frostland/frost_mammoth.svg',
 './assets/td/frostland/skill-mark.svg', './assets/td/frostland/skill-spear.svg', './assets/td/frostland/skill-hunt.svg', './assets/td/frostland/skill-winter.svg',
 './assets/td/frostland/hero-selection-v1.png', './assets/td/frostland/hero-selection-v2.png', './assets/td/frostland/faction-selection-v1.png', './assets/td/frostland/hero-actions-v1.png', './assets/td/frostland/soldier-actions-v1.png', './assets/td/items/frostland-spears-v1.png', './assets/td/items/frostland-spears.svg',
 './frostland-preview.html', './src/td/frostland-preview.js', './src/td/systems/FrostlandAtlas.js', './src/td/systems/FrostlandSprites.js', './src/td/systems/FrostlandAnimation.js', './src/td/systems/FrostlandAudio.js', './src/td/systems/FrostlandVFX.js', './src/td/systems/FrostStatusSystem.js', './src/td/systems/FrostlandHero.js', './src/td/systems/FrostlandArt.js',
 './src/td/shop/ThunderKing.js', './assets/td/shop/thunder-chief-motion-v3.png', './assets/td/shop/thunder-chief-attack-v3.png', './assets/td/shop/thunder-chief-cast-v3.png',
 './codex.html', './skin-lab.html', './codex.css', './shop.css', './skin-lab.css', './src/td/codex/ChronicleSeed.js', './src/td/codex/CodexBattleBridge.js', './src/td/codex/CodexCatalog.js', './src/td/codex/CodexHost.js', './src/td/codex/CodexIntegration.js', './src/td/codex/CodexView.js', './src/td/codex/GameplayIdentity.js', './src/td/codex/StoryCodexBridge.js', './src/td/codex/StoryCodexMapping.js', './src/td/codex/thumbnails.js', './src/td/shop/ScrollRail.js', './src/td/shop/ShopArt.js', './src/td/shop/ShopTemplates.js', './src/td/shop/ShopView.js', './src/td/shop/SkinCatalog.js', './src/td/shop/SkinSchema.js', './src/td/shop/SkinStore.js', './src/td/skin-lab/HeroLooks.js', './src/td/skin-lab/main.js', './src/td/skin-lab/PreviewModel.js',
 './td-cinematic.css', './src/td/codex/CodexProgressAdapter.js', './src/td/codex/ChronicleProgressAdapter.js', './src/td/codex/CodexSaveBridge.js', './src/td/cinematic/CinematicCatalog.js', './src/td/cinematic/CinematicStoryAdapter.js', './src/td/cinematic/PrologueData.js', './src/td/cinematic/PrologueProgress.js', './src/td/cinematic/CinematicPlayer.js',
 './assets/cinematics/prologue/subtitles/zh-TW.vtt',
 './td-result.css', './assets/td/lobby/victory-background-v1.png', './src/td/systems/ResultScreen.js',
 './assets/td/lobby/kingdom-lobby-v1.png', './assets/td/lobby/story-card-v1.png', './assets/td/lobby/expedition-card-v1.png', './assets/td/lobby/campaign-map-v1.png', './assets/td/shop/eclipse-court-concept-v1.png', './assets/td/goblin-soldiers-atlas-v2.png',
 './src/td/app/ProfileSkinAdapter.js', './src/td/systems/CosmeticArt.js', './src/td/skin-lab/ChiefPreview.js', './assets/td/shop/bone-chief-portrait-v1.png', './assets/td/shop/bone-chief-motion-v1.png', './assets/td/shop/bone-chief-attack-v1.png', './assets/td/shop/bone-chief-cast-v1.png', './assets/td/shop/chief-original-actions-v1.png', './assets/td/shop/chief-original-portrait-v1.png', './assets/td/shop/thunder-chief-portrait-v1.png', './assets/td/shop/thunder-chief-actions-v1.png',
 './td-expedition.css', './assets/td/lobby/skin-frost-v1.png', './assets/td/lobby/limited-orc-v1.png', './td-lobby.css', './td-ranking.css', './src/td/app/ProfileStore.js', './src/td/app/StoryCatalog.js', './src/td/ranking/RankingDataSource.js', './src/td/ranking/RankingView.js', './src/td/app/FrontierApp.js',
 './assets/td/bear-actions-v3.png', './assets/td/ultimate-dragon-actions-v3.png',
 './assets/td/kingdom-mage-actions-v2.png', './assets/td/alchemist-actions-v2.png', './assets/td/bounty-hunter-actions-v2.png', './assets/td/pirate-actions-v2.png', './assets/td/blacksmith-actions-v2.png', './assets/td/time-mage-actions-v2.png',
 './assets/td/bomb-robot-actions-v2.png', './assets/td/heavy-bomb-robot-actions-v2.png', './assets/td/ultimate-dragon-actions-v2.png', './assets/td/ultimate-commander-actions-v2.png', './assets/td/ultimate-soulsteel-actions-v2.png',
 './assets/td/beastmaster-actions-v3.png', './assets/td/bear-actions-v2.png',
  './assets/td/beastmaster-v2.png',
  './assets/td/ultimate-dragon-v1.png', './assets/td/ultimate-commander-v1.png', './assets/td/ultimate-soulsteel-v1.png',
  './src/td/systems/WaveHUD.js', './td-wave.css',
  './td-mobile.html', './src/td/mobile-entry.js', './src/td/mobile-pwa.js',
  './assets/td/opening/hero-hunter-selection-v1.png', './assets/td/opening/hero-arcanist-selection-v1.png', './assets/td/opening/hero-rogue-selection-v1.png', './assets/td/opening/difficulty-scenes-v1.png',
  './assets/td/opening/faction-kingdom-selection-v1.png', './assets/td/opening/faction-silverleaf-selection-v1.png', './assets/td/opening/faction-twilight-selection-v1.png',
 './assets/td/opening/chief-skill-icons-v1.png', './assets/td/opening/chief-shockwave-icon.svg', './assets/td/opening/faction-wild-selection-v1.png', './assets/td/opening/hero-chief-selection-v2.png', './assets/td/wild-chief-actions-v1.png', './assets/td/wild-centaur-actions-v1.png', './assets/td/wild-boar-rider-actions-v1.png', './assets/td/wild-minotaur-actions-v1.png', './assets/td/wild-shaman-actions-v1.png',
  './assets/td/autumn-ruins-v1.png', './assets/td/twin-pass-v1.png', './assets/td/beginner-valley-v2.png', './assets/td/silverleaf-valley-v4.png', './assets/td/shadowfall-ruins-v3.png', './assets/td/frostborn-chasm-v3.png', './assets/td/frontier-ground-v2.png', './assets/td/frontier-ground-v1.png', './assets/td/hero-skill-icons-v1.png',
  './src/td/maps.js', './src/td/systems/FrontierTerrain.js',
  './src/td/systems/BattlefieldCamera.js',
  './src/td/systems/MiniMapView.js',
  './src/td/systems/HeroJoystick.js',
  './src/td/systems/BattleSynergySystem.js', './src/td/systems/GoblinNetworkSystem.js', './src/td/systems/GoblinAnimation.js', './src/td/systems/GoblinArt.js', './assets/td/goblin-concept-card.svg', './assets/td/goblin-chief-engineer-v1.png', './assets/td/goblin-soldiers-atlas-v1.png', './assets/td/faction-builds-v1.png',
  './td-combat.css',
  './src/td/systems/TargetSelector.js', './src/td/systems/ChapterCheckpointSystem.js',
  './src/td/systems/TDDifficultySystem.js', './src/td/systems/EnemyTraitSystem.js', './src/td/systems/BattleReportSystem.js',
  './', './index.html', './styles.css', './td.html', './td.css', './manifest.webmanifest', './td.webmanifest', './assets/icons/game-icon.svg', './assets/icons/app-icon-192.png', './assets/icons/app-icon-512.png', './assets/icons/apple-touch-icon-180.png',
  './src/namespace.js', './src/config.js', './src/utils/math.js',
  './src/skins/SkinRegistry.js', './src/skins/SkinPacks.js',
  './src/entities/Bullet.js', './src/entities/EnemyBullet.js', './src/entities/Player.js', './src/entities/Enemy.js', './src/entities/Boss.js', './src/entities/PowerUp.js',
  './src/systems/Weapon.js', './src/systems/Collision.js', './src/systems/Spawner.js', './src/systems/GameState.js', './src/systems/Effects.js', './src/systems/BattlefieldRenderer.js', './src/systems/DifficultySystem.js', './src/systems/SkillSystem.js', './src/systems/ChallengeSystem.js', './src/systems/StageDirector.js', './src/systems/SupportSystem.js', './src/systems/InputController.js',
  './src/Game.js', './src/main.js',
  './assets/td/enemy-grunt-actions-v1.png', './assets/td/enemy-orc-grunt-actions-v2.png', './assets/td/enemy-runner-actions-v1.png', './assets/td/enemy-brute-actions-v1.png', './assets/td/enemy-shaman-actions-v1.png', './assets/td/enemy-healer-actions-v1.png', './assets/td/enemy-boss-actions-v1.png', './assets/td/faction-towers-v1.png', './assets/td/faction-towers-v2.png', './assets/td/faction-shield-v1.png', './assets/td/faction-knight-v1.png', './assets/td/faction-skeleton-v1.png', './assets/td/faction-dragon-v1.png', './assets/td/faction-treant-v1.png', './assets/td/faction-golem-v1.png', './assets/td/faction-structures-v1.png', './assets/td/war-wolf-actions-v1.png', './assets/td/arcane-elemental-actions-v1.png', './assets/td/crypt-wraith-actions-v1.png', './assets/td/graveyard-revenant-actions-v1.png', './assets/td/hero-actions-v1.png', './assets/td/hero-hunter-actions-v2.png', './assets/td/hero-rogue-actions-v2.png', './assets/td/hero-hunter-actions-unarmed-v4.png', './assets/td/hero-arcanist-actions-unarmed-v1.png', './assets/td/hero-rogue-actions-unarmed-v2.png', './assets/td/rogue-actions-unarmed-v2.png', './assets/td/forest-valley-v1.png', './assets/td/towers-atlas-v1.png', './assets/td/units-atlas-v1.png', './assets/td/frontier-keep-v1.png', './assets/td/human-td-battlefield-v2.png', './assets/td/ranger-actions-v1.png', './assets/td/arcanist-actions-v1.png', './assets/td/rogue-actions-v1.png', './assets/td/items/weapons-atlas-v5.png', './assets/td/items/class-weapons-atlas-v1.png', './assets/td/items/chief-axes-v1.png', './assets/td/items/goblin-tools-v1.png', './assets/td/items/equipment-atlas-v1.png',
  './assets/td/faction-musketeer-actions-v1.png', './assets/td/faction-halberdier-actions-v1.png', './assets/td/faction-dryad-actions-v1.png', './assets/td/faction-moonblade-actions-v1.png', './assets/td/faction-banshee-actions-v1.png', './assets/td/faction-bone-rider-actions-v1.png', './assets/td/enemy-warder-actions-v1.png', './assets/td/enemy-commander-actions-v1.png',
  './src/td/namespace.js', './src/td/config.js', './src/td/systems/SpriteFrameBounds.js', './src/td/systems/HeroSkillVFX.js', './src/td/systems/ArtSystem.js', './src/td/systems/EquipmentSystem.js', './src/td/systems/ArmorySystem.js', './src/td/systems/ProfessionSystem.js', './src/td/systems/FactionSystem.js', './src/td/systems/LootSystem.js', './src/td/systems/PathSystem.js', './src/td/systems/LayoutSystem.js', './src/td/systems/NavigationSystem.js', './src/td/systems/CommandSystem.js', './src/td/systems/WaveCatalog.js', './src/td/systems/EconomySystem.js', './src/td/systems/CombatFeedbackSystem.js', './src/td/systems/TowerEvolutionSystem.js', './src/td/systems/TowerSkillSystem.js', './src/td/systems/ShopSystem.js', './src/td/entities/Summon.js', './src/td/entities/FieldLoot.js', './src/td/entities/Monster.js', './src/td/systems/EnemyCombatSystem.js', './src/td/entities/Projectile.js', './src/td/entities/CombatUnit.js', './src/td/entities/Building.js', './src/td/systems/HeroRoster.js', './src/td/systems/ChiefShockwave.js', './src/td/systems/HeroUltimateSystem.js', './src/td/entities/Hero.js', './src/td/systems/WaveSystem.js', './src/td/systems/BuildSystem.js', './src/td/TDGame.js', './src/td/systems/ArmoryUI.js', './src/td/main.js'
];

// 安裝時只預存遊戲殼；頁面直接載入完整美術，成功後由 fetch handler 快取，避免安裝流程同步等待約 90 MB。
const PRECACHE = ASSETS.filter(function (asset) { return !asset.startsWith('./assets/td/'); });
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(PRECACHE.map(function (asset) { return new Request(asset, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key.startsWith('sky-strike-v') && key !== CACHE_NAME; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'GAME_VERSION' && event.ports[0]) event.ports[0].postMessage(CACHE_NAME);
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  // Optional media is never precached. Let the browser/server handle byte ranges.
  if (new URL(event.request.url).pathname.endsWith('.mp4') || event.request.headers.has('range')) return;
  if (new URL(event.request.url).pathname.includes('/assets/td/')) {
    event.respondWith(caches.open(CACHE_NAME).then(function (cache) { return cache.match(event.request, { ignoreSearch: true }); }).then(function (cached) {
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
  event.respondWith(fetch(event.request, { cache: 'no-cache' }).then(function (response) {
      if (!response || response.status !== 200 || response.type === 'opaque') return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { return cache.put(event.request, copy); }).catch(function () { /* 快取失敗不影響遊戲。 */ });
      return response;
    }).catch(function () { return caches.open(CACHE_NAME).then(function (cache) { return cache.match(event.request, { ignoreSearch: true }); }); }));
});
