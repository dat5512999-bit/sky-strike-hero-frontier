'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');

test('大酋長與首席工程師各有初始武器及三次同價規則的商店升級',()=>{
  const {ns}=load();
  for(const classType of ['chief','goblin']){
    const hero={classType,equipment:{spear:0}},shop=new ns.systems.ShopSystem(hero),economy={gold:1000,spend({gold}){if(this.gold<gold)return false;this.gold-=gold;return true;}};
    const names=[];
    assert.equal(ns.systems.EquipmentSystem.weapon(hero).level,0);
    for(let level=1;level<=3;level++){
      const offer=shop.offer('spear');
      assert.equal(offer.price,[100,160,220][level-1]);
      assert.equal(offer.visual.level,level);
      assert.ok(offer.visual.atlas);
      const bought=shop.buy('spear',economy);
      assert.equal(bought.ok,true);
      assert.equal(bought.item.level,level);
      names.push(bought.item.name);
    }
    assert.equal(new Set(names).size,3);
    assert.equal(shop.offer('spear').level,3);
    assert.equal(shop.buy('spear',economy).ok,false);
    assert.equal(hero.equipment.spear,3);
  }
});

test('兩組武器圖集皆具透明通道，可供商城及戰場共用',()=>{
  for(const file of ['chief-axes-v1.png','goblin-tools-v1.png']){
    const data=fs.readFileSync('assets/td/items/'+file);
    assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a');
    assert.ok(data.readUInt32BE(16)>=1500);
    assert.equal(data[25],6);
  }
});
