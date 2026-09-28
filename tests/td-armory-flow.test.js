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

test('軍械庫與角色配裝各有獨立入口，販售在遊戲內確認，手機離線版包含介面程式',()=>{
  const html=fs.readFileSync('td.html','utf8'),worker=fs.readFileSync('sw.js','utf8'),ui=fs.readFileSync('src/td/systems/ArmoryUI.js','utf8');
  for(const id of ['td-armory-screen','td-armory-sell-screen','td-armory-sell-cancel','td-armory-sell-confirm','td-equip-screen','td-unit-equip','td-hero-equip'])assert.ok(html.includes('id="'+id+'"'));
  assert.ok(worker.includes("'./src/td/systems/ArmoryUI.js'"));
  assert.doesNotMatch(ui,/\bconfirm\s*\(/,'販售不能使用瀏覽器原生確認視窗');assert.match(ui,/requestArmorySale/);assert.match(ui,/confirmArmorySale/);assert.match(ui,/closeArmorySale/);
});

test('士兵配裝可列出相容軍械，未持有時仍能導向正確商店商品',()=>{
  const {ns}=load(),armory=new ns.systems.ArmorySystem(),hunter=new ns.entities.CombatUnit('hunter',100,100),shield=new ns.entities.CombatUnit('shield',100,100),ui=fs.readFileSync('src/td/systems/ArmoryUI.js','utf8'),game=fs.readFileSync('src/td/TDGame.js','utf8');
  assert.deepEqual(Array.from(armory.compatibleItems(hunter),item=>item.id).sort(),['lion-bow']);
  assert.deepEqual(Array.from(armory.compatibleItems(shield),item=>item.id).sort(),['lion-shield','war-drum']);
  assert.match(ui,/尚未取得可前往商店購買/);assert.match(ui,/openShopForEquipment/);assert.match(ui,/dataset\.shopGear/);
  assert.match(game,/適用目前選取/);assert.match(game,/dataset\.compatible/);
});
