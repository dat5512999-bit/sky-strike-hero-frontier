'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../src/td/shop/SkinCatalog.js');
const root=path.join(__dirname,'..'),pack=()=>catalog.find(item=>item.id==='goblin-contractors');
const pngSize=file=>{const data=fs.readFileSync(path.join(root,file));return {width:data.readUInt32BE(16),height:data.readUInt32BE(20)};};

test('地精工地防衛公司 has one explicit atlas cell for every soldier and tower',()=>{
  const skin=pack();assert.ok(skin);assert.equal(skin.category,'faction');assert.equal(skin.targetId,'goblin');
  const cover='assets/td/shop/goblin-contractors-concept-v1.png',units='assets/td/shop/goblin-contractors-units-v1.png',a='assets/td/shop/goblin-contractors-buildings-a-v1.png',b='assets/td/shop/goblin-contractors-buildings-b-v1.png';
  assert.equal(skin.cover.src,cover);for(const file of [cover,units,a,b])assert.ok(fs.existsSync(path.join(root,file)),file);
  assert.deepEqual(pngSize(units),{width:1254,height:1254});assert.deepEqual(pngSize(a),{width:2172,height:724});assert.deepEqual(pngSize(b),{width:2172,height:724});
  const source=fs.readFileSync(path.join(root,'src/td/systems/FactionSkinArt.js'),'utf8');
  for(const id of ['goblinEngineer','goblinGunner','goblinRiveter','goblinRecycler','goblinMech','goblinGenerator','goblinTurret','goblinMortar','goblinSnare','goblinCooler','goblinSiege'])assert.match(source,new RegExp(id));
  assert.match(source,/if\(!atlas\?\.ready\)return prior\.unit\.call\(this,ctx,unit\)/);assert.match(source,/return prior\.building\.apply\(this,arguments\)/);
  assert.match(fs.readFileSync(path.join(root,'td.html'),'utf8'),/src="src\/td\/systems\/FactionSkinArt\.js"/);
  const cache=fs.readFileSync(path.join(root,'sw.js'),'utf8');for(const file of [cover,units,a,b])assert.ok(cache.includes('./'+file),file+' must be available offline');
});

test('renderer selects the expected unit rows and A/B tower atlas without changing unselected factions',()=>{
  globalThis.TowerFrontier={systems:{},TDGame:function(){}};globalThis.TowerFrontier.TDGame.prototype={updateOpeningPresentation(){return 'base';}};
  globalThis.TowerFrontier.systems.ArtSystem=function(){};const proto=globalThis.TowerFrontier.systems.ArtSystem.prototype;let fallback=0;
  proto.drawCombatUnit=function(){fallback++;return 'unit-base';};proto.drawBuilding=function(){fallback++;return 'building-base';};
  globalThis.TowerFrontier.systems.ArtSystem.UNIT_HEIGHTS={goblinEngineer:82,goblinGunner:82,goblinRiveter:82,goblinRecycler:82,goblinMech:82};globalThis.TowerFrontier.systems.FactionSystem={FACTIONS:{goblin:{selectionFocus:'50% 50%'}}};globalThis.FrontierShop={catalog:[pack()]};
  delete require.cache[require.resolve('../src/td/systems/FactionSkinArt.js')];require('../src/td/systems/FactionSkinArt.js');
  const calls=[],ctx={save(){},restore(){},translate(){},scale(){},beginPath(){},ellipse(){},fill(){},stroke(){},drawImage(...args){calls.push(args);}};
  const art={cosmeticEquipped:{'faction:goblin':'goblin-contractors'},load(src){return {ready:true,width:src.includes('units')?1254:2172,height:src.includes('units')?1254:724,src};}};
  for(const [row,type] of ['goblinEngineer','goblinGunner','goblinRiveter','goblinRecycler','goblinMech'].entries()){calls.length=0;proto.drawCombatUnit.call(art,ctx,{type,x:20,y:30,level:1,state:'attack',frame:0,facing:0});assert.equal(calls.at(-1)[1],2*(1254/4));assert.equal(calls.at(-1)[2],row*(1254/5));}
  for(const type of ['goblinGenerator','goblinTurret','goblinMortar','goblinSnare','goblinRecycler','goblinCooler','goblinSiege']){calls.length=0;proto.drawBuilding.call(art,ctx,type,20,30,1);assert.equal(calls.at(-1)[0].ready,true);}
  art.cosmeticEquipped={};assert.equal(proto.drawCombatUnit.call(art,ctx,{type:'goblinEngineer'}),'unit-base');assert.equal(proto.drawBuilding.call(art,ctx,'goblinGenerator',0,0,1),'building-base');assert.equal(fallback,2);
});
