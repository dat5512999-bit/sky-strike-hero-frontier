(function (ns) {
  'use strict';
  const canvas = document.getElementById('game');
  const ui = {
    score: document.getElementById('score'),
    health: document.getElementById('health'),
    overlay: document.getElementById('overlay'),
    title: document.getElementById('overlay-title'),
    message: document.getElementById('overlay-message'),
    button: document.getElementById('start-button')
  };
  globalThis.skyStrikeGame = new ns.Game(canvas, ui);
})(globalThis.SkyStrike);
