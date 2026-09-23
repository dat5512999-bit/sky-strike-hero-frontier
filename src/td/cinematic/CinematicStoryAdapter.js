(function (api) {
  'use strict';
  const hooks = Object.freeze(['cinematicOnChapterStart', 'cinematicBeforeBattle', 'cinematicAfterBattle', 'cinematicOnChapterComplete']);
  class CinematicStoryAdapter {
    constructor(player) { this.player = player; }
    async trigger(storyData, hook, { onComplete, ...options } = {}) {
      if (!hooks.includes(hook)) throw new Error('未知的 Cinematic Story Hook。');
      const id = storyData?.[hook];
      let result;
      try {
        result = id ? await this.player.play(id, options) : { cinematicId: null, reason: 'not-configured', triggered: false, watched: false };
      } catch (_) {
        result = { cinematicId: id, reason: 'player-error', triggered: true, watched: false };
      }
      // The Story host continues from this single result, including Skip and missing assets.
      try { onComplete?.(result); } catch (_) { /* Promise must still settle if a host observer throws. */ }
      return result;
    }
  }
  CinematicStoryAdapter.HOOKS = hooks;
  api.CinematicStoryAdapter = CinematicStoryAdapter;
})(globalThis.TowerFrontier.cinematic);
