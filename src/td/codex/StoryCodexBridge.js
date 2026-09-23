(function (ns) {
  'use strict';
  const valid = value => typeof value === 'string' && /^[a-zA-Z0-9_.:-]{1,120}$/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
  const transitions = { encounterEntry: 'encountered', discoverEntry: 'discovered', unlockEntry: 'unlocked', fullyKnowEntry: 'fullyKnown', unlockHero: 'unlocked', unlockFaction: 'unlocked', unlockMap: 'unlocked' };
  class StoryCodexBridge {
    constructor(options = {}) {
      this.save = options.save || new ns.codex.CodexSaveBridge(options);
      this.mapping = options.mapping || ns.codex.storyCodexMapping;
      this.getMission = options.getMission || (() => null);
      this.completedMissionIds = options.completedMissionIds || null;
      this.seeds = options.seeds || ns.codex.chronicleSeed;
      this.entryIds = options.entryIds || new Set([
        ...Object.keys(ns.entities.Monster?.TYPES || {}).map(id => 'enemy:' + id),
        ...Object.keys(ns.systems.HeroRoster?.CLASSES || {}).map(id => 'hero:' + id),
        ...Object.keys(ns.systems.FactionSystem?.FACTIONS || {}).map(id => 'faction:' + id),
        ...Object.keys(ns.config?.units || {}).filter(id => !ns.config.units[id].enemyOnly).map(id => 'unit:' + id),
        ...Object.keys(ns.config?.buildings || {}).map(id => 'tower:' + id),
        ...Object.keys(ns.maps?.definitions || {}).map(id => 'map:' + id),
        ...Object.keys(ns.systems.ArmorySystem?.ITEMS || {}).map(id => 'equipment:' + id),
        ...Object.values(ns.systems.EquipmentSystem?.WEAPONS || {}).flat().map(row => 'equipment:' + row.id),
        ...this.seeds.map(row => 'chronicle:' + row.id)
      ]);
      this.progress = new ns.codex.CodexProgressAdapter({ storage: this.save, key: 'codex' });
      this.chronicleProgress = new ns.codex.ChronicleProgressAdapter({ storage: this.save, key: 'chronicle', seeds: this.seeds });
      this.pendingBattle = new Set();
    }
    refresh() {
      this.progress.entries = Object.create(null); this.progress.load();
      this.chronicleProgress.entries = Object.create(null); this.chronicleProgress.load();
      this.progress.listeners.forEach(fn => fn()); this.chronicleProgress.listeners.forEach(fn => fn());
    }
    apply(actions, receipt) {
      if (!Array.isArray(actions) || (receipt && !valid(receipt))) throw new Error('無效的圖鑑事件。');
      const next = this.save.snapshot();
      if (receipt && next.receipts.includes(receipt)) return { changed: [], duplicate: true };
      const memory = { getItem: key => JSON.stringify(next[key]), setItem: (key, value) => { next[key] = JSON.parse(value); } };
      const progress = new ns.codex.CodexProgressAdapter({ storage: memory, key: 'codex' });
      const archive = new ns.codex.ChronicleProgressAdapter({ storage: memory, key: 'chronicle', seeds: this.seeds });
      const changed = new Set();
      for (const action of actions) {
        const id = action.entryId;
        if (['unlockChronicle', 'updateChronicle'].includes(action.action)) {
          const seed = this.seeds.find(row => 'chronicle:' + row.id === id);
          if (!seed || !seed.fragments.some(row => [...(row.requires?.allOf || []), ...(row.requires?.anyOf || [])].includes(action.milestone))) throw new Error('此史料階段尚未定義。');
          const before = JSON.stringify(archive.view(seed));
          if (!archive.ingest({ type: 'story-milestone', id: action.milestone })) throw new Error('未知的史料事件。');
          if (before !== JSON.stringify(archive.view(seed))) changed.add(id);
        } else if (action.action === 'unlockCinematic') {
          if (!valid(action.cinematicId) || !/^[a-zA-Z0-9_-]+$/.test(action.cinematicId)) throw new Error('無效的影片代號。');
          if (!next.unlockedCinematics.includes(action.cinematicId)) { next.unlockedCinematics.push(action.cinematicId); progress.update('cinematic:' + action.cinematicId, { unlocked: true }); changed.add('cinematic:' + action.cinematicId); }
        } else {
          const flag = transitions[action.action];
          if (!flag || !/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(id || '') || (this.entryIds && !this.entryIds.has(id))) throw new Error('未知的圖鑑項目或事件。');
          if (id.startsWith('chronicle:')) throw new Error('編年史請使用對應的史料階段事件。');
          const expected = { unlockHero: 'hero:', unlockFaction: 'faction:', unlockMap: 'map:' }[action.action];
          if (expected && !id.startsWith(expected)) throw new Error('解鎖項目類型不符。');
          if (!progress.state(id)[flag]) { progress.update(id, { [flag]: true }); changed.add(id); }
        }
      }
      if (receipt) next.receipts.push(receipt);
      this.save.commit(next); this.refresh();
      return { changed: [...changed], duplicate: false };
    }
    dispatch(event) {
      if (!event || !valid(event.id)) return { changed: [], ignored: true };
      const actions = Object.hasOwn(this.mapping.events, event.id) ? this.mapping.events[event.id] : null;
      if (!actions) return { changed: [], ignored: true };
      return this.apply(actions, 'event:' + event.id);
    }
    completeChapter(id) {
      const chapter = Object.hasOwn(this.mapping.chapters, id) && this.mapping.chapters[id];
      if (!chapter?.ready || !chapter.requiredMissionIds?.length) throw new Error('章節條件尚待 Story Data 接入。');
      const completed = this.save.profileStore?.current().completed || this.completedMissionIds?.() || [];
      if (!chapter.requiredMissionIds.every(mission => completed.includes(mission))) throw new Error('章節任務尚未全部完成。');
      return this.apply(chapter.rewards, 'chapter:' + id);
    }
    handleStoryEvent(event) {
      if (!event || !valid(event.id)) return { changed: [], ignored: true };
      if (event.type === 'chapter-completed') return this.completeChapter(event.id);
      if (event.type === 'cinematic-completed') return this.markCinematicWatched(event.id);
      if (event.type === 'mission-completed') {
        const mission = this.getMission(event.id);
        const completed = this.save.profileStore?.current().completed || this.completedMissionIds?.() || [];
        if (!mission || !completed.includes(event.id)) throw new Error('Story Core 尚未確認任務完成。');
        const actions = [...(this.mapping.events['mission-completed:' + event.id] || [])];
        // Rewards come from Story Data. This adapter never completes missions or edits Story UI.
        for (const [kind, action] of [['heroes', 'unlockHero'], ['factions', 'unlockFaction'], ['maps', 'unlockMap']]) {
          const prefix = { heroes: 'hero:', factions: 'faction:', maps: 'map:' }[kind];
          for (const id of mission.rewards?.[kind] || []) actions.push({ action, entryId: prefix + id });
        }
        for (const id of mission.discovered || []) if (this.entryIds?.has(id)) actions.push({ action: 'discoverEntry', entryId: id });
        return this.apply(actions, 'mission:' + event.id);
      }
      return this.dispatch(event.type === 'mission-started' ? { id: 'mission-started:' + event.id } : event);
    }
    bindStoryCore(source) {
      if (typeof source?.subscribe !== 'function') throw new Error('Story Core 必須提供 subscribe(listener)。');
      return source.subscribe(event => this.handleStoryEvent(event));
    }
    encounter(type, key) {
      if (!['enemy', 'unit'].includes(type) || this.progress.state(type + ':' + key).encountered) return false;
      const result = this.apply([{ action: 'encounterEntry', entryId: type + ':' + key }]);
      result.changed.forEach(id => this.pendingBattle.add(id)); return result.changed.length > 0;
    }
    beginBattle() { this.pendingBattle.clear(); }
    endBattle() { const result = [...this.pendingBattle]; this.pendingBattle.clear(); return { label: 'NEW CODEX ENTRY', entries: result }; }
    markCinematicWatched(id) {
      const next = this.save.snapshot();
      if (!next.unlockedCinematics.includes(id)) return false;
      if (!next.watchedCinematics.includes(id)) next.watchedCinematics.push(id);
      this.save.commit(next); this.refresh(); this.progress.markRead('cinematic:' + id); return true;
    }
    unread() {
      return [...Object.keys(this.progress.entries).filter(id => this.progress.isUnread(id)), ...this.seeds.filter(seed => this.chronicleProgress.view(seed).unseen).map(seed => 'chronicle:' + seed.id)];
    }
    connect(target = globalThis) {
      const receive = event => { try { this.handleStoryEvent(event.detail); } catch (error) { this.onError?.(error); } };
      target.addEventListener('hero-frontier:story', receive);
      return () => target.removeEventListener('hero-frontier:story', receive);
    }
  }
  ns.codex.StoryCodexBridge = StoryCodexBridge;
})(globalThis.TowerFrontier);
