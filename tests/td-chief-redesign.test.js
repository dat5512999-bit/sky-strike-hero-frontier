'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs'),{inspect}=require('../scripts/inspect-evolution-atlas.cjs');
test('approved chief body and two evolution atlases have 48 complete measured poses with transparent borders',()=>{
  const {ns}=load();for(const form of [ns.systems.ChiefBaseSpriteAtlas,...Object.values(ns.systems.HeroEvolutionSpriteAtlas.chief)]){const r=inspect(form.path,form.worldHeight);assert.equal(r.count,16,form.path);assert.deepEqual(r.errors,[]);assert.equal(r.outside,0);assert.equal(r.form.width,form.width);assert.equal(r.form.height,form.height);assert.deepEqual(JSON.parse(JSON.stringify(form.frames)),r.form.frames);}
});
test('chief base uses measured rows and mirrors while preserving weapon upgrades, equipment and evolution state',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),h=new ns.entities.Hero(100,100);h.chooseClass('chief');h.equipment.spear=3;h.gear={weapon:'test'};let gear=0;art.drawGearPieces=()=>gear++;art.drawRank=()=>{};
  const before=JSON.stringify([h.equipment,h.gear,h.evolution,h.combatConfig(),h.healthAtLevel()]),image={ready:true},form=ns.systems.ChiefBaseSpriteAtlas;
  for(const [state,row]of [['idle',0],['walk',1],['attack',2],['cast',3]])for(let col=0;col<4;col++)for(const facing of [0,Math.PI]){
    const c=strictCanvas();Object.assign(h,{state,frame:col,facing});assert.equal(art.drawChiefBaseSprite(c.ctx,{...h,type:'chief',config:()=>ns.systems.HeroRoster.get('chief')},image),true);assert.equal(c.depth,0);const call=c.calls.find(a=>a[0]==='drawImage');assert.deepEqual(call.slice(2,6),Array.from(form.frames[row*4+col].slice(0,4)));assert.equal(c.calls.some(a=>a[0]==='scale'&&a[1]===-1),facing===Math.PI);
  }
  assert.equal(gear,32);assert.equal(JSON.stringify([h.equipment,h.gear,h.evolution,h.combatConfig(),h.healthAtLevel()]),before);assert.equal(art.drawChiefBaseSprite(strictCanvas().ctx,h,{ready:false}),false);
});
test('base render errors restore Canvas state and retired chief assets stay local rather than published',()=>{
  const {ns}=load(),c=strictCanvas(),art=Object.create(ns.systems.ArtSystem.prototype);art.drawGearPieces=()=>{throw Error('injected gear failure');};art.drawRank=()=>{};assert.throws(()=>art.drawChiefBaseSprite(c.ctx,{x:0,y:0,state:'cast',frame:1,facing:0},{ready:true}),/injected/);assert.equal(c.depth,0);
  const p=require('../scripts/build-static-site.cjs').plan(),paths=p.files.map(f=>f.path);for(const f of ['assets/td/wild-chief-actions-v1.png','assets/td/opening/hero-chief-selection-v2.png','assets/td/evolution/chief-awakened-actions-v1.png']){assert(fs.existsSync(f));assert(!paths.includes(f));}assert(paths.includes(ns.systems.ChiefBaseSpriteAtlas.path));
  const sw=fs.readFileSync('sw.js','utf8'),html=fs.readFileSync('td.html','utf8');assert(sw.includes(ns.systems.ChiefBaseSpriteAtlas.path));assert.equal(html.split('src/td/systems/ChiefBaseSpriteArt.js').length,2);
});
