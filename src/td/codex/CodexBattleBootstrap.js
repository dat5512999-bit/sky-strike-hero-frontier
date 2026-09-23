(function (ns) {
  'use strict';
  const game = globalThis.towerFrontierGame;
  if (!game) return;
  const options = globalThis.HeroFrontierProgressionOptions || {};
  const progression = new ns.codex.StoryCodexBridge({ ...options, profileStore: options.profileStore || game.app?.store });
  globalThis.HeroFrontierProgression = progression;
  progression.connect();
  progression.onError = error => { progression.save.warning = error.message; };
  ns.codex.CodexBattleBridge.install(game, progression, summary => {
    const message = game.ui.overlayMessage;
    if (message) message.textContent += ' · ' + summary.label + '：' + summary.entries.length + ' 項新記錄';
  });
  // Small navigation entry in the existing opening screen; never opens a modal during combat.
  const link = document.createElement('a'); link.href = 'codex.html'; link.className = 'codex-navigation';
  const refresh = () => { link.textContent = '世界圖鑑' + (progression.unread().length ? ' · NEW' : ''); };
  (game.ui.professionScreen || document.body).append(link);
  progression.progress.subscribe(refresh); progression.chronicleProgress.subscribe(refresh); refresh();
})(globalThis.TowerFrontier);
