'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const lab = require('../src/td/skin-lab/PreviewModel.js');
const schema = require('../src/td/shop/SkinSchema.js');
const catalog = require('../src/td/shop/SkinCatalog.js');
function engine() {
  const context = vm.createContext({});
  for (const file of ['namespace.js', 'config.js', 'systems/HeroRoster.js', 'entities/Hero.js', 'systems/SpriteFrameBounds.js', 'systems/ArtSystem.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/td', file), 'utf8'), context);
  return context.TowerFrontier;
}
const json = object => JSON.parse(JSON.stringify(object));
test('frost prototype reuses the cosmetic schema and correct arcanist hero atlas', () => {
  const skin = lab.previewSkin({ schema, catalog });
  assert.equal(skin.targetId, 'arcanist'); assert.equal(skin.cosmeticOnly, true);
  assert.equal(catalog[0].slots.battlefieldSprite.src, lab.frostPath);
  assert.equal(skin.slots.battlefieldSprite.src, lab.frostPath);
  assert.ok(Object.isFrozen(skin.slots));
  assert.ok(fs.existsSync(path.join(__dirname, '..', lab.frostPath)));
  assert.equal(schema.validate(skin), skin);
});
test('all four motions advance real Hero frames and repeat without changing combat stats', () => {
  const model = new lab.PreviewModel(engine()), stats = model.stats();
  for (const motion of lab.motions) {
    model.setMotion(motion);
    const frames = new Set();
    for (let i = 0; i < 180; i++) { model.advance(1 / 60); frames.add(model.hero.frame); assert.equal(model.hero.state, motion); }
    assert.deepEqual([...frames].sort(), [0, 1, 2, 3], motion);
    assert.deepEqual(model.stats(), stats);
  }
  assert.throws(() => model.setMotion('damage-boost'));
});
test('pause, turn, and presentation snapshots preserve the actual model', () => {
  const model = new lab.PreviewModel(engine()); model.setMotion('walk'); model.advance(.05);
  model.paused = true; const before = json(model.hero); model.advance(.05); assert.deepEqual(json(model.hero), before);
  const snapshot = model.snapshot(); assert.throws(() => { snapshot.equipment.spear = 99; });
  model.paused = false; model.facing = Math.PI; model.advance(.05);
  assert.equal(model.hero.facing, Math.PI); assert.equal(model.hero.classType, 'arcanist'); assert.equal(model.hero.health, 100);
});
test('prototype registration preserves every existing renderer metric and frame boundary', () => {
  const ns = engine(), bounds = json(ns.systems.SpriteFrameBounds), metrics = json(ns.systems.ArtSystem.SPRITE_METRICS);
  lab.registerPrototype(ns);
  for (const key of Object.keys(bounds)) assert.deepEqual(json(ns.systems.SpriteFrameBounds[key]), bounds[key]);
  for (const key of Object.keys(metrics)) assert.deepEqual(json(ns.systems.ArtSystem.SPRITE_METRICS[key]), metrics[key]);
  assert.equal(ns.systems.SpriteFrameBounds[lab.frostPath].frames.length, 16);
});
test('actual ArtSystem draws different atlases from the same frozen hero without writing combat state', () => {
  const ns = engine(), model = new lab.PreviewModel(ns); lab.registerPrototype(ns);
  const images = [lab.basePath, lab.frostPath].map(assetSrc => ({ assetSrc, width: 1254, height: 1254, ready: true }));
  const renderers = images.map(image => lab.createRenderer(ns, image)), draws = [];
  const ctx = new Proxy({}, { get: (_, key) => key === 'drawImage' ? (...args) => draws.push(args) : () => {} });
  const before = json(model.hero), stats = model.stats();
  for (const motion of lab.motions) {
    model.setMotion(motion); model.advance(.05);
    const hero = model.snapshot(), serialized = json(hero);
    renderers.forEach(renderer => assert.equal(renderer.drawHero(ctx, hero), true));
    assert.deepEqual(json(hero), serialized); assert.deepEqual(model.stats(), stats);
  }
  assert.ok(draws.some(args => args[0] === images[0])); assert.ok(draws.some(args => args[0] === images[1]));
  assert.equal(model.hero.health, before.health); assert.deepEqual(json(model.hero.gear), before.gear);
});
test('preview entry has no game bootstrap, persistence, or purchase integration', () => {
  const html = fs.readFileSync(path.join(__dirname, '../skin-lab.html'), 'utf8');
  const code = ['PreviewModel.js', 'main.js'].map(name => fs.readFileSync(path.join(__dirname, '../src/td/skin-lab', name), 'utf8')).join('\n');
  assert.doesNotMatch(html, /src="[^"\n]*(?:TDGame|ProfileStore|NavigationSystem|Save|EconomySystem)/);
  assert.doesNotMatch(code, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|\.buy\(|\.equip\(/);
});
test('cast uses four independent cells without inherited clip paths', () => {
  const ns = engine();
  ns.systems.SpriteFrameBounds[lab.basePath].clipPaths = [{ cached: true }];
  lab.registerPrototype(ns);
  const bounds = ns.systems.SpriteFrameBounds[lab.frostPath];
  assert.equal(bounds.clipPaths, undefined);
  const image = { assetSrc: lab.frostPath, ready: true }, castImage = { width: 1254, height: 1254 }, draws = [];
  const renderer = lab.createRenderer(ns, image, castImage);
  const ctx = new Proxy({}, { get: (_, key) => key === 'clip' ? () => assert.fail('cast must not use the old silhouette mask') : key === 'drawImage' ? (...args) => draws.push(args) : () => {} });
  const model = new lab.PreviewModel(ns); model.setMotion('cast');
  for (let frame = 0; frame < 4; frame++) {
    const hero = Object.freeze({ ...model.snapshot(), frame });
    const before = json(hero); renderer.drawHero(ctx, hero); assert.deepEqual(json(hero), before);
    assert.equal(draws[frame][0], castImage);
    assert.deepEqual(draws[frame].slice(1, 5), lab.castLayout.frames[frame].slice(0, 4));
  }
});
test('camera fits complete spell bounds for both skins and facings without changing scale between poses', () => {
  const ns = engine(); lab.registerPrototype(ns);
  const bounds = lab.presentationBounds(ns, [lab.basePath, lab.frostPath]);
  assert.ok(bounds.top < -90, 'cast VFX extends above the old idle-based camera');
  for (const [width, height] of [[738, 260], [398, 240], [160, 230]]) {
    for (const zoom of [1, 2.5]) {
      const camera = lab.fitCamera(width, height, zoom, bounds);
      assert.ok(camera.foot + bounds.top * camera.scale >= 39);
      assert.ok(camera.foot + bounds.bottom * camera.scale <= height - 21);
      assert.ok(camera.x + bounds.left * camera.scale >= 19);
      assert.ok(camera.x + bounds.right * camera.scale <= width - 19);
      assert.ok(camera.scale <= zoom);
    }
  }
});
