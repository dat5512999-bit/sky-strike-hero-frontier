(function (ns) {
  'use strict';
  const KEY = 'heroFrontierProgressionV1', EXT = 'codexProgression';
  const clone = value => JSON.parse(JSON.stringify(value));
  const empty = () => ({ saveVersion: 1, codex: { schema: 1, entries: {} }, chronicle: { schema: 1, milestones: [], entries: {} }, receipts: [], unlockedCinematics: [], watchedCinematics: [] });
  const kinds = { hero: 'heroes', faction: 'factions', map: 'maps' };
  class CodexSaveBridge {
    constructor(options = {}) {
      this.profileStore = options.profileStore || null;
      this.storage = options.storage === undefined ? (() => { try { return globalThis.localStorage; } catch (_) { return null; } })() : options.storage;
      this.profileId = this.profileStore?.current().id;
      this.listeners = new Set(); this.warning = ''; this.readOnly = false;
      this.load();
    }
    load() {
      try {
        if (this.profileStore) this.data = this.fromProfile(this.profileStore.current());
        else {
          const raw = this.storage?.getItem(KEY);
          this.data = raw ? JSON.parse(raw) : empty();
          if (!raw) {
            // Legacy keys remain untouched as rollback backups; the envelope becomes the sole active save.
            const old = this.storage?.getItem('heroFrontierCodexV1');
            const lore = this.storage?.getItem('heroFrontierCodexV1:chronicle') || this.storage?.getItem('heroFrontierChronicleV1');
            if (old) this.data.codex = JSON.parse(old);
            if (lore) this.data.chronicle = JSON.parse(lore);
          }
        }
        this.validate(this.data);
        this.serialized = this.storage?.getItem(KEY) || null;
      } catch (_) { this.readOnly = true; this.warning = '進度版本不相容或已損毀；原存檔已保留，請先還原備份。'; this.data = empty(); }
    }
    validate(data) {
      if (data?.saveVersion !== 1 || data.codex?.schema !== 1 || data.chronicle?.schema !== 1 ||
        !data.codex.entries || typeof data.codex.entries !== 'object' || Array.isArray(data.codex.entries) ||
        !data.chronicle.entries || typeof data.chronicle.entries !== 'object' || Array.isArray(data.chronicle.entries) ||
        !['receipts', 'unlockedCinematics', 'watchedCinematics'].every(key => Array.isArray(data[key])) || !Array.isArray(data.chronicle.milestones)) throw new Error('Invalid Codex save');
    }
    fromProfile(profile) {
      const extension = profile.data[EXT];
      const data = extension ? clone(extension) : empty();
      this.validate(data);
      // Native fields stay authoritative; no second storyProgress, encountered or hero/faction unlock list.
      for (const id of profile.encountered || []) (data.codex.entries[id.includes(':') ? id : 'enemy:' + id] ||= {}).encountered = true;
      for (const id of profile.discovered || []) if (id.includes(':')) (data.codex.entries[id] ||= {}).discovered = true;
      for (const [type, kind] of Object.entries(kinds)) for (const id of profile.unlocks[kind] || []) (data.codex.entries[type + ':' + id] ||= {}).unlocked = true;
      data.watchedCinematics = (profile.cinematics || []).filter(id => id.startsWith('cinematic:')).map(id => id.slice(10));
      return data;
    }
    commit(next) {
      this.validate(next);
      if (this.readOnly) throw new Error(this.warning);
      if (this.profileStore) {
        if (this.profileStore.current().id !== this.profileId) throw new Error('存檔已切換，請重新開啟圖鑑。');
        this.profileStore.change(state => {
          const profile = state.profiles[this.profileId], extension = clone(next);
          for (const [id, row] of Object.entries(extension.codex.entries)) {
            const [type, key] = id.split(':');
            if (row.encountered) { const native = type === 'enemy' ? key : id; if (!profile.encountered.includes(native)) profile.encountered.push(native); }
            if (row.discovered && !profile.discovered.includes(id)) profile.discovered.push(id);
            if (row.unlocked && kinds[type] && !profile.unlocks[kinds[type]].includes(key)) profile.unlocks[kinds[type]].push(key);
            delete row.encountered; delete row.discovered;
            if (kinds[type]) delete row.unlocked;
          }
          for (const id of next.watchedCinematics) if (!profile.cinematics.includes('cinematic:' + id)) profile.cinematics.push('cinematic:' + id);
          extension.watchedCinematics = []; // Actual watched IDs use the existing cinematics field.
          profile.data[EXT] = extension;
        });
      } else if (this.storage) {
        if (this.storage.getItem(KEY) !== this.serialized) throw new Error('另一個分頁已更新進度，請重新載入後再試。');
        const serialized = JSON.stringify(next); this.storage.setItem(KEY, serialized); this.serialized = serialized;
      }
      this.data = clone(next); this.warning = this.storage || this.profileStore ? '' : '進度僅保留於本次瀏覽。';
      this.listeners.forEach(fn => fn());
    }
    getItem(key) { return JSON.stringify(this.data[key]); }
    setItem(key, value) {
      if (!['codex', 'chronicle'].includes(key)) throw new Error('Unknown save section');
      const next = clone(this.data); next[key] = JSON.parse(value); this.commit(next);
    }
    snapshot() { return clone(this.data); }
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  }
  CodexSaveBridge.KEY = KEY;
  ns.codex.CodexSaveBridge = CodexSaveBridge;
})(globalThis.TowerFrontier);
