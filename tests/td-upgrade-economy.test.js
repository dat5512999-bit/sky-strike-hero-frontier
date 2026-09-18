'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');

test('all soldiers use a base-price upgrade curve instead of flat cheap upgrades',()=>{
  const {ns}=load(),ratios=[1,1.3,1.7,2.2];
  for(const [type,cfg] of Object.entries(ns.config.units)){
    if(cfg.enemyOnly)continue;
    const unit=new ns.entities.CombatUnit(type,100,100);
    for(let level=1;level<=4;level++){
      unit.level=level;
      assert.equal(unit.upgradeCost().gold,Math.round(cfg.cost*ratios[level-1]/5)*5,type+' Lv.'+level);
    }
  }
});

test('ancient dragon and other ultimate soldiers require premium proportional investment',()=>{
  const {ns}=load(),expected={royalCommander:[750,975,1275,1650],dragon:[800,1040,1360,1760],soulsteel:[850,1105,1445,1870]};
  for(const [type,prices] of Object.entries(expected)){
    const unit=new ns.entities.CombatUnit(type,100,100);
    prices.forEach((price,index)=>{unit.level=index+1;assert.equal(unit.upgradeCost().gold,price);});
  }
});

test('defense buildings retain their steeper proportional saving curve',()=>{
  const {ns}=load(),tower=new ns.entities.Building('arrow',100,100);
  assert.deepEqual([1,2,3,4].map(level=>{tower.level=level;return tower.upgradeCost().gold;}),[280,420,620,840]);
  assert.deepEqual([1,2,3,4].map(level=>{tower.level=level;return tower.upgradeCost().merit;}),[0,0,1,2]);
});
