'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {rgba}=require('./png-pixels.cjs');
const {load}=require('./helpers/td-runtime.cjs');

test('release version is consistent across lobby, battle page, reports and offline cache',()=>{
  const fs=require('node:fs'),version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
  for(const file of ['td.html','src/td/app/FrontierApp.js','src/td/systems/BattleReportSystem.js','sw.js','update.html'])assert.match(fs.readFileSync(file,'utf8'),new RegExp(version.replaceAll('.','\\.')),file);
});

test('evolution crest atlases are transparent, equally cropped and available offline',()=>{
  const cache=require('node:fs').readFileSync('sw.js','utf8');
  for(const file of ['assets/td/evolution-crests-awakened-v1.png','assets/td/evolution-crests-transcendent-v1.png']){
    assert.ok(cache.includes('./'+file),file+' is not cached for offline play');
    const {width,height,pixels}=rgba(file);assert.equal(width,1254);assert.equal(height,1254);
    for(let row=0;row<2;row++)for(let column=0;column<3;column++){
      let filled=0;for(let y=row*627+32;y<(row+1)*627-32;y+=8)for(let x=column*418+24;x<(column+1)*418-24;x+=8)if(pixels[(y*width+x)*4+3]>80)filled++;
      assert.ok(filled>40,file+' has an empty crest cell '+column+','+row);
    }
  }
});

test('frostland hero uses its approved animation atlas with measured source rectangles',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),calls=[];
  art.load=src=>({assetSrc:src,ready:true,width:1280,height:1280});
  const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>calls.push(args):()=>{}});
  const hero={classType:'frostland',state:'cast',frame:2,x:100,y:100,facing:0,equipment:{spear:0,rune:0,charm:0}};
  assert.equal(art.drawHero(ctx,hero),true);
  const call=calls.find(args=>args[0].assetSrc==='assets/td/frostland/hero-actions-v1.png');assert.ok(call);assert.deepEqual(call.slice(1,5),[662,909,264,325]);
});

test('all six evolved heroes receive a rank-specific production crest',()=>{
  const {ns}=load(),art={load:src=>({assetSrc:src,ready:true,width:1254,height:1254})},calls=[];
  const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>calls.push(args):()=>{}});
  for(const [rank,source] of [[1,'awakened'],[2,'transcendent']])for(const [index,classType] of ['hunter','arcanist','rogue','chief','goblin','frostland'].entries()){
    calls.length=0;const hero={classType,animationTime:0,x:100,y:100,evolution:{rank}};
    assert.equal(ns.systems.HeroEvolutionPresentation.draw(ctx,art,hero),true);
    const call=calls.find(args=>args[0].assetSrc);assert.ok(call);assert.match(call[0].assetSrc,new RegExp(source));assert.equal(call[1],(index%3)*418);assert.equal(call[2],Math.floor(index/3)*627);
  }
});

test('evolution casts and transformations are six-class visual-only transient states',()=>{
  const {ns}=load(),calls=[];
  const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?()=>{}:(...args)=>calls.push([key,args])});
  for(const classType of ['hunter','arcanist','rogue','chief','goblin','frostland']){
    const hero={classType,animationTime:0,x:100,y:100,evolution:{rank:2},evolutionCast:{slot:'f',rank:2,time:.5,max:1,targetX:165,targetY:125},evolutionReveal:{rank:2,time:.8,max:1.2}};
    assert.doesNotThrow(()=>ns.systems.HeroEvolutionPresentation.draw(ctx,{load:()=>({ready:false})},hero),classType);
    assert.equal(hero.evolution.rank,2,'presentation must not alter combat rank');
  }
  assert.ok(calls.some(([name])=>name==='arc'),'visual effects should draw animated geometry');
});

test('七個軍團的每名守軍都有五階名稱，且每個軍團至少有一座可分支進階建築',()=>{
  const {ns}=load(),factions=ns.systems.FactionSystem.FACTIONS;
  for(const faction of Object.values(factions)){
    for(const type of faction.units){const unit=new ns.entities.CombatUnit(type,0,0),names=[];for(let level=1;level<=5;level++){names.push(unit.evolutionName());if(level<5)unit.upgrade();}assert.equal(new Set(names).size,5,faction.id+' · '+type);}
    assert.ok(faction.buildings.some(type=>ns.systems.TowerEvolutionSystem.branches(type).length===2),faction.id+' needs a visible branch choice');
  }
});

test('地精與霜原分支改變實際戰鬥或網路資料，而不是只更換名稱',()=>{
  const {ns}=load(),network=new ns.systems.GoblinNetworkSystem(),generator=new ns.entities.Building('goblinGenerator',100,100),recycler=new ns.entities.Building('goblinRecycler',120,100),crystal=new ns.entities.Building('frostCrystal',100,100);
  generator.level=3;assert.equal(generator.chooseBranch('dynamo'),true);assert.equal(network.capacity(generator),7);
  recycler.level=3;assert.equal(recycler.chooseBranch('mint'),true);assert.equal(recycler.config().recyclerGold,20);assert.equal(recycler.config().recyclerCap,110);
  crystal.level=3;assert.equal(crystal.chooseBranch('permafrost'),true);assert.equal(crystal.config().frost,37.5);assert.equal(crystal.config().slow,.5);
});
