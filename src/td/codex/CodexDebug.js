(function (ns) {
  'use strict';
  // Only the dedicated development page loads this file; production HTML has no debug import.
  if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || !location.pathname.endsWith('/codex-dev.html')) return;
  const runtime = globalThis.HeroFrontierCodex?.progression;
  if (!runtime) return;
  const commands = {
    unlockChronicle: (entryId, milestone) => runtime.apply([{ action: 'unlockChronicle', entryId, milestone }]),
    updateChronicleStage: (entryId, milestone) => runtime.apply([{ action: 'updateChronicle', entryId, milestone }]),
    encounterEnemy: key => runtime.encounter('enemy', key),
    discoverEntry: entryId => runtime.apply([{ action: 'discoverEntry', entryId }]),
    unlockHero: key => runtime.apply([{ action: 'unlockHero', entryId: 'hero:' + key }]),
    unlockFaction: key => runtime.apply([{ action: 'unlockFaction', entryId: 'faction:' + key }]),
    completeChapter: id => {
      const chapter = Object.hasOwn(runtime.mapping.chapters, id) && runtime.mapping.chapters[id];
      if (!chapter?.rewards.length) throw new Error('此章節尚無可測試的獎勵資料。');
      // Development simulation: test the reward mapping without fabricating completed Story missions.
      return runtime.apply(chapter.rewards, 'debug-chapter:' + id);
    },
    resetCodexProgress: () => {
      const next = runtime.save.snapshot(); next.codex.entries = {}; next.chronicle = { schema: 1, entries: {}, milestones: [] }; next.receipts = []; next.unlockedCinematics = []; next.watchedCinematics = [];
      if (runtime.save.profileStore) {
        const store = runtime.save.profileStore;
        if (store.current().id !== runtime.save.profileId || store.current().kind !== 'test') throw new Error('請切換至測試回合後重新開啟開發圖鑑。');
        store.change(state => {
          const profile = state.profiles[runtime.save.profileId];
          profile.encountered = profile.encountered.filter(id => !runtime.entryIds.has(id.includes(':') ? id : 'enemy:' + id));
          profile.discovered = profile.discovered.filter(id => !runtime.entryIds.has(id));
          profile.cinematics = profile.cinematics.filter(id => !id.startsWith('cinematic:'));
          profile.data.codexProgression = next;
        });
        runtime.save.load(); // Existing Story completion and playable unlocks remain authoritative.
      } else runtime.save.commit(next);
      runtime.refresh(); runtime.chronicleProgress.sync(); runtime.refresh();
    }
  };
  globalThis.CodexDebug = Object.freeze(commands);
  const panel = document.createElement('details'); panel.className = 'codex-debug';
  const title = document.createElement('summary'); title.textContent = 'DEV · Story Unlock Commands';
  const text = document.createElement('pre'); text.textContent = 'Console: CodexDebug\n' + Object.keys(commands).join('\n') + '\ncompleteChapter 僅模擬資料中的章節獎勵，不改 Story 完成紀錄。\nProfile Reset 限測試回合，保留 Story 與可用角色。';
  panel.append(title, text); document.body.append(panel);
})(globalThis.TowerFrontier);
