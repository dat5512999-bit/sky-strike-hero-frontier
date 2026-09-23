(function (root) {
  'use strict';
  const api = (root.TowerFrontier ||= {}).cinematic ||= {};
  api.VERSION = '1.0.0';
  api.validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(id);
  api.safeAsset = value => {
    if (typeof value !== 'string' || !value.trim()) return false;
    if (/^assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.split('/').includes('..')) return true;
    try { return ['http:', 'https:', 'file:'].includes(new URL(value, root.location?.href || 'http://localhost/').protocol); }
    catch (_) { return false; }
  };
  class CinematicCatalog {
    constructor(entries = []) {
      this.entries = new Map();
      for (const entry of entries) {
        if (!api.validId(entry.cinematicId) || this.entries.has(entry.cinematicId)) throw new Error('影片代號無效或重複。');
        if (entry.videoAsset !== null && !api.safeAsset(entry.videoAsset)) throw new Error('影片資產網址無效。');
        if (!Number.isFinite(entry.duration) || entry.duration <= 0) throw new Error('影片長度必須大於零。');
        const tracks = entry.subtitleTracks || [];
        if (!Array.isArray(tracks) || tracks.some(t => !['zh-TW', 'en', 'ja'].includes(t.language) || !api.safeAsset(t.src)) || new Set(tracks.map(t => t.language)).size !== tracks.length) throw new Error('字幕軌設定無效。');
        this.entries.set(entry.cinematicId, Object.freeze({ ...entry, subtitleTracks: Object.freeze(tracks.map(t => Object.freeze({ ...t }))) }));
      }
    }
    get(id) { return this.entries.get(id) || null; }
    list() { return [...this.entries.values()]; }
  }
  api.CinematicCatalog = CinematicCatalog;
  api.placeholderData = [{
    cinematicId: 'placeholder-v1', title: '播放功能測試',
    videoAsset: 'assets/cinematics/placeholder.webm', duration: 6,
    subtitleTracks: [
      { language: 'zh-TW', label: '繁體中文', src: 'assets/cinematics/subtitles/placeholder.zh-TW.vtt' },
      { language: 'en', label: 'English', src: 'assets/cinematics/subtitles/placeholder.en.vtt' },
      { language: 'ja', label: '日本語', src: 'assets/cinematics/subtitles/placeholder.ja.vtt' }
    ], chapter: null, unlockCondition: null, placeholder: true
  }];
})(globalThis);
