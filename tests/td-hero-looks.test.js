'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const lab = require('../src/td/skin-lab/PreviewModel.js'), chief = require('../src/td/skin-lab/ChiefPreview.js'), looks = require('../src/td/skin-lab/HeroLooks.js');
const schema = require('../src/td/shop/SkinSchema.js');
const json = value => JSON.parse(JSON.stringify(value));
function engine() {
  const context = vm.createContext({});
  for (const file of ['namespace.js','config.js','systems/HeroRoster.js','entities/Hero.js','systems/SpriteFrameBounds.js','systems/ArtSystem.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/td',file),'utf8'),context);
  return context.TowerFrontier;
}
test('all authored hero looks target existing heroes and use valid cosmetic assets', () => {
  const ns = engine(); assert.deepEqual([...new Set(looks.definitions.map(l=>l.heroId))].sort(), ['arcanist','chief','hunter','rogue']);
  assert.ok(looks.definitions.every(look=>ns.systems.HeroRoster.CLASSES[look.heroId]));
  assert.equal(new Set(looks.definitions.map(l=>l.skinId)).size, 5);
  for (const look of looks.definitions.filter(l=>!l.portraitOnly)) {
    const skin = looks.cosmetic(look,{schema}); assert.equal(skin.targetId,look.heroId); assert.ok(Object.isFrozen(skin.slots));
    for (const src of [look.portrait,look.baseSprite,look.sprite,look.cast || looks.actionLayouts[look.heroId]?.src || look.sprite]) assert.ok(fs.existsSync(path.join(__dirname,'..',src)),src);
    assert.equal(skin.cosmeticOnly,true); assert.equal(skin.availability.status,'locked');
  }
});
test('hero selection uses actual roster stats and preserves them across all preview motions', () => {
  const ns=engine();
  for (const id of ['hunter','rogue','arcanist','chief']) {
    const model=new lab.PreviewModel(ns,id), cfg=chief.rosterFor(ns,id), stats=model.stats();
    assert.equal(stats.damage,cfg.damage); assert.equal(stats.range,cfg.range); assert.equal(stats.interval,cfg.interval);
    for(const motion of lab.motions){model.setMotion(motion);for(let i=0;i<80;i++)model.advance(1/60);assert.equal(model.hero.classType,id);assert.deepEqual(model.stats(),stats);}
  }
  assert.throws(()=>new lab.PreviewModel(ns,'unknown'));
});
test('all base and skin renderers work without ArmorySystem and do not mutate heroes', () => {
  const ns=engine(); assert.equal(ns.systems.ArmorySystem,undefined);
  for (const look of looks.definitions.filter(l=>!l.portraitOnly)) {
    looks.registerLook(ns,look); const model=new lab.PreviewModel(ns,look.heroId);
    const base={assetSrc:look.baseSprite,width:1254,height:1254,ready:true}, skin={...base,assetSrc:look.sprite}, action={width:1254,height:1254,ready:true};
    const seen=[], ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>seen.push(args[0]):()=>{}});
    const renderers=[lab.createRenderer(ns,base),looks.createLookRenderer(ns,look,skin,action,action)];
    for(const state of lab.motions)for(let frame=0;frame<4;frame++){
      const hero=Object.freeze({...model.snapshot(),state,frame}), before=json(hero);
      renderers.forEach(renderer=>assert.equal(renderer.drawHero(ctx,hero),true)); assert.deepEqual(json(hero),before);
    }
    assert.ok(seen.includes(base));assert.ok(seen.includes(skin));assert.ok(seen.includes(action));
  }
});
test('new look metadata leaves all original core atlas entries untouched', () => {
  const ns=engine(), before=json(ns.systems.SpriteFrameBounds), metrics=json(ns.systems.ArtSystem.SPRITE_METRICS);
  looks.definitions.forEach(look=>looks.registerLook(ns,look));
  for(const key of Object.keys(before))assert.deepEqual(json(ns.systems.SpriteFrameBounds[key]),before[key]);
  for(const key of Object.keys(metrics))assert.deepEqual(json(ns.systems.ArtSystem.SPRITE_METRICS[key]),metrics[key]);
});

test('chief fallback creates only a preview instance and never registers or modifies Core', () => {
  const ns=engine(), realChief=ns.systems.HeroRoster.CLASSES.chief;
  delete ns.systems.HeroRoster.CLASSES.chief;
  const roster=json(ns.systems.HeroRoster.CLASSES), method=ns.entities.Hero.prototype.combatConfig;
  const hero=chief.createPreviewHero(ns,'chief');
  assert.equal(hero.classType,'chief'); assert.equal(hero.combatConfig().damage,24); assert.equal(hero.maxHealth,100);
  assert.deepEqual(json(ns.systems.HeroRoster.CLASSES),roster); assert.equal(ns.entities.Hero.prototype.combatConfig,method);
  assert.equal(ns.systems.HeroRoster.CLASSES.chief,undefined);
  ns.systems.HeroRoster.CLASSES.chief={...realChief,damage:27};
  const integrated=chief.createPreviewHero(ns,'chief');assert.equal(integrated.combatConfig().damage,27);assert.ok(!Object.hasOwn(integrated,'combatConfig'));
});
test('skin resolution cannot cross heroes and retained thunder assets remain available', () => {
  assert.equal(looks.getLook('hunter','bone-emperor'),null);assert.equal(looks.getLook('missing'),null);
  assert.deepEqual(looks.looksFor('chief').map(l=>l.skinId),['bone-emperor','thunder-king']);
  const saved=looks.getLook('chief','thunder-king');assert.notEqual(saved.portraitOnly,true);
  for(const src of [saved.portrait,saved.sprite]) assert.ok(fs.existsSync(path.join(__dirname,'..',src)));
});
