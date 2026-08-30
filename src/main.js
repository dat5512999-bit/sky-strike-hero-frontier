(function (ns) {
  'use strict';
  const canvas = document.getElementById('game');
  const ui = {
    score: document.getElementById('score'),
    health: document.getElementById('health'),
    overlay: document.getElementById('overlay'),
    title: document.getElementById('overlay-title'),
    message: document.getElementById('overlay-message'),
    button: document.getElementById('start-button'),
    skinPicker: document.getElementById('skin-picker'),
    skinOptions: document.getElementById('skin-options'),
    threat: document.getElementById('threat'),
    skillStatus: document.getElementById('skill-status'),
    combo: document.getElementById('combo'),
    bestScore: document.getElementById('best-score')
  };
  globalThis.skyStrikeGame = new ns.Game(canvas, ui);

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    globalThis.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* Offline mode is optional. */ });
    });
  }
})(globalThis.SkyStrike);
