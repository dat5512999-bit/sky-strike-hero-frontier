(function (ns) {
  'use strict';
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const categories = [['all', '精選推薦', 'FEATURED'], ['hero', '英雄造型', 'HERO SKIN'], ['faction', '軍團外觀', 'FACTION SKIN'], ['effect', '特效外觀', 'EFFECT SKIN'], ['other', '其他外觀', 'COSMETICS'], ['collaboration', '聯名企劃', 'COLLABORATION']];
  const labels = { portrait: '頭像', selectionArt: '選角立繪', battlefieldSprite: '戰場角色', skillVfx: '技能特效', summonAppearance: '召喚物', animation: '動作', voice: '語音', soldierAppearance: '士兵外觀', towerAppearance: '防禦塔', banner: '旗幟', buildVfx: '建造特效', attackVfx: '攻擊特效' };
  const rarities = { rare: '稀有', epic: '史詩', legendary: '傳說' };
  const states = { available: '可購買', owned: '已擁有', equipped: '已裝備', locked: '未開放' };
  const textPrice = skin => skin.availability.status === 'locked' ? '尚未推出' : skin.price.amount.toLocaleString('en-US');
  const price = skin => skin.availability.status === 'locked' ? '敬請期待' : ns.crystal + '<span>' + textPrice(skin) + '</span>';

  ns.renderCard = (view, skin, collection = false) => {
    const status = view.store.status(skin.id);
    return view.button('select', `
      <div class="hf-card-art"><img src="${escape(skin.cover.src)}" alt="" loading="lazy"><span class="hf-rarity ${skin.rarity}">${rarities[skin.rarity]}</span></div>
      <div class="hf-card-copy"><h3>${escape(skin.name)}</h3><small>${escape(skin.subtitle)}</small>
        <div><b class="hf-price">${price(skin)}</b><span class="hf-state" data-state="${status}">${status === 'available' ? ns.icon('all') : states[status]}</span></div>
      </div>`, skin.id, `class="hf-card${collection ? ' hf-card--collection' : ''}" aria-label="預覽 ${escape(skin.name)}，${states[status]}" aria-pressed="${view.selected === skin.id}"`);
  };

  ns.renderShop = (view, { state, skin, status, items, asset }) => {
    const b = view.button.bind(view);
    const collection = view.category === 'all' && !view.ownedOnly;
    return `
      <header class="hf-top">
        <div class="hf-brand"><span>HERO</span><strong>FRONTIER</strong><small>─ 英雄的邊境 ─</small></div>
        <div class="hf-title"><h1>商城</h1><small>SHOP</small></div>
        <div class="hf-profile"><img src="assets/td/opening/hero-hunter-selection-v1.png" alt="玩家頭像"><div>邊境旅人<small>外觀典藏 · 本機玩家檔案</small><i></i></div></div>
        <div class="hf-wallet">${ns.crystal}<div><small>試用水晶</small><b>${state.balance.toLocaleString('en-US')}</b></div></div>
        ${b('owned', ns.icon('book') + '<span>我的收藏</span>', '', `class="hf-collection-button" aria-label="我的收藏" aria-pressed="${view.ownedOnly}"`)}
        ${view.onClose ? b('exit', '返回', '', 'aria-label="返回上一頁"') : ''}
      </header>
      <nav class="hf-categories" aria-label="外觀分類">
        ${categories.map(([id, name, en]) => b('category', ns.icon(id) + '<span>' + name + '<small>' + en + '</small></span>', id, `aria-pressed="${view.category === id}"`)).join('')}
        <div class="hf-compass" aria-hidden="true">✧</div><p>Different Heroes<br>One World</p>
      </nav>
      <section class="hf-browse" aria-label="外觀商品">
        <div class="hf-banner">
          <img src="assets/td/shop/frost-banner-v2.png" alt="霜華之誓：冰雪公主與霜狼">
          <div class="hf-banner-copy"><small>全 新 造 型 登 場</small><h2>霜華之誓 <span>❄</span></h2><em>OATH OF THE FROST</em><p>「冰雪不熄，誓言永恆。」</p></div>
          ${b('select', '探索典藏 ' + ns.icon('arrow'), 'astral-oath', 'class="hf-banner-cta"')}
          <div class="hf-banner-dots" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div class="panel-heading hf-list-heading"><h2>${categories.find(c => c[0] === view.category)[1]} <small>${items.length} 件外觀</small></h2><span>你的風格，你的傳說。</span></div>
        <div class="hf-products">${items.length ? (collection ? items.slice(0, 5).map(s => ns.renderCard(view, s)).join('') + `
          <div class="hf-series-heading"><h2>更多外觀</h2><small>可左右滑動</small><div class="hf-rail-controls">${b('scroll-collection', '‹', '-1', 'aria-label="外觀向左捲動" aria-controls="hf-collection-track"')}${b('scroll-collection', '›', '1', 'aria-label="外觀向右捲動" aria-controls="hf-collection-track"')}</div></div>
          <div id="hf-collection-track" class="hf-collection-track" tabindex="0" role="region" aria-label="更多外觀，可左右滑動或使用方向鍵">${items.slice(5).map(s => ns.renderCard(view, s, true)).join('')}</div>` : items.map(s => ns.renderCard(view, s)).join('')) : '<div class="hf-empty"><h3>'+(view.category==='effect'?'敬請期待':'尚無收藏')+'</h3><p>'+(view.category==='effect'?'特效外觀完成實際遊戲預覽後推出。':'關閉「我的收藏」，探索此分類的外觀。')+'</p></div>'}</div>
        <div class="hf-note"><span>✧ 外觀隨心，實力公平。</span><small>純外觀 · 不影響戰鬥能力與排名</small></div>
      </section>
      <aside class="hf-detail" aria-label="外觀詳情">
        <div class="hf-detail-top"><span>More Than Power <br>A New Legend</span>${b('close-detail', ns.icon('close'), '', 'aria-label="關閉詳情"')}</div>
        <div class="hf-preview" data-type="${asset?.type || 'fallback'}">${view.preview(asset, skin)}<span class="hf-preview-label">${view.previewSlot === 'cover' ? '造型立繪' : labels[view.previewSlot]}${asset ? '' : skin.id==='eclipse-court'&&['soldierAppearance','towerAppearance'].includes(view.previewSlot)?' · 黑金配色' : ' · 沿用原版'}</span></div>
        <div class="hf-detail-copy">
          <span class="hf-rarity ${skin.rarity}">${rarities[skin.rarity]} · ${states[status]}</span><h2>${escape(skin.name)}</h2><p>${escape(skin.subtitle)}</p>
          <div class="hf-slots" aria-label="預覽項目">
            ${b('preview', '<img src="' + escape(skin.cover.src) + '" alt=""><span>立繪</span>', 'cover', `aria-pressed="${view.previewSlot === 'cover'}"`)}
            ${Object.keys(skin.slots).map(key => b('preview', '<span class="hf-slot-symbol">' + ns.icon(key === 'animation' ? 'arrow' : key === 'voice' ? 'collaboration' : key.toLowerCase().includes('vfx') ? 'effect' : 'hero') + '</span><span>' + labels[key] + '</span>', key, `title="${labels[key]}${skin.slots[key] ? '預覽' : '：沿用原版'}" aria-pressed="${view.previewSlot === key}"`)).join('')}
          </div>
          ${skin.category === 'hero' && skin.slots.battlefieldSprite ? '<a class="hf-compare-link" href="skin-lab.html?hero='+encodeURIComponent(skin.targetId)+'&amp;skin='+encodeURIComponent(skin.id)+'">換裝前後比較 · 戰場動作實驗室 ↗</a>' : ''}
          <details class="hf-skin-info"><summary>造型內容與使用說明</summary><p>${escape(skin.description)}</p><p>${skin.id==='eclipse-court'?'軍團提供七種王國士兵及八種建築的專屬戰場圖；士兵目前以單姿態搭配移動與攻擊動態呈現，技能特效沿用原版。':'裝備後在正式戰場顯示對應的角色動作；未列出的效果與語音沿用原版。'}購買紀錄保存在目前玩家檔案。</p></details>
        </div>
        <div class="hf-purchase">
          ${status === 'locked' ? '<p>' + escape(skin.availability.reason) + '</p>' : ''}
          <span class="hf-price">${price(skin)}</span>
          ${b(status === 'available' ? 'buy' : status === 'owned' ? 'equip' : 'unequip', (status === 'available' ? ns.icon('all') : '') + (status === 'available' ? '使用試用水晶購買' : status === 'owned' ? '裝備外觀' : status === 'equipped' ? '卸下外觀' : '尚未開放'), skin.id, `class="shop-button" ${status === 'locked' || view.pending ? 'disabled' : ''}`)}
        </div>
      </aside>
      <div class="hf-status" role="status" aria-live="polite">${escape(view.message || '試用水晶與外觀保存在目前玩家檔案 · 無真實付款')}</div>
      <dialog class="hf-confirm"><h2>確認購買</h2><p>${escape(skin.name)} · ${textPrice(skin)} 試用水晶</p><p>將從目前玩家檔案扣除，購買後可裝備。無真實付款。</p><div>${b('cancel', '取消', '', view.pending ? 'disabled' : '')}${b('confirm', view.pending ? '處理中…' : '確認購買', skin.id, `class="shop-button" ${view.pending ? 'disabled' : ''}`)}</div></dialog>`;
  };
})(globalThis.FrontierShop);
