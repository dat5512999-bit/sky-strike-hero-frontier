(function (root) {
  'use strict';
  root.FrontierSkinLab ||= {};
  // Read-only snapshot of the other development line's chief profile (2026-09-21).
  // Never register it in HeroRoster or replace a Core method/prototype.
  const chiefProfile = Object.freeze({ name: '大酋長・戈爾', faction: '荒野部族 · 萬族戰團',
    selectionArt: 'assets/td/shop/chief-original-portrait-v1.png', color: '#df6548',
    range: 112, damage: 24, interval: .66, attackType: 'chaos', splash: 26 });
  function rosterFor(engine, heroId) {
    const profile = engine.systems.HeroRoster.CLASSES[heroId];
    if (profile) return profile;
    if (heroId === 'chief') return chiefProfile;
    throw new Error('找不到此英雄');
  }
  function createPreviewHero(engine, heroId) {
    const profile = rosterFor(engine, heroId), hero = new engine.entities.Hero(360, 360);
    if (!hero.chooseClass(heroId)) {
      hero.classType = heroId;
      const original = hero.combatConfig;
      // Only this isolated preview instance uses the missing role's reference stats.
      hero.combatConfig = function () { return { ...original.call(this), ...profile }; };
    }
    return hero;
  }
  const chiefLayouts = {
    original: { src: 'assets/td/shop/chief-original-actions-v1.png', referenceWidth: 1312, bodyHeight: 287,
      frames: [[30,3,273,297,160,294],[364,2,282,296,495,292],[679,3,284,296,817,292],[1030,7,274,289,1164,288],
        [38,329,287,260,176,579],[360,326,274,266,496,583],[695,331,271,261,823,583],[1025,333,264,265,1159,578],
        [33,598,265,292,179,876],[334,602,281,286,483,874],[666,610,318,274,814,873],[1016,592,270,297,1150,881]] },
    motion: { src: 'assets/td/shop/bone-chief-motion-v1.png', referenceWidth: 1774, bodyHeight: 396,
      frames: [[20,20,385,414,240,423],[470,28,378,405,680,423],[905,30,379,404,1120,423],[1354,30,385,404,1560,423],
        [14,477,426,383,227,850],[452,484,428,376,663,850],[892,487,435,373,1107,850],[1337,492,425,365,1550,847]] },
    attack: { src: 'assets/td/shop/bone-chief-attack-v1.png', referenceWidth: 1254, bodyHeight: 380,
      frames: [[80,186,494,376,381,550],[757,18,360,546,968,552],[50,676,595,504,284,1105],[696,749,529,430,921,1128]] },
    cast: { src: 'assets/td/shop/bone-chief-cast-v1.png', referenceWidth: 1254, bodyHeight: 415,
      frames: [[46,40,472,509,302,536],[720,12,447,547,974,546],[20,568,613,637,329,1191],[692,727,534,474,922,1186]] }
  };
  Object.values(chiefLayouts).forEach(layout => { layout.frames.forEach(Object.freeze); Object.freeze(layout.frames); Object.freeze(layout); }); Object.freeze(chiefLayouts);
  function createChiefRenderer(image, attackImage, castImage, layouts = chiefLayouts) {
    const original = image.assetSrc === chiefLayouts.original.src;
    return { drawHero(ctx, hero) {
      let layout = original ? chiefLayouts.original : layouts.motion, source = image;
      const frame = Math.max(0, Math.min(3, hero.frame));
      let index = frame + (hero.state === 'walk' ? 4 : hero.state === 'attack' && original ? 8 : 0);
      // Current main-line chief cast uses idle poses; the new skin has a cosmetic warcry.
      if (!original && ['attack', 'cast'].includes(hero.state)) {
        layout = layouts[hero.state]; source = hero.state === 'attack' ? attackImage : castImage; index = frame;
      }
      if (!source || !source.ready) return false;
      const [x,y,w,h,ax,ay] = layout.frames[index], ratio = source.width / layout.referenceWidth, scale = 92 / layout.bodyHeight;
      ctx.save(); ctx.translate(hero.x, hero.y + 12); if (Math.cos(hero.facing) < 0) ctx.scale(-1,1);
      ctx.drawImage(source,x*ratio,y*ratio,w*ratio,h*ratio,(x-ax)*scale,(y-ay)*scale,w*scale,h*scale); ctx.restore(); return true;
    } };
  }
  function chiefBounds(layouts = chiefLayouts) {
    const bounds = { left: -40, right: 40, top: -100, bottom: 12 };
    [chiefLayouts.original, ...Object.values(layouts)].forEach(layout => layout.frames.forEach(([x,y,w,h,ax,ay]) => {
      const scale = 92 / layout.bodyHeight;
      bounds.left = Math.min(bounds.left,(x-ax)*scale,-(x+w-ax)*scale); bounds.right = Math.max(bounds.right,(x+w-ax)*scale,-(x-ax)*scale);
      bounds.top = Math.min(bounds.top,(y-ay)*scale); bounds.bottom = Math.max(bounds.bottom,(y+h-ay)*scale);
    }));
    return Object.freeze(bounds);
  }
  const api = { chiefProfile, rosterFor, createPreviewHero, chiefLayouts, createChiefRenderer, chiefBounds };
  Object.assign(root.FrontierSkinLab, api);
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
