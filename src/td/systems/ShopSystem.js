(function(ns){
  'use strict';
  const ITEMS={
    spear:{name:'職業武器鍛造',cost:100,description:'每級英雄普攻與傷害技能 +20%'},
    rune:{name:'迅捷符文',cost:120,description:'每級新施放技能冷卻縮短 10%（最多 30%）'},
    charm:{name:'祖靈契約',cost:140,description:'每級英雄守衛持續 +3 秒、傷害 +20%'},
    'gear-lion-bow':{name:'獅心王弓',cost:260,gear:'lion-bow',description:'遠程物理裝備：傷害、射程與目標數提升。'},
    'gear-moon-staff':{name:'月銀古杖',cost:270,gear:'moon-staff',description:'魔法裝備：提高傷害並增加連鎖。'},
    'gear-vine-crown':{name:'常青冠冕',cost:220,gear:'vine-crown',description:'通用法系護甲：提高攻速與射程。'},
    'gear-war-drum':{name:'先鋒戰鼓',cost:250,gear:'war-drum',description:'前排戰器：提高傷害、攻速與範圍。'},
    'gear-soul-lantern':{name:'噬魂冥燈',cost:280,gear:'soul-lantern',description:'暗影戰器：連鎖攻擊並增加擊殺賞金。'},
    'gear-bone-crown':{name:'幽骨王冠',cost:320,gear:'bone-crown',description:'重型護甲：提高傷害並增加攻擊目標。'},
    'evolution-stone':{name:'英雄進化石',special:'evolution',description:'以首領勳章購買；波次間可發起專屬試煉。'}
  };
  class ShopSystem{
    constructor(hero,armory){this.hero=hero;this.armory=armory;}
    offer(id){const cfg=ITEMS[id];if(!cfg)return null;if(cfg.special==='evolution'){const game=this.context,progress=ns.systems.HeroEvolutionSystem.progress(this.hero,game?.waves?.wave||0),gate=progress.gate;if(!gate)return Object.assign({},cfg,{id,level:1,max:1,price:0,emblems:0,name:'英雄進化完成',description:'已達超凡；後續波次以精研成長，不再轉職。'});return Object.assign({},cfg,{id,level:progress.hasStone?1:0,max:1,price:0,emblems:gate.emblems,stage:gate.wave,description:'第 '+gate.wave+' 波守成後，以 '+gate.emblems+' 枚首領勳章購買，開啟'+(this.hero.evolution.rank?'超凡':'覺醒')+'試煉。'});}if(cfg.gear){const copies=this.armory?this.armory.owned.filter(entry=>String(entry).replace(/#\d+$/,'')===cfg.gear).length:0;return Object.assign({},cfg,{id,level:copies,max:3,price:cfg.cost+copies*80,gearItem:ns.systems.ArmorySystem.item(cfg.gear)});}const level=this.hero.equipment[id]||0,item=Object.assign({},cfg,{id:id,level:level,max:3,price:Math.round(cfg.cost*(1+level*.6))});if(id==='charm'&&this.hero.classType==='chief')item.description='每級裂地衝擊波傷害 +20%；Lv.3 波幅加寬';if(id==='charm'&&this.hero.classType==='frostland')item.description='每級獵群號令持續 +1 秒；Lv.3 最長 8 秒';if(id==='spear'){const active=ns.systems.EquipmentSystem.weapon(this.hero),next=ns.systems.EquipmentSystem.nextWeapon(this.hero);item.visual=next||active;item.active=active;item.name=next?next.name:active.name;item.description=next?next.description:'目前已裝備最高階武器。';}return item;}
    usable(id){const offer=ITEMS[id];if(!offer?.gear||!this.context)return true;const item=ns.systems.ArmorySystem.item(offer.gear),deployed=this.context.build&&this.context.build.combatUnits?this.context.build.combatUnits().map(unit=>unit.type):[],units=Array.from(new Set(this.context.factions.available('unit').concat(deployed)));return Boolean(item&&((item.heroes||[]).includes(this.hero.classType)||(item.types||[]).some(id=>units.includes(id))));}
    buy(id,economy){if(!this.usable(id))return{ok:false,message:'目前隊伍沒有可使用此軍械的角色'};const item=this.offer(id);if(!item)return{ok:false,message:'找不到此商品'};if(item.special==='evolution')return ns.systems.HeroEvolutionSystem.buyStone(this.hero,economy,this.context?.waves?.wave||0);if(item.level>=item.max)return{ok:false,message:'此裝備已達購買上限'};if(!economy.spend({gold:item.price}))return{ok:false,message:'金幣不足，還需要 '+(item.price-economy.gold)+'G'};if(item.gear){this.armory.obtain(item.gear);return{ok:true,item:item.gearItem,message:'已購買 '+item.name+'，收入軍械庫'};}this.hero.equipment[id]=item.level+1;const equipped=id==='spear'?ns.systems.EquipmentSystem.weapon(this.hero):null;return{ok:true,item:equipped,message:equipped?'已裝備 '+equipped.rarityInfo.name+' · '+equipped.name:item.name+' 升至 Lv.'+(item.level+1)};}
    exchange(direction,economy){const rate=ns.systems.EconomySystem.MERIT_GOLD_RATE;if(direction==='gold-to-merit'){if(!economy.exchangeGoldForMerit())return{ok:false,message:'金幣不足，需要 '+rate+'G 才能兌換 1 功勳'};return{ok:true,message:'已用 '+rate+'G 兌換 1 功勳'};}if(direction==='merit-to-gold'){if(!economy.exchangeMeritForGold())return{ok:false,message:'功勳不足，需要 1 功勳才能兌換 '+rate+'G'};return{ok:true,message:'已用 1 功勳兌換 '+rate+'G'};}return{ok:false,message:'找不到此兌換項目'};}
  }
  ShopSystem.ITEMS=ITEMS;ns.systems.ShopSystem=ShopSystem;
})(globalThis.TowerFrontier);
