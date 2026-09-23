(function (ns) {
  'use strict';
  const KEY = 'heroFrontierCodexV1';
  const flags = ['encountered', 'discovered', 'unlocked', 'fullyKnown', 'watched', 'favorite'];
  const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(id);
  function storage() { try { return globalThis.localStorage; } catch (_) { return null; } }
  class CodexProgressAdapter {
    constructor(options = {}) {
      this.storage = options.storage === undefined ? storage() : options.storage;
      this.key = options.key || KEY;
      this.entries = Object.create(null);
      this.listeners = new Set();
      this.warning = '';
      this.readOnly = false;
      this.load();
    }
    load() {
      if (!this.storage) { this.warning = '目前進度僅保留於本次瀏覽。'; return; }
      try {
        const raw = this.storage.getItem(this.key);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.schema !== 1 || !data.entries || typeof data.entries !== 'object' || Array.isArray(data.entries)) {
          this.readOnly = true;
          this.warning = '收藏檔版本不相容，原檔已保留；本次變更僅暫存。';
          return;
        }
        for (const [id, value] of Object.entries(data.entries)) {
          if (validId(id) && value && typeof value === 'object') {
            this.entries[id] = { ...Object.fromEntries(flags.map(flag => [flag, value[flag] === true])), revision: Number.isSafeInteger(value.revision) && value.revision > 0 ? value.revision : 0, readRevision: Number.isSafeInteger(value.readRevision) && value.readRevision > 0 ? value.readRevision : 0 };
          }
        }
      } catch (_) { this.readOnly = true; this.warning = '收藏檔無法讀取，原檔已保留；本次變更僅暫存。'; }
    }
    state(id, defaults = {}) {
      const saved = this.entries[id] || {};
      return Object.fromEntries(flags.map(flag => [flag, flag === 'favorite' ? saved[flag] === true : saved[flag] === true || defaults[flag] === true]));
    }
    update(id, patch) {
      if (!validId(id)) return false;
      const next = { ...(this.entries[id] || {}) };
      for (const flag of flags) {
        if (typeof patch[flag] === 'boolean') next[flag] = flag === 'favorite' ? patch[flag] : next[flag] === true || patch[flag];
      }
      const before = this.entries[id] || {};
      if (flags.some(flag => flag !== 'favorite' && next[flag] && !before[flag])) next.revision = (before.revision || 0) + 1;
      // Discovery is monotonic and includes the preceding levels.
      if (next.fullyKnown || next.unlocked) next.discovered = true;
      if (next.discovered) next.encountered = true;
      this.entries[id] = next;
      this.persist();
      this.listeners.forEach(fn => fn(id));
      return true;
    }
    isUnread(id) { const row = this.entries[id]; return Boolean(row && (row.revision || 0) > (row.readRevision || 0)); }
    markRead(id) {
      if (!this.entries[id] || !this.isUnread(id)) return false;
      this.entries[id].readRevision = this.entries[id].revision; this.persist(); this.listeners.forEach(fn => fn(id)); return true;
    }
    persist() {
      if (!this.storage || this.readOnly) return false;
      try { this.storage.setItem(this.key, JSON.stringify(this.snapshot())); this.warning = ''; return true; }
      catch (_) { this.warning = '無法儲存收藏，請確認瀏覽器儲存空間；本次變更仍可使用。'; return false; }
    }
    snapshot() { return JSON.parse(JSON.stringify({ schema: 1, entries: this.entries })); }
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    ingest(event) {
      const changes = {
        encountered: { encountered: true }, discovered: { discovered: true }, unlocked: { unlocked: true },
        'fully-known': { fullyKnown: true },
        'cinematic-watched': { encountered: true, discovered: true, unlocked: true, watched: true }
      };
      if (!event || !changes[event.type]) return false;
      if (event.type === 'cinematic-watched' && !String(event.id).startsWith('chronicle:')) return false;
      return this.update(event.id, changes[event.type]);
    }
  }
  CodexProgressAdapter.KEY = KEY;
  ns.codex = ns.codex || {};
  ns.codex.CodexProgressAdapter = CodexProgressAdapter;
})(globalThis.TowerFrontier);
