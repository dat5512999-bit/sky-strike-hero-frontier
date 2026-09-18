(function(ns){
  'use strict';
  const ITEMS={
    'orc-contract':{name:'赤牙戰契',rarity:'傳說',icon:'⚔',description:'解鎖可定點部署、可升級的半獸人勇士與赤牙祖靈柱。',unlock:{units:['orc'],buildings:['totem']}},
    'wolf-core':{name:'狼王核心',rarity:'史詩',icon:'狼',description:'戰狼獲得裝甲進化，召喚數量與存續時間提升。',equipment:{charm:1}},
    'dragon-egg':{name:'翡翠龍卵',rarity:'傳說',icon:'龍',description:'解鎖幼龍守衛；牠能飛行並造成範圍魔法傷害。',unlock:{units:['dragon']}},
    'bone-contract':{name:'幽骨契約',rarity:'史詩',icon:'骷',description:'解鎖骷髏衛士與靈魂收割塔。',unlock:{units:['skeleton'],buildings:['soul']}},
    'royal-armory':{name:'王國軍械箱',rarity:'精良',icon:'盾',description:'解鎖重裝盾衛，並立即獲得 90 金幣。',unlock:{units:['shield']},resources:{gold:90}},
    'frontier-supplies':{name:'邊境補給',rarity:'精良',icon:'箱',description:'立即取得 120 金幣與 2 木材。',resources:{gold:120,lumber:2}},
    'gear-lion-bow':{name:'獅心王弓',rarity:'史詩',icon:'弓',description:'取得可裝備的獅心王弓。',gear:'lion-bow'},
    'gear-lion-shield':{name:'不落獅盾',rarity:'傳說',icon:'盾',description:'取得為盾衛攻擊附加聖盾震波的傳說獅盾。',gear:'lion-shield'},
    'gear-war-drum':{name:'先鋒戰鼓',rarity:'史詩',icon:'鼓',description:'取得強化盾衛或半獸人的戰鼓。',gear:'war-drum'},
    'gear-dragon-heart':{name:'翡翠龍心',rarity:'傳說',icon:'龍',description:'取得能使幼龍進化的龍心。',gear:'dragon-heart'},
    'gear-moon-staff':{name:'月銀古杖',rarity:'史詩',icon:'杖',description:'取得奧術師與精靈英雄可用的古杖。',gear:'moon-staff'},
    'gear-vine-crown':{name:'常青冠冕',rarity:'精良',icon:'冠',description:'取得延伸精靈守軍射程與攻速的常青冠冕。',gear:'vine-crown'},
    'gear-wolf-saddle':{name:'赤牙狼騎戰鞍',rarity:'傳說',icon:'鞍',description:'讓赤牙勇士真正騎上戰狼。',gear:'wolf-saddle'},
    'gear-bone-crown':{name:'幽骨王冠',rarity:'傳說',icon:'骨',description:'使骷髏劍士進階為死亡騎士。',gear:'bone-crown'},
    'gear-soul-lantern':{name:'噬魂冥燈',rarity:'史詩',icon:'燈',description:'為暗影守軍附加靈魂連鎖與賞金。',gear:'soul-lantern'}
  };
  class LootSystem{
    constructor(random){this.random=random||Math.random;this.reset();}
    reset(){this.claimed=new Set();this.pending=[];this.history=[];}
    get(id){return ITEMS[id]||null;}
    createOffers(wave,profession,faction){
      let pool=Object.keys(ITEMS).filter(id=>!this.claimed.has(id)||ITEMS[id].resources);
      if(faction==='arcanist'||!faction&&profession==='hunter')pool=pool.filter(id=>id!=='dragon-egg');
      if(faction==='rogue')pool=pool.filter(id=>id!=='bone-contract');
      const offers=[];
      if(wave===5&&!this.claimed.has('orc-contract'))offers.push('orc-contract');
      if(wave%3===0){let gearPool=pool.filter(id=>ITEMS[id].gear);if(wave===3){const starter={hunter:'lion-bow',arcanist:'moon-staff',rogue:'soul-lantern'}[profession];gearPool=gearPool.filter(id=>ITEMS[id].gear===starter);}if(gearPool.length){const id=gearPool[Math.floor(this.random()*gearPool.length)];offers.push(id);pool=pool.filter(entry=>entry!==id);}}
      while(offers.length<3&&pool.length){const index=Math.floor(this.random()*pool.length),id=pool.splice(index,1)[0];if(offers.indexOf(id)<0)offers.push(id);}
      this.pending=offers;return offers.map(id=>Object.assign({id:id},ITEMS[id]));
    }
    claim(id,context){if(this.pending.indexOf(id)<0||!ITEMS[id])return null;const item=ITEMS[id];this.pending=[];this.claimed.add(id);this.history.push(id);
      if(item.unlock){(item.unlock.units||[]).forEach(unit=>context.factions.unlock('unit',unit));(item.unlock.buildings||[]).forEach(building=>context.factions.unlock('building',building));}
      if(item.equipment){Object.keys(item.equipment).forEach(key=>{context.hero.equipment[key]=Math.min(3,(context.hero.equipment[key]||0)+item.equipment[key]);});}
      if(item.gear&&context.armory)context.armory.obtain(item.gear);
      if(item.resources){context.economy.gold+=item.resources.gold||0;context.economy.lumber+=item.resources.lumber||0;context.economy.merit+=item.resources.merit||0;}
      return Object.assign({id:id},item);
    }
    grant(id,context){if(!ITEMS[id])return null;this.pending=[id];return this.claim(id,context);}
    rollDrop(monster,profession,faction,activeDrops){
      const special=['boss','commander','healer','warder'].includes(monster.type),chance=monster.type==='boss'?1:special?.16:.018;
      if((activeDrops||0)>=3||this.random()>chance)return null;
      let pool=Object.keys(ITEMS).filter(id=>ITEMS[id].gear&&!this.claimed.has(id));
      if(faction==='arcanist'||!faction&&profession==='hunter')pool=pool.filter(id=>id!=='dragon-egg');
      if(!pool.length)pool=['frontier-supplies'];
      const id=pool[Math.floor(this.random()*pool.length)];return Object.assign({id},ITEMS[id]);
    }
    milestone(wave,context){
      const id={5:'orc-contract',10:'dragon-egg',15:'bone-contract'}[wave];
      if(!id||this.claimed.has(id))return null;return this.grant(id,context);
    }
  }
  LootSystem.ITEMS=ITEMS;ns.systems.LootSystem=LootSystem;
})(globalThis.TowerFrontier);
