(function (ns) {
  'use strict';
  if(globalThis.HeroFrontierCodexBootError){const error=document.createElement('p');error.textContent='圖鑑存檔無法讀取：'+globalThis.HeroFrontierCodexBootError+'。請保留資料並返回大廳匯出備份。';error.setAttribute('role','alert');document.querySelector('.collection').replaceChildren(error);return;}
  const $ = id => document.getElementById(id);
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const button = (text, action, className) => { const node = el('button', className, text); node.type = 'button'; node.addEventListener('click', action); return node; };
  const api = ns.codex;
  const host = globalThis.HeroFrontierCodexOptions || {};
  const progression = host.progress ? null : new api.StoryCodexBridge(host);
  const progress = host.progress || progression.progress;
  const chronicleProgress = host.chronicleProgress || progression?.chronicleProgress || new api.ChronicleProgressAdapter({ storage: progress.storage, key: progress.key + ':chronicle', seeds: host.chronicles || api.chronicleSeed });
  const report = new ns.systems.BattleReportSystem();
  const catalog = new api.CodexCatalog({ ...host, cinematicProgress: host.cinematicProgress || (progression ? id => ({ unlocked: progression.save.data.unlockedCinematics.includes(id), watched: progression.save.data.watchedCinematics.includes(id) }) : null), availability: host.availability || (host.profileStore ? entry => { if(entry.key.startsWith('goblin'))return host.profileStore.current().kind==='admin';if(entry.source?.frostland||entry.key==='frostland'||entry.key.startsWith('frostland-')){const kind=entry.type==='hero'||entry.key.startsWith('frostland-spear-')?'heroes':'factions';return host.profileStore.allows(kind,'frostland');}const kind = { hero: 'heroes', faction: 'factions', map: 'maps' }[entry.type]; return kind ? host.profileStore.allows(kind, entry.key) : undefined; } : null), chronicleProgress, mapProgress: host.mapProgress || (id => api.CodexIntegration.mapProgress(report, id)) });
  const integration = new api.CodexIntegration(progress, { ...host, chronicleProgress, progression });
  integration.connect();
  let viewMode = 'collection';
  let category = 'hero', selected = null, tab = 'basic', visible = [], toastTimer, lastCardId;
  const filters = { search: '', state: '', faction: '', role: '', rarity: '', slot: '', sourceType: '' };
  function notify(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500); }
  function knownImage(entry, full = false) {
    if(entry.revealed&&entry.key.startsWith('frostland-spear-')){const box=el('div','frost-codex-art');box.setAttribute('role','img');box.setAttribute('aria-label',entry.name);box.style.backgroundImage='url(assets/td/items/frostland-spears-v1.png)';box.style.backgroundSize='400% 100%';box.style.backgroundPosition=(Number(entry.key.at(-1))/3*100)+'% 0%';return box;}
    if(entry.revealed&&entry.type==='unit'&&entry.source?.frostland){const hero=false,box=el('div','frost-codex-art');box.setAttribute('role','img');box.setAttribute('aria-label',entry.name);box.style.backgroundImage='url(assets/td/frostland/'+(hero?'hero':'soldier')+'-actions-v1.png)';box.style.backgroundSize=hero?'400% 400%':'400% 600%';const index=['frostWolf','frostBear','frostBird','frostHunter','frostShaman','frostMammoth'].indexOf(entry.key);box.style.backgroundPosition='0% '+(hero?0:index*20)+'%';return box;}

    const src = full ? entry.art : entry.archive ? entry.thumbnail : (api.thumbnails?.[entry.id]||(entry.source?.frostland||entry.key==='frostland'?entry.thumbnail:null));
    if (entry.silhouette && !full) {
      const image = el('img', 'encounter-silhouette'); image.alt = '曾遇見的模糊身影'; image.src = entry.silhouette; image.loading = 'lazy';
      image.addEventListener('error', () => image.replaceWith(el('div', 'silhouette', '◈')), { once: true }); return image;
    }
    if (!src || !entry.revealed) return el('div', 'silhouette', entry.archive ? archiveSymbols[entry.visualType] || '▤' : entry.icon || '◇');
    const image = el('img'); image.alt = entry.name; image.src = src; image.loading = 'lazy'; image.decoding = 'async';
    image.addEventListener('error', () => image.replaceWith(el('div', 'silhouette', '◇')), { once: true });
    return image;
  }
  function openModal(content) { $('modal-body').replaceChildren(content); $('modal').showModal(); }
  function closeModal() { $('modal').close(); $('modal-body').replaceChildren(); }
  $('close-modal').addEventListener('click', closeModal);
  $('modal').addEventListener('close', () => $('modal-body').replaceChildren());
  $('help').addEventListener('click', () => {
    const block = el('div'); block.append(el('p', 'eyebrow', 'A GUIDE TO THE ARCHIVE'), el('h2', '', '世界仍有未解之謎'));
    const list = el('ul', 'help-list');
    ['完全未知：只有未明記錄；曾遇見後會留下模糊身影。', '已發現：可以閱讀基本資料，完整數值與能力仍可能未知。', '已解鎖 / 完整資料：可使用，或已取得目前完整資料；不代表揭曉所有世界真相。', 'Gameplay Identity 提供能力搭配建議；Detailed Stats 可展開查看真實數值。', '點選卡片閱讀；手機可按「返回」或 Esc 回到收藏。', '編年史只顯示目前取得的史料，後續線索會追加而不取代舊記錄。', 'NEW INFORMATION 是新收錄，ARCHIVE UPDATED 代表讀過的條目有新史料。', '史料標籤代表來源；看完可按「標記本頁史料已讀」。', '收藏儲存在目前瀏覽器；更換瀏覽器或清除資料不會自動移轉。'].forEach(text => list.append(el('li', '', text)));
    block.append(list); openModal(block);
  });
  const archiveSymbols = { WORLD: '◎', CIVILIZATION: '⚑', EVENT: '◇', HISTORY: '◷', BELIEF: '✧', LEGEND: '✦', CHARACTER_RECORD: '♜' };
  const eras = [['ancient', 'Ancient History · 遠古歷史'], ['pre-chapter', 'Pre-Chapter History · 故事之前'], ['chapter1', 'Chapter I · 第一章'], ['chapter2', 'Chapter II · 第二章'], ['future', 'Future Chapters · 後續篇章']];
  function renderCategories() {
    $('categories').replaceChildren(...api.categories.map(([id, name, english, icon]) => {
      const node = button('', () => changeCategory(id), 'category'); node.dataset.category = id; node.setAttribute('aria-current', String(id === category));
      const label = el('span'); label.append(el('strong', '', name), el('small', '', english)); node.append(el('span', 'symbol', icon), label);
      const unread = progression ? progression.unread() : [];
      if (unread.some(key => key.startsWith(id + ':') || id === 'chronicle' && key.startsWith('cinematic:'))) node.append(el('span', 'nav-new', 'NEW'));
      return node;
    }));
  }
  function addSelect(key, label, options) {
    const wrapper = el('label', 'filter-label'), select = el('select'); select.id = 'filter-' + key; select.setAttribute('aria-label', label);
    select.append(new Option(label, '')); options.forEach(([value, name]) => select.append(new Option(name, value))); select.value = filters[key];
    select.addEventListener('change', () => { filters[key] = select.value; selected = null; renderCollection(); }); wrapper.append(el('span', '', label), select); $('context-filters').append(wrapper);
  }
  function contextFilters() {
    $('context-filters').replaceChildren();
    const entries = catalog.query(progress, { type: category }).filter(e => e.revealed);
    if (['hero', 'unit', 'tower'].includes(category)) {
      const ids = new Set(entries.map(e => e.faction));
      addSelect('faction', '全部軍團', [...ids].map(id => [id, ns.systems.FactionSystem.FACTIONS[id]?.name || '中立']));
      addSelect('role', '全部定位', [...new Set(entries.map(e => e.role))].filter(Boolean).map(role => [role, role]));
    } else if (category === 'equipment') {
      addSelect('rarity', '全部稀有度', [...new Set(entries.map(e => e.rarity))].map(value => [value, value]));
      addSelect('slot', '全部類型', [['weapon', '武器'], ['armor', '護甲'], ['relic', '遺物']]);
    } else if (category === 'chronicle') {
      addSelect('role', '全部編年分類', api.chronicleCategories.map(value => [value, value]));
      addSelect('sourceType', '全部史料來源', Object.entries(api.sources));
    }
    else if (category === 'enemy') addSelect('role', '全部定位', [...new Set(entries.map(e => e.role))].map(value => [value, value]));
  }
  function changeCategory(id) {
    category = id; selected = null; tab = 'basic';
    Object.keys(filters).forEach(key => { filters[key] = ''; }); $('search').value = ''; $('state').value = '';
    document.body.classList.remove('detail-open'); renderCategories(); contextFilters(); renderCollection();
  }
  function makeCard(entry) {
    const node = button('', () => selectEntry(entry.id, true), 'card' + (!entry.revealed ? ' unknown' : ['unit', 'tower', 'enemy', 'equipment'].includes(entry.type) ? ' sprite' : ''));
    node.dataset.entry = entry.id; node.setAttribute('aria-pressed', String(selected === entry.id)); node.setAttribute('aria-label', entry.name + '，' + entry.role); node.style.setProperty('--accent', entry.color);
    node.append(knownImage(entry));
    const copy = el('span', 'card-copy'); copy.append(el('strong', '', entry.name), el('small', '', entry.role)); node.append(copy);
    const status = entry.discoveryState;
    node.dataset.knowledge = entry.knowledgeLevel;
    if (entry.type === 'chronicle') { node.classList.add('chronicle-card'); node.dataset.visual = entry.visualType || 'HISTORY'; }
    if (!entry.archive && progress.isUnread(entry.id)) node.append(el('span', 'archive-badge', 'NEW'));
    const marker = entry.archive ? entry.readable ? entry.chronicleCategory : '封存記錄' : { UNKNOWN: '完全未知', ENCOUNTERED: '已遇見', DISCOVERED: '已發現', UNLOCKED: '已解鎖', FULLY_KNOWN: '完整資料' }[entry.knowledgeLevel];
    node.append(el('span', 'card-marker', marker));
    if (entry.updateLabel) node.append(el('span', 'archive-badge', entry.updateLabel));
    if (entry.archive) node.append(el('span', 'archive-symbol', archiveSymbols[entry.visualType] || '▤'));
    if (entry.knowledgeLevel === 'UNKNOWN') node.append(el('span', 'unknown-index', '未明記錄 ' + String(visible.findIndex(other => other.id === entry.id) + 1).padStart(2, '0')));
    if (status.favorite) node.append(el('span', 'card-favorite', '♥'));
    return node;
  }
  function emptyBlock(title, text, icon = '◇') { const block = el('div', 'empty'); block.append(el('span', 'empty-icon', icon), el('h3', '', title), el('p', '', text)); return block; }
  function renderCollection() {
    const config = api.categories.find(([id]) => id === category);
    visible = catalog.query(progress, { ...filters, type: category });
    const all = catalog.query(progress, { type: category });
    $('collection-title').textContent = config[1] + '收藏'; $('category-en').textContent = config[2] + ' / THE WORLD ARCHIVE';
    const knownCount = all.filter(e => e.archive ? e.readable : e.revealed).length;
    $('collection-number').textContent = String(knownCount).padStart(2, '0');
    if (!visible.some(e => e.id === selected)) selected = visible[0]?.id || null;
    $('archive-modes').hidden = category !== 'chronicle';
    $('archive-modes').replaceChildren(...[['collection', 'COLLECTION · 收藏'], ['timeline', 'TIMELINE · 時序']].map(([mode, label]) => {
      const action = button(label, () => { viewMode = mode; renderCollection(); }); action.dataset.mode = mode; action.setAttribute('aria-pressed', String(viewMode === mode)); return action;
    }));
    if (category === 'chronicle' && progression?.save.data.unlockedCinematics.length) {
      $('archive-modes').append(button('Cinematic Collection' + (progression.unread().some(id => id.startsWith('cinematic:')) ? ' · NEW' : ''), () => {
        const content = el('div'); content.append(el('h2', '', 'Cinematic Collection'));
        progression.save.data.unlockedCinematics.forEach((id, index) => {
          const entry=catalog.query(progress,{type:'chronicle'}).find(row=>row.cinematicId===id&&row.discoveryState.watched);
          if(entry){content.append(el('h3','',entry.name),el('p','','CONFIRMED / STORY EXPERIENCE'),button('Replay Cinematic · 重播影片',async()=>{closeModal();const result=await integration.replay(entry);notify(result.message);},'primary'));}
          else content.append(el('p', '', '影像 ' + (index + 1) + ' · 影片準備中'));
          progress.markRead('cinematic:' + id);
        }); openModal(content);
      }, 'cinematic-inbox'));
    }
    $('grid').classList.toggle('timeline', category === 'chronicle' && viewMode === 'timeline');
    if (category === 'chronicle' && viewMode === 'timeline') {
      $('grid').replaceChildren(...eras.map(([era, title]) => {
        const group = el('section', 'timeline-era'); group.dataset.era = era; group.append(el('h3', '', title));
        const records = visible.filter(entry => (entry.timelineEra || 'future') === era).sort((a, b) => a.timelineOrder - b.timelineOrder);
        const list = el('div', 'timeline-list'); list.append(...records.map(makeCard));
        if (!records.length) list.append(el('p', 'note', '尚無可顯示的記錄。')); group.append(list); return group;
      }));
    } else $('grid').replaceChildren(...visible.map(makeCard));
    if (!visible.length) $('grid').append(category === 'chronicle' && !all.length ?
      emptyBlock('故事，等待被發現', '世界歷史、族群記錄、文件與看過的影片，將隨旅程收錄於此。不同來源，保留不同的聲音。', '▤') : emptyBlock('沒有符合的項目', '試試其他名稱、定位，或重設篩選。未公開的名稱不會出現在搜尋結果。'));
    $('count').textContent = (category === 'chronicle' ? '可閱讀 ' : '已發現 ') + knownCount + ' / ' + all.length + ' · 顯示 ' + visible.length + ' 項';
    $('storage-status').textContent = progression?.save.warning || progress.warning || chronicleProgress.warning || '收藏保存在此瀏覽器';
    if (!selected) document.body.classList.remove('detail-open');
    const panelScroll = $('detail').scrollTop, bodyScroll = $('detail').querySelector('.detail-body')?.scrollTop || 0;
    renderDetail(); $('detail').scrollTop = panelScroll;
    if ($('detail').querySelector('.detail-body')) $('detail').querySelector('.detail-body').scrollTop = bodyScroll;
  }
  function selectEntry(id, focus = false) {
    if (!visible.some(e => e.id === id)) {
      const candidate = catalog.query(progress).find(e => e.id === id);
      if (!candidate) return;
      changeCategory(candidate.type);
    }
    selected = id; tab = 'basic'; lastCardId = id;
    if (!id.startsWith('chronicle:')) progress.markRead(id);
    renderCollection();
    document.body.classList.add('detail-open');
    if (focus && matchMedia('(max-width:1100px)').matches) $('detail').querySelector('.mobile-back')?.focus();
    $('detail').scrollTop = 0;
    if ($('detail').querySelector('.detail-body')) $('detail').querySelector('.detail-body').scrollTop = 0;
  }
  function closeDetail() {
    document.body.classList.remove('detail-open');
    [...$('grid').querySelectorAll('[data-entry]')].find(node => node.dataset.entry === lastCardId)?.focus();
  }
  function facts(rows) { const dl = el('dl', 'facts'); rows.forEach(({ label, value }) => { const row = el('div'); row.append(el('dt', '', label), el('dd', '', value)); dl.append(row); }); return dl; }
  function heading(node, text) { node.append(el('h3', 'section-title', text)); }
  function showRelated(node, entry) {
    const ids = new Set(entry.relatedEntries);
    // Add inverse links, derived from the same catalogs. Project before rendering names.
    catalog.all().forEach(other => { if (other.relatedEntries.includes(entry.id)) ids.add(other.id); });
    const links = catalog.query(progress).filter(other => ids.has(other.id));
    if (!links.length) { node.append(el('p', 'note', '尚無已公開的關聯記錄。')); return; }
    const list = el('div', 'related-list');
    const relatedLabels = { hero: 'Related Characters · 人物', faction: 'Related Factions · 軍團', map: 'Related Maps · 地圖', chronicle: 'Related Chronicle · 編年史' };
    let lastType = ''; links.sort((a, b) => a.type.localeCompare(b.type)).forEach(other => {
      if (other.type !== lastType) { lastType = other.type; list.append(el('h3', 'section-title', relatedLabels[other.type] || api.categories.find(([id]) => id === other.type)[1])); } const action = button('', () => selectEntry(other.id, true)); action.dataset.related = other.id;
      const label = api.categories.find(([id]) => id === other.type)[1];
      action.append(el('span', '', other.name), el('span', '', label + (other.archive && !other.readable ? ' · 封存 ›' : ' ›'))); list.append(action); });
    if (entry.archive) for (const [type, label] of Object.entries(relatedLabels)) if (!links.some(link => link.type === type)) { list.append(el('h3', 'section-title', label), el('p', 'note', '尚無已公開的關聯記錄。')); }
    node.append(list);
  }
  function showRoutes(node, entry) {
    const svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('route-map'); svg.setAttribute('viewBox', '0 0 ' + entry.source.width + ' ' + entry.source.height); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', entry.name + '道路示意圖');
    entry.routes.filter(Array.isArray).forEach(route => { const line = document.createElementNS(svgNS, 'polyline'); line.setAttribute('points', route.map(point => point.x + ',' + point.y).join(' ')); svg.append(line); });
    node.append(svg, el('p', 'note', '道路示意，直接讀取現行戰場路線。'));
  }
  function basic(node, entry) {
    if (entry.archive) { archiveView(node, entry); return; }
    if (entry.identity && !['unit', 'tower'].includes(entry.type)) node.append(el('p', 'identity', entry.identity));
    const chips = el('div', 'state-chips');
    [['encountered', '已遇見'], ['discovered', '已發現'], ['unlocked', entry.type === 'equipment' ? '已取得' : '已解鎖']].forEach(([flag, text]) => chips.append(el('span', 'chip' + (entry.discoveryState[flag] ? ' active' : ''), (entry.discoveryState[flag] ? '✓ ' : '○ ') + text)));
    node.append(chips);
    node.append(el('p', 'knowledge-label', entry.knowledgeLevel));
    if (!entry.revealed) { node.append(el('p', 'identity', '還有未曾相遇的世界。'), el('p', 'note', entry.unlockRequirement)); return; }
    const faction = ns.systems.FactionSystem.FACTIONS[entry.faction];
    if (faction) node.append(facts([{ label: '所屬軍團', value: faction.name }]));
    if (entry.gameplayIdentity?.length) {
      heading(node, 'Gameplay Identity · 戰術定位');
      node.append(facts(entry.gameplayIdentity), el('p', 'note', '依現行能力整理的搭配建議；戰局條件會影響實際表現。'));
    } else node.append(facts(entry.gameplayInfo));
    if (['hero', 'unit', 'tower', 'enemy'].includes(entry.type)) {
      if (entry.full) {
        const stats = el('details', 'detailed-stats'); stats.append(el('summary', '', 'Detailed Stats · 詳細數值'));
        const source = entry.source;
        const rows = [['damage', 'ATK 攻擊'], ['health', 'HP 生命'], ['range', 'Range 射程'], ['interval', 'Attack Interval'], ['cost', 'Cost 金幣'], ['wood', '木材'], ['armor', '護甲'], ['speed', '移動速度'], ['splash', '影響範圍'], ['attackDamage', '對英雄攻擊'], ['attackInterval', '對英雄攻擊間隔'], ['reward', '擊殺金幣']].filter(([key]) => source[key] !== undefined).map(([key, label]) => ({ label, value: String(source[key]) + (key === 'interval' || key === 'attackInterval' ? ' 秒' : '') }));
        stats.append(facts(rows)); if (entry.gameplayIdentity?.length) stats.append(facts(entry.gameplayInfo));
        stats.append(el('p', 'note', '即時讀取遊戲基礎資料；實戰會受難度、等級、裝備與增益影響。')); node.append(stats);
      } else node.append(el('p', 'note', '已取得基本資料；完整能力與詳細數值尚待調查。'));
    }
    if (['hero', 'faction'].includes(entry.type)) {
      heading(node, '旅程與成長');
      node.append(facts(['earlyGame', 'midGame', 'lateGame', 'storyStatus'].map((key, index) => ({ label: ['前期', '中期', '後期', '劇情狀態'][index], value: entry[key] || entry.source[key] || '尚無正式記載' }))));
    }
    if (entry.type === 'map' && entry.full) { heading(node, '路線配置'); showRoutes(node, entry); }
    const actions = el('div', 'detail-actions');
    if (entry.art) actions.append(button('立繪欣賞 ↗', () => { const block = el('div'); block.append(el('h2', '', entry.name), knownImage(entry, true)); openModal(block); }));
    if (['hero', 'map'].includes(entry.type) && entry.discoveryState.unlocked) actions.append(button('前往自由遠征 ›', () => integration.expedition(entry), 'primary'));
    if (!entry.discoveryState.unlocked) { heading(node, '解鎖條件'); node.append(el('p', 'note', entry.unlockRequirement)); }
    if (entry.cinematicId) {
      actions.append(button(entry.discoveryState.watched ? '重播影片 ▷' : '觀看影片 ▷', async () => { const result = await integration.replay(entry); notify(result.message); }, 'primary'));
      node.append(el('p', 'note', entry.discoveryState.watched ? '已觀看 · 可重播' : entry.discoveryState.unlocked ? '已解鎖 · 尚未觀看' : '影片尚未解鎖'));
    }
    node.append(actions);
  }
  function loreView(node, entry) {
    const records = entry.lore.length ? entry.lore : [{ sourceType: 'UNKNOWN', text: api.emptyLore }];
    records.forEach((record, index) => {
      const lore = el('section', 'lore archive-fragment'); if (record.id) lore.dataset.fragment = record.id;
      const top = el('div', 'fragment-heading'); top.append(el('span', 'source', api.sources[record.sourceType] || api.sources.UNKNOWN));
      if (entry.archive) top.append(el('span', 'fragment-order', '記錄 ' + String(index + 1).padStart(2, '0')));
      if (record.isNew) top.append(el('span', 'new-fragment', 'NEW'));
      lore.append(top, el('p', '', record.text)); node.append(lore);
    });
    node.append(el('p', 'note', '記錄呈現其來源的觀點；未經證實的傳說保留未知。'));
    if (entry.archive && entry.updateLabel) node.append(button('標記本頁史料已讀', () => {
      const restoreTab = tab; chronicleProgress.markRead(entry.key, entry.lore.map(row => row.id));
      $('tab-' + restoreTab)?.focus();
    }, 'mark-read'));
  }
  function archiveView(node, entry) {
    if (entry.updateLabel) node.append(el('p', 'archive-update', entry.updateLabel));
    node.append(el('p', 'eyebrow', entry.chronicleCategory + ' / ' + (entry.readable ? '已收錄 ' + entry.lore.length + ' 段史料' : '封存記錄')));
    if (entry.readable) {
      node.append(facts([{ label: 'Story Chapter', value: entry.chapter ? 'Chapter ' + entry.chapter : '世界公開記錄' }, { label: 'Source Type', value: [...new Set(entry.lore.map(row => api.sources[row.sourceType]))].join(' / ') }, { label: 'Archive', value: entry.archiveStatus }]));
      heading(node, 'Summary · 目前所知'); node.append(el('p', 'archive-summary', entry.lore[0] ? '【' + api.sources[entry.lore[0].sourceType] + '】' + entry.lore[0].text.split('。')[0] + '。' : api.emptyLore));
      heading(node, '✓ 已確認史實 · Known Facts');
      const confirmed = entry.lore.filter(row => row.sourceType === 'CONFIRMED');
      if (!confirmed.length) node.append(el('p', 'note', '目前收錄的是來源觀點，尚無已確認史實。'));
      confirmed.forEach(row => node.append(el('p', 'known-fact', row.text)));
      heading(node, '? 尚未確認 · Unknown Questions');
      node.append(el('p', 'note unknown-question', entry.full ? '目前沒有新增的待查問題；記錄完整不代表已揭曉世界的所有真相。' : '尚待取得後續史料。其他來源是否留下不同記載？'));
      heading(node, 'Information Blocks · 取得的記錄'); loreView(node, entry);
      heading(node, 'Related Content · 延伸閱讀'); showRelated(node, entry);
    }
    else node.append(el('p', 'identity', '這一頁，仍等待旅程中的線索。'), el('p', 'note', entry.unlockRequirement));
    heading(node, 'Related Cinematic · 影像紀錄');
    if (!entry.cinematicId) node.append(el('p', 'note cinematic-placeholder', '影像紀錄準備中。尚無可播放的影片。'));
    else if (!entry.discoveryState.watched) node.append(el('p', 'note cinematic-placeholder', '影片尚未解鎖。在故事中看過後，可於此處重播。'));
    else node.append(button('重播影片 ▷', async () => { const result = await integration.replay(entry); notify(result.message); }, 'primary'));
  }
  function renderDetail() {
    const entry = visible.find(e => e.id === selected);
    const root = $('detail-content'); root.replaceChildren(); root.classList.toggle('chronicle-detail', Boolean(entry?.archive));
    if (!entry) { root.append(emptyBlock('每段旅程，都有回聲', '選擇一項收藏，翻開它的故事。', '✧')); return; }
    const banner = el('div', 'detail-hero' + (['unit', 'tower', 'enemy', 'equipment'].includes(entry.type) ? ' sprite' : ''));
    if (entry.archive) { banner.classList.add('archive-banner'); banner.dataset.visual = entry.visualType; }
    banner.append(knownImage(entry));
    const toolbar = el('div', 'detail-toolbar'); toolbar.append(button('‹ 返回', closeDetail, 'mobile-back'));
    const favorite = button(entry.discoveryState.favorite ? '♥' : '♡', () => { progress.update(entry.id, { favorite: !entry.discoveryState.favorite }); $('detail').querySelector('.favorite')?.focus(); }, 'favorite');
    favorite.setAttribute('aria-label', entry.discoveryState.favorite ? '取消收藏' : '加入收藏'); favorite.setAttribute('aria-pressed', String(entry.discoveryState.favorite)); toolbar.append(favorite); banner.append(toolbar);
    const title = el('div', 'detail-title'); title.append(el('p', 'eyebrow', api.categories.find(([id]) => id === entry.type)[2]), el('h2', '', entry.name), el('p', '', entry.role));
    if (entry.updateLabel) title.append(el('span', 'archive-banner-update', entry.updateLabel));
    banner.append(title); root.append(banner);
    const tabs = el('div', 'detail-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', '詳情內容');
    const tabDefinitions = entry.archive ? [['basic', '已知記錄'], ['lore', '史料來源'], ['related', '相關內容']] : [['basic', '基本資料'], ['lore', '背景故事'], ['skills', '技能 / 成長'], ['related', '相關內容']];
    if (entry.archive) tabs.append(button('‹ 返回', closeDetail, 'archive-back'));
    tabDefinitions.forEach(([id, label]) => {
      const b = button(label, () => { tab = id; renderDetail(); $('tab-' + id).focus(); });
      b.id = 'tab-' + id; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(tab === id)); b.setAttribute('aria-controls', 'detail-panel'); b.tabIndex = tab === id ? 0 : -1;
      b.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault(); const ids = tabDefinitions.map(([key]) => key); const index = ids.indexOf(tab);
        tab = event.key === 'Home' ? ids[0] : event.key === 'End' ? ids[ids.length - 1] : ids[(index + (event.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length]; renderDetail(); $('tab-' + tab).focus();
      }); tabs.append(b);
    }); root.append(tabs);
    const body = el('div', 'detail-body'); body.id = 'detail-panel'; body.setAttribute('role', 'tabpanel'); body.setAttribute('aria-labelledby', 'tab-' + tab);
    if (tab === 'basic' || !entry.revealed) basic(body, entry);
    else if (tab === 'lore') {
      if (entry.archive && !entry.readable) archiveView(body, entry); else loreView(body, entry);
    } else if (tab === 'skills') {
      const rows = [...(entry.skills || []), ...(entry.upgrades || [])];
      if (entry.full && entry.type === 'hero') rows.push(...entry.gameplayInfo.filter(row => ['終極技能', '被動'].includes(row.label)));
      if (entry.full && (entry.type === 'unit' || entry.type === 'tower')) rows.unshift(...entry.gameplayInfo.filter(row => row.label.includes('戰術')));
      if (!rows.length) body.append(el('p', 'note', '此項目尚無獨立技能或成長記錄。'));
      rows.forEach(row => { const block = el('section', 'skill'); block.append(el('h3', '', row.label), el('p', '', row.value)); body.append(block); });
    } else showRelated(body, entry);
    root.append(body);
  }
  $('search').addEventListener('input', event => { filters.search = event.target.value; selected = null; renderCollection(); });
  $('state').addEventListener('change', event => { filters.state = event.target.value; selected = null; renderCollection(); });
  $('clear-filters').addEventListener('click', () => changeCategory(category));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('modal').open) closeDetail(); });
  progress.subscribe(() => { renderCategories(); contextFilters(); renderCollection(); });
  chronicleProgress.subscribe(() => { renderCategories(); contextFilters(); renderCollection(); });
  globalThis.addEventListener('storage', event => {
    if (progression && event.key === api.CodexSaveBridge.KEY) { progression.save.load(); progression.refresh(); return; }
    const adapter = event.key === progress.key ? progress : event.key === chronicleProgress.key ? chronicleProgress : null;
    if (adapter) { adapter.entries = Object.create(null); adapter.readOnly = false; adapter.warning = ''; if (adapter.milestones) adapter.milestones.clear(); adapter.load(); adapter.sync?.(); contextFilters(); renderCollection(); }
  });
  // Keep page-owned listeners through the browser back/forward cache.
  globalThis.addEventListener('pageshow', event => { if (event.persisted) { contextFilters(); renderCollection(); } });
  // Stable integration surface; no core or gameplay writes.
  globalThis.HeroFrontierCodex = { progress, chronicleProgress, catalog, integration, progression, refresh: () => { contextFilters(); renderCollection(); }, select: selectEntry };
  if (progression) { progression.entryIds = new Set(catalog.all().map(entry => entry.id)); progression.onError = error => notify(error.message); }
  renderCategories(); contextFilters(); renderCollection();
})(globalThis.TowerFrontier);
