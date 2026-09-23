(function (root) {
  'use strict';
  const definitions = [
    { heroId: 'arcanist', skinId: 'astral-oath', name: '霜華之誓', theme: '霜雪典藏', accent: '#a5d9ff',
      originalDescription: '翠綠披風 ／ 棕色長髮 ／ 奧術法師', description: '霜藍銀甲 ／ 銀白長髮 ／ 雪絨披風',
      portrait: 'assets/td/shop/frost-portrait-v2.png', baseSprite: 'assets/td/hero-actions-v1.png', sprite: 'assets/td/shop/frost-actions-prototype-v1.png', cast: 'assets/td/shop/frost-cast-prototype-v1.png' },
    { heroId: 'hunter', skinId: 'solar-lion', name: '曜陽獅心', theme: '烈日王庭', accent: '#eeb95b',
      originalDescription: '王國藍金鎧甲 ／ 藍色兜帽 ／ 王國獵手', description: '象牙白鎧 ／ 赤紅披風 ／ 太陽紋長弓',
      portrait: 'assets/td/shop/sun-portrait-v1.png', baseSprite: 'assets/td/hero-hunter-actions-v2.png', sprite: 'assets/td/shop/sun-actions-v1.png' },
    { heroId: 'rogue', skinId: 'crimson-fox', name: '緋月狐影', theme: '月下緋櫻', accent: '#ed95ac',
      originalDescription: '暗紫兜帽 ／ 暗影輕甲 ／ 月刃刺客', description: '緋紅戰袍 ／ 白髮狐面 ／ 月牙雙刃',
      portrait: 'assets/td/shop/moon-portrait-v1.png', baseSprite: 'assets/td/hero-rogue-actions-v2.png', sprite: 'assets/td/shop/moon-actions-v1.png' },
    { heroId: 'chief', skinId: 'bone-emperor', name: '冥骨帝王', theme: '幽冥王座', accent: '#9ce5b4',
      originalDescription: '赤紅部族甲 ／ 白狼毛皮 ／ 戰斧酋長', description: '龍骨肩甲 ／ 紫黑王袍 ／ 幽綠魂火巨斧',
      portrait: 'assets/td/shop/bone-chief-portrait-v1.png', baseSprite: 'assets/td/shop/chief-original-actions-v1.png', sprite: 'assets/td/shop/bone-chief-motion-v1.png', spriteRows: 2,
      attack: 'assets/td/shop/bone-chief-attack-v1.png', cast: 'assets/td/shop/bone-chief-cast-v1.png' },
    (root.FrontierShop?.thunderKing || require('../shop/ThunderKing.js')).look
  ];
  definitions.forEach(Object.freeze); Object.freeze(definitions);
  const actionLayouts = {
    hunter: { src: 'assets/td/shop/sun-attack-v1.png', referenceSize: 1254, bodyHeight: 455, frames: [[76,105,459,506,320,589],[672,41,515,575,920,593],[55,645,667,550,292,1168],[710,641,458,557,947,1174]] },
    rogue: { src: 'assets/td/shop/moon-attack-v1.png', referenceSize: 1254, bodyHeight: 420, frames: [[125,58,440,563,290,600],[734,82,480,555,1000,615],[38,737,626,458,235,1175],[703,839,545,379,955,1154]] }
  };
  const sheetFrames = {
    hunter: [[40,0,268,311],[350,0,267,313],[660,0,275,313],[970,0,284,313],[40,313,268,306],[340,313,280,309],[654,313,284,308],[971,320,283,303]],
    rogue: [[25,0,297,324],[334,0,291,323],[660,0,304,324],[973,0,281,325],[25,328,290,290],[332,328,295,292],[651,328,294,293],[973,327,281,295]]
  };
  Object.values(actionLayouts).forEach(layout => { layout.frames.forEach(Object.freeze); Object.freeze(layout.frames); Object.freeze(layout); }); Object.freeze(actionLayouts);
  function looksFor(heroId) { return definitions.filter(look => look.heroId === heroId); }
  function getLook(heroId, skinId) { return looksFor(heroId).find(look => skinId === undefined || look.skinId === skinId) || null; }
  function registerLook(engine, look) {
    if (look.heroId === 'chief') return;
    if (look.heroId === 'arcanist') { root.FrontierSkinLab.registerPrototype(engine); return; }
    const original = engine.systems.SpriteFrameBounds[look.baseSprite];
    const frames = original.frames.map((frame, index) => (sheetFrames[look.heroId][index] || frame).slice());
    engine.systems.SpriteFrameBounds[look.sprite] = { width: original.width, height: original.height, frames };
    engine.systems.ArtSystem.SPRITE_METRICS[look.sprite] = { ...engine.systems.ArtSystem.SPRITE_METRICS[look.baseSprite] };
  }
  function createLookRenderer(engine, look, image, actionImage, castImage) {
    if (look.heroId === 'chief') return root.FrontierSkinLab.createChiefRenderer(image, actionImage, castImage, look.skinId === 'thunder-king' ? root.FrontierShop.thunderKing.layouts : undefined);
    const renderer = root.FrontierSkinLab.createRenderer(engine, image, look.heroId === 'arcanist' ? actionImage : null);
    const layout = actionLayouts[look.heroId];
    if (!layout || !actionImage || image.assetSrc !== look.sprite) return renderer;
    const original = renderer.drawHero;
    renderer.drawHero = function (ctx, hero) {
      if (!['attack', 'cast'].includes(hero.state)) return original.call(this, ctx, hero);
      const [x, y, w, h, ax, ay] = layout.frames[Math.max(0, Math.min(3, hero.frame))];
      const ratio = actionImage.width / layout.referenceSize, scale = 78 / layout.bodyHeight;
      ctx.save(); ctx.translate(hero.x, hero.y + 12); if (Math.cos(hero.facing) < 0) ctx.scale(-1, 1);
      ctx.drawImage(actionImage, x * ratio, y * ratio, w * ratio, h * ratio, (x - ax) * scale, (y - ay) * scale, w * scale, h * scale); ctx.restore(); return true;
    };
    return renderer;
  }
  function lookBounds(engine, look) {
    if (look.heroId === 'chief') return root.FrontierSkinLab.chiefBounds(look.skinId === 'thunder-king' ? root.FrontierShop.thunderKing.layouts : undefined);
    const result = { ...root.FrontierSkinLab.presentationBounds(engine, [look.baseSprite, look.sprite]) }, layout = actionLayouts[look.heroId];
    if (layout) layout.frames.forEach(([x, y, w, h, ax, ay]) => {
      const scale = 78 / layout.bodyHeight;
      result.left = Math.min(result.left, (x - ax) * scale, -(x + w - ax) * scale);
      result.right = Math.max(result.right, (x + w - ax) * scale, -(x - ax) * scale);
      result.top = Math.min(result.top, (y - ay) * scale); result.bottom = Math.max(result.bottom, (y + h - ay) * scale);
    });
    return Object.freeze(result);
  }
  function cosmetic(look, shop) {
    const image = { type: 'image', src: look.portrait }, sprite = { type: 'sprite', src: look.sprite, columns: 4, rows: look.spriteRows || 4, frames: 4 };
    return shop.schema.catalog([{ schemaVersion: 1, id: look.skinId, name: look.name, subtitle: look.theme,
      description: look.description, category: 'hero', targetId: look.heroId, rarity: 'legendary', cosmeticOnly: true,
      price: { currency: 'mock-crystal', amount: 0 }, availability: { status: 'locked', reason: '試裝企劃，尚未販售' }, cover: image,
      slots: { portrait: image, selectionArt: image, battlefieldSprite: sprite, animation: { ...sprite, type: 'animation' }, skillVfx: null, summonAppearance: null, voice: null }
    }])[0];
  }
  const api = { definitions, getLook, looksFor, cosmetic, actionLayouts, registerLook, createLookRenderer, lookBounds };
  root.FrontierSkinLab = Object.assign(root.FrontierSkinLab || {}, api);
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
