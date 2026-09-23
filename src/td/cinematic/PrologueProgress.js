(function (ns) {
  'use strict';
  const api = ns.cinematic;
  class PrologueProgress {
    constructor(store) { this.store = store; }
    get prologueSeen() { return this.store.current().cinematics.includes('cinematic:' + api.prologue.cinematicId); }
    identity() { const p = this.store.current(); return [p.id, p.round, p.startedAt].join(':'); }
    complete(result, identity = this.identity()) {
      if (identity !== this.identity()) throw new Error('玩家或測試輪次已切換，請回到故事選單。');
      if (result.cinematicId !== api.prologue.cinematicId || !result.watched || !['ended', 'skipped'].includes(result.reason)) return false;
      if (this.prologueSeen) return true;
      // Use the existing Codex envelope, with one atomic ProfileStore commit.
      const save = new ns.codex.CodexSaveBridge({ profileStore: this.store, storage: null });
      const next = save.snapshot();
      const memory = { getItem: key => JSON.stringify(next[key]), setItem: (key, value) => { next[key] = JSON.parse(value); } };
      const chronicle = new ns.codex.ChronicleProgressAdapter({ storage: memory, key: 'chronicle', seeds: [api.prologueChronicle] });
      chronicle.ingest({ type: 'story-milestone', id: 'prologue.experienced' });
      for (const key of ['unlockedCinematics', 'watchedCinematics']) {
        if (!next[key].includes(result.cinematicId)) next[key].push(result.cinematicId);
      }
      const id = 'cinematic:' + result.cinematicId;
      next.codex.entries[id] = { ...next.codex.entries[id], unlocked: true, watched: true };
      const receipt = 'cinematic-experienced:' + result.cinematicId;
      if (!next.receipts.includes(receipt)) next.receipts.push(receipt);
      save.commit(next);
      return true;
    }
    state(id) { const watched = id === api.prologue.cinematicId && this.prologueSeen; return { unlocked: watched, watched }; }
    replay(id, player) {
      if (!this.state(id).unlocked) return Promise.resolve({ cinematicId: id, watched: false, reason: 'locked' });
      // Replay is deliberately read-only, including Skip.
      return player.play(id, { replay: true });
    }
  }
  api.PrologueProgress = PrologueProgress;
})(globalThis.TowerFrontier);
