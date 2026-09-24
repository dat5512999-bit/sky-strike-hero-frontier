(function (ns) {
  'use strict';
  const api = ns.cinematic;
  const base = 'assets/cinematics/prologue/';
  const cinematicId = 'prologue_before_shattered_peace';
  const characterFields = ['faceIdentity', 'hair', 'costume', 'factionSymbol', 'bodyProportion', 'ageAppearance', 'weapon'];
  const locationFields = ['architecture', 'banner', 'factionSymbol', 'cityLayout', 'visualLanguage'];
  const reference = (id, name, fields) => ({ id, name, status: 'pending-approval', referenceAsset: null,
    revision: null, continuity: Object.fromEntries(fields.map(field => [field, null])) });
  const characters = [
    ['silverleaf_king', 'Silverleaf King'], ['silverleaf_prince', 'Silverleaf Prince'],
    ['silverleaf_princess', 'Silverleaf Princess'], ['guard_commander', 'Guard Commander'],
    ['king', 'King'], ['chancellor', 'Chancellor']
  ].map(([id, name]) => reference(id, name, characterFields));
  const locations = [['shared_city', 'Shared City'], ['royal_palace', 'Royal Palace'],
    ['shadow_district', 'Shadow District'], ['silverleaf_territory', 'Silverleaf Territory']
  ].map(([id, name]) => reference(id, name, locationFields));
  // Only the user's approved shot brief is represented. Unnamed figures have no character binding.
  const shot = (number, start, end, title, asset, description, characterRefs, locationRefs, direction) => ({
    id: 'shot_' + String(number).padStart(2, '0'), start, end, title,
    imageAsset: base + asset + '.webp', description, characterRefs, locationRefs, direction
  });
  const shots = [
    shot(1, 0, 6, '曾經的世界', 'shot_01_world', '和平時期的東方大陸。人類城市、銀葉自然文明、暮影領域存在於同一個世界。', [], ['silverleaf_territory'], '超廣角世界景觀；宏大、和平、充滿未知。'),
    shot(2, 6, 14, '第一次真正的交流', 'shot_02_cooperation', '人類商隊與銀葉交流。暮影魔法師協助其他文明。不同種族傭兵共同工作。早期傭兵制度源自跨種族合作。', [], [], '呈現交流與合作。'),
    shot(3, 14, 23, '共同城市', 'shot_03_shared_city', '人類帶來工程、制度與建設；銀葉帶來自然與元素；暮影帶來魔法與知識。不同文明共同建立繁榮的城市。', [], ['shared_city'], '最後拉遠鏡頭，完整呈現共同城市。'),
    shot(4, 23, 31, '銀葉王子', 'shot_04_silverleaf_prince', '銀葉王子走在共同城市中。不同種族居民認識他，向他致意。', ['silverleaf_prince'], ['shared_city'], '受到不同文明尊重的共同統治者人選；不宣告必然繼位。'),
    shot(5, 31, 38, '陰影', 'shot_05_conspiracy', '王宮內，共同城市地圖旁，一隻手推倒象徵王子的棋子。', [], ['royal_palace'], '音樂與畫面轉暗；不顯示完整面孔、身份或可辨識角色標記。'),
    shot(6, 38, 44, '暮影區', 'shot_06_shadow_district', '夜晚，銀葉王子進入暮影生活區。街道逐漸安靜，遠處存在不明人影。', ['silverleaf_prince'], ['shadow_district'], '不明人影不綁定任何角色身份。'),
    shot(7, 44, 48, '死亡', 'shot_07_assassination', '門關上。劍刃反光。王子回頭。金屬聲。畫面切黑。', ['silverleaf_prince'], ['shadow_district'], '快速剪接；不展示完整殺人過程或兇手。'),
    shot(8, 48, 53, '王子之死', 'shot_08_prince_death', '王子被發現倒在暮影區。現場有一件與古代暮影禁忌有關的物件。', ['silverleaf_prince'], ['shadow_district'], '物件的身份、來源、是否造成死亡，均保持未知。'),
    shot(9, 53, 58, '和平破裂', 'shot_09_war_begins', '銀葉軍集結；王國城門封鎖；暮影居民察覺異常；禁衛軍團長閱讀案件資料；銀葉公主在遠方收到消息；銀葉王面對兒子的死亡。', ['guard_commander', 'silverleaf_princess', 'silverleaf_king'], ['shared_city', 'shadow_district', 'silverleaf_territory'], '快速 Montage；不揭露真相。公主所在位置未定，不推定為銀葉領地。'),
    shot(10, 58, 60, 'HERO FRONTIER', 'shot_10_title', 'CHAPTER I\n《破碎的和平》', [], [], '黑畫面與標題。')
  ];
  const subtitles = {
    schemaVersion: 1, timeUnit: 'seconds', format: 'WebVTT', defaultLanguage: 'zh-TW',
    tracks: [
      { language: 'zh-TW', label: '繁體中文', status: 'concept', src: base + 'subtitles/zh-TW.vtt' },
      { language: 'en', label: 'English（待翻譯）', status: 'pending-translation', src: base + 'subtitles/en.vtt' },
      { language: 'ja', label: '日本語（翻訳準備中）', status: 'pending-translation', src: base + 'subtitles/ja.vtt' }
    ],
    cues: [
      { id: 'shared-peace', start: 14, end: 23, language: 'zh-TW', text: '我們曾相信，這就是和平。' },
      { id: 'title-concept', start: 58, end: 60, language: 'zh-TW', text: '有些戰爭，開始於仇恨。\n而有些……開始於一個謊言。' }
    ]
  };
  const prologue = {
    schemaVersion: 1, cinematicId, title: '《曾經的和平》', productionTitle: '序章｜破碎的和平之前',
    version: '1.0.0', status: 'key-art-storyboard', duration: 60, expectedDuration: { min: 45, max: 60 },
    chapter: 1, chapterTitle: '破碎的和平', firstMissionId: 'chapter1-border',
    videoAsset: base + 'prologue_zh_tw.mp4', subtitleTracks: subtitles.tracks, subtitles,
    unlockCondition: 'completed-or-skipped', sourceType: 'CONFIRMED', sourceContext: 'STORY EXPERIENCE',
    bibleReference: 'docs/WORLD_STORY_BIBLE_V1.md', shots, characters, locations,
    continuityPolicy: '同一 reference ID 使用同一份核准設計；null 表示未定稿，不能自行補完。'
  };
  function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
  api.prologue = freeze(prologue);
  api.prologueChronicle = freeze({
    id: cinematicId, name: prologue.title, category: 'Cinematic Collection', chapter: 1,
    cinematicId, cinematicStatus: 'key-art-storyboard', visualType: 'EVENT', timelineEra: 'pre-chapter',
    sourceType: 'CONFIRMED', sourceContext: 'STORY EXPERIENCE', spoilerPolicy: 'HIDE_TITLE',
    requires: { allOf: ['prologue.experienced'] }, relatedEntries: [],
    fragments: [{ id: 'story-experience', sourceType: 'CONFIRMED', sourceContext: 'STORY EXPERIENCE',
      requires: { allOf: ['prologue.experienced'] },
      text: '不同種族曾經合作，共同建立城市。銀葉王子受到不同文明尊重。王子死亡後，和平開始破裂。' }]
  });
  api.prologueCatalog = new api.CinematicCatalog([prologue]);
})(globalThis.TowerFrontier);
