'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const files = ['namespace', 'config', 'maps', 'systems/HeroRoster', 'systems/ProfessionSystem', 'systems/HeroUltimateSystem', 'systems/FactionSystem', 'entities/Monster', 'systems/WaveCatalog', 'systems/ArmorySystem', 'systems/EquipmentSystem', 'systems/TowerEvolutionSystem', 'systems/TDDifficultySystem', 'systems/BattleReportSystem', 'codex/CodexProgressAdapter', 'codex/CodexCatalog', 'codex/CodexIntegration', 'codex/thumbnails'];
function load() { const context = vm.createContext({ console }); [...files, 'entities/CombatUnit'].forEach(file => vm.runInContext(fs.readFileSync(path.join(root, 'src/td/' + file + '.js'), 'utf8'), context)); return context.TowerFrontier; }
function memory(raw) { const data = new Map(raw ? [['heroFrontierCodexV1', raw]] : []); return { data, getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) }; }
test('Codex covers real catalogs without altering or copying balance sources', () => {
  const ns = load(), catalog = new ns.codex.CodexCatalog(), entries = catalog.all();
  for (const type of ['hero', 'faction', 'unit', 'tower', 'enemy', 'equipment', 'map']) assert.ok(entries.some(e => e.type === type), type);
  assert.equal(new Set(entries.map(e => e.id)).size, entries.length);
  assert.equal(entries.find(e => e.id === 'hero:arcanist').source, ns.systems.HeroRoster.CLASSES.arcanist);
  ns.systems.HeroRoster.CLASSES.arcanist.damage = 999;
  assert.equal(catalog.all().find(e => e.id === 'hero:arcanist').source.damage, 999);
  assert.ok(!entries.some(e => e.id === 'unit:halberdier'));
  for (const entry of entries) for (const id of entry.relatedEntries) assert.ok(entries.some(e => e.id === id), id);
});
test('new gameplay entries appear without a UI or catalog switch', () => {
  const ns = load(); ns.systems.HeroRoster.CLASSES.test = { name: 'New Hero', skills: [], hints: [] };
  assert.ok(new ns.codex.CodexCatalog().all().some(e => e.id === 'hero:test'));
});
test('soldier growth previews reuse entity evolution, upgrade cost and scaling', () => {
  const ns = load(), entry = new ns.codex.CodexCatalog().all().find(e => e.id === 'unit:shield');
  const source = new ns.entities.CombatUnit('shield', 0, 0), snapshot = JSON.stringify(ns.config.units.shield);
  assert.equal(entry.upgrades.length, 5); assert.ok(entry.upgrades[0].label.includes(source.evolutionName()));
  assert.ok(entry.upgrades[0].value.includes('金幣 ' + source.upgradeCost().gold));
  source.upgrade(); assert.ok(entry.upgrades[1].value.includes(String(Number(source.config().damage.toFixed(1)))));
  assert.equal(JSON.stringify(ns.config.units.shield), snapshot);
});
test('discovery advances monotonically and persists in the legacy adapter', () => {
  const ns = load(), storage = memory(), progress = new ns.codex.CodexProgressAdapter({ storage });
  progress.ingest({ type: 'encountered', id: 'enemy:boss' });
  assert.equal(progress.state('enemy:boss').encountered, true); assert.equal(progress.state('enemy:boss').discovered, false); assert.equal(progress.state('enemy:boss').unlocked, false);
  progress.ingest({ type: 'discovered', id: 'enemy:boss' }); assert.equal(progress.state('enemy:boss').unlocked, false);
  progress.ingest({ type: 'unlocked', id: 'hero:rogue' }); assert.equal(progress.state('hero:rogue').encountered, true);
  assert.equal(storage.data.size, 1); assert.equal(new ns.codex.CodexProgressAdapter({ storage }).state('enemy:boss').discovered, true);
  progress.update('enemy:boss', { encountered: false }); assert.equal(progress.state('enemy:boss').encountered, true);
  progress.update('enemy:boss', { favorite: true }); progress.update('enemy:boss', { favorite: false }); assert.equal(progress.state('enemy:boss').favorite, false);
});
test('spoiler rules redact before search, filters, art and relationships', () => {
  const ns = load(), progress = new ns.codex.CodexProgressAdapter({ storage: null });
  const catalog = new ns.codex.CodexCatalog({ metadata: { 'enemy:boss': { hiddenUntilEncountered: 'hidden' }, 'enemy:grunt': { hiddenUntilEncountered: 'silhouette' }, 'enemy:runner': { hiddenUntilEncountered: 'name' } } });
  assert.ok(!catalog.query(progress).some(e => e.id === 'enemy:boss'));
  assert.equal(catalog.query(progress, { search: '邊境步兵' }).length, 0);
  assert.equal(catalog.query(progress, { search: '疾風獵犬' }).length, 1);
  const silhouette = catalog.query(progress).find(e => e.id === 'enemy:grunt');
  assert.equal(silhouette.art, undefined); assert.equal(silhouette.source, undefined); assert.equal(silhouette.faction, undefined); assert.equal(silhouette.relatedEntries.length, 0);
  progress.ingest({ type: 'encountered', id: 'enemy:boss' }); assert.equal(catalog.query(progress).find(e => e.id === 'enemy:boss').name, '？？？');
  progress.ingest({ type: 'discovered', id: 'enemy:boss' }); assert.equal(catalog.query(progress, { role: '首領' }).length, 1);
});
test('search and category-specific filters compose with favorites and obtained state', () => {
  const ns = load(), catalog = new ns.codex.CodexCatalog(), progress = new ns.codex.CodexProgressAdapter({ storage: null });
  const hero = catalog.query(progress, { type: 'hero', faction: 'arcanist', search: '希爾芙', state: 'unlocked' }); assert.equal(hero.length, 1);
  assert.equal(catalog.query(progress, { type: 'equipment', state: 'unlocked' }).length, 0);
  progress.update('equipment:lion-bow', { unlocked: true, favorite: true });
  assert.equal(catalog.query(progress, { type: 'equipment', rarity: '史詩', slot: 'weapon', state: 'favorite' }).length, 1);
  assert.equal(catalog.query(progress, { type: 'equipment', state: 'unlocked' }).length, 1);
});
test('equipment compatibility is exactly the existing armory rule', () => {
  const ns = load(), catalog = new ns.codex.CodexCatalog(), armory = new ns.systems.ArmorySystem();
  for (const entry of catalog.all().filter(e => e.type === 'equipment' && !e.weaponHero)) {
    for (const id of Object.keys(ns.config.units).filter(id => !ns.config.units[id].enemyOnly)) assert.equal(entry.relatedEntries.includes('unit:' + id), armory.canEquip(entry.key, { kind: 'unit', type: id }));
  }
});
test('map scores and completion derive from report records, not score > 0', () => {
  const ns = load(), report = new ns.systems.BattleReportSystem(null);
  report.bestByMap.beginner = 4200; report.records = [{ map: 'beginner', victory: false, difficulty: 'standard' }, { map: 'beginner', victory: true, difficulty: 'story' }];
  const data = ns.codex.CodexIntegration.mapProgress(report, 'beginner'); assert.equal(data.bestScore, 4200); assert.equal(data.completed.join(','), 'story');
});
test('corrupt/future saves are preserved and blocked storage remains usable', () => {
  const ns = load();
  for (const raw of ['{broken', JSON.stringify({ schema: 99, entries: {} }), JSON.stringify({ schema: 1, entries: [] })]) {
    const storage = memory(raw), progress = new ns.codex.CodexProgressAdapter({ storage }); progress.update('hero:arcanist', { favorite: true });
    assert.equal(storage.getItem(progress.key), raw); assert.ok(progress.warning); assert.equal(progress.state('hero:arcanist').favorite, true);
  }
  const progress = new ns.codex.CodexProgressAdapter({ storage: { getItem: () => null, setItem: () => { throw new Error('Quota'); } } });
  assert.equal(progress.update('hero:hunter', { favorite: true }), true); assert.ok(progress.warning);
  assert.equal(progress.update('__proto__', { unlocked: true }), false);
  assert.equal(progress.ingest({ type: 'cinematic-watched', id: 'hero:hunter' }), false);
});
test('Cinematic adapter enforces locks, awaits completion, handles missing and failed player', async () => {
  const ns = load(), progress = new ns.codex.CodexProgressAdapter({ storage: null });
  const entry = { id: 'chronicle:intro', cinematicId: 'intro', discoveryState: { unlocked: false } };
  let calls = 0; const integration = new ns.codex.CodexIntegration(progress, { player: { play: async () => { calls++; return { watched: true }; } } });
  assert.equal((await integration.replay(entry)).ok, false); assert.equal(calls, 0);
  entry.discoveryState.unlocked = true; assert.equal((await new ns.codex.CodexIntegration(progress).replay(entry)).ok, false);
  assert.equal((await integration.replay(entry)).ok, true); assert.equal(progress.state(entry.id).watched, true);
  integration.player.play = async () => { throw new Error('offline'); }; assert.equal((await integration.replay(entry)).ok, false);
});
test('Story watched event automatically collects cinematic with source viewpoint intact', () => {
  const ns = load(), progress = new ns.codex.CodexProgressAdapter({ storage: null });
  const catalog = new ns.codex.CodexCatalog({ chronicles: [{ id: 'record', name: 'Test record', kind: 'cinematic', cinematicId: 'clip', sourceType: 'LEGEND', text: 'A disputed story' }] });
  progress.ingest({ type: 'cinematic-watched', id: 'chronicle:record' });
  const entry = catalog.query(progress, { type: 'chronicle' })[0]; assert.equal(entry.discoveryState.watched, true); assert.equal(entry.lore[0].sourceType, 'LEGEND');
  assert.equal(Object.keys(ns.codex.sources).length, 8);
});
test('expedition adapter gates locked entries and passes structured selection', () => {
  const ns = load(), calls = [], integration = new ns.codex.CodexIntegration(null, { navigate: value => calls.push(value) });
  assert.equal(integration.expedition({ type: 'hero', discoveryState: { unlocked: false } }), false);
  assert.equal(integration.expedition({ id: 'hero:arcanist', type: 'hero', key: 'arcanist', discoveryState: { unlocked: true } }), true); assert.equal(calls[0].hero, 'arcanist');
});
test('generated thumbnails exist and stay small; HTML loads no battle runtime', () => {
  const ns = load(); for (const file of Object.values(ns.codex.thumbnails)) { assert.ok(fs.existsSync(path.join(root, file)), file); assert.ok(fs.statSync(path.join(root, file)).size < 150000, file); }
  const html = fs.readFileSync(path.join(root, 'codex.html'), 'utf8'); assert.ok(!html.includes('TDGame.js')); assert.ok(!html.includes('ArtSystem.js')); assert.ok(html.includes('viewport-fit=cover'));
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) if (!match[1].startsWith('data:')) assert.ok(fs.existsSync(path.join(root, match[1])), match[1]);
});
