(function (ns) {
  'use strict';
  class GameState {
    constructor() {
      this.highScore = this.loadNumber('sky-strike-high-score');
      this.highCombo = this.loadNumber('sky-strike-high-combo');
      this.reset();
    }
    loadNumber(key) { try { return Number(globalThis.localStorage.getItem(key)) || 0; } catch (_) { return 0; } }
    saveNumber(key, value) { try { globalThis.localStorage.setItem(key, String(value)); } catch (_) { /* Records are optional. */ } }
    reset() { this.status = 'ready'; this.score = 0; this.elapsed = 0; this.combo = 0; this.multiplier = 1; this.bestCombo = 0; }
    start() { this.status = 'playing'; this.elapsed = 0; }
    pause() { if (this.status === 'playing') this.status = 'paused'; }
    resume() { if (this.status === 'paused') this.status = 'playing'; }
    end() {
      this.status = 'gameover';
      this.highScore = Math.max(this.highScore, this.score);
      this.highCombo = Math.max(this.highCombo, this.bestCombo);
      this.saveNumber('sky-strike-high-score', this.highScore);
      this.saveNumber('sky-strike-high-combo', this.highCombo);
    }
    addScore(value) { this.score += value; }
    registerKill(value) {
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.multiplier = Math.min(5, 1 + Math.floor(this.combo / 5));
      const awarded = value * this.multiplier;
      this.addScore(awarded);
      return awarded;
    }
    breakCombo() { this.combo = 0; this.multiplier = 1; }
    update(dt) { if (this.status === 'playing') this.elapsed += dt; }
  }
  ns.systems.GameState = GameState;
})(globalThis.SkyStrike);
