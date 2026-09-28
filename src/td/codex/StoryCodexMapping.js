(function (ns) {
  'use strict';
  // These are integration IDs, not additional story scripts or new canon.
  // StoryCatalog must supply chapter requiredMissionIds and hero rewards after merge.
  ns.codex.storyCodexMapping = {
    version: 1,
    events: Object.assign(Object.fromEntries((ns.codex.chronicleSeed || []).flatMap(entry => entry.fragments.flatMap(fragment =>
      [...(fragment.requires?.allOf || []), ...(fragment.requires?.anyOf || [])].map(id => [id, [{ action: 'updateChronicle', entryId: 'chronicle:' + entry.id, milestone: id }]])
    ))), {
      'mission-completed:chapter2-western-signal': [{ action: 'updateChronicle', entryId: 'chronicle:western-continent', milestone: 'chapter2.west-arrived' }],
      'mission-completed:chapter2-ember-road': [{ action: 'updateChronicle', entryId: 'chronicle:wild-tribes', milestone: 'chapter2.tribes-met' }],
      'mission-completed:chapter2-stone-circle': [{ action: 'updateChronicle', entryId: 'chronicle:southern-orc-survivors', milestone: 'chapter2.orc-history-heard' }],
      'mission-completed:chapter2-red-mesa': [{ action: 'updateChronicle', entryId: 'chronicle:infernal-war', milestone: 'chapter2.war-name-known' }]
    }),
    chapters: {
      'chapter1': { requiredMissionIds: [], ready: false, rewards: [{ action: 'unlockFaction', entryId: 'faction:arcanist' }, { action: 'unlockFaction', entryId: 'faction:rogue' }] },
      'chapter2': { requiredMissionIds: ['chapter2-western-signal', 'chapter2-ember-road', 'chapter2-stone-circle', 'chapter2-red-mesa'], ready: true, rewards: [{ action: 'unlockFaction', entryId: 'faction:wild' }] },
      // The Chapter III outcome unlocks existing playable content only. It adds
      // no Chronicle claim about what caused the anomaly or who made it.
      'chapter3': { requiredMissionIds: ['chapter3-white-trace', 'chapter3-echo-yard', 'chapter3-crossmark', 'chapter3-nightwatch'], ready: true, rewards: [{ action: 'unlockHero', entryId: 'hero:frostland' }, { action: 'unlockFaction', entryId: 'faction:frostland' }, { action: 'unlockHero', entryId: 'hero:goblin' }, { action: 'unlockFaction', entryId: 'faction:goblin' }] }
    }
  };
})(globalThis.TowerFrontier);
