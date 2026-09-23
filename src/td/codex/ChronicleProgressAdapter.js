(function (ns) {
  'use strict';
  const valid = value => typeof value === 'string' && /^[a-zA-Z0-9_.:-]{1,120}$/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
  const strings = value => Array.isArray(value) ? [...new Set(value.filter(valid))] : [];
  class ChronicleProgressAdapter {
    constructor(options = {}) {
      this.seeds = options.seeds || ns.codex.chronicleSeed || [];
      this.storage = options.storage === undefined ? (() => { try { return globalThis.localStorage; } catch (_) { return null; } })() : options.storage;
      this.key = options.key || 'heroFrontierChronicleV1';
      this.listeners = new Set(); this.warning = ''; this.readOnly = false;
      this.entries = Object.create(null); this.milestones = new Set();
      this.load(); this.sync();
    }
    load() {
      if (!this.storage) { this.warning = '編年史進度僅保留於本次瀏覽。'; return; }
      try {
        const raw = this.storage.getItem(this.key); if (!raw) return;
        const data = JSON.parse(raw);
        if (data.schema !== 1 || !Array.isArray(data.milestones) || !data.entries || typeof data.entries !== 'object' || Array.isArray(data.entries)) throw new Error('schema');
        this.milestones = new Set(strings(data.milestones));
        this.entries = Object.create(null);
        for (const [id, row] of Object.entries(data.entries)) if (valid(id) && row && typeof row === 'object') this.entries[id] = { acquired: strings(row.acquired), read: strings(row.read) };
      } catch (_) { this.readOnly = true; this.warning = '編年史存檔無法讀取或版本不相容；原檔保留，本次變更僅暫存。'; }
    }
    meets(requirement) {
      if (!requirement || requirement.blocked) return false;
      const all = requirement.allOf || [], any = requirement.anyOf || [];
      return all.every(id => this.milestones.has(id)) && (!any.length || any.some(id => this.milestones.has(id)));
    }
    sync() {
      let changed = false;
      for (const entry of this.seeds) {
        if (!this.meets(entry.requires) && !(this.entries[entry.id]?.acquired.length)) continue;
        const row = this.entries[entry.id] || { acquired: [], read: [] };
        for (const fragment of entry.fragments || []) if (this.meets(fragment.requires) && !row.acquired.includes(fragment.id)) { row.acquired.push(fragment.id); changed = true; }
        if (row.acquired.length) this.entries[entry.id] = row;
      }
      if (changed) this.persist();
      return changed;
    }
    ingest(event) {
      if (event?.type !== 'story-milestone' || !valid(event.id)) return false;
      // Do not guess chapter completion or silently accept misspelled integration IDs.
      const supported = this.seeds.some(entry => [entry.requires, ...(entry.fragments || []).map(row => row.requires)].some(rule => [...(rule?.allOf || []), ...(rule?.anyOf || [])].includes(event.id)));
      if (!supported) return false;
      if (this.milestones.has(event.id)) return true;
      this.milestones.add(event.id); this.sync(); this.persist(); this.listeners.forEach(fn => fn(event.id)); return true;
    }
    view(entry) {
      const row = this.entries[entry.id] || { acquired: [], read: [] };
      const fragments = (entry.fragments || []).filter(fragment => row.acquired.includes(fragment.id)).map(fragment => ({ ...fragment, isNew: !row.read.includes(fragment.id) }));
      const unseen = fragments.filter(fragment => fragment.isNew);
      const fullyKnown = fragments.length > 0 && fragments.length === (entry.fragments || []).length && !entry.archiveMayExpand && !entry.pendingFragments?.length;
      return { status: !fragments.length ? 'LOCKED' : unseen.length && row.read.length ? 'UPDATED' : fullyKnown ? 'COMPLETE' : 'DISCOVERED', fragments, discovered: fragments.length > 0, fullyKnown,
        updateLabel: unseen.length ? (row.read.length ? 'ARCHIVE UPDATED' : 'NEW INFORMATION') : '', unseen: unseen.length };
    }
    markRead(id, fragmentIds) {
      const row = this.entries[id]; if (!row) return false;
      const list = strings(fragmentIds).filter(fragment => row.acquired.includes(fragment));
      row.read = [...new Set([...row.read, ...list])]; this.persist(); this.listeners.forEach(fn => fn(id)); return true;
    }
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    snapshot() { return JSON.parse(JSON.stringify({ schema: 1, milestones: [...this.milestones], entries: this.entries })); }
    persist() {
      if (!this.storage || this.readOnly) return false;
      try { this.storage.setItem(this.key, JSON.stringify(this.snapshot())); this.warning = ''; return true; }
      catch (_) { this.warning = '編年史無法儲存，本次取得的史料仍可閱讀。'; return false; }
    }
  }
  ns.codex.ChronicleProgressAdapter = ChronicleProgressAdapter;
})(globalThis.TowerFrontier);
