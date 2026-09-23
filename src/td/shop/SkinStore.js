(function (root) {
  'use strict';
  const schema = root.FrontierShop?.schema || require('./SkinSchema.js');
  const clone = value => JSON.parse(JSON.stringify(value));
  const slotKey = skin => skin.category + ':' + skin.targetId;
  // Adapter contract: load(): Promise<State>; commit(next, expectedRevision): Promise<void>.
  // commit must atomically compare revision and persist the entire state, or reject without writing.
  class MemorySkinAdapter {
    constructor(seed = { version: 1, revision: 0, balance: 5230, ownedSkins: [], equippedSkins: {} }) { this.state = clone(seed); }
    async load() { return clone(this.state); }
    async commit(next, expectedRevision) {
      if (this.state.revision !== expectedRevision) throw new Error('外觀資料已更新，請重新開啟商城後再試。');
      this.state = clone(next);
    }
  }
  class SkinStore {
    constructor(catalog, adapter) { this.catalog = schema.catalog(catalog); this.adapter = adapter; this.state = null; this.busy = false; }
    async init() { const state = await this.adapter.load(); this.validateState(state); this.state = clone(state); return this; }
    validateState(s) {
      const fail = () => { throw new Error('外觀存檔無法讀取；請保留原始資料並檢查 Adapter。'); };
      if (!s || Object.keys(s).some(k => !['version', 'revision', 'balance', 'ownedSkins', 'equippedSkins'].includes(k)) || s.version !== 1 || !Number.isSafeInteger(s.revision) || s.revision < 0 || !Number.isSafeInteger(s.balance) || s.balance < 0 || !Array.isArray(s.ownedSkins) || !s.equippedSkins || typeof s.equippedSkins !== 'object' || Array.isArray(s.equippedSkins)) fail();
      if (new Set(s.ownedSkins).size !== s.ownedSkins.length || s.ownedSkins.some(id => !this.catalog.some(skin => skin.id === id && skin.availability.status === 'available'))) fail();
      for (const [key, id] of Object.entries(s.equippedSkins)) { const skin = this.catalog.find(item => item.id === id); if (!skin || !s.ownedSkins.includes(id) || slotKey(skin) !== key) fail(); }
    }
    snapshot() { if (!this.state) throw new Error('商城尚未準備完成。'); return clone(this.state); }
    get(id) { const skin = this.catalog.find(item => item.id === id); if (!skin) throw new Error('找不到此外觀。'); return skin; }
    status(id) { const skin = this.get(id), state = this.snapshot(); return skin.availability.status === 'locked' ? 'locked' : state.equippedSkins[slotKey(skin)] === id ? 'equipped' : state.ownedSkins.includes(id) ? 'owned' : 'available'; }
    async change(action) {
      if (this.busy) throw new Error('正在處理，請稍候。');
      this.busy = true;
      try { const previous = this.snapshot(), next = clone(previous); action(next); next.revision++; this.validateState(next); await this.adapter.commit(next, previous.revision); this.state = next; return this.snapshot(); }
      finally { this.busy = false; }
    }
    buy(id) {
      return this.change(state => {
        const skin = this.get(id);
        if (skin.availability.status === 'locked') throw new Error(skin.availability.reason);
        if (state.ownedSkins.includes(id)) throw new Error('你已擁有此外觀，不需要重複購買。');
        if (state.balance < skin.price.amount) throw new Error('試用水晶不足，無法購買此外觀。');
        state.balance -= skin.price.amount; state.ownedSkins.push(id);
      });
    }
    equip(id) { return this.change(state => { const skin = this.get(id); if (!state.ownedSkins.includes(id) || skin.availability.status === 'locked') throw new Error('請先擁有此外觀。'); state.equippedSkins[slotKey(skin)] = id; }); }
    unequip(id) { return this.change(state => { const skin = this.get(id); if (state.equippedSkins[slotKey(skin)] !== id) throw new Error('此外觀尚未裝備。'); delete state.equippedSkins[slotKey(skin)]; }); }
    // The caller may apply these cosmetic-only slots to rendering; gameplay stats remain separate.
    appearance(category, targetId, base = {}) {
      const allowed = schema.slots[category];
      if (!allowed) throw new Error('未知的外觀分類。');
      const selected = this.state.equippedSkins[category + ':' + targetId];
      const overrides = selected ? this.get(selected).slots : {};
      const result = {};
      for (const key of allowed) { const value = overrides[key] || base[key]; if (value) result[key] = clone(value); }
      return result;
    }
  }
  const api = { MemorySkinAdapter, SkinStore, slotKey };
  root.FrontierShop = Object.assign(root.FrontierShop || {}, api);
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
