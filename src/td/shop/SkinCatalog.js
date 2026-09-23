(function (root) {
  'use strict';
  const schema = root.FrontierShop?.schema || require('./SkinSchema.js');
  const image = src => ({ type: 'image', src: 'assets/td/' + src + '.png' });
  const sprite = (src, type = 'sprite') => ({ type, src: 'assets/td/' + src + '.png', columns: 4, rows: 4, frames: 4 });
  const mage = image('shop/frost-portrait-v2');
  const kingdom = image('opening/faction-kingdom-selection-v1');
  const forest = image('opening/faction-silverleaf-selection-v1');
  function skin(id, name, subtitle, category, targetId, rarity, amount, cover, slots, reason = '') {
    return { schemaVersion: 1, id, name, subtitle, category, targetId, rarity, cosmeticOnly: true,
      description: '此外觀可保存於目前玩家檔案；僅改變視覺，不影響戰鬥能力或排行榜積分。',
      price: { currency: 'mock-crystal', amount }, availability: { status: reason ? 'locked' : 'available', reason }, cover, slots };
  }
  const thunder = root.FrontierShop?.thunderKing || require('./ThunderKing.js');
  const catalog = schema.catalog([
    skin('astral-oath', '霜華之誓', '銀葉公主 · 霜雪典藏', 'hero', 'arcanist', 'legendary', 1280, mage, {
      portrait: mage, selectionArt: mage, battlefieldSprite: sprite('shop/frost-actions-prototype-v1'), skillVfx: null,
      summonAppearance: null, animation: sprite('shop/frost-actions-prototype-v1', 'animation'), voice: null
    }),
    thunder.skin,
    skin('solar-lion', '曜陽獅心', '守誓者 · 烈日王庭', 'hero', 'hunter', 'legendary', 1280, image('shop/sun-portrait-v1'), {
      portrait: image('shop/sun-portrait-v1'), selectionArt: image('shop/sun-portrait-v1'), battlefieldSprite: sprite('shop/sun-actions-v1'), skillVfx: null,
      summonAppearance: null, animation: sprite('shop/sun-actions-v1','animation'), voice: null
    }),
    skin('crimson-fox', '緋月狐影', '影行者 · 月下緋櫻', 'hero', 'rogue', 'legendary', 1280, image('shop/moon-portrait-v1'), {
      portrait: image('shop/moon-portrait-v1'), selectionArt: image('shop/moon-portrait-v1'), battlefieldSprite: sprite('shop/moon-actions-v1'), skillVfx: null,
      summonAppearance: null, animation: sprite('shop/moon-actions-v1','animation'), voice: null
    }),
    skin('bone-emperor', '冥骨帝王', '大酋長 · 幽冥王座', 'hero', 'chief', 'legendary', 1280, image('shop/bone-chief-portrait-v1'), {
      portrait: image('shop/bone-chief-portrait-v1'), selectionArt: image('shop/bone-chief-portrait-v1'), battlefieldSprite: { type: 'sprite', src: 'assets/td/shop/bone-chief-motion-v1.png', columns: 4, rows: 2, frames: 4 }, skillVfx: null,
      summonAppearance: null, animation: { type: 'animation', src: 'assets/td/shop/bone-chief-attack-v1.png', columns: 2, rows: 2, frames: 2 }, voice: null
    }),
    skin('eclipse-court', '日蝕王庭', '王國守望 · 黑金軍團', 'faction', 'hunter', 'legendary', 1680, image('shop/eclipse-court-concept-v1'), {
      soldierAppearance: image('combat-art/eclipse-units-a-v1'), towerAppearance: image('combat-art/eclipse-buildings-v1'), banner: image('shop/eclipse-court-concept-v1'), buildVfx: null, attackVfx: null
    }),
    skin('silverleaf-oath', '銀葉之盟', '銀葉軍團 · 森林之心', 'faction', 'silverleaf', 'rare', 480, forest, {
      soldierAppearance: sprite('faction-dryad-actions-v1'), towerAppearance: null, banner: forest, buildVfx: null, attackVfx: null
    }, '軍團造型尚未推出'),
    skin('arcane-echo', '暮影之翼', '傳送特效 · 幻紫之翼', 'effect', 'global', 'epic', 480, image('shop/phoenix-v2'), { skillVfx: null }, '敬請期待：正式特效尚未推出'),
    skin('frontier-banner', '邊境旗印', '個人頁籤 · 美術圖塊', 'other', 'profile', 'rare', 280, kingdom, { banner: kingdom }, '目前可在個人頁籤免費試用；正式販售尚未推出'),
    skin('guest-realm', '異界來訪', '聯名企劃 · 敬請期待', 'collaboration', 'reserved', 'legendary', 0, forest, { selectionArt: null }, 'Collaboration 預留，內容與價格尚未公布')
  ]);
  root.FrontierShop = Object.assign(root.FrontierShop || {}, { catalog });
  if (typeof module !== 'undefined') module.exports = catalog;
})(globalThis);
