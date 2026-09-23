(function (ns) {
  'use strict';
  class CodexIntegration {
    constructor(progress, options = {}) {
      this.progress = progress;
      this.storyBridge = options.progression || null;
      this.player = options.player || null;
      this.readOnlyReplay = options.readOnlyReplay === true;
      this.chronicleProgress = options.chronicleProgress || null;
      this.navigate = options.navigate || (() => { globalThis.location.href = 'td.html'; });
    }
    connect(target = globalThis) {
      const receive = event => this.progress.ingest(event.detail);
      const story = event => { try { if (this.storyBridge) this.storyBridge.handleStoryEvent(event.detail); else this.chronicleProgress?.ingest(event.detail); } catch (error) { this.storyBridge.onError?.(error); } };
      target.addEventListener('hero-frontier:codex', receive);
      target.addEventListener('hero-frontier:story', story);
      return () => { target.removeEventListener('hero-frontier:codex', receive); target.removeEventListener('hero-frontier:story', story); };
    }
    async replay(entry) {
      if (!entry?.cinematicId || !entry.discoveryState.unlocked) return { ok: false, message: '此回憶尚未解鎖。' };
      if (entry.archive && !entry.discoveryState.watched) return { ok: false, message: '在故事中看過這段影片後，即可回到圖鑑重播。' };
      if (!this.player?.play) return { ok: false, message: '影片回顧準備中，開放後即可在此重播。' };
      try {
        const result = await this.player.play(entry.cinematicId);
        if (result?.watched && !this.readOnlyReplay) {
          if (this.storyBridge?.save.data.unlockedCinematics.includes(entry.cinematicId)) this.storyBridge.markCinematicWatched(entry.cinematicId);
          else this.progress.ingest({ type: 'cinematic-watched', id: entry.id });
        }
        return { ok: true, message: this.readOnlyReplay ? '回顧結束，故事進度不變。' : result?.watched ? '已收錄看過的回憶。' : '影片尚未看完。' };
      } catch (_) { return { ok: false, message: '影片暫時無法播放，請稍後重試。' }; }
    }
    expedition(entry) {
      if (!entry?.discoveryState.unlocked || !['hero', 'map'].includes(entry.type)) return false;
      this.navigate({ entryId: entry.id, hero: entry.type === 'hero' ? entry.key : null, map: entry.type === 'map' ? entry.key : null });
      return true;
    }
    static mapProgress(report, id) {
      return { bestScore: report.bestForMap(id), completed: [...new Set(report.recordsForMap(id).filter(record => record.victory === true).map(record => record.difficultyName || record.difficulty))] };
    }
  }
  ns.codex.CodexIntegration = CodexIntegration;
})(globalThis.TowerFrontier);
