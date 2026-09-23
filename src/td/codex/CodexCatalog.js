(function (ns) {
  'use strict';
  const categories = [
    ['hero', '英雄', 'HERO', '♜'], ['faction', '軍團', 'FACTION', '⚑'], ['unit', '士兵', 'UNIT', '♞'],
    ['tower', '防禦塔', 'TOWER', '♖'], ['enemy', '敵人', 'ENEMY', '♟'], ['equipment', '裝備', 'EQUIPMENT', '⚔'],
    ['map', '地圖', 'MAP', '◇'], ['chronicle', '編年史', 'CHRONICLE', '▤']
  ];
  const sources = { CONFIRMED: '已確認史實', SILVERLEAF_BELIEF: '銀葉信仰', SILVERLEAF_RECORD: '銀葉史料', SHADOW_RECORD: '暮影記載', KINGDOM_OFFICIAL: '王國官方紀錄', ORC_ORAL_HISTORY: '獸人口述', LEGEND: '傳說', UNKNOWN: '真實性未知' };
  const attackNames = { pierce: '穿刺', magic: '魔法', chaos: '混沌' };
  const armorNames = { light: '輕甲', heavy: '重甲', arcane: '秘法甲' };
  const slots = { weapon: '武器', armor: '護甲', relic: '遺物' };
  const emptyLore = '尚無記載。新的故事片段將在探索後收錄。';
  const defaults = { encountered: false, discovered: true, unlocked: true };
  const thumb = id => 'assets/td/codex/' + id.replace(':', '-') + '.webp';
  const field = (label, value) => ({ label, value: value == null || value === '' ? '尚無記載' : String(value) });
  function unitGrowth(key) {
    if (!ns.entities.CombatUnit) return [];
    // Isolated read model: reuse the entity's upgrade rules without touching a battle.
    const preview = new ns.entities.CombatUnit(key, 0, 0), rows = [];
    do {
      const config = preview.config(), cost = preview.upgradeCost();
      rows.push(field('Lv.' + preview.level + ' · ' + preview.evolutionName(),
        '攻擊 ' + Number(config.damage.toFixed(1)) + ' / 射程 ' + config.range +
        (cost ? '；下一級：金幣 ' + cost.gold + '、功勳 ' + cost.merit : '；已達最高等級')));
    } while (preview.upgrade() && rows.length < 20);
    return rows;
  }
  class CodexCatalog {
    constructor(options = {}) {
      this.metadata = options.metadata || {};
      this.chronicles = options.chronicles || ns.codex.chronicleSeed || [];
      this.chronicleProgress = options.chronicleProgress || (ns.codex.ChronicleProgressAdapter ? new ns.codex.ChronicleProgressAdapter({ seeds: this.chronicles, storage: null }) : null);
      this.resolveConcept = options.resolveConcept || (() => []);
      this.availability = options.availability || null;
      this.cinematicProgress = options.cinematicProgress || null;
      this.mapProgress = options.mapProgress || (() => null);
    }
    all() {
      const entries = [];
      const add = (type, key, source, extra = {}) => {
        const id = type + ':' + key;
        const meta = this.metadata[id] || {};
        const entry={ id, type, key, name: source.name, source, icon: source.icon || '◇', color: source.color || '#b5c7c7',
          art: source.selectionArt || source.asset || null, thumbnail: thumb(id), role: source.role || '',
          hiddenUntilEncountered: 'name', defaults: { ...defaults }, unlockRequirement: '等待冒險進度開放。',
          lore: [], relatedEntries: [], gameplayInfo: [], ...extra, ...meta };
        if(key.startsWith('goblin')||source.frostland||key==='frostland'||key.startsWith('frostland-')){
          entry.defaults={encountered:false,discovered:false,unlocked:false};
          entry.hiddenUntilEncountered='hidden';
          entry.unlockRequirement='TESTABLE／STORY_LOCKED；正式劇情尚未指定解鎖章節';
          entry.lore=[{text:'歷史、發跡地與其他文明關係尚未定案。CONCEPT / UNKNOWN。',sourceType:'UNKNOWN'}];
        }
        if(source.frostland||key==='frostland'){entry.thumbnail=source.selectionArt||'assets/td/frostland/'+key+'.svg';entry.gameplayInfo.push(field('狩獵規則','100 Frost 開啟窗口；Boss 深寒持續移動；碎冰每窗口一次，重控間隔 3 秒'));}
        entries.push(entry);
      };
      const factions = ns.systems.FactionSystem.FACTIONS;
      const factionOf = (kind, key) => Object.values(factions).find(f => (f[kind] || []).includes(key));
      for (const [key, hero] of Object.entries(ns.systems.HeroRoster.CLASSES)) {
        const profession = ns.systems.ProfessionSystem.DEFINITIONS[key] || {};
        const ultimate = ns.systems.HeroUltimateSystem.get(key);
        add('hero', key, hero, { title: hero.name.split('・')[0], faction: key, role: profession.title || attackNames[hero.attackType],
          identity: profession.description || hero.faction,
          gameplayInfo: [field('英雄定位', profession.description), field('出身', hero.faction), field('被動', hero.passive?.description || hero.passive),
            field('終極技能', ultimate.name + '｜' + ultimate.hint)],
          skills: (hero.skills || []).map((name, i) => field(name, hero.hints[i])), relatedEntries: ['faction:' + key] });
      }
      for (const [key, faction] of Object.entries(factions)) {
        add('faction', key, faction, { faction: key, role: faction.theme, identity: faction.theme,
          gameplayInfo: [field('軍團主題', faction.theme), field('起源', faction.origin)],
          relatedEntries: ['hero:' + key, ...faction.units.filter(id => !ns.config.units[id]?.enemyOnly).map(id => 'unit:' + id), ...faction.buildings.map(id => 'tower:' + id)] });
      }
      for (const [type, values, kind] of [['unit', ns.config.units, 'units'], ['tower', ns.config.buildings, 'buildings']]) {
        for (const [key, value] of Object.entries(values)) {
          if (value.enemyOnly) continue;
          const faction = factionOf(kind, key);
          const difficulty = new ns.systems.TDDifficultySystem();
          const requirement = difficulty.lockReason(type === 'unit' ? 'unit' : 'building', key);
          add(type, key, value, { faction: faction?.id || 'neutral', identity: value.role,
            role: value.supportOnly ? '支援' : attackNames[value.attackType] || '戰鬥',
            unlockRequirement: requirement || '依戰局軍團與軍備開放狀態使用。',
            gameplayInfo: [field('戰術用途 / 特殊能力', value.role), field('攻擊方式', value.supportOnly ? '支援友軍' : attackNames[value.attackType]),
              field('使用條件', requirement || '依選擇軍團與雇傭軍規則開放'), field('遭遇地區', value.encounterLocation)],
            upgrades: type === 'tower' ? ns.systems.TowerEvolutionSystem.branches(key).map(b => field(b.name, b.description)) : unitGrowth(key),
            relatedEntries: faction ? ['faction:' + faction.id] : [] });
        }
      }
      for (const [key, enemy] of Object.entries(ns.entities.Monster.TYPES)) {
        const wave = ns.systems.WaveCatalog.WAVES.findIndex(w => w.groups.some(g => g[0] === key));
        const multipliers = Object.entries(ns.config.damageMultipliers).map(([attack, values]) => attackNames[attack] + ' ×' + values[enemy.armorType]).join(' / ');
        add('enemy', key, enemy, { defaults: {}, hiddenUntilEncountered: 'silhouette',
          role: enemy.combatRole === 'boss' ? '首領' : enemy.combatRole === 'hunter' ? '獵殺英雄' : enemy.combatRole === 'siege' ? '攻城' : '行軍',
          gameplayInfo: [field('首次可遭遇', wave < 0 ? null : '自由遠征・第 ' + (wave + 1) + ' 波'),
            field('戰場預告', wave < 0 ? null : ns.systems.WaveCatalog.WAVES[wave].hint), field('護甲', armorNames[enemy.armorType]),
            field('傷害相性', multipliers), field('劇情登場', enemy.storyAppearance)],
          relatedEntries: [] });
      }
      const armory = new ns.systems.ArmorySystem();
      for (const [key, item] of Object.entries(ns.systems.ArmorySystem.ITEMS)) {
        const compatible = [...Object.keys(ns.config.units).filter(id => !ns.config.units[id].enemyOnly && armory.canEquip(key, { kind: 'unit', type: id })).map(id => 'unit:' + id),
          ...Object.keys(ns.systems.HeroRoster.CLASSES).filter(id => armory.canEquip(key, { classType: id })).map(id => 'hero:' + id)];
        add('equipment', key, item, { defaults: { discovered: true }, role: slots[item.slot], rarity: item.rarity, slot: item.slot,
          gameplayInfo: [field('效果', item.description), field('稀有度', item.rarity), field('類型', slots[item.slot]), field('推薦依據', '依現行軍械庫適用角色；未另設推薦評分。')], relatedEntries: compatible });
      }
      for (const [hero, weapons] of Object.entries(ns.systems.EquipmentSystem.WEAPONS)) {
        for (const weapon of weapons) add('equipment', weapon.id, weapon, { defaults: { discovered: true }, role: '武器', rarity: ns.systems.EquipmentSystem.RARITIES[weapon.rarity].name, slot: 'weapon',
          gameplayInfo: [field('效果', weapon.description), field('裝備來源', '英雄武器升級'), field('推薦依據', '此英雄的專屬武器')], relatedEntries: ['hero:' + hero], weaponHero: hero });
      }
      for (const map of Object.values(ns.maps.definitions)) {
        if (map.visible === false) continue;
        const progress = this.mapProgress(map.id);
        add('map', map.id, map, { role: '遠征戰場', gameplayInfo: [field('地區', map.region), field('戰場特色', map.description || (map.routes?.length > 1 ? '多路線交會戰場' : '單一路線防禦戰場')),
          field('首次劇情登場', map.storyAppearance), field('最佳積分', progress?.bestScore ?? '尚無紀錄'), field('已通關難度', progress?.completed?.join('、') || '尚無通關紀錄')],
          routes: map.routes || [map.path], relatedEntries: [] });
      }
      for (const chronicle of this.chronicles) {
        if (!chronicle.fragments) {
          // Preserve the original host-provided cinematic catalog contract.
          add('chronicle', chronicle.id, chronicle, { defaults: {}, hiddenUntilEncountered: chronicle.hiddenUntilEncountered || 'silhouette', role: chronicle.kind || '文件',
            cinematicId: chronicle.cinematicId, lore: [{ text: chronicle.text || emptyLore, sourceType: chronicle.sourceType || 'UNKNOWN' }], relatedEntries: chronicle.relatedEntries || [] });
          continue;
        }
        const archive = this.chronicleProgress.view(chronicle);
        const concepts = (chronicle.relatedConcepts || []).flatMap(concept => this.resolveConcept(concept) || []).filter(id => typeof id === 'string');
        add('chronicle', chronicle.id, chronicle, {
          defaults: { discovered: chronicle.chapter === 1 || archive.discovered, fullyKnown: archive.fullyKnown },
          hiddenUntilEncountered: chronicle.hiddenUntilEncountered, role: chronicle.category, chronicleCategory: chronicle.category,
          chapter: chronicle.chapter, spoilerPolicy: chronicle.spoilerPolicy || 'SHOW_TITLE', lockedTitle: chronicle.lockedTitle || '被封存的歷史',
          visualType: chronicle.visualType, timelineEra: chronicle.timelineEra, timelineOrder: chronicle.timelineOrder ?? this.chronicles.indexOf(chronicle),
          art: chronicle.artwork, thumbnail: chronicle.artwork, archiveStatus: archive.status,
          cinematicId: chronicle.cinematicId, cinematicStatus: chronicle.cinematicStatus,
          archive: true, readable: archive.discovered, updateLabel: archive.updateLabel,
          lore: archive.fragments, relatedEntries: [...(chronicle.relatedEntries || []), ...concepts],
          unlockRequirement: chronicle.contentPending ? '相關史料尚未收錄。' : chronicle.chapter === 1 ? '於第一章取得對應線索後開放。' : '於第二章取得對應線索後開放。'
        });
      }
      const mapIds = entries.filter(entry => entry.type === 'map').map(entry => entry.id);
      const enemies = entries.filter(entry => entry.type === 'enemy').map(entry => entry.id);
      const availableIds = new Set(entries.map(entry => entry.id));
      for (const entry of entries) {
        if (['unit', 'tower'].includes(entry.type)) entry.gameplayIdentity = ns.codex.GameplayIdentity?.describe(entry) || [];
        if (entry.type === 'map') entry.relatedEntries.push(...enemies);
        if (entry.type === 'enemy') entry.relatedEntries.push(...mapIds);
        if (entry.type === 'hero' && entry.faction) {
          entry.relatedEntries.push(...entries.filter(other => other.type === 'chronicle' && other.relatedEntries.includes('faction:' + entry.faction)).map(other => other.id));
        }
        entry.relatedEntries = [...new Set(entry.relatedEntries)].filter(id => availableIds.has(id) && id !== entry.id);
      }
      return entries.map(entry => {
        const eligibility = this.availability?.(entry);
        if (typeof eligibility === 'boolean') entry.defaults.unlocked = eligibility;
        return entry;
      });
    }
    project(entry, progress) {
      const discoveryState = progress.state(entry.id, entry.defaults);
      const cinematic = entry.cinematicId && this.cinematicProgress?.(entry.cinematicId);
      if (cinematic && (!entry.archive || entry.readable)) { discoveryState.unlocked ||= cinematic.unlocked === true; discoveryState.watched ||= cinematic.watched === true; }
      // Story gates control seed fragments, even if a general Codex unlock event was received.
      if (entry.archive && !entry.readable) {
        if (entry.spoilerPolicy === 'FULLY_HIDDEN') return null;
        if (entry.spoilerPolicy === 'HIDE_TITLE') entry = { ...entry, name: entry.lockedTitle, source: {}, art: null, thumbnail: null, cinematicId: null, relatedEntries: [] };
      }
      if (!discoveryState.encountered && !discoveryState.discovered && !discoveryState.unlocked && !discoveryState.fullyKnown && entry.hiddenUntilEncountered === 'hidden') return null;
      const full = entry.archive ? entry.defaults.fullyKnown : discoveryState.unlocked || discoveryState.fullyKnown;
      const revealed = discoveryState.discovered || discoveryState.unlocked || discoveryState.fullyKnown;
      const knowledgeLevel = full ? (discoveryState.unlocked && entry.type !== 'enemy' && !entry.archive ? 'UNLOCKED' : 'FULLY_KNOWN') : revealed ? 'DISCOVERED' : discoveryState.encountered ? 'ENCOUNTERED' : 'UNKNOWN';
      // Redact before search/filter/relationships so hidden names cannot be inferred.
      if (!revealed) return { id: entry.id, type: entry.type, key: entry.key, name: entry.hiddenUntilEncountered === 'name' ? entry.name : '？？？',
        role: discoveryState.encountered ? (entry.encounterHint || '曾見過的身影 · 詳情待查') : '完全未知', discoveryState, knowledgeLevel, revealed: false, full: false,
        silhouette: discoveryState.encountered ? ns.codex.thumbnails?.[entry.id] : null,
        icon: discoveryState.encountered ? '◈' : '?', relatedEntries: [], lore: [], gameplayInfo: [],
        unlockRequirement: '繼續探索，收集更多線索。', color: '#748287' };
      if (entry.archive) return { ...entry, source: { name: entry.name }, discoveryState, knowledgeLevel, full, revealed: true };
      if (!full) return { ...entry, source: { name: entry.name }, gameplayInfo: entry.type === 'enemy' ? entry.gameplayInfo.filter(row => ['首次可遭遇', '戰場預告'].includes(row.label)) : entry.gameplayInfo,
        skills: [], upgrades: [], lore: [], discoveryState, knowledgeLevel, full: false, revealed: true };
      return { ...entry, discoveryState, knowledgeLevel, full: true, revealed: true };
    }
    query(progress, filters = {}) {
      const query = String(filters.search || '').trim().toLocaleLowerCase();
      return this.all().map(entry => this.project(entry, progress)).filter(Boolean).filter(entry =>
        (!filters.type || entry.type === filters.type) && (!query || (entry.name + ' ' + entry.role + ' ' + entry.lore.map(row => row.text).join(' ')).toLocaleLowerCase().includes(query)) &&
        (!filters.faction || entry.faction === filters.faction) && (!filters.role || entry.role === filters.role) &&
        (!filters.rarity || entry.rarity === filters.rarity) && (!filters.slot || entry.slot === filters.slot) &&
        (!filters.sourceType || entry.lore.some(row => row.sourceType === filters.sourceType)) &&
        (!filters.state || (filters.state === 'locked' ? (entry.archive ? !entry.readable : !entry.discoveryState.unlocked) : filters.state === 'unlocked' && entry.archive ? entry.readable : filters.state === 'unknown' ? entry.knowledgeLevel === 'UNKNOWN' : filters.state === 'fullyKnown' ? entry.full : filters.state === 'updated' ? Boolean(entry.updateLabel) : entry.discoveryState[filters.state])));
    }
  }
  Object.assign(ns.codex, { CodexCatalog, categories, sources, attackNames, emptyLore });
})(globalThis.TowerFrontier);
