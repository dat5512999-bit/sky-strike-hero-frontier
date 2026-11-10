(function (root) {
  'use strict';
  root.FrontierSkinLab ||= {};
  // Read-only snapshot of the other development line's chief profile (2026-09-21).
  // Never register it in HeroRoster or replace a Core method/prototype.
  const chiefProfile = Object.freeze({ name: '大酋長・戈爾', faction: '荒野部族 · 萬族戰團',
    selectionArt: 'assets/td/opening/hero-chief-selection-v3.png', color: '#df6548',
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
    original: { src: 'assets/td/wild-chief-actions-v2.png', referenceWidth: 1254, bodyHeight: 291,
      frames: [[68,12,214,291,164,299],[373,6,206,297,466,299],[673,13,209,287,770,296],[984,13,198,289,1076,298],[32,321,254,285,152,602],[347,321,248,284,449,601],[644,321,239,286,767,603],[982,326,195,278,1078,600],[20,660,256,266,177,922],[327,616,263,308,471,920],[675,679,257,244,804,919],[985,680,238,240,1109,916]] },
    ...(root.FrontierChiefSkinAtlas || require('../shop/ChiefSkinAtlas.js'))['bone-emperor'].layouts
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
      ctx.save();try{ctx.translate(hero.x, hero.y + 12); if (Math.cos(hero.facing) < 0) ctx.scale(-1,1);
        ctx.drawImage(source,x*ratio,y*ratio,w*ratio,h*ratio,(x-ax)*scale,(y-ay)*scale,w*scale,h*scale);
      }finally{ctx.restore();}return true;
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
