'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,tick}=require('./helpers/td-runtime.cjs');
test('every deployed unit and building has its own purpose, also available in deployment preview',()=>{
 const {ns}=load(),g=game(ns);
 for(const [kind,catalog] of [['unit',ns.config.units],['building',ns.config.buildings]])for(const type of Object.keys(catalog)){
  const subject=kind==='unit'?new ns.entities.CombatUnit(type,100,100):new ns.entities.Building(type,100,100);
  const text=g.selectionPurpose(subject);assert.ok(text.startsWith('用途｜'));assert.ok(text.length>3);assert.equal(text,g.selectionPurpose({kind,type}));
  if(catalog[type].supportOnly)assert.match(text,/不直接攻擊/);
 }
});
test('time mage explains actual recipients, magnitude and cycle after upgrade',()=>{
 const {ns}=load(),g=game(ns),mage=new ns.entities.CombatUnit('timeMage',100,100),near=new ns.entities.CombatUnit('hunter',110,100),far=new ns.entities.CombatUnit('hunter',500,500),tower=new ns.entities.Building('arrow',120,100);
 mage.level=3;g.build.items=[mage,near,far,tower];tick(g,.1);
 assert.equal(near.supportHaste,.3);assert.equal(tower.supportHaste,.3);assert.equal(far.supportHaste,0);
 assert.match(g.selectionPurpose(mage),/每 8 秒.*其他士兵與防禦塔攻速 \+30%.*3 秒.*不含英雄與召喚物/);
 tick(g,3);assert.equal(near.supportHaste,0);assert.equal(tower.supportHaste,0);
});
test('support building purpose shows upgraded effect and range',()=>{
 const {ns}=load(),g=game(ns),flag=new ns.entities.Building('battleflag',100,100);flag.level=5;
 const text=g.selectionPurpose(flag);assert.match(text,/Lv\.5/);assert.match(text,/傷害 \+20%/);assert.match(text,/有效範圍 202/);
});
test('selection switching and clearing never leave stale purpose',()=>{
 const {ns}=load(),g=game(ns);g.ui={selectionPurpose:{hidden:true,textContent:''}};
 g.updateSelectionPurpose({kind:'unit',type:'timeMage'});assert.equal(g.ui.selectionPurpose.hidden,false);assert.match(g.ui.selectionPurpose.textContent,/30%/);
 g.updateSelectionPurpose({kind:'building',type:'cannon'});assert.match(g.ui.selectionPurpose.textContent,/群體收割/);assert.doesNotMatch(g.ui.selectionPurpose.textContent,/30%/);
 g.updateSelectionPurpose(null);assert.equal(g.ui.selectionPurpose.hidden,true);assert.equal(g.ui.selectionPurpose.textContent,'');
});

