(function (ns) {
  'use strict';
  class GameState {
    constructor() { this.reset(); }
    reset() { this.status = 'ready'; this.score = 0; this.elapsed = 0; }
    start() { this.status = 'playing'; this.elapsed = 0; }
    pause() { if (this.status === 'playing') this.status = 'paused'; }
    resume() { if (this.status === 'paused') this.status = 'playing'; }
    end() { this.status = 'gameover'; }
    addScore(value) { this.score += value; }
    update(dt) { if (this.status === 'playing') this.elapsed += dt; }
  }
  ns.systems.GameState = GameState;
})(globalThis.SkyStrike);
