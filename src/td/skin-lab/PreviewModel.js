(function (root) {
  'use strict';
  const basePath = 'assets/td/hero-actions-v1.png';
  const frostPath = 'assets/td/shop/frost-actions-prototype-v1.png';
  const castLayout = Object.freeze({ src: 'assets/td/shop/frost-cast-prototype-v1.png', referenceSize: 1254, bodyHeight: 290,
    // Source x/y/width/height, then foot anchor x/y. Rectangles include transparent
    // gutters; the release plume is wider than half the sheet, so use explicit rects.
    frames: Object.freeze([[106, 65, 394, 549, 313, 585], [762, 65, 385, 560, 971, 585],
      [30, 787, 653, 358, 224, 1111], [761, 799, 425, 373, 995, 1137]].map(Object.freeze)) });
  const motions = Object.freeze(['idle', 'walk', 'attack', 'cast']);
  // This isolated page advances the real Hero animation. Appearance never enters Hero.
  class PreviewModel {
    constructor(engine, heroId = 'arcanist') {
      this.engine = engine;
      if (root.FrontierSkinLab.createPreviewHero) this.hero = root.FrontierSkinLab.createPreviewHero(engine, heroId);
      else { this.hero = new engine.entities.Hero(360, 360); if (!this.hero.chooseClass(heroId)) throw new Error('找不到此英雄'); }
      this.motion = 'idle'; this.time = 0; this.facing = 0; this.paused = false;
    }
    setMotion(motion) {
      if (!motions.includes(motion)) throw new Error('不支援的預覽動作');
      this.motion = motion; this.time = 0;
      this.hero.attackTimer = 0; this.hero.castTimer = 0; this.hero.pendingTarget = null;
      this.hero.x = 360; this.hero.y = 360; this.hero.targetX = 360; this.hero.targetY = 360;
      this.hero.state = motion; this.hero.frame = 0; this.hero.animationTime = 0;
    }
    advance(dt) {
      if (this.paused) return;
      dt = Math.max(0, Math.min(.05, Number(dt) || 0));
      const hero = this.hero;
      this.time += dt; hero.cooldown = 999;
      if (this.motion === 'walk') { hero.x = 360; hero.targetX = this.facing ? 260 : 460; }
      if (this.motion === 'attack' && hero.attackTimer <= dt) { hero.attackTimer = .36; hero.animationTime = 0; }
      if (this.motion === 'cast' && hero.castTimer <= dt) { hero.beginCast(); hero.animationTime = 0; }
      hero.update(dt, [], []);
      hero.facing = this.facing;
    }
    snapshot() {
      // Read-only rendering snapshot; x/y changes only position on the preview canvas.
      return Object.freeze({ ...this.hero, x: 0, y: 0, gear: Object.freeze({ ...this.hero.gear }), equipment: Object.freeze({ ...this.hero.equipment }) });
    }
    stats() { const cfg = this.hero.combatConfig(); return { damage: cfg.damage, maxHealth: this.hero.maxHealth, range: cfg.range, interval: cfg.interval, speed: cfg.speed, novaDamage: cfg.novaDamage, novaCooldown: cfg.novaCooldown }; }
  }
  function createRenderer(engine, image, castImage = null) {
    if (root.FrontierSkinLab.chiefLayouts && image.assetSrc === root.FrontierSkinLab.chiefLayouts.original.src) return root.FrontierSkinLab.createChiefRenderer(image);
    // Reuse the real renderer without constructing ArtSystem and loading a whole battle.
    const renderer = Object.create(engine.systems.ArtSystem.prototype);
    renderer.hero = image;
    renderer.heroHunter = image; renderer.heroRogue = image;
    // This page previews costume-only art, with no equipment layer. The hunter
    // renderer otherwise asks ArmorySystem to resolve even an empty gear object.
    renderer.drawHero = function (ctx, hero) {
      return engine.systems.ArtSystem.prototype.drawHero.call(this, ctx, Object.freeze({ ...hero, gear: null }));
    };
    if (castImage && image.assetSrc === frostPath) {
      const original = renderer.drawHero;
      renderer.drawHero = function (ctx, hero) {
        if (hero.state !== 'cast') return original.call(this, ctx, hero);
        const frame = Math.max(0, Math.min(3, hero.frame)), [x, y, w, h, ax, ay] = castLayout.frames[frame];
        const ratio = castImage.width / castLayout.referenceSize, scale = 78 / castLayout.bodyHeight;
        ctx.save(); ctx.translate(hero.x, hero.y + 12);
        if (Math.cos(hero.facing) < 0) ctx.scale(-1, 1);
        ctx.drawImage(castImage, x * ratio, y * ratio, w * ratio, h * ratio, (x - ax) * scale, (y - ay) * scale, w * scale, h * scale);
        ctx.restore(); return true;
      };
    }
    return renderer;
  }
  function registerPrototype(engine) {
    // Keep the existing idle/walk/attack prototype. Cast uses its own padded atlas
    // and never inherits these cut-outs. Do not copy runtime Path2D caches.
    const source = engine.systems.SpriteFrameBounds[basePath];
    engine.systems.SpriteFrameBounds[frostPath] = JSON.parse(JSON.stringify({ width: source.width, height: source.height, frames: source.frames, cuts: source.cuts }));
    engine.systems.ArtSystem.SPRITE_METRICS[frostPath] = { ...engine.systems.ArtSystem.SPRITE_METRICS[basePath] };
  }
  function presentationBounds(engine, paths) {
    // Union all poses and both skins, in the same world units as drawHero. A fixed
    // camera across motions prevents scale pumping and reserves space for full VFX.
    const result = { left: -32, right: 32, top: -90, bottom: 12 };
    for (const path of paths) {
      const atlas = engine.systems.SpriteFrameBounds[path], metric = engine.systems.ArtSystem.SPRITE_METRICS[path];
      if (!atlas || !metric) continue;
      const cellWidth = atlas.width / 4, cellHeight = atlas.height / 4, height = 78 / metric.visible;
      atlas.frames.forEach(([x, y, w, h], index) => {
        const left = ((x - index % 4 * cellWidth) / cellWidth - .5) * height;
        const top = ((y - Math.floor(index / 4) * cellHeight) / cellHeight - metric.foot) * height;
        const right = left + w / cellWidth * height, bottom = top + h / cellHeight * height;
        result.left = Math.min(result.left, left, -right); result.right = Math.max(result.right, right, -left);
        result.top = Math.min(result.top, top); result.bottom = Math.max(result.bottom, bottom);
      });
    }
    const castScale = 78 / castLayout.bodyHeight;
    (paths.includes(frostPath) ? castLayout.frames : []).forEach(([x, y, w, h, ax, ay]) => {
      result.left = Math.min(result.left, (x - ax) * castScale, -(x + w - ax) * castScale);
      result.right = Math.max(result.right, (x + w - ax) * castScale, -(x - ax) * castScale);
      result.top = Math.min(result.top, (y - ay) * castScale); result.bottom = Math.max(result.bottom, (y + h - ay) * castScale);
    });
    return Object.freeze(result);
  }
  function fitCamera(width, height, zoom, bounds) {
    const scale = Math.min(zoom, Math.max(1, width - 40) / (bounds.right - bounds.left), Math.max(1, height - 62) / (bounds.bottom - bounds.top));
    return { scale, x: width / 2, foot: 40 - bounds.top * scale };
  }
  function previewSkin(shop) {
    const skin = shop.catalog.find(item => item.id === 'astral-oath');
    return shop.schema.catalog([{ ...skin, slots: { ...skin.slots,
      battlefieldSprite: { ...skin.slots.battlefieldSprite, src: frostPath },
      animation: { ...skin.slots.animation, src: frostPath }
    } }])[0];
  }
  const api = { PreviewModel, createRenderer, registerPrototype, previewSkin, presentationBounds, fitCamera, basePath, frostPath, castLayout, motions };
  root.FrontierSkinLab = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
