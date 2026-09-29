'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');const {strictCanvas}=require('./helpers/strict-canvas.cjs');

test('埃及選角使用男性 v2 肖像，三名南方英雄以實體 DOM 呈現技能圖示',()=>{
  const {ns}=load(),skills={dataset:{},innerHTML:''},g=Object.create(ns.TDGame.prototype);
  Object.assign(g,{selectedProfession:'egypt',selectedFaction:'wild',difficulty:{current:()=>({name:'測試'})},art:{cosmeticEquipped:{}},ui:{heroSkills:skills},report:null});
  g.updateOpeningPresentation();
  assert.match(ns.systems.HeroRoster.get('egypt').selectionArt,/hero-selection-v2\.png$/);
  assert.match(skills.innerHTML,/class="hero-skill-icon"/);assert.match(skills.innerHTML,/skill-icons-v1\.png/);assert.equal(skills.dataset.iconArt,'true');
  g.selectedProfession='hunter';g.updateOpeningPresentation();assert.equal(skills.dataset.iconArt,undefined);
});

test('矮人與龍族八座塔使用插畫圖集，部署卡不再顯示向量輪廓符號',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype);art.load=path=>({ready:true,width:2089,height:753,assetSrc:path});art.drawRank=()=>{};
  for(const faction of ['dwarf','dragonkin'])for(const type of ns.systems.FactionSystem.FACTIONS[faction].buildings){
    const canvas=strictCanvas();assert.equal(art.drawBuilding(canvas.ctx,type,160,180,1),true,type);
    assert.ok(canvas.calls.some(call=>call[0]==='drawImage'),type+' must use a painted tower atlas');assert.equal(canvas.depth,0,type+' restores canvas state');
  }
});

test('塔圖集載入後會清除舊的部署卡快取，而不是永久保留載入中的向量縮圖',()=>{
  const source=fs.readFileSync('src/td/systems/ImperialFactionArt.js','utf8');
  assert.match(source,/function buildingImage/);assert.match(source,/previewCache\?\.delete\('building:'\+type\)/);assert.match(source,/delete card\.dataset\.previewReady/);assert.match(source,/system\.game\?\.updateUi\?\.\(\)/);
});

test('8D performance containment reuses the convoy ordering buffer and preserves updates',()=>{
  const {ns}=load(),g=Object.create(ns.TDGame.prototype);let updates=0;
  Object.assign(g,{hero:{},report:{recordLeak(){}},baseHealth:20,flash(){},monsters:[
    {active:true,routeDistance:20,update(){updates++;},leaked:false},
    {active:true,routeDistance:40,update(){updates++;},leaked:false}
  ]});
  const before=g.monsters.slice();g.updateMonsterConvoy(.1);const buffer=g.convoyOrder;g.updateMonsterConvoy(.1);
  assert.equal(g.convoyOrder,buffer);assert.equal(updates,4);assert.deepEqual(g.monsters,before);
  const source=fs.readFileSync('src/td/systems/Performance8DOptimizer.js','utf8');assert.match(source,/active\.length=0/);assert.doesNotMatch(source,/this\.monsters\.filter/);
});
