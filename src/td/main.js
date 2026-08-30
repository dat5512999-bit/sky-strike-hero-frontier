(function(ns){
  'use strict';
  const ui={gold:document.getElementById('td-gold'),health:document.getElementById('td-health'),waveStatus:document.getElementById('td-wave-status'),wave:document.getElementById('td-wave-button'),skill:document.getElementById('td-skill-button'),selection:document.getElementById('td-selection'),buildPanel:document.getElementById('td-build-panel'),towerPanel:document.getElementById('td-tower-panel'),buildButtons:Array.from(document.querySelectorAll('[data-tower]')),upgrade:document.getElementById('td-upgrade'),sell:document.getElementById('td-sell'),overlay:document.getElementById('td-overlay'),overlayTitle:document.getElementById('td-overlay-title'),overlayMessage:document.getElementById('td-overlay-message'),restart:document.getElementById('td-restart')};
  globalThis.towerFrontierGame=new ns.TDGame(document.getElementById('td-game'),ui);
})(globalThis.TowerFrontier);
