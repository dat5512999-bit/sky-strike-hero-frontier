(function (ns) {
  'use strict';
  // These are integration IDs, not additional story scripts or new canon.
  // StoryCatalog must supply chapter requiredMissionIds and hero rewards after merge.
  ns.codex.storyCodexMapping = {
    version: 1,
    events: Object.fromEntries((ns.codex.chronicleSeed || []).flatMap(entry => entry.fragments.flatMap(fragment =>
      [...(fragment.requires?.allOf || []), ...(fragment.requires?.anyOf || [])].map(id => [id, [{ action: 'updateChronicle', entryId: 'chronicle:' + entry.id, milestone: id }]])
    ))),
    chapters: {
      'chapter1': { requiredMissionIds: [], ready: false, rewards: [{ action: 'unlockFaction', entryId: 'faction:arcanist' }, { action: 'unlockFaction', entryId: 'faction:rogue' }] },
      'chapter2': { requiredMissionIds: [], ready: false, rewards: [], pendingFaction: 'wild-horde' }
    }
  };
})(globalThis.TowerFrontier);
