(function(ns){
  'use strict';
  const ITEMS={
    spear:{name:'職業武器鍛造',cost:100,description:'每級英雄普攻與傷害技能 +20%'},
    rune:{name:'迅捷符文',cost:120,description:'每級新施放技能冷卻縮短 10%（最多 30%）'},
    charm:{name:'祖靈契約',cost:140,description:'每級英雄守衛持續 +3 秒、傷害 +20%'}
  };
  class ShopSystem{
    constructor(hero){this.hero=hero;}
    offer(id){const cfg=ITEMS[id];if(!cfg)return null;const level=this.hero.equipment[id]||0,item=Object.assign({},cfg,{id:id,level:level,max:3,price:Math.round(cfg.cost*(1+level*.6))});if(id==='spear'){const active=ns.systems.EquipmentSystem.weapon(this.hero),next=ns.systems.EquipmentSystem.nextWeapon(this.hero);item.visual=next||active;item.active=active;item.name=next?next.name:active.name;item.description=next?next.description:'目前已裝備最高階武器。';}return item;}
    buy(id,economy){const item=this.offer(id);if(!item)return{ok:false,message:'找不到此商品'};if(item.level>=item.max)return{ok:false,message:'此裝備已達最高等級'};if(!economy.spend({gold:item.price}))return{ok:false,message:'金幣不足，還需要 '+(item.price-economy.gold)+'G'};this.hero.equipment[id]=item.level+1;const equipped=id==='spear'?ns.systems.EquipmentSystem.weapon(this.hero):null;return{ok:true,item:equipped,message:equipped?'已裝備 '+equipped.rarityInfo.name+' · '+equipped.name:item.name+' 升至 Lv.'+(item.level+1)};}
    exchange(direction,economy){const rate=ns.systems.EconomySystem.MERIT_GOLD_RATE;if(direction==='gold-to-merit'){if(!economy.exchangeGoldForMerit())return{ok:false,message:'金幣不足，需要 '+rate+'G 才能兌換 1 功勳'};return{ok:true,message:'已用 '+rate+'G 兌換 1 功勳'};}if(direction==='merit-to-gold'){if(!economy.exchangeMeritForGold())return{ok:false,message:'功勳不足，需要 1 功勳才能兌換 '+rate+'G'};return{ok:true,message:'已用 1 功勳兌換 '+rate+'G'};}return{ok:false,message:'找不到此兌換項目'};}
  }
  ShopSystem.ITEMS=ITEMS;ns.systems.ShopSystem=ShopSystem;
})(globalThis.TowerFrontier);
