'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function load() {
  const context = vm.createContext({ console });
  const html = fs.readFileSync(path.join(root, 'codex.html'), 'utf8');
  for (const [, file] of html.matchAll(/<script src="([^"]+)"/g)) if (!file.endsWith('CodexView.js')) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  return context.TowerFrontier;
}
function memory() { const map = new Map(); return { getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, value) }; }
function setup(options = {}) {
  const ns = load(), storage = options.storage || memory(), progress = new ns.codex.CodexProgressAdapter({ storage });
  const archive = new ns.codex.ChronicleProgressAdapter({ storage, ...options });
  const catalog = new ns.codex.CodexCatalog({ chronicleProgress: archive, ...options });
  return { ns, progress, archive, catalog, storage };
}
test('seed contains exactly the requested 21 records, 9 readable, 8 sealed and 4 hidden', () => {
  const { ns, progress, catalog } = setup();
  assert.equal(ns.codex.categories.length, 8); assert.equal(ns.codex.chronicleCategories.join(','), '世界,文明,歷史,事件,信仰,傳說,人物紀錄');
  const seeds = ns.codex.chronicleSeed, initial = catalog.query(progress, { type: 'chronicle' });
  assert.equal(seeds.length, 21); assert.equal(initial.length, 17);
  assert.equal(initial.filter(row => row.readable).length, 9); assert.equal(initial.filter(row => !row.readable).length, 8);
  assert.equal(seeds.filter(row => row.chapter === 2 && row.hiddenUntilEncountered === 'hidden').length, 4);
  assert.equal(new Set(seeds.map(row => row.id)).size, 21);
  assert.ok(seeds.every(row => row.fragments.every(fragment => fragment.bibleSections?.length)));
  assert.equal(seeds.find(row => row.id === 'kingdom-martial-law').fragments.length, 0);
  assert.equal(seeds.find(row => row.id === 'kingdom-martial-law').requires.blocked, true);
});
test('public player data excludes hidden chapter, unreleased stages and forbidden revelations', () => {
  const { progress, catalog, ns } = setup(); const payload = JSON.stringify(catalog.query(progress, { type: 'chronicle' }));
  for (const term of ['首相策劃', '皇族親衛隊執行', '平均壽命逐代下降', '共同祖先', '神秘古代種族', '獄烈戰爭', '西方大陸', '亡魂就是黑魔法', 'silverleaf-record', 'shadow-record']) assert.ok(!payload.includes(term), term);
  const holy = catalog.query(progress).find(row => row.id === 'chronicle:holy-spirits'); assert.equal(holy.lore[0].sourceType, 'SILVERLEAF_BELIEF');
  assert.ok(holy.lore[0].text.includes('並非已被證實'));
  const allAuthoredText = ns.codex.chronicleSeed.flatMap(row => row.fragments.map(fragment => fragment.text)).join('\n');
  for (const term of ['首相策劃', '皇族親衛隊執行', '神秘古代種族', '遠古同源', '平均壽命逐代下降']) assert.ok(!allAuthoredText.includes(term), term);
});
test('filters and search only inspect acquired fragment text', () => {
  const { progress, catalog, archive } = setup();
  assert.equal(catalog.query(progress, { type: 'chronicle', role: '世界', state: 'unlocked' }).length, 4);
  assert.equal(catalog.query(progress, { sourceType: 'SILVERLEAF_BELIEF' }).length, 1);
  assert.equal(catalog.query(progress, { search: '高層逐漸確認' }).length, 0);
  archive.ingest({ type: 'story-milestone', id: 'chapter1.black-magic-taboo-known' });
  archive.ingest({ type: 'story-milestone', id: 'chapter1.shadow-elder-account-heard' });
  assert.equal(catalog.query(progress, { search: '高層逐漸確認' }).length, 1);
  assert.equal(catalog.query(progress, { sourceType: 'SHADOW_RECORD' }).length, 1);
});
test('progressive records append stable fragment IDs and persist NEW/UPDATED/read state', () => {
  const { ns, archive, catalog, progress, storage } = setup();
  const seed = ns.codex.chronicleSeed.find(row => row.id === 'black-magic');
  const event = id => archive.ingest({ type: 'story-milestone', id });
  event('chapter1.black-magic-taboo-known');
  let row = archive.view(seed); assert.equal(row.fragments.length, 1); assert.equal(row.updateLabel, 'NEW INFORMATION');
  const firstText = row.fragments[0].text;
  archive.markRead('black-magic', ['taboo', 'shadow-record']); assert.equal(archive.view(seed).updateLabel, '');
  event('chapter1.silverleaf-record-found'); row = archive.view(seed); assert.equal(row.fragments.length, 2); assert.equal(row.updateLabel, 'ARCHIVE UPDATED'); assert.equal(row.fragments[0].text, firstText);
  event('chapter1.shadow-elder-account-heard'); event('chapter1.shadow-elder-account-heard');
  row = archive.view(seed); assert.equal(row.fragments.length, 3); assert.equal(row.fullyKnown, false); assert.equal(row.fragments[0].isNew, false); assert.equal(row.fragments[2].isNew, true);
  assert.equal(new ns.codex.ChronicleProgressAdapter({ storage }).view(seed).updateLabel, 'ARCHIVE UPDATED');
  archive.markRead('black-magic', row.fragments.map(fragment => fragment.id));
  assert.equal(catalog.query(progress, { type: 'chronicle', state: 'updated' }).some(entry => entry.id === 'chronicle:black-magic'), false);
  assert.equal(event('chapter1.ancient-document-found'), false);
});
test('out of order milestones retain fragments but do not bypass entry gates', () => {
  const { ns, archive } = setup(); const seed = ns.codex.chronicleSeed.find(row => row.id === 'black-magic');
  archive.ingest({ type: 'story-milestone', id: 'chapter1.shadow-elder-account-heard' }); assert.equal(archive.view(seed).fragments.length, 0);
  archive.ingest({ type: 'story-milestone', id: 'chapter1.black-magic-taboo-known' }); assert.equal(archive.view(seed).fragments.length, 2);
  assert.equal(archive.ingest({ type: 'story-milestone', id: 'chapter1.complete' }), false);
  assert.equal(archive.ingest({ type: 'unlocked', id: 'black-magic' }), false);
});
test('chapter II remains absent until its own explicit milestone; generic unlock is insufficient', () => {
  const { archive, progress, catalog } = setup(); progress.ingest({ type: 'unlocked', id: 'chronicle:western-continent' });
  assert.ok(!catalog.query(progress).some(row => row.id === 'chronicle:western-continent'));
  archive.ingest({ type: 'story-milestone', id: 'chapter2.west-arrived' });
  assert.ok(catalog.query(progress).some(row => row.id === 'chronicle:western-continent'));
  assert.equal(catalog.query(progress, { type: 'chronicle' }).length, 18);
  assert.ok(!catalog.query(progress).some(row => row.id === 'chronicle:infernal-war'));
});
test('discovery progresses from unknown to silhouette, basic data and complete stats', () => {
  const { catalog, progress } = setup(); const get = () => catalog.query(progress).find(row => row.id === 'enemy:boss');
  assert.equal(get().knowledgeLevel, 'UNKNOWN'); assert.equal(get().name, '？？？'); assert.equal(get().silhouette, null);
  progress.ingest({ type: 'encountered', id: 'enemy:boss' }); assert.equal(get().knowledgeLevel, 'ENCOUNTERED'); assert.ok(get().silhouette); assert.equal(get().source, undefined);
  progress.ingest({ type: 'discovered', id: 'enemy:boss' }); assert.equal(get().knowledgeLevel, 'DISCOVERED'); assert.equal(get().name, '軍團戰將'); assert.equal(get().source.health, undefined); assert.ok(!get().gameplayInfo.some(row => row.label === '傷害相性'));
  progress.ingest({ type: 'fully-known', id: 'enemy:boss' }); assert.equal(get().knowledgeLevel, 'FULLY_KNOWN'); assert.equal(get().source.health, 790);
  assert.equal(catalog.query(progress, { state: 'fullyKnown', type: 'enemy' }).length, 1);
});
test('tactical hierarchy is driven by capabilities and stats remain live references', () => {
  const { ns, catalog, progress } = setup();
  for (const entry of catalog.query(progress).filter(row => ['unit', 'tower'].includes(row.type))) {
    assert.equal(entry.gameplayIdentity.length, 8); assert.equal(entry.gameplayIdentity[0].label, '定位'); assert.ok(!entry.gameplayIdentity.some(row => /\d/.test(row.value)));
  }
  let tower = catalog.query(progress).find(row => row.id === 'tower:frost'); assert.equal(tower.gameplayIdentity[0].value, '防線控場');
  ns.config.buildings.frost.damage = 432; tower = catalog.query(progress).find(row => row.id === 'tower:frost'); assert.equal(tower.source.damage, 432);
});
test('relations bridge real catalogs and accept only existing concept targets', () => {
  const { ns, progress, archive } = setup();
  const catalog = new ns.codex.CodexCatalog({ chronicleProgress: archive, resolveConcept: concept => concept === 'silverleaf-story-map' ? ['map:beginner', 'map:nonexistent'] : [] });
  const rows = catalog.query(progress), silverleaf = rows.find(row => row.id === 'chronicle:silverleaf');
  assert.ok(silverleaf.relatedEntries.includes('faction:arcanist')); assert.ok(silverleaf.relatedEntries.includes('map:beginner')); assert.ok(!silverleaf.relatedEntries.includes('map:nonexistent'));
  assert.ok(rows.find(row => row.id === 'hero:arcanist').relatedEntries.includes('chronicle:silverleaf'));
  assert.ok(rows.find(row => row.id === 'map:beginner').relatedEntries.includes('enemy:boss'));
  assert.ok(rows.find(row => row.id === 'faction:arcanist').relatedEntries.some(id => id.startsWith('unit:')));
  assert.ok(rows.find(row => row.id === 'faction:arcanist').relatedEntries.some(id => id.startsWith('tower:')));
});
test('bad/future archive saves stay untouched; blocked storage stays readable', () => {
  const ns = load();
  for (const raw of ['broken', '{"schema":99,"milestones":[],"entries":{}}']) {
    const storage = memory(); storage.setItem('heroFrontierChronicleV1', raw); const archive = new ns.codex.ChronicleProgressAdapter({ storage });
    archive.ingest({ type: 'story-milestone', id: 'chapter1.prince-death-known' }); assert.equal(storage.getItem(archive.key), raw); assert.ok(archive.warning);
    assert.equal(archive.view(ns.codex.chronicleSeed[0]).discovered, true);
  }
  const archive = new ns.codex.ChronicleProgressAdapter({ storage: { getItem: () => null, setItem: () => { throw new Error('quota'); } } });
  assert.ok(archive.warning); assert.equal(archive.ingest({ type: 'story-milestone', id: '__proto__' }), false);
});
test('Story event bus is an adapter and can detach without touching Story Core', () => {
  const { ns, archive, progress } = setup(); const target = new EventTarget();
  const detach = new ns.codex.CodexIntegration(progress, { chronicleProgress: archive }).connect(target);
  const event = new Event('hero-frontier:story'); event.detail = { type: 'story-milestone', id: 'chapter1.prince-death-known' }; target.dispatchEvent(event);
  assert.ok(archive.milestones.has(event.detail.id)); detach();
  const second = new Event('hero-frontier:story'); second.detail = { type: 'story-milestone', id: 'chapter2.west-arrived' }; target.dispatchEvent(second); assert.ok(!archive.milestones.has(second.detail.id));
});
test('seed cinematics are placeholders and replay requires a story watched record', async () => {
  const { ns, progress } = setup(); assert.ok(ns.codex.chronicleSeed.every(entry => entry.cinematicId === null));
  let played = false; const adapter = new ns.codex.CodexIntegration(progress, { player: { play: async () => { played = true; return { watched: true }; } } });
  const entry = { archive: true, cinematicId: 'fixture', id: 'chronicle:coexistence', discoveryState: { unlocked: true, watched: false } };
  assert.equal((await adapter.replay(entry)).ok, false); assert.equal(played, false);
  entry.discoveryState.watched = true; assert.equal((await adapter.replay(entry)).ok, true);
});
test('Bible content is never requested by the player entrypoint', () => {
  assert.ok(!fs.readFileSync(path.join(root, 'codex.html'), 'utf8').includes('WORLD_STORY_BIBLE_V1.md'));
});
