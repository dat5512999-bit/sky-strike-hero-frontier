(function(ns){
  'use strict';
  const ITEMS={
    spear:{name:'銀葉戰刃',cost:100,description:'每級英雄普攻與霜環、雷擊傷害 +20%'},
    rune:{name:'迅捷符文',cost:120,description:'每級新施放技能冷卻縮短 10%（最多 30%）'},
    charm:{name:'祖靈契約',cost:140,description:'每級英雄守衛持續 +3 秒、傷害 +20%'}
  };
  class ShopSystem{
    constructor(hero){this.hero=hero;}
    offer(id){const cfg=ITEMS[id];if(!cfg)return null;const level=this.hero.equipment[id]||0;return Object.assign({},cfg,{id:id,level:level,max:3,price:Math.round(cfg.cost*(1+level*.6))});}
    buy(id,economy){const item=this.offer(id);if(!item)return{ok:false,message:'找不到此商品'};if(item.level>=item.max)return{ok:false,message:'此裝備已達最高等級'};if(!economy.spend({gold:item.price}))return{ok:false,message:'金幣不足，還需要 '+(item.price-economy.gold)+'G'};this.hero.equipment[id]=item.level+1;return{ok:true,message:item.name+' 升至 Lv.'+(item.level+1)};}
  }
  ShopSystem.ITEMS=ITEMS;ns.systems.ShopSystem=ShopSystem;
})(globalThis.TowerFrontier);
