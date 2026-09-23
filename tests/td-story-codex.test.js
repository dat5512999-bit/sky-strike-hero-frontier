'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const clone = value => JSON.parse(JSON.stringify(value));
function load() {
  const context = vm.createContext({ console });
  for (const [, file] of fs.readFileSync(path.join(root, 'codex.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)) if (!file.endsWith('CodexView.js')) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  return context.TowerFrontier;
}
function storage() { const data = new Map(); return { data, getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) }; }
function fixture(ns) {
  return { version: 1, events: { ...ns.codex.storyCodexMapping.events,
    'mock.mission.start': [],
    'mock.mission.complete': [{ action: 'discoverEntry', entryId: 'enemy:halberdier' }, { action: 'unlockChronicle', entryId: 'chronicle:black-magic', milestone: 'chapter1.black-magic-taboo-known' }],
    'mock.intel': [{ action: 'fullyKnowEntry', entryId: 'enemy:halberdier' }]
  }, chapters: { 'first-arc': { ready: true, requiredMissionIds: ['mock.mission'], rewards: [{ action: 'unlockFaction', entryId: 'faction:arcanist' }, { action: 'unlockFaction', entryId: 'faction:rogue' }, { action: 'unlockHero', entryId: 'hero:arcanist' }] } } };
}
// Narrow ProfileStore port, not a second Story Core. Real store compatibility is also audited separately.
function profilePort() {
  const make = id => ({ id, completed: [], encountered: [], discovered: [], cinematics: [], unlocks: { heroes: ['hunter'], factions: ['hunter'], maps: ['beginner'] }, data: {} });
  return { state: { saveVersion: 1, active: 'test', profiles: { test: make('test'), other: make('other') } },
    current() { return clone(this.state.profiles[this.state.active]); },
    change(edit) { const next = clone(this.state); edit(next); this.state = next; },
    allows(kind, id) { return this.current().unlocks[kind].includes(id); }
  };
}
test('complete mock flow: actual spawn -> discovery -> NEW -> read -> appended lore -> atomic save/reload', () => {
  const ns = load(), disk = storage(), mapping = fixture(ns);
  const bridge = new ns.codex.StoryCodexBridge({ storage: disk, mapping });
  const catalog = new ns.codex.CodexCatalog({ chronicleProgress: bridge.chronicleProgress });
  const enemy = () => catalog.query(bridge.progress).find(row => row.id === 'enemy:halberdier');
  const seed = ns.codex.chronicleSeed.find(row => row.id === 'black-magic');
  assert.equal(enemy().knowledgeLevel, 'UNKNOWN'); bridge.dispatch({ id: 'mock.mission.start' });
  const game = { waves: { update(dt, monsters) { if (dt > 0) monsters.push({ type: 'halberdier' }); return 'wave'; } }, build: { items: [] }, end() {}, reset() {} };
  let summary;
  ns.codex.CodexBattleBridge.install(game, bridge, result => { summary = result; });
  game.waves.update(0, []); assert.equal(enemy().knowledgeLevel, 'UNKNOWN');
  game.waves.update(1, []); assert.equal(enemy().knowledgeLevel, 'ENCOUNTERED'); assert.equal(summary, undefined);
  game.end(); assert.deepEqual(clone(summary.entries), ['enemy:halberdier']);
  bridge.dispatch({ id: 'mock.mission.complete' }); assert.equal(enemy().knowledgeLevel, 'DISCOVERED');
  assert.ok(bridge.unread().includes('chronicle:black-magic'));
  bridge.progress.markRead('enemy:halberdier'); bridge.chronicleProgress.markRead(seed.id, ['taboo']);
  assert.ok(!bridge.unread().includes('enemy:halberdier')); assert.ok(!bridge.unread().includes('chronicle:black-magic'));
  bridge.dispatch({ id: 'chapter1.silverleaf-record-found' });
  const archive = bridge.chronicleProgress.view(seed);
  assert.equal(archive.status, 'UPDATED'); assert.equal(archive.updateLabel, 'ARCHIVE UPDATED');
  assert.deepEqual(clone(archive.fragments.map(row => row.id)), ['taboo', 'silverleaf-record']);
  const restored = new ns.codex.StoryCodexBridge({ storage: disk, mapping });
  assert.deepEqual(clone(restored.save.snapshot()), clone(bridge.save.snapshot()));
  assert.equal(restored.chronicleProgress.view(seed).updateLabel, 'ARCHIVE UPDATED');
  restored.dispatch({ id: 'mock.intel' }); assert.equal(new ns.codex.CodexCatalog({ chronicleProgress: restored.chronicleProgress }).query(restored.progress).find(row => row.id === enemy().id).knowledgeLevel, 'FULLY_KNOWN');
});
test('event batches validate atomically, duplicate receipts do not resurface NEW, progress cannot regress', () => {
  const ns = load(), bridge = new ns.codex.StoryCodexBridge({ storage: storage(), mapping: fixture(ns) });
  const before = clone(bridge.save.snapshot());
  assert.throws(() => bridge.apply([{ action: 'discoverEntry', entryId: 'enemy:boss' }, { action: 'unknown' }]));
  assert.deepEqual(clone(bridge.save.snapshot()), before);
  bridge.dispatch({ id: 'mock.mission.complete' }); bridge.progress.markRead('enemy:halberdier');
  assert.equal(bridge.dispatch({ id: 'mock.mission.complete' }).duplicate, true);
  assert.equal(bridge.progress.isUnread('enemy:halberdier'), false);
  bridge.encounter('enemy', 'halberdier'); assert.equal(bridge.progress.state('enemy:halberdier').discovered, true);
  assert.equal(bridge.dispatch({ id: '__proto__' }).ignored, true);
  assert.throws(() => bridge.apply([{ action: 'unlockHero', entryId: 'enemy:boss' }]));
});
test('ProfileStore native fields remain authoritative and extension does not duplicate them', () => {
  const ns = load(), store = profilePort(), bridge = new ns.codex.StoryCodexBridge({ profileStore: store, storage: null, mapping: fixture(ns) });
  bridge.encounter('enemy', 'halberdier'); bridge.dispatch({ id: 'mock.mission.complete' });
  bridge.apply([{ action: 'unlockHero', entryId: 'hero:rogue' }, { action: 'unlockMap', entryId: 'map:twinpass' }, { action: 'unlockCinematic', cinematicId: 'demo' }]);
  assert.equal(bridge.markCinematicWatched('demo'), true);
  const profile = store.current(), extension = profile.data.codexProgression;
  assert.ok(profile.encountered.includes('halberdier')); assert.ok(profile.discovered.includes('enemy:halberdier'));
  assert.ok(profile.unlocks.heroes.includes('rogue')); assert.ok(profile.unlocks.maps.includes('twinpass'));
  assert.ok(profile.cinematics.includes('cinematic:demo')); assert.deepEqual(extension.watchedCinematics, []);
  assert.equal(extension.codex.entries['enemy:halberdier'].encountered, undefined);
  assert.equal(extension.codex.entries['enemy:halberdier'].discovered, undefined);
  assert.equal(extension.codex.entries['hero:rogue'].unlocked, undefined);
  assert.equal(extension.storyProgress, undefined); assert.equal(store.state.saveVersion, 1);
  assert.deepEqual(profile.completed, []);
  const restored = new ns.codex.StoryCodexBridge({ profileStore: store, storage: null });
  assert.equal(restored.progress.state('enemy:halberdier').discovered, true);
  assert.ok(restored.save.data.watchedCinematics.includes('demo'));
  store.state.active = 'other'; assert.throws(() => bridge.encounter('enemy', 'boss'), /存檔已切換/);
  assert.deepEqual(store.current().encountered, []);
});
test('chapter rewards use required mission IDs, do not turn the sample mission into chapter completion', () => {
  const ns = load(), store = profilePort(), bridge = new ns.codex.StoryCodexBridge({ profileStore: store, storage: null, mapping: fixture(ns) });
  assert.throws(() => bridge.completeChapter('first-arc'), /尚未全部完成/);
  store.change(state => state.profiles.test.completed.push('mock.mission'));
  bridge.completeChapter('first-arc');
  assert.ok(store.current().unlocks.factions.includes('arcanist')); assert.ok(store.current().unlocks.factions.includes('rogue'));
  assert.ok(store.current().unlocks.heroes.includes('arcanist'));
  bridge.progress.markRead('hero:arcanist'); bridge.completeChapter('first-arc'); assert.equal(bridge.progress.isUnread('hero:arcanist'), false);
  const pending = new ns.codex.StoryCodexBridge({ storage: storage() }); assert.throws(() => pending.completeChapter('chapter1'), /尚待/);
});
test('legacy migration preserves rollback data; incompatible saves, quota and stale tabs cannot partially unlock', () => {
  const ns = load(), disk = storage();
  const legacy = JSON.stringify({ schema: 1, entries: { 'enemy:boss': { encountered: true, favorite: true } } });
  disk.setItem('heroFrontierCodexV1', legacy);
  const bridge = new ns.codex.StoryCodexBridge({ storage: disk });
  assert.equal(bridge.progress.state('enemy:boss').favorite, true); assert.equal(disk.getItem('heroFrontierCodexV1'), legacy);
  const other = new ns.codex.StoryCodexBridge({ storage: disk });
  bridge.encounter('enemy', 'grunt'); assert.throws(() => other.encounter('enemy', 'runner'), /另一個分頁/);
  assert.equal(other.progress.state('enemy:runner').encountered, false);
  const before = disk.getItem(ns.codex.CodexSaveBridge.KEY); disk.setItem = () => { throw new Error('quota'); };
  assert.throws(() => bridge.encounter('enemy', 'brute'), /quota/); assert.equal(disk.getItem(ns.codex.CodexSaveBridge.KEY), before);
  const future = storage(); future.setItem(ns.codex.CodexSaveBridge.KEY, '{"saveVersion":999}');
  const blocked = new ns.codex.StoryCodexBridge({ storage: future }); assert.throws(() => blocked.encounter('enemy', 'boss'), /版本/);
  assert.equal(future.getItem(ns.codex.CodexSaveBridge.KEY), '{"saveVersion":999}');
});
test('battle binding is reversible, actual deployments count, repeated encounters and preview do not spam', () => {
  const ns = load(), bridge = new ns.codex.StoryCodexBridge({ storage: storage() });
  const game = { waves: { update(dt, monsters) { monsters.push({ type: 'boss' }); } }, build: { items: [], placeQueued(ok) { if (ok) this.items.push({ kind: 'unit', type: 'shield' }); return ok; } }, end() {}, reset() {} };
  const original = game.waves.update, summaries = [];
  const binding = ns.codex.CodexBattleBridge.install(game, bridge, result => summaries.push(result));
  assert.equal(ns.codex.CodexBattleBridge.install(game, bridge), binding);
  game.build.placeQueued(false); assert.equal(bridge.progress.state('unit:shield').encountered, false);
  game.build.placeQueued(true); game.waves.update(1, []); game.waves.update(1, []); assert.equal(summaries.length, 0);
  game.end(); assert.equal(summaries[0].entries.length, 2); game.end(); assert.equal(summaries.length, 1);
  binding.dispose(); assert.equal(game.waves.update, original);
});
test('cinematic unlock differs from watching; partial or legacy started cinematic never means watched', () => {
  const ns = load(), store = profilePort(); store.state.profiles.test.cinematics.push('chapter1-border');
  const bridge = new ns.codex.StoryCodexBridge({ profileStore: store, storage: null });
  assert.equal(bridge.save.data.watchedCinematics.length, 0); assert.equal(bridge.markCinematicWatched('demo'), false);
  bridge.apply([{ action: 'unlockCinematic', cinematicId: 'demo' }]);
  assert.ok(bridge.unread().includes('cinematic:demo')); assert.equal(bridge.save.data.watchedCinematics.length, 0);
  bridge.progress.markRead('cinematic:demo'); assert.ok(!bridge.unread().includes('cinematic:demo'));
  assert.equal(bridge.markCinematicWatched('demo'), true);
});
test('all sealed title policies redact search/relations/art before projection, with distinct visuals and timeline buckets', () => {
  const ns = load(), bridge = new ns.codex.StoryCodexBridge({ storage: storage() });
  const catalog = new ns.codex.CodexCatalog({ chronicleProgress: bridge.chronicleProgress });
  const publicRows = catalog.query(bridge.progress, { type: 'chronicle' });
  assert.equal(publicRows.find(row => row.id === 'chronicle:prince-death').name, '未知事件');
  assert.equal(catalog.query(bridge.progress, { search: '銀葉王子之死' }).length, 0);
  assert.equal(publicRows.find(row => row.id === 'chronicle:kingdom-guard').name, '王國禁衛軍');
  assert.ok(!publicRows.some(row => row.id === 'chronicle:infernal-war'));
  assert.equal(publicRows.find(row => row.id === 'chronicle:prince-death').relatedEntries.length, 0);
  assert.ok(new Set(publicRows.map(row => row.visualType)).size >= 5);
  bridge.dispatch({ id: 'chapter1.prince-death-known' }); assert.equal(catalog.query(bridge.progress, { search: '銀葉王子之死' }).length, 1);
  const black = ns.codex.chronicleSeed.find(row => row.id === 'black-magic');
  bridge.dispatch({ id: 'chapter1.black-magic-taboo-known' }); bridge.dispatch({ id: 'chapter1.silverleaf-record-found' }); bridge.dispatch({ id: 'chapter1.shadow-elder-account-heard' });
  assert.equal(bridge.chronicleProgress.view(black).fragments.length, 3);
  assert.equal(bridge.chronicleProgress.view(black).fullyKnown, false);
  assert.throws(() => bridge.apply([{ action: 'updateChronicle', entryId: 'chronicle:black-magic', milestone: 'chapter1.ancient-document' }]));
});
test('production entrypoints exclude development commands and debug page is loopback restricted', () => {
  for (const file of ['codex.html', 'td.html']) assert.ok(!fs.readFileSync(path.join(root, file), 'utf8').includes('CodexDebug'));
  assert.ok(fs.readFileSync(path.join(root, 'codex-dev.html'), 'utf8').includes('CodexDebug.js'));
  const context = vm.createContext({ TowerFrontier: load(), location: { hostname: 'example.com', pathname: '/codex-dev.html' } });
  vm.runInContext(fs.readFileSync(path.join(root, 'src/td/codex/CodexDebug.js'), 'utf8'), context);
  assert.equal(context.CodexDebug, undefined);
});

test('Story port consumes only completed core missions and reads rewards from live Story Data', () => {
  const ns = load(), store = profilePort(), mission = { id: 'core-mission', rewards: { maps: ['twinpass'] }, discovered: ['enemy:boss'] };
  const bridge = new ns.codex.StoryCodexBridge({ profileStore: store, storage: null, getMission: id => id === mission.id ? mission : null, entryIds: new Set(['map:twinpass', 'enemy:boss']) });
  assert.throws(() => bridge.handleStoryEvent({ type: 'mission-completed', id: mission.id }), /尚未確認/);
  let listener; const detach = bridge.bindStoryCore({ subscribe(fn) { listener = fn; return () => { listener = null; }; } });
  store.change(state => state.profiles.test.completed.push(mission.id));
  listener({ type: 'mission-completed', id: mission.id });
  assert.equal(bridge.progress.state('enemy:boss').discovered, true); assert.equal(bridge.progress.state('map:twinpass').unlocked, true);
  assert.deepEqual(store.current().completed, ['core-mission']); detach(); assert.equal(listener, null);
});

test('completed cinematic port enables archive replay using the shared watched field', async () => {
  const ns = load(), seed = clone(ns.codex.chronicleSeed[0]); seed.cinematicId = 'archive-clip';
  const bridge = new ns.codex.StoryCodexBridge({ storage: storage(), seeds: [seed] });
  const catalog = new ns.codex.CodexCatalog({ chronicles: [seed], chronicleProgress: bridge.chronicleProgress, cinematicProgress: id => ({ unlocked: bridge.save.data.unlockedCinematics.includes(id), watched: bridge.save.data.watchedCinematics.includes(id) }) });
  const entry = () => catalog.query(bridge.progress, { type: 'chronicle' })[0];
  let played = 0;
  const integration = new ns.codex.CodexIntegration(bridge.progress, { progression: bridge, player: { async play() { played++; return { watched: true }; } } });
  bridge.apply([{ action: 'unlockCinematic', cinematicId: 'archive-clip' }]);
  assert.equal((await integration.replay(entry())).ok, false); assert.equal(played, 0);
  bridge.handleStoryEvent({ type: 'cinematic-completed', id: 'archive-clip' });
  assert.equal(entry().discoveryState.watched, true); assert.equal((await integration.replay(entry())).ok, true); assert.equal(played, 1);
  assert.throws(() => bridge.apply([{ action: 'unlockCinematic', cinematicId: 'bad.id' }]));
  assert.throws(() => bridge.apply([{ action: 'unlockHero', entryId: 'hero:unapproved' }]));
});
