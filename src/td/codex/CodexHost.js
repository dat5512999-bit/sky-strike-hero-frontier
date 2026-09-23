(function (ns) {
  'use strict';
  // Standalone page host: use the same active profile as the lobby, never a demo save.
  if (!globalThis.document) return;
  try {
    const profileStore = new ns.systems.ProfileStore(localStorage);
    const progress = new ns.cinematic.PrologueProgress(profileStore);
    const player = new ns.cinematic.CinematicPlayer();
    const seeds = [...ns.codex.chronicleSeed, ns.cinematic.prologueChronicle];
    ns.codex.chronicleCategories = [...ns.codex.chronicleCategories, 'Cinematic Collection'];
    const report = new ns.systems.BattleReportSystem(profileStore.adapter('free'));
    globalThis.HeroFrontierCodexOptions = {
      profileStore, storage: null, seeds, chronicles: seeds,
      getMission: id => id === ns.systems.StoryCatalog.mission.id ? ns.systems.StoryCatalog.mission : null,
      cinematicProgress: id => progress.state(id),
      player: { play: id => progress.replay(id, player) },
      readOnlyReplay: true,
      mapProgress: id => ns.codex.CodexIntegration.mapProgress(report, id),
      navigate: ({ hero, map }) => {
        const query = new URLSearchParams({ panel: 'free' });
        if (hero && profileStore.allows('heroes', hero)) query.set('hero', hero);
        if (map && profileStore.allows('maps', map)) query.set('map', map);
        location.href = 'td.html?' + query;
      }
    };
    // Reload after cross-page/profile updates so old references cannot target a different round.
    addEventListener('storage', event => { if (event.key === ns.systems.ProfileStore.KEY) location.reload(); });
    addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  } catch (error) {
    globalThis.HeroFrontierCodexBootError = error.message;
  }
})(globalThis.TowerFrontier);
