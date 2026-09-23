(function (ns) {
  'use strict';
  // Player-safe excerpts only. The internal Bible is NEVER loaded by codex.html.
  // Every authored fragment cites a Bible section; IDs are immutable archive revisions.
  const gate = (...milestones) => ({ allOf: milestones });
  const fragment = (id, sourceType, text, bibleSections, requires = gate()) => ({ id, sourceType, text, bibleSections, requires });
  const record = (id, name, category, chapter, requires, fragments, relatedEntries = [], extra = {}) => ({
    id, name, category, chapter, requires, fragments, relatedEntries,
    hiddenUntilEncountered: chapter === 2 ? 'hidden' : chapter === 1 ? 'name' : 'silhouette',
    spoilerPolicy: chapter === 2 ? 'FULLY_HIDDEN' : chapter === 1 && !['kingdom-guard', 'royal-guard', 'first-prohibition'].includes(id) ? 'HIDE_TITLE' : 'SHOW_TITLE',
    lockedTitle: category === '事件' ? '未知事件' : '被封存的歷史',
    visualType: { 世界: 'WORLD', 文明: 'CIVILIZATION', 事件: 'EVENT', 歷史: 'HISTORY', 信仰: 'BELIEF', 傳說: 'LEGEND', 人物紀錄: 'CHARACTER_RECORD' }[category],
    timelineEra: ['coexistence', 'mercenary-origins', 'shared-city', 'first-prohibition'].includes(id) ? 'ancient' : chapter === 0 ? 'pre-chapter' : chapter === 1 ? 'chapter1' : chapter === 2 ? 'chapter2' : 'future',
    artwork: null, cinematicId: null, cinematicStatus: 'placeholder', ...extra
  });
  const entries = [
    record('coexistence', '多族共存的年代', '世界', 0, gate(), [
      fragment('public', 'CONFIRMED', '遠古時期，各大種族分別生活在自己的發跡地，彼此存在交流、貿易與合作。族群之間並非始終互相敵對。', ['一'])
    ], ['chronicle:mercenary-origins', 'chronicle:shared-city']),
    record('mercenary-origins', '傭兵制度的起源', '世界', 0, gate(), [
      fragment('public', 'CONFIRMED', '文明發展使各族逐漸看見自身的不足，於是開始雇用其他種族協助工作。早期的傭兵制度源自跨種族合作，最初並不是為了戰爭。', ['一'])
    ], ['chronicle:coexistence', 'chronicle:shared-city']),
    record('shared-city', '共同城市的建立', '世界', 0, gate(), [
      fragment('public', 'CONFIRMED', '東方大陸的人類提出共同建城，希望不同文明能在共同的制度、法律與管理方式下生活。隨著城市壯大，誰應成為共同統治者，逐漸成為新的問題。', ['二'])
    ], ['chronicle:kingdom', 'chronicle:silverleaf', 'chronicle:shadow']),
    record('kingdom', '王國', '文明', 0, gate(), [
      fragment('public', 'CONFIRMED', '人類王國是共同城市故事中的一方。東方大陸的人類曾提出共同建立城市，讓不同種族在共同制度之下生活。', ['二', '十一'])
    ], ['faction:hunter', 'chronicle:shared-city', 'chronicle:kingdom-guard', 'chronicle:royal-guard']),
    record('silverleaf', '銀葉', '文明', 0, gate(), [
      fragment('public', 'CONFIRMED', '銀葉是與自然、元素高度共生的古老種族，具有非常長的生命週期。元素與歷史在銀葉文化中佔有重要位置。', ['三', '八'])
    ], ['faction:arcanist', 'chronicle:elemental-spirits', 'chronicle:holy-spirits', 'chronicle:first-prohibition'], { relatedConcepts: ['silverleaf-princess', 'water-elemental', 'silverleaf-story-map'] }),
    record('shadow', '暮影', '文明', 0, gate(), [
      fragment('public', 'CONFIRMED', '暮影是重視魔法、知識、傳統與靈魂研究的古老文明。它的歷史跨越多個世代，並非每一段過去都為現代族人熟知。', ['五', '七'])
    ], ['faction:rogue', 'chronicle:first-prohibition', 'chronicle:black-magic']),
    record('elemental-spirits', '元素精靈', '信仰', 0, gate(), [
      fragment('public', 'CONFIRMED', '元素精靈是真實存在的自然生命，並不等同死者亡魂。它們能實際介入世界，甚至參與戰鬥。銀葉文化傾向說「元素回應了呼喚」，而不是強迫召喚元素。', ['四'])
    ], ['chronicle:silverleaf', 'chronicle:holy-spirits'], { relatedConcepts: ['water-elemental', 'silverleaf-princess'] }),
    record('holy-spirits', '聖靈', '信仰', 0, gate(), [
      fragment('belief', 'SILVERLEAF_BELIEF', '銀葉的傳統信仰認為，族人生命將盡時，自然元素精靈會逐漸出現在其身旁；死亡後，靈魂與元素精靈融合，最終化為聖靈。銀葉相信祖先的聖靈會守護、祝福後代，並延續生命力量。這是銀葉的信仰，並非已被證實的生命機制。', ['三'])
    ], ['chronicle:silverleaf', 'chronicle:elemental-spirits']),
    record('southern-empire', '南方帝國', '世界', 0, gate(), [
      fragment('public', 'CONFIRMED', '南方帝國長時間維持統一，對部分歷史極度保密，也不歡迎其他大陸的人進入南方。外界對它的認識有限。', ['九'])
    ], ['chronicle:coexistence']),
    record('prince-death', '銀葉王子之死', '事件', 1, gate('chapter1.prince-death-known'), [
      fragment('death-known', 'CONFIRMED', '銀葉王子死亡。失去兒子後，銀葉王最初仍希望調查真相並阻止戰爭。事件的真相尚待調查。', ['十三', '十四'], gate('chapter1.prince-death-known'))
    ], ['chronicle:silverleaf', 'chronicle:silverleaf-shadow-conflict', 'chronicle:kingdom-guard']),
    // The requested title has no event narrative in Bible V1. Keep it sealed, with NO invented account.
    record('kingdom-martial-law', '王國戒嚴', '事件', 1, { blocked: true }, [], ['chronicle:kingdom'], { contentPending: true }),
    record('kingdom-guard', '王國禁衛軍', '人物紀錄', 1, gate('chapter1.kingdom-guard-met'), [
      fragment('institution', 'CONFIRMED', '王國軍與王國禁衛軍依照王國法律、正式制度及軍事體系運作。禁衛軍團長效忠的是王國、法律與人民，而非國王個人的私人意志。', ['十二'], gate('chapter1.kingdom-guard-met')),
      fragment('investigation', 'CONFIRMED', '禁衛軍團長不是一開始就知道完整真相。他透過案件調查、現場破綻、行動紀錄、證人與禁物來源，逐步察覺王子死亡事件存在問題。', ['十六'], gate('chapter1.guard-investigation-known'))
    ], ['chronicle:kingdom', 'chronicle:royal-guard', 'chronicle:prince-death']),
    record('royal-guard', '皇族親衛隊', '人物紀錄', 1, gate('chapter1.royal-guard-known'), [
      fragment('institution', 'CONFIRMED', '皇族親衛隊由國王直接管理與任命，主要效忠國王與王室。它與王國禁衛軍長期互相監督，兩股勢力之間原本就存在衝突。', ['十二'], gate('chapter1.royal-guard-known'))
    ], ['chronicle:kingdom', 'chronicle:kingdom-guard']),
    record('silverleaf-shadow-conflict', '銀葉與暮影衝突', '事件', 1, gate('chapter1.conflict-witnessed'), [
      fragment('conflict', 'CONFIRMED', '銀葉王起初希望阻止戰爭，後來在喪子之痛、看似指向暮影的證據、黑魔法痕跡與族內悲憤之中逐漸失去理性，最終下令攻擊暮影。', ['十四'], gate('chapter1.conflict-witnessed'))
    ], ['chronicle:prince-death', 'chronicle:silverleaf', 'chronicle:shadow', 'chronicle:taboo-reopened']),
    record('black-magic', '黑魔法禁忌', '歷史', 1, gate('chapter1.black-magic-taboo-known'), [
      fragment('taboo', 'CONFIRMED', '黑魔法是一項曾被禁止的古代禁忌，相關研究資料、禁物、祭器與術式曾遭封印。完整的禁魔原因並非現代各族共同知悉。', ['七'], gate('chapter1.black-magic-taboo-known')),
      fragment('silverleaf-record', 'SILVERLEAF_RECORD', '銀葉的記憶保留了與暮影討論黑魔法、共同決定禁魔的歷史。因為生命週期漫長，部分銀葉仍親身記得那個時代；現代暮影多數族人卻已不知道完整經過。', ['七'], gate('chapter1.silverleaf-record-found')),
      fragment('shadow-record', 'SHADOW_RECORD', '暮影最初並不認為黑魔法本身邪惡。經過長期研究，高層逐漸確認它存在嚴重代價，才與銀葉共同決定禁止。少數暮影長老仍知道禁魔的真正原因。', ['七'], gate('chapter1.shadow-elder-account-heard'))
    ], ['chronicle:first-prohibition', 'chronicle:taboo-reopened', 'chronicle:silverleaf', 'chronicle:shadow'], {
      // Reserved acquisition slot only: Bible supplies no ancient-document text to publish.
      pendingFragments: ['ancient-document'], archiveMayExpand: true
    }),
    record('first-prohibition', '第一次禁魔', '歷史', 1, gate('chapter1.first-prohibition-known'), [
      fragment('joint-ban', 'CONFIRMED', '銀葉與暮影曾共同決定禁止黑魔法，並封印大量研究資料、禁物、祭器與術式。數個世代過後，兩族對這段歷史留下了顯著不同的記憶。', ['七'], gate('chapter1.first-prohibition-known'))
    ], ['chronicle:black-magic', 'chronicle:silverleaf', 'chronicle:shadow']),
    record('taboo-reopened', '暮影重新打開禁忌', '事件', 1, gate('chapter1.taboo-reopened-witnessed'), [
      fragment('reopening', 'CONFIRMED', '銀葉攻入暮影生活區，造成大量平民與士兵死亡。少數知悉古代真相的暮影長老，在痛苦中決定重新打開被封印的黑魔法。戰爭將原本被恐懼的事物，再次帶回了現實。', ['十五'], gate('chapter1.taboo-reopened-witnessed'))
    ], ['chronicle:silverleaf-shadow-conflict', 'chronicle:black-magic', 'chronicle:shadow']),
    record('western-continent', '西方大陸', '世界', 2, gate('chapter2.west-arrived'), [
      fragment('arrival', 'CONFIRMED', '旅程來到西方大陸，逐步接觸半獸人、人馬、戰牛及其他荒野部族。', ['十八'], gate('chapter2.west-arrived'))
    ], ['chronicle:wild-tribes', 'chronicle:southern-orc-survivors']),
    record('wild-tribes', '荒野部族', '文明', 2, gate('chapter2.tribes-met'), [
      fragment('tribes', 'CONFIRMED', '西方之旅將遇見半獸人、人馬、戰牛與其他荒野部族。不同部族會在對應故事中逐步走入玩家的旅程。', ['十八'], gate('chapter2.tribes-met'))
    ], ['chronicle:western-continent']),
    record('southern-orc-survivors', '南方獸人遺民', '歷史', 2, gate('chapter2.orc-history-heard'), [
      fragment('migration', 'ORC_ORAL_HISTORY', '過去有部分獸人生活在南方。獄烈戰爭結束、南方完成統一時，一個很小的獸人部落逃離南方，最後抵達西方大陸。', ['十'], gate('chapter2.orc-history-heard'))
    ], ['chronicle:western-continent', 'chronicle:infernal-war', 'chronicle:southern-empire']),
    record('infernal-war', '獄烈戰爭', '歷史', 2, gate('chapter2.war-name-known'), [
      fragment('war-name', 'CONFIRMED', '南方歷史中存在一場名為「獄烈戰爭」的戰爭。在它以前，南方並非今日的統一帝國。這段歷史受到嚴格保密，已收集的線索尚不足以說明完整經過。', ['九'], gate('chapter2.war-name-known'))
    ], ['chronicle:southern-empire', 'chronicle:southern-orc-survivors'], { archiveMayExpand: true })
  ];
  function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
  ns.codex.chronicleCategories = ['世界', '文明', '歷史', '事件', '信仰', '傳說', '人物紀錄'];
  ns.codex.chronicleSeed = freeze(entries);
  ns.codex.bibleReference = Object.freeze({ path: 'docs/WORLD_STORY_BIBLE_V1.md', sha256: 'E209A0BDA0E48AE7DBF92B030D242563503ED31928530BE51DB99D0CA665688C' });
})(globalThis.TowerFrontier);
