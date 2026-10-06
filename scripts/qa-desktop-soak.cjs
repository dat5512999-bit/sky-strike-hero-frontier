'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { summarizeSamples } = require('./qa-battlefield-acceptance.cjs');

const ROOT = path.resolve(__dirname, '..');
const HERO = { naga: 'naga', dwarf: 'dwarf', egypt: 'egypt' };

function parseArgs(argv) {
  const options = { faction: 'naga', seconds: 90, headed: false,
    out: path.join(ROOT, 'artifacts', 'desktop-soak') };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--faction') options.faction = argv[++i];
    else if (flag === '--seconds') options.seconds = Number(argv[++i]);
    else if (flag === '--headed') options.headed = true;
    else if (flag === '--out') options.out = argv[++i] && path.resolve(argv[i]);
    else throw Error(`不支援的參數：${flag}`);
  }
  if (!HERO[options.faction]) throw Error('目前長測支援 naga、dwarf 或 egypt');
  if (!Number.isInteger(options.seconds) || options.seconds < 10 || options.seconds > 600)
    throw Error('--seconds 必須是 10–600 的整數');
  if (!options.out || !options.out.startsWith(path.join(ROOT, 'artifacts') + path.sep))
    throw Error('輸出必須位於 artifacts/ 下');
  return options;
}

async function run(options) {
  const { chromium } = require('playwright');
  const port = process.env.TD_TEST_PORT === undefined ? 4173 : Number(process.env.TD_TEST_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('TD_TEST_PORT 必須是有效的本機連接埠');
  fs.mkdirSync(options.out, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: !options.headed });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/td.html`);
    await page.waitForFunction(() => globalThis.towerFrontierGame?.app && globalThis.TowerFrontier?.systems?.ProfileStore);
    await page.evaluate(({ faction, hero }) => {
      const g = globalThis.towerFrontierGame, ns = globalThis.TowerFrontier, data = new Map();
      const store = new ns.systems.ProfileStore({ getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) });
      store.switchTo('admin'); g.app.store = store; g.app.bindStorage('free'); g.app.openFree();
      store.state.profiles.admin.data['synthetic-performance-payload'] = 'x'.repeat(1024 * 1024);
      g.reset(); g.chooseMap('tidegateoutfall'); g.chooseProfession(hero, faction);
      g.waves.holdPreparation(true); g.setGameSpeed(2);
      g.monsters = Array.from({ length: 120 }, (_, i) => {
        const monster = new ns.entities.Monster(i % 6 ? 'grunt' : 'brute', 15, g.path.points);
        monster.setRouteDistance(260 + (i % 60) * 9);
        monster.health = monster.maxHealth = 100000;
        monster.speed = 0; // Fixed population: prevents natural leaks from hiding late-session work.
        return monster;
      });
      const center = g.monsters[5];
      g.hero.x = center.x; g.hero.y = center.y;
      g.hero.health = g.hero.maxHealth = 100000;
      const factionData = ns.systems.FactionSystem.FACTIONS[faction];
      g.build.items.push(new ns.entities.CombatUnit(factionData.units[0], center.x + 50, center.y + 50));
      for (const [i, type] of factionData.buildings.slice(0, 3).entries())
        g.build.items.push(new ns.entities.Building(type, [315, 383, 633][i], [130, 260, 275][i]));
      if (!g.performanceMonitor.enabled) g.performanceMonitor.toggle();
      globalThis.__qaSamples = [];
      const record = g.performanceMonitor.record.bind(g.performanceMonitor);
      g.performanceMonitor.record = sample => { globalThis.__qaSamples.push(sample); record(sample); };
      g.frameTiming.clear(performance.now());
      g.paused = false;
      globalThis.__qaLongTasks = [];
      try {
        globalThis.__qaLongTaskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) globalThis.__qaLongTasks.push(entry.duration);
        });
        globalThis.__qaLongTaskObserver.observe({ type: 'longtask', buffered: true });
      } catch (_) { /* Not every browser exposes longtask entries. */ }
    }, { faction: options.faction, hero: HERO[options.faction] });
    await page.waitForFunction(hero => globalThis.towerFrontierGame.art.coreStatus(hero).ready, HERO[options.faction]);
    if (options.headed) await page.bringToFront();
    await page.screenshot({ path: path.join(options.out, 'start.png') });
    const buckets = [];
    const total = options.seconds;
    for (let elapsed = 0; elapsed < total; elapsed += 5) {
      await page.waitForTimeout(Math.min(5, total - elapsed) * 1000);
      const bucket = await page.evaluate(() => {
        const g = globalThis.towerFrontierGame;
        if ((g.elapsed || 0) % 12 < 5) g.castHeroSkill('thunder');
        const samples = globalThis.__qaSamples.splice(0);
        const tasks = globalThis.__qaLongTasks.splice(0);
        return { samples, longTasks: tasks, monsters: g.monsters.length,
          projectiles: g.projectiles.length, effects: g.effects.length,
          visibility: document.visibilityState, focused: document.hasFocus(),
          heapMB: performance.memory ? Number((performance.memory.usedJSHeapSize / 1048576).toFixed(1)) : null,
          discardedMs: g.frameTiming.discarded * 1000 };
      });
      buckets.push({ second: Math.min(total, elapsed + 5), ...summarizeSamples(bucket.samples),
        monsters: bucket.monsters, projectiles: bucket.projectiles, effects: bucket.effects,
        visibility: bucket.visibility, focused: bucket.focused,
        heapMB: bucket.heapMB, longTaskCount: bucket.longTasks.length,
        longTaskMaxMs: Number((Math.max(0, ...bucket.longTasks)).toFixed(1)),
        discardedMs: Number(bucket.discardedMs.toFixed(1)) });
      console.log(`${options.faction} ${buckets.at(-1).second}/${total}s · frame P95 ${buckets.at(-1).frameP95}ms · update P95 ${buckets.at(-1).updateP95}ms · draw P95 ${buckets.at(-1).drawP95}ms`);
    }
    await page.screenshot({ path: path.join(options.out, 'end.png') });
    const report = { faction: options.faction, seconds: options.seconds, headed: options.headed,
      fixture: '隔離記憶體 1 MiB 存檔、潮門外流、×2、120 隻固定高血怪、1 士兵、3 塔、週期技能；桌面 Edge',
      buckets, errors,
      limitations: '瀏覽器視窗即使以 headed 啟動，也無法證明整段期間一直取得作業系統前景焦點；固定怪物不等於自然 50 波。' };
    fs.writeFileSync(path.join(options.out, 'report.json'), JSON.stringify(report, null, 2));
    if (errors.length || buckets.some(bucket => bucket.frames < 20 || bucket.monsters < 100)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  try { run(parseArgs(process.argv.slice(2))).catch(error => { console.error(error); process.exitCode = 1; }); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { parseArgs };
