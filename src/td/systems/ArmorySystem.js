(function(ns){
  'use strict';
  const ITEMS={
    'lion-bow':{name:'獅心王弓',rarity:'史詩',slot:'weapon',column:0,row:0,types:['hunter'],heroes:['hunter'],description:'攻擊 +28%、射程 +12%，獵手額外增加一個目標。',mods:{damage:1.28,range:1.12,shots:1},title:'獅心神射手'},
    'lion-shield':{name:'不落獅盾',rarity:'傳說',slot:'armor',column:1,row:0,types:['shield'],description:'生命 +40%、護甲 +4，成為重裝聖盾。',mods:{health:1.4,armor:4},title:'獅心聖盾'},
    'war-drum':{name:'先鋒戰鼓',rarity:'史詩',slot:'relic',column:2,row:0,types:['orc','shield'],description:'傷害與攻速提高，第四擊的戰技範圍擴大。',mods:{damage:1.18,interval:.84,splash:18},title:'戰鼓統領'},
    'dragon-heart':{name:'翡翠龍心',rarity:'傳說',slot:'relic',column:0,row:1,types:['dragon'],description:'魔法傷害 +35%、爆炸範圍 +22。',mods:{damage:1.35,splash:22},title:'翡翠龍王'},
    'moon-staff':{name:'月銀古杖',rarity:'史詩',slot:'weapon',column:1,row:1,types:['arcanist'],heroes:['arcanist'],description:'魔法傷害 +30%，攻擊附帶一次連鎖。',mods:{damage:1.3,chain:2},title:'月銀大法師'},
    'vine-crown':{name:'常青冠冕',rarity:'精良',slot:'armor',column:2,row:1,types:['dragon','arcanist'],description:'生命 +25%、攻速 +12%。',mods:{health:1.25,interval:.88},title:'常青守護者'},
    'wolf-saddle':{name:'赤牙狼騎戰鞍',rarity:'傳說',slot:'relic',column:0,row:2,types:['orc'],description:'半獸人騎乘戰狼，移速 +35%、傷害 +22%、重擊範圍擴大。',mods:{speed:1.35,damage:1.22,splash:20},title:'赤牙狼騎督軍',mount:'wolf'},
    'bone-crown':{name:'幽骨王冠',rarity:'傳說',slot:'armor',column:1,row:2,types:['skeleton'],description:'傷害 +32%，額外攻擊一個目標。',mods:{damage:1.32,shots:1},title:'幽骨死亡騎士'},
    'soul-lantern':{name:'噬魂冥燈',rarity:'史詩',slot:'relic',column:2,row:2,types:['rogue','skeleton'],heroes:['rogue'],description:'攻擊附帶靈魂連鎖，擊殺賞金再提高。',mods:{chain:2,bountyBonus:.2},title:'噬魂行者'}
  };
  class ArmorySystem{
    constructor(){this.reset();}
    reset(){this.owned=[];this.assignments=new Map();}
    get(id){return ITEMS[id]||null;}
    obtain(id){if(!ITEMS[id])return null;if(this.owned.indexOf(id)<0)this.owned.push(id);return ITEMS[id];}
    targetLabel(target){if(!target)return'尚未選取單位';if(target.kind==='unit')return typeof target.evolutionName==='function'?target.evolutionName():target.config().name;return ns.systems.HeroRoster.get(target.classType).name;}
    canEquip(id,target){const item=ITEMS[id];if(!item||!target)return false;if(target.kind==='unit')return(item.types||[]).indexOf(target.type)>=0;return Boolean(target.classType&&(item.heroes||[]).indexOf(target.classType)>=0);}
    syncHealth(target,beforeMax){if(!target||target.kind!=='unit')return;target.maxHealth=target.config().maxHealth;target.health=Math.min(target.maxHealth,(target.health||0)+Math.max(0,target.maxHealth-(beforeMax||target.maxHealth)));target.displayHealth=target.health;}
    wearer(id){return this.assignments.get(id)||null;}
    equip(id,target){const item=ITEMS[id];if(this.owned.indexOf(id)<0)return{ok:false,message:'尚未取得這件裝備'};if(!this.canEquip(id,target))return{ok:false,message:'這件裝備不適合目前選取的角色'};target.gear=target.gear||{};if(target.gear[item.slot]===id)return{ok:false,message:'目前角色已裝備 '+item.name};const previousTarget=this.wearer(id),movedFrom=previousTarget&&previousTarget!==target?this.targetLabel(previousTarget):null;if(previousTarget&&previousTarget!==target){const oldMax=previousTarget.maxHealth||0;Object.keys(previousTarget.gear).forEach(slot=>{if(previousTarget.gear[slot]===id)delete previousTarget.gear[slot];});this.syncHealth(previousTarget,oldMax);}const replaced=target.gear[item.slot];if(replaced)this.assignments.delete(replaced);const beforeMax=target.maxHealth||0;target.gear[item.slot]=id;this.assignments.set(id,target);this.syncHealth(target,beforeMax);return{ok:true,item:item,replaced:replaced||null,movedFrom:movedFrom,message:this.targetLabel(target)+' 裝備 '+item.name+(movedFrom?' · 已從 '+movedFrom+' 轉移':'')};}
    unequip(slot,target){if(!target||!target.gear||!target.gear[slot])return{ok:false,message:'此欄位沒有裝備'};const beforeMax=target.maxHealth||0,id=target.gear[slot],item=ITEMS[id];delete target.gear[slot];this.assignments.delete(id);this.syncHealth(target,beforeMax);return{ok:true,item:item,message:this.targetLabel(target)+' 卸下 '+item.name};}
    releaseTarget(target){if(!target||!target.gear)return[];const released=Object.keys(target.gear).map(slot=>this.unequip(slot,target).item).filter(Boolean);return released;}
    equipped(target){if(!target||!target.gear)return[];return Object.values(target.gear).map(id=>ITEMS[id]).filter(Boolean);}
    static apply(target,config){const result=Object.assign({},config);if(!target||!target.gear)return result;Object.values(target.gear).forEach(function(id){const item=ITEMS[id];if(!item)return;const mods=item.mods||{};['damage','range','interval','speed','health'].forEach(function(key){if(mods[key]!==undefined){const source=key==='health'?'maxHealth':key;result[source]=(result[source]===undefined?(key==='health'?(result.health||0):0):result[source])*mods[key];}});['armor','shots','splash','chain','bountyBonus'].forEach(function(key){if(mods[key]!==undefined)result[key]=(result[key]===undefined&&key==='shots'?1:(result[key]||0))+mods[key];});});return result;}
    static title(target,fallback){if(!target||!target.gear)return fallback;const equipped=Object.values(target.gear).map(id=>ITEMS[id]).filter(Boolean);const signature=equipped.slice().reverse().find(item=>item.title);return signature?signature.title:fallback;}
    static visual(target){if(!target||!target.gear)return null;const items=Object.values(target.gear).map(id=>ITEMS[id]).filter(Boolean);return items.find(item=>item.mount)||items[items.length-1]||null;}
  }
  ArmorySystem.ITEMS=ITEMS;ns.systems.ArmorySystem=ArmorySystem;
})(globalThis.TowerFrontier);
