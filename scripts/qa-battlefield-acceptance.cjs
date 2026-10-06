'use strict';

// Local-only visual/performance evidence. Never reads the player's saved profile.
const fs = require('node:fs');
const path = require('node:path');

const VERSION = '1.0.0';
const ROOT = path.resolve(__dirname, '..');
const FACTIONS = Object.freeze({
  naga: 'naga', dragonkin: 'dragonkin', dwarf: 'dwarf', egypt: 'egypt', goblin: 'goblin',
  frostland: 'frostland', hunter: 'hunter', arcanist: 'arcanist',
  rogue: 'rogue', wild: 'chief'
});

function parseArgs(argv) {
  const options = { faction: 'naga', out: path.join(ROOT, 'artifacts', 'battlefield-acceptance') };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help') return { help: true };
    if (argv[i] === '--faction') options.faction = argv[++i];
    else if (argv[i] === '--out') options.out = argv[++i] && path.resolve(argv[i]);
    else throw Error(`不支援的參數：${argv[i]}`);
  }
  if (!FACTIONS[options.faction]) throw Error(`未知軍團：${options.faction}`);
  if (!options.out || !options.out.startsWith(path.join(ROOT, 'artifacts') + path.sep)) throw Error('輸出必須位於 artifacts/ 下');
  return options;
}

function summarizeSamples(samples) {
  const p95 = key => {
    const values = samples.map(sample => Number(sample[key]) || 0).sort((a, b) => a - b);
    return Number((values[Math.floor((values.length - 1) * .95)] || 0).toFixed(2));
  };
  const mean = samples.reduce((sum, sample) => sum + (Number(sample.realMs) || 0), 0) / (samples.length || 1);
  return {
    frames: samples.length, fps: mean ? Number((1000 / mean).toFixed(1)) : 0,
    frameP95: p95('realMs'), updateP95: p95('updateMs'),
    uiP95: p95('uiMs'), simulationP95: p95('simulationMs'), drawP95: p95('drawMs'),
    backlogP95: p95('backlogMs'), discardedP95: p95('discardedMs')
  };
}

async function run(options) {
  const { chromium } = require('playwright');
  const port = process.env.TD_TEST_PORT === undefined ? 4173 : Number(process.env.TD_TEST_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('TD_TEST_PORT 必須是有效的本機連接埠');
  const localUrl = `http://127.0.0.1:${port}/td.html`;
  fs.mkdirSync(options.out, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(localUrl);
    await page.waitForFunction(() => globalThis.towerFrontierGame?.app && globalThis.TowerFrontier?.systems?.ProfileStore);
    await page.evaluate(({ faction, hero }) => {
      const g = globalThis.towerFrontierGame, ns = globalThis.TowerFrontier;
      const data = new Map();
      const store = new ns.systems.ProfileStore({ getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) });
      store.switchTo('admin');
      g.app.store = store;
      g.app.bindStorage('free');
      g.app.openFree();
      g.reset();
      g.chooseMap('tidegateoutfall');
      g.chooseProfession(hero, faction);
      g.paused = true;
    }, { faction: options.faction, hero: FACTIONS[options.faction] });
    await page.waitForFunction(hero => {
      const g = globalThis.towerFrontierGame;
      return g.profession.selected && g.art.coreStatus(hero).ready;
    }, FACTIONS[options.faction], { timeout: 30000 });
    await page.waitForFunction(faction => {
      const g = globalThis.towerFrontierGame, ns = globalThis.TowerFrontier;
      return ns.systems.FactionSystem.FACTIONS[faction].buildings.every(type =>
        g.ui.buildButtons.some(button => button.dataset.buildKind === 'building' &&
          button.dataset.buildType === type && button.dataset.previewReady === 'true'));
    }, options.faction, { timeout: 30000 });

    const art = await page.evaluate(faction => {
      const g = globalThis.towerFrontierGame, ns = globalThis.TowerFrontier;
      g.updateUi();
      const own = ns.systems.FactionSystem.FACTIONS[faction];
      const towerTypes = (own.buildings || []).filter(type => ns.config.buildings[type]);
      const cards = towerTypes.map(type => {
        const button = g.ui.buildButtons.find(item => item.dataset.buildType === type && item.dataset.buildKind === 'building');
        const canvas = button?.querySelector('canvas');
        if (!button || !canvas) return { type, found: false };
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let occupied = 0;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 16) occupied++;
        const source = g.art.previewCache.get('building:' + type);
        const sourcePixels = source?.source.getContext('2d').getImageData(0, 0, 384, 384).data;
        let sourceAlpha = 0, includedAlpha = 0;
        if (sourcePixels) for (let y = 0; y < 384; y++) for (let x = 0; x < 384; x++) {
          const alpha = sourcePixels[(y * 384 + x) * 4 + 3];
          sourceAlpha += alpha;
          if (x >= source.left && x < source.left + source.width && y >= source.top && y < source.top + source.height)
            includedAlpha += alpha;
        }
        return { type, found: true, width: canvas.width, height: canvas.height,
          occupiedRatio: Number((occupied / (canvas.width * canvas.height)).toFixed(3)),
          cropCoverage: sourceAlpha ? Number((includedAlpha / sourceAlpha).toFixed(3)) : 0,
          dataUrl: canvas.toDataURL('image/png') };
      });
      // Ask the real placement rules, so QA images cannot silently show a tower at sea.
      g.build.items = [];
      const placements = towerTypes.map((type, index) => {
        const areas = ns.config.buildAreas || [];
        const order = [...areas.slice(index), ...areas.slice(0, index)];
        let chosen = null;
        for (const area of order) {
          const xs = area.map(point => point.x), ys = area.map(point => point.y);
          const cx = xs.reduce((sum, x) => sum + x, 0) / xs.length;
          const cy = ys.reduce((sum, y) => sum + y, 0) / ys.length;
          const candidates = [];
          for (let y = Math.min(...ys); y <= Math.max(...ys); y += 12)
            for (let x = Math.min(...xs); x <= Math.max(...xs); x += 12)
              candidates.push({ x, y, distance: Math.hypot(x - cx, y - cy) });
          candidates.sort((a, b) => a.distance - b.distance);
          chosen = candidates.find(point => g.build.canPlaceAt(point.x, point.y, 'building'));
          if (chosen) break;
        }
        if (chosen) g.build.items.push(new ns.entities.Building(type, chosen.x, chosen.y));
        return { type, x: chosen?.x ?? null, y: chosen?.y ?? null, legal: Boolean(chosen) };
      });
      g.monsters = [];
      g.camera.enabled = true;
      g.camera.started = true;
      g.camera.overview = false;
      g.camera.zoom = 1;
      g.camera.focus(768, 512);
      g.draw();
      return { towers: towerTypes, cards, placements, scale100: g.camera.scale(),
        map: ns.config.mapId, canvas: { width: g.canvas.width, height: g.canvas.height } };
    }, options.faction);
    for (const card of art.cards) {
      if (!card.dataUrl) continue;
      const image = Buffer.from(card.dataUrl.slice(card.dataUrl.indexOf(',') + 1), 'base64');
      fs.writeFileSync(path.join(options.out, `card-${card.type}.png`), image);
      delete card.dataUrl;
    }
    await page.evaluate(() => globalThis.towerFrontierGame.showCommands('build'));
    await page.locator('#td-build-drawer').screenshot({ path: path.join(options.out, 'build-drawer.png') });
    await page.evaluate(() => globalThis.towerFrontierGame.showCommands('orders'));
    await page.evaluate(() => {
      const g = globalThis.towerFrontierGame, ns = globalThis.TowerFrontier;
      const map = ns.maps.definitions[ns.config.mapId];
      const overlay = document.createElement('canvas');
      overlay.id = 'qa-map-geometry'; overlay.width = map.width; overlay.height = map.height;
      Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '99999', width: '100vw', height: '100vh', objectFit: 'contain', background: '#07100e' });
      document.body.append(overlay);
      const ctx = overlay.getContext('2d');
      ctx.drawImage(g.art.mapAssets[map.id], 0, 0, map.width, map.height);
      for (const area of map.buildAreas || []) {
        ctx.fillStyle = 'rgba(37, 255, 128, .12)'; ctx.strokeStyle = '#49ff98'; ctx.lineWidth = 3;
        ctx.beginPath(); area.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      for (const route of map.routes || [map.path]) {
        ctx.strokeStyle = '#ffdc57'; ctx.lineWidth = 4; ctx.beginPath();
        route.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke();
      }
    });
    await page.locator('#qa-map-geometry').screenshot({ path: path.join(options.out, 'map-geometry.png') });
    await page.evaluate(() => document.querySelector('#qa-map-geometry').remove());
    await page.locator('#td-game').screenshot({ path: path.join(options.out, 'battle-100.png') });
    const halfScale = await page.evaluate(() => {
      const g = globalThis.towerFrontierGame;
      g.camera.zoom = .5; // QA-only exact scale; normal player controls enforce their own floor.
      g.camera.focus(768, 512);
      g.draw();
      return { scale: g.camera.scale(), width: g.camera.worldWidth, height: g.camera.worldHeight,
        viewportWidth: g.camera.width, viewportHeight: g.camera.height };
    });
    const canvasBox = await page.locator('#td-game').boundingBox();
    const scaledWidth = halfScale.width * halfScale.scale;
    const scaledHeight = halfScale.height * halfScale.scale;
    await page.screenshot({ path: path.join(options.out, 'battle-50.png'), clip: {
      x: canvasBox.x + (halfScale.viewportWidth - scaledWidth) / 2,
      y: canvasBox.y + (halfScale.viewportHeight - scaledHeight) / 2,
      width: scaledWidth, height: scaledHeight
    } });
    const metrics = [];
    for (const faction of [...new Set(['dwarf', options.faction])]) {
      for (const monsterCount of [11, 120]) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
        const benchPage = await context.newPage();
        benchPage.on('pageerror', error => errors.push(error.message));
        try {
          await benchPage.goto(localUrl);
          await benchPage.waitForFunction(() => globalThis.towerFrontierGame?.app && globalThis.TowerFrontier?.systems?.ProfileStore);
          await benchPage.evaluate(({ faction, hero, monsterCount }) => {
            const g = globalThis.towerFrontierGame, ns = globalThis.TowerFrontier, data = new Map();
            const store = new ns.systems.ProfileStore({ getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) });
            store.switchTo('admin'); g.app.store = store; g.app.bindStorage('free'); g.app.openFree();
            g.reset(); g.chooseMap('tidegateoutfall'); g.chooseProfession(hero, faction);
            g.waves.holdPreparation(true); g.setGameSpeed(2);
            g.monsters = Array.from({ length: monsterCount }, (_, i) => {
              const m = new ns.entities.Monster('grunt', 1, g.path.points);
              m.setRouteDistance(180 + (i % 60) * 12);
              m.health = m.maxHealth = 100000;
              return m;
            });
            const center = g.monsters[5];
            g.hero.x = center.x; g.hero.y = center.y; g.hero.health = g.hero.maxHealth = 100000;
            const unitType = ns.systems.FactionSystem.FACTIONS[faction].units[0];
            g.build.items.push(new ns.entities.CombatUnit(unitType, center.x + 50, center.y + 50));
            if (!g.performanceMonitor.enabled) g.performanceMonitor.toggle();
            g.paused = false;
            g.castHeroSkill('thunder');
            g.frameTiming.clear(performance.now());
          }, { faction, hero: FACTIONS[faction], monsterCount });
          await benchPage.waitForTimeout(1000);
          await benchPage.evaluate(() => { globalThis.towerFrontierGame.performanceMonitor.samples = []; });
          await benchPage.waitForTimeout(3000);
          const sample = await benchPage.evaluate(() => {
            const g = globalThis.towerFrontierGame;
            g.paused = true;
            return { samples: g.performanceMonitor.samples.slice(), monsters: g.monsters.length };
          });
          metrics.push({ faction, monsterCount, observedMonsters: sample.monsters, speed: 2,
            ...summarizeSamples(sample.samples) });
        } finally {
          await context.close();
        }
      }
    }
    const report = {
      qaVersion: VERSION, generatedAt: new Date().toISOString(), faction: options.faction,
      fixture: '潮門外流；記憶體測試存檔；1 名英雄、1 名士兵、英雄 W；×2；高血量 grunt；暖機 1 秒、測量 3 秒',
      visual: { ...art, scale50: halfScale.scale, requiresHumanReview: true }, metrics, errors,
      limitations: '背景無頭 Edge 量測不代表玩家前景 FPS；繪圖呼叫 P95 不包含 GPU 呈現。高怪量為壓力 fixture，非自然波次。'
    };
    fs.writeFileSync(path.join(options.out, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (errors.length || art.cards.some(card => !card.found || card.occupiedRatio < .01 || card.cropCoverage < .95) ||
        art.placements.some(item => !item.legal) ||
        Math.abs(halfScale.scale / art.scale100 - .5) > .01 || metrics.some(item => item.frames < 30)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log('用法：node scripts/qa-battlefield-acceptance.cjs [--faction naga|dragonkin|dwarf|egypt|goblin|frostland|hunter|arcanist|rogue|wild] [--out artifacts/...]\n先執行 npm run serve:test；需安裝 Playwright 與 Edge。');
    else run(options).catch(error => { console.error(error); process.exitCode = 1; });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { parseArgs, summarizeSamples, VERSION };
