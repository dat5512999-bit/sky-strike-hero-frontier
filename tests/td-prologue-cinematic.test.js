'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), crypto = require('node:crypto');
const { load } = require('./helpers/td-runtime.cjs');
const storage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };
const plain = value => JSON.parse(JSON.stringify(value));
function setup() { const { ns } = load(), disk = storage(), store = new ns.systems.ProfileStore(disk); return { ns, api: ns.cinematic, disk, store, progress: new ns.cinematic.PrologueProgress(store) }; }
const result = (api, reason = 'ended') => ({ cinematicId: api.prologue.cinematicId, watched: true, reason });

test('prologue contains exactly ten contiguous shots and the requested asset slots', () => {
  const { api } = setup(), p = api.prologue;
  assert.equal(p.cinematicId, 'prologue_before_shattered_peace'); assert.equal(p.title, '《曾經的和平》');
  assert.deepEqual(plain(p.shots.map(s => [s.start, s.end])), [[0,6],[6,14],[14,23],[23,31],[31,38],[38,44],[44,48],[48,53],[53,58],[58,60]]);
  assert.equal(new Set(p.shots.map(s => s.imageAsset)).size, 10);
  assert.ok(p.shots.every(s => s.imageAsset.startsWith('assets/cinematics/prologue/shot_')));
  assert.equal(p.status, 'key-art-storyboard');
  assert.ok(p.shots.every(shot => typeof shot.narration === 'string' && shot.narration.trim()), 'every key frame has visible short narration');
  for (const asset of p.shots.map(s => s.imageAsset)) {
    assert.ok(fs.existsSync(asset), asset);
    assert.ok(fs.statSync(asset).size > 100000, asset + ' must be a real storyboard key frame');
  }
  assert.equal(p.videoAsset, 'assets/cinematics/prologue/prologue_zh_tw.mp4');
  assert.ok(Object.isFrozen(p.shots[0]));
  assert.deepEqual(JSON.parse(fs.readFileSync('assets/cinematics/prologue/manifest.json', 'utf8')), plain(p));
});
test('character and location references reserve continuity without inventing appearances', () => {
  const { api } = setup(), p = api.prologue;
  assert.equal(p.characters.length, 6); assert.equal(p.locations.length, 4);
  for (const row of [...p.characters, ...p.locations]) {
    assert.equal(row.status, 'pending-approval'); assert.equal(row.referenceAsset, null);
    assert.ok(Object.values(row.continuity).every(value => value === null));
  }
  for (const shot of p.shots) {
    assert.ok(shot.characterRefs.every(id => p.characters.some(c => c.id === id)));
    assert.ok(shot.locationRefs.every(id => p.locations.some(l => l.id === id)));
  }
  assert.deepEqual(plain(p.shots[4].characterRefs), []);
  assert.ok(!p.shots.some(s => s.characterRefs.includes('chancellor') || s.characterRefs.includes('king')));
});
test('subtitle slots contain only supplied concept lines; untranslated tracks stay pending', () => {
  const { api } = setup(), subtitles = api.prologue.subtitles;
  assert.deepEqual(plain(subtitles.tracks.map(t => t.language)), ['zh-TW', 'en', 'ja']);
  for (const track of subtitles.tracks) assert.match(fs.readFileSync(track.src, 'utf8'), /^WEBVTT/);
  assert.equal(subtitles.cues.length, 2);
  assert.ok(subtitles.cues.every(c => c.start >= 0 && c.end <= 60 && c.start < c.end));
  assert.ok(subtitles.tracks.slice(1).every(t => t.status === 'pending-translation'));
});
for (const reason of ['ended', 'skipped']) test(reason + ' atomically collects prologue without completing missions or unlocking factions', () => {
  const { api, store, progress, disk } = setup(); store.newRound();
  const before = store.current(); let writes = 0; const set = disk.setItem; disk.setItem = (...args) => { writes++; set(...args); };
  assert.equal(progress.complete(result(api, reason)), true); assert.equal(writes, 1);
  assert.equal(progress.prologueSeen, true);
  const after = store.current();
  for (const key of ['completed', 'encountered', 'discovered', 'unlocks', 'wallet', 'lastRun']) assert.deepEqual(after[key], before[key]);
  const envelope = after.data.codexProgression;
  assert.deepEqual(plain(envelope.chronicle.milestones), ['prologue.experienced']);
  assert.deepEqual(plain(envelope.unlockedCinematics), [api.prologue.cinematicId]);
  assert.equal(envelope.chronicle.entries[api.prologue.cinematicId].acquired[0], 'story-experience');
  assert.equal(progress.complete(result(api, reason)), true); assert.equal(writes, 1);
});
test('save failure retains original data and permits retry without replaying', () => {
  const { api, store, disk, progress } = setup(), before = store.export(), set = disk.setItem;
  disk.setItem = () => { throw Error('quota'); };
  assert.throws(() => progress.complete(result(api, 'skipped')), /quota/);
  assert.equal(store.export(), before); assert.equal(progress.prologueSeen, false);
  disk.setItem = set; assert.equal(progress.complete(result(api, 'skipped')), true);
});
test('unrelated Codex milestones and favorites survive prologue collection', () => {
  const { ns, api, store, progress } = setup();
  const bridge = new ns.codex.CodexSaveBridge({ profileStore: store, storage: null }), data = bridge.snapshot();
  data.chronicle.milestones.push('existing.history'); data.codex.entries['hero:hunter'] = { favorite: true }; bridge.commit(data);
  progress.complete(result(api));
  assert.deepEqual(plain(store.current().data.codexProgression.chronicle.milestones), ['existing.history', 'prologue.experienced']);
  assert.equal(store.current().data.codexProgression.codex.entries['hero:hunter'].favorite, true);
});
test('reload, export/import and profile rounds retain independent seen state', () => {
  const { ns, api, store, progress, disk } = setup(); progress.complete(result(api)); store.newRound();
  assert.equal(progress.prologueSeen, false); progress.complete(result(api, 'skipped')); store.newRound();
  assert.equal(progress.prologueSeen, false); store.restoreRound(1); assert.equal(progress.prologueSeen, true);
  const reloaded = new ns.systems.ProfileStore(disk); assert.equal(new api.PrologueProgress(reloaded).prologueSeen, true);
  const imported = new ns.systems.ProfileStore(storage()); imported.import(store.export());
  assert.equal(new api.PrologueProgress(imported).prologueSeen, true);
  imported.switchTo('admin'); assert.equal(new api.PrologueProgress(imported).prologueSeen, false);
});
test('completion rejects abandoned, unknown, and switched-profile sessions', () => {
  const { api, store, progress } = setup(), identity = progress.identity();
  assert.equal(progress.complete({ ...result(api), reason: 'busy' }), false);
  assert.equal(progress.complete({ ...result(api), cinematicId: 'unknown' }), false);
  store.newRound(); assert.throws(() => progress.complete(result(api), identity), /已切換/);
  const roundIdentity = progress.identity(); store.newRound(); assert.throws(() => progress.complete(result(api), roundIdentity), /已切換/);
});
test('Chronicle replay is locked until experienced, then remains completely read-only', async () => {
  const { api, store, progress } = setup(); let calls = 0;
  const player = { play: async () => { calls++; return result(api, 'skipped'); } };
  assert.equal((await progress.replay(api.prologue.cinematicId, player)).reason, 'locked'); assert.equal(calls, 0);
  progress.complete(result(api)); const before = store.export(); await progress.replay(api.prologue.cinematicId, player);
  assert.equal(calls, 1); assert.equal(store.export(), before);
});
test('Story entry plays prologue once, then offers three cards before battle', async () => {
  const { ns, api, store } = setup(), app = Object.create(ns.systems.FrontierApp.prototype);
  let plays = 0, launches = 0; Object.assign(app, { store, root:{querySelector(){return null;}}, cinematicPlayer: { play: async () => { plays++; return result(api, 'skipped'); } }, run: fn => fn(), show(page) { this.page = page; }, render() {}, launchStory() { launches++; } });
  await app.startCinematic(); assert.equal(app.page, 'chapter-start'); assert.equal(launches, 0); assert.equal(plays, 1);
  app.act('chapter-battle'); assert.equal(app.page, 'story-cards'); assert.equal(launches, 0);
  assert.match(app.renderStoryCards(), /邊境烽火亮起/);
  app.act('story-card-next'); assert.match(app.renderStoryCards(), /對面也是王國士兵/);
  app.act('story-card-next'); assert.match(app.renderStoryCards(), /查清命令從何而來/);
  app.act('story-card-next'); assert.equal(launches, 1);
  await app.startCinematic(); assert.equal(plays, 1); assert.equal(app.page, 'story-cards'); assert.equal(launches, 1);
  app.act('story-card-skip'); assert.equal(launches, 2);
  const beforeCards = store.export(); app.act('story-card-replay'); assert.equal(app.page, 'story-cards');
  app.act('story-card-skip'); assert.equal(app.page, 'story'); assert.equal(launches, 2); assert.equal(store.export(), beforeCards);
  app.replayOnly = true; const before = store.export(); await app.startCinematic();
  assert.equal(plays, 2); assert.equal(launches, 2); assert.equal(store.export(), before);
});
test('first mission story cards use the current continuity-approved Chapter I key art', () => {
  const catalog = setup().ns.systems.StoryCatalog.mission;
  assert.deepEqual(plain(catalog.storyCards.map(card => card.image)), [
    'assets/td/story/kingdom-border-at-dusk-v2.png',
    'assets/td/story/rhen-oathkeeper-v2.png',
    'assets/td/story/kingdom-checkpoint-order-v2.png'
  ]);
  for (const file of [...catalog.storyCards.map(card => card.image), 'assets/td/story/chapter1-hero-continuity-v1.png']) {
    assert.ok(fs.existsSync(file), file);
    assert.ok(fs.statSync(file).size > 100000, file + ' must be a real key-art asset');
  }
  const continuity = fs.readFileSync('docs/STORY_CHARACTER_CONTINUITY_V1.md', 'utf8');
  for (const source of ['hero-hunter-selection-v1.png', 'hero-arcanist-selection-v1.png', 'hero-rogue-selection-v1.png', 'hero-chief-selection-v2.png']) assert.ok(continuity.includes(source), source);
});
test('every playable Chapter I mission has three original story cards and a spoiler-safe aftermath beat', () => {
  const missions = setup().ns.systems.StoryCatalog.missions.filter(mission => mission.chapter === 1);
  assert.equal(missions.length, 4);
  for (const mission of missions) {
    assert.equal(mission.storyCards.length, 3, mission.id);
    assert.match(mission.aftermath, /.+/, mission.id + ' aftermath');
    for (const card of mission.storyCards) {
      assert.ok(fs.existsSync(card.image), card.image);
      assert.ok(fs.statSync(card.image).size > 100000, card.image + ' must be a real story key-art asset');
    }
  }
  assert.match(missions[1].aftermath, /不足以判定王子之死/);
  assert.match(missions[2].aftermath, /沒有證明現代暮影/);
  assert.match(missions[3].aftermath, /不受禁衛軍管轄/);
});
test('story cards launch and replay the selected mission rather than always returning to the first mission', () => {
  const { ns, store } = setup(), app = Object.create(ns.systems.FrontierApp.prototype), selected = ns.systems.StoryCatalog.getMission('chapter1-shadowfall');
  Object.assign(app, { store, root: { querySelector(){ return null; } }, show(page){ this.page = page; }, render(){}, launchStory(mission){ this.launched = mission; return true; } });
  app.act('story-battle', selected.id); assert.equal(app.storyCardMission, selected); assert.match(app.renderStoryCards(), /被懷疑的人們也在等答案/);
  app.act('story-card-next'); app.act('story-card-next'); app.act('story-card-next'); assert.equal(app.launched, selected);
  app.act('story-card-replay', selected.id); assert.equal(app.storyCardReplay, true); assert.match(app.renderStoryCards(), /舊城疑雲/);
  app.act('story-card-skip'); assert.equal(app.page, 'story');
});
test('Chapter II 2-1 is a three-card browseable preview and never launches a battle', () => {
  const { ns, store } = setup(), preview = ns.systems.StoryCatalog.chapter2Preview, app = Object.create(ns.systems.FrontierApp.prototype);
  Object.assign(app, { store, root: { querySelector(){ return null; } }, show(page){ this.page = page; }, render(){}, launchStory(){ throw Error('Chapter II preview must not launch a battle'); } });
  assert.equal(preview.id, 'chapter2-western-signal-preview'); assert.equal(preview.chapter, 2); assert.equal(preview.previewOnly, true); assert.equal(preview.storyCards.length, 3);
  for (const card of preview.storyCards) { assert.ok(fs.existsSync(card.image), card.image); assert.ok(fs.statSync(card.image).size > 100000, card.image); }
  app.act('story-card-replay', preview.id); assert.equal(app.page, 'story-cards'); assert.equal(app.storyCardReplay, true);
  assert.match(app.renderStoryCards(), /CHAPTER 2/); assert.match(app.renderStoryCards(), /西境風號/);
  app.act('story-card-next'); assert.match(app.renderStoryCards(), /不急著相信/);
  app.act('story-card-next'); assert.match(app.renderStoryCards(), /護送這條路/);
  app.act('story-card-next'); assert.equal(app.page, 'story');
  app.act('story-battle', preview.id); assert.equal(app.storyCardReplay, true); app.act('story-card-skip'); assert.equal(app.page, 'story');
});
test('Story adapter resolves missing/failed playback without multiple completion callbacks', async () => {
  const { api } = setup(); let completed = 0;
  const adapter = new api.CinematicStoryAdapter({ play: async () => { throw Error('media'); } });
  const answer = await adapter.trigger({ cinematicOnChapterStart: 'missing' }, 'cinematicOnChapterStart', { onComplete: () => completed++ });
  assert.equal(answer.reason, 'player-error'); assert.equal(completed, 1);
  await assert.rejects(adapter.trigger({}, 'invalid'), /未知/);
});
test('optional video is absent from service-worker install, while player, key frames and subtitles ship', () => {
  const { api } = setup(), worker = fs.readFileSync('sw.js', 'utf8');
  for (const file of [api.prologue.videoAsset, ...api.prologue.shots.map(s => s.imageAsset)]) assert.ok(!worker.includes("'./" + file + "'"));
  assert.ok(worker.includes('CinematicPlayer.js')); assert.ok(worker.includes('subtitles/zh-TW.vtt'));
  assert.match(worker, /headers\.has\('range'\)/);
});
test('World Story Bible remains byte-identical to the approved version', () => {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('docs/WORLD_STORY_BIBLE_V1.md')).digest('hex').toUpperCase(), 'E209A0BDA0E48AE7DBF92B030D242563503ED31928530BE51DB99D0CA665688C');
});
