(function (ns) {
  'use strict';
  const STORAGE_KEY = 'sky-strike-skin';

  class SkinRegistry {
    constructor() {
      this.packs = new Map();
      this.selectedId = 'classic';
    }

    register(pack) {
      if (!pack || !pack.id || !pack.name || !pack.renderers) throw new Error('Invalid skin pack');
      this.packs.set(pack.id, Object.freeze(pack));
      return this;
    }

    all() { return Array.from(this.packs.values()); }
    get(id) { return this.packs.get(id) || this.packs.get('classic'); }
    current() { return this.get(this.selectedId); }

    select(id, persist) {
      if (!this.packs.has(id)) return false;
      this.selectedId = id;
      if (persist !== false) {
        try { globalThis.localStorage.setItem(STORAGE_KEY, id); } catch (_) { /* Storage may be disabled. */ }
      }
      return true;
    }

    restore() {
      try { this.select(globalThis.localStorage.getItem(STORAGE_KEY), false); } catch (_) { /* Use default. */ }
      return this.selectedId;
    }

    draw(kind, ctx, entity) {
      const renderer = this.current().renderers[kind] || this.get('classic').renderers[kind];
      renderer(ctx, entity);
    }
  }

  ns.skins = new SkinRegistry();
  ns.systems.SkinRegistry = SkinRegistry;
})(globalThis.SkyStrike);
