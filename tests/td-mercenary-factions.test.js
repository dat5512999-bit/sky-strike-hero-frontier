'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game}=require('./helpers/td-runtime.cjs');

test('商城傭兵卡會在正式冰原與地精圖集載入後重繪',()=>{
  const frost=fs.readFileSync('src/td/systems/FrostlandSprites.js','utf8'),goblin=fs.readFileSync('src/td/systems/GoblinArt.js','utf8');
  assert.match(frost,/\[data-mercenary\^="frost"\]/);
  assert.match(goblin,/\[data-mercenary\^="goblin"\]/);
  assert.match(frost,/previewCache\?\.delete\('unit:'\+id\)/);
  assert.match(goblin,/previewCache\?\.delete\('unit:'\+id\)/);
});

test('霜原與地精的四名傭兵只對非本族開放，並保留正確的跨族倍率',()=>{
  const {ns}=load(),factions=new ns.systems.FactionSystem(),choices={frostWolf:113,frostBird:218,goblinGunner:173,goblinRiveter:225};
  factions.choose('hunter');
  for(const [type,price] of Object.entries(choices)){
    assert.equal(factions.canHire(type,'unit'),true,type);
    assert.equal(Math.ceil(ns.config.units[type].cost*1.5),price,type);
  }
  factions.choose('frostland');assert.equal(factions.canHire('frostWolf','unit'),false);assert.equal(factions.canHire('frostBird','unit'),false);assert.equal(factions.canHire('goblinGunner','unit'),true);
  factions.choose('goblin');assert.equal(factions.canHire('goblinGunner','unit'),false);assert.equal(factions.canHire('goblinRiveter','unit'),false);assert.equal(factions.canHire('frostWolf','unit'),true);
});

test('已部署的霜原與地精傭兵會讓可用軍械出現在商城，三階購買與裝備皆有效',()=>{
  const {ns}=load(),g=game(ns),armory=new ns.systems.ArmorySystem(),shop=new ns.systems.ShopSystem(g.hero,armory);
  g.factions.choose('hunter');g.economy.gold=10000;shop.context=g;
  const cases=[['frostWolf','gear-war-drum','war-drum'],['frostBird','gear-moon-staff','moon-staff'],['goblinGunner','gear-lion-bow','lion-bow'],['goblinRiveter','gear-lion-bow','lion-bow']];
  const purchased=new Set();
  for(const [type,shopId,itemId] of cases){
    const unit=new ns.entities.CombatUnit(type,100,100);g.build.items.push(unit);
    assert.equal(shop.usable(shopId),true,type);
    if(!purchased.has(shopId)){for(let tier=1;tier<=3;tier++)assert.equal(shop.buy(shopId,g.economy).ok,true,type+' tier '+tier);purchased.add(shopId);}
    assert.equal(shop.offer(shopId).level,3,type);
    const copy=armory.owned.find(id=>String(id).replace(/#\d+$/,'')===itemId);
    assert.equal(armory.canEquip(copy,unit),true,type);
    assert.equal(armory.equip(copy,unit).ok,true,type);
    assert.equal(armory.unequip(ns.systems.ArmorySystem.item(copy).slot,unit).ok,true,type);
  }
});
