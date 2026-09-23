'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');

test('閒置裝備可半價販售，裝備中不可販售，卸下後可販售',()=>{
  const {ns}=load(),armory=new ns.systems.ArmorySystem(),economy=new ns.systems.EconomySystem(),unit=new ns.entities.CombatUnit('shield',100,100);
  armory.obtain('war-drum');const starting=armory.resaleValue('war-drum');assert.equal(starting,125);
  assert.equal(armory.equip('war-drum',unit).ok,true);
  assert.equal(armory.sell('war-drum',economy).ok,false);
  assert.equal(armory.owned.length,1);
  assert.equal(armory.unequip('relic',unit).ok,true);
  const gold=economy.gold;assert.equal(armory.sell('war-drum',economy).ok,true);
  assert.equal(economy.gold,gold+starting);assert.equal(armory.owned.length,0);
});

test('軍械庫與角色配裝各有獨立入口，手機離線版包含介面程式',()=>{
  const html=fs.readFileSync('td.html','utf8'),worker=fs.readFileSync('sw.js','utf8');
  for(const id of ['td-armory-screen','td-equip-screen','td-unit-equip','td-hero-equip'])assert.ok(html.includes('id="'+id+'"'));
  assert.ok(worker.includes("'./src/td/systems/ArmoryUI.js'"));
});
