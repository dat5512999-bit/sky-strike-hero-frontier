(function(ns){
  'use strict';
  const ITEMS={
    'lion-bow':{name:'獅心王弓',rarity:'史詩',slot:'weapon',column:0,row:0,types:['hunter','musketeer','bountyHunter','dryad'],heroes:['hunter'],description:'攻擊 +28%、射程 +12%，額外增加一個攻擊目標。',mods:{damage:1.28,range:1.12,shots:1},title:'獅心神射手'},
    'lion-shield':{name:'不落獅盾',rarity:'傳說',slot:'armor',column:1,row:0,types:['royalCommander','shield','knight'],description:'每次攻擊附帶聖盾震波，擴大近距控場。',mods:{splash:24,interval:.9},title:'獅心聖盾'},
    'war-drum':{name:'先鋒戰鼓',rarity:'史詩',slot:'relic',column:2,row:0,types:['orc','shield','golem','pirate'],description:'傷害與攻速提高，第四擊的戰技範圍擴大。',mods:{damage:1.18,interval:.84,splash:18},title:'戰鼓統領'},
    'dragon-heart':{name:'翡翠龍心',rarity:'傳說',slot:'relic',column:0,row:1,types:['dragon'],description:'魔法傷害 +35%、爆炸範圍 +22。',mods:{damage:1.35,splash:22},title:'翡翠龍王'},
    'moon-staff':{name:'月銀古杖',rarity:'史詩',slot:'weapon',column:1,row:1,types:['arcanist','kingdomMage','alchemist','beastmaster'],heroes:['arcanist'],description:'魔法傷害 +30%，攻擊附帶一次連鎖。',mods:{damage:1.3,chain:2},title:'月銀大法師'},
    'vine-crown':{name:'常青冠冕',rarity:'精良',slot:'armor',column:2,row:1,types:['dragon','arcanist','treant','beastmaster','alchemist'],description:'攻速 +18%、射程 +10%，延伸定點火力。',mods:{interval:.82,range:1.1},title:'常青守護者'},
    'wolf-saddle':{name:'赤牙狼騎戰鞍',rarity:'傳說',slot:'relic',column:0,row:2,types:['orc'],description:'騎狼外觀，傷害 +22%、攻速 +12%、重擊範圍擴大。',mods:{interval:.88,damage:1.22,splash:20},title:'赤牙狼騎督軍',mount:'wolf'},
    'bone-crown':{name:'幽骨王冠',rarity:'傳說',slot:'armor',column:1,row:2,types:['skeleton','golem','soulsteel'],description:'傷害 +32%，額外攻擊一個目標。',mods:{damage:1.32,shots:1},title:'幽骨死亡騎士'},
    'soul-lantern':{name:'噬魂冥燈',rarity:'史詩',slot:'relic',column:2,row:2,types:['rogue','skeleton'],heroes:['rogue'],description:'攻擊附帶靈魂連鎖，擊殺賞金再提高。',mods:{chain:2,bountyBonus:.2},title:'噬魂行者'}
  };
  ITEMS['lion-bow'].types.push('frostHunter');
  ITEMS['war-drum'].types.push('frostWolf','frostBear','frostMammoth');
  ITEMS['moon-staff'].types.push('frostBird','frostShaman');
  ITEMS['vine-crown'].types.push('frostBird','frostShaman');
  ITEMS['war-drum'].heroes=['frostland'];
  const WILD_COMPATIBILITY={'lion-bow':['centaur'],'lion-shield':['boarRider','minotaur'],'war-drum':['centaur','boarRider','minotaur','shaman'],'moon-staff':['shaman'],'vine-crown':['centaur','shaman']};
  Object.entries(WILD_COMPATIBILITY).forEach(([id,types])=>{ITEMS[id].types=Array.from(new Set(ITEMS[id].types.concat(types)));});
  ITEMS['war-drum'].heroes.push('chief');
  ITEMS['war-drum'].heroes.push('naga');
  ITEMS['lion-shield'].types.push('nagaTideguard','nagaShellbreaker','nagaDeepWargod');
  ITEMS['war-drum'].types.push('nagaTideguard','nagaShellbreaker','nagaDeepWargod');
  ITEMS['lion-bow'].types.push('nagaMantaRaider','nagaVenomStalker');
  ITEMS['moon-staff'].types.push('nagaVenomStalker');
  ITEMS['vine-crown'].types.push('nagaMantaRaider','nagaVenomStalker');
  ITEMS['war-drum'].types.push('goblinMech');
  ITEMS['vine-crown'].heroes=['goblin'];
  ITEMS['lion-bow'].types.push('goblinEngineer','goblinGunner','goblinRiveter');
  ITEMS['war-drum'].types.push('goblinRecycler');
  class ArmorySystem{
    constructor(){this.reset();}
    reset(){this.owned=[];this.assignments=new Map();}
    get(id){const item=ArmorySystem.item(id),copy=String(id||'').match(/#(\d+)$/);return item&&copy?Object.assign({},item,{name:item.name+' · 第'+copy[1]+'件'}):item;}
    obtain(id){if(!ITEMS[id])return null;let copy=id,index=2;while(this.owned.includes(copy))copy=id+'#'+index++;this.owned.push(copy);return ITEMS[id];}
    targetLabel(target){if(!target)return'尚未選取單位';if(target.kind==='unit')return(typeof target.evolutionName==='function'?target.evolutionName():target.config().name)+(target.unitId?' #'+target.unitId:'');return ns.systems.HeroRoster.get(target.classType).name;}
    canEquip(id,target){const item=this.get(id);if(!item||!target)return false;if(target.kind==='unit')return(item.types||[]).indexOf(target.type)>=0;return Boolean(target.classType&&(item.heroes||[]).indexOf(target.classType)>=0);}
    syncHealth(target,beforeMax){if(!target||target.kind!=='unit')return;target.maxHealth=target.config().maxHealth;target.health=Math.min(target.maxHealth,(target.health||0)+Math.max(0,target.maxHealth-(beforeMax||target.maxHealth)));target.displayHealth=target.health;}
    wearer(id){return this.assignments.get(id)||null;}
    equip(id,target){const item=this.get(id);if(this.owned.indexOf(id)<0)return{ok:false,message:'尚未取得這件裝備'};if(!this.canEquip(id,target))return{ok:false,message:'這件裝備不適合目前選取的角色'};target.gear=target.gear||{};if(Object.values(target.gear).includes(id))return{ok:false,message:'目前角色已裝備 '+item.name};const previousTarget=this.wearer(id),movedFrom=previousTarget&&previousTarget!==target?this.targetLabel(previousTarget):null;if(previousTarget&&previousTarget!==target){const oldMax=previousTarget.maxHealth||0;Object.keys(previousTarget.gear).forEach(slot=>{if(previousTarget.gear[slot]===id)delete previousTarget.gear[slot];});this.syncHealth(previousTarget,oldMax);}const replacedIds=target.kind==='unit'?Object.values(target.gear):[target.gear[item.slot]];replacedIds.filter(Boolean).forEach(oldId=>{Object.keys(target.gear).forEach(slot=>{if(target.gear[slot]===oldId)delete target.gear[slot];});this.assignments.delete(oldId);});const beforeMax=target.maxHealth||0;target.gear[item.slot]=id;this.assignments.set(id,target);this.syncHealth(target,beforeMax);return{ok:true,item:item,replaced:replacedIds[0]||null,movedFrom:movedFrom,message:this.targetLabel(target)+' 裝備 '+item.name+(movedFrom?' · 已從 '+movedFrom+' 轉移':'')+(replacedIds[0]?' · 舊裝備已回軍械庫':'')};}
    unequip(slot,target){if(!target||!target.gear||!target.gear[slot])return{ok:false,message:'此欄位沒有裝備'};const beforeMax=target.maxHealth||0,id=target.gear[slot],item=this.get(id);delete target.gear[slot];this.assignments.delete(id);this.syncHealth(target,beforeMax);return{ok:true,item:item,message:this.targetLabel(target)+' 卸下 '+item.name+'，已回軍械庫'};}
    releaseTarget(target){if(!target||!target.gear)return[];const released=Object.keys(target.gear).map(slot=>this.unequip(slot,target).item).filter(Boolean);return released;}
    equipped(target){if(!target||!target.gear)return[];return Object.values(target.gear).map(id=>this.get(id)).filter(Boolean);}
    resaleValue(id){const item=this.get(id);if(!item||!this.owned.includes(id))return 0;const base=String(id).replace(/#\d+$/,'');const shop=Object.values(ns.systems.ShopSystem?.ITEMS||{}).find(offer=>offer.gear===base);return Math.round((shop?.cost||({精良:180,史詩:250,傳說:320}[item.rarity]||180))*.5);}
    sell(id,economy){if(!this.owned.includes(id))return{ok:false,message:'找不到這件裝備'};if(this.wearer(id))return{ok:false,message:'請先從持有人卸下這件裝備'};const gold=this.resaleValue(id);this.owned.splice(this.owned.indexOf(id),1);economy.refundGold(gold);return{ok:true,gold,message:'已販售 '+this.get(id).name+'，獲得 '+gold+'G'};}
    recommend(id,targets){const item=this.get(id);if(!item)return[];return (targets||[]).filter(target=>this.canEquip(id,target)).map(target=>{const cfg=target.combatConfig?target.combatConfig():target.config(),mods=item.mods||{};let score=0,reasons=[];if(mods.interval){score+=(1/Math.max(.2,cfg.interval))*22;reasons.push('高攻速可更頻繁觸發效果');}if(mods.shots||mods.chain){score+=(cfg.shots||1)*12+(cfg.chain||0)*8+(mods.shots||0)*16;reasons.push((cfg.shots||1)>1||cfg.chain?'多目標攻擊能放大觸發次數':'裝備會增加多目標能力');}if(mods.splash){score+=(cfg.splash||0)*.35+12;reasons.push('範圍攻擊可擴大群體收益');}if(mods.range){score+=(cfg.range||0)*.08;reasons.push('長射程可提高持續開火時間');}if(mods.damage)score+=(cfg.damage||0)/Math.max(.25,cfg.interval||1)*mods.damage*.3;if(!Object.keys(target.gear||{}).length){score+=14;reasons.push('目前未裝備，無換裝成本');}return{target,score,reason:reasons.slice(0,2).join('；')||'能力類型與此裝備相容'};}).sort((a,b)=>b.score-a.score).slice(0,3);}
    compare(id,target){const item=this.get(id);if(!item||!target||!this.canEquip(id,target))return null;const cfg=target.combatConfig?target.combatConfig():target.config(),mods=item.mods||{},rows=[];const add=(label,before,after,suffix)=>{const delta=after-before;if(Math.abs(delta)>.001)rows.push({label,before,after,delta,suffix:suffix||''});};add('攻擊',cfg.damage||0,(cfg.damage||0)*(mods.damage||1));add('攻速',1/(cfg.interval||1),1/((cfg.interval||1)*(mods.interval||1)));add('射程',cfg.range||0,(cfg.range||0)*(mods.range||1));add('目標',cfg.shots||1,(cfg.shots||1)+(mods.shots||0));add('範圍',cfg.splash||0,(cfg.splash||0)+(mods.splash||0));add('連鎖',cfg.chain||0,(cfg.chain||0)+(mods.chain||0));return{rows,special:item.description};}
    static item(id){return ITEMS[id]||ITEMS[String(id||'').replace(/#\d+$/,'')]||null;}
    static apply(target,config){const result=Object.assign({},config);if(!target||!target.gear)return result;Object.values(target.gear).forEach(function(id){const item=ArmorySystem.item(id);if(!item)return;const mods=item.mods||{};['damage','range','interval','speed','health'].forEach(function(key){if(mods[key]!==undefined){const source=key==='health'?'maxHealth':key;result[source]=(result[source]===undefined?(key==='health'?(result.health||0):0):result[source])*mods[key];}});['armor','shots','splash','chain','bountyBonus'].forEach(function(key){if(mods[key]!==undefined)result[key]=(result[key]===undefined&&key==='shots'?1:(result[key]||0))+mods[key];});});return result;}
    static title(target,fallback){if(!target||!target.gear)return fallback;const equipped=Object.values(target.gear).map(ArmorySystem.item).filter(Boolean);const signature=equipped.slice().reverse().find(item=>item.title);return signature?signature.title:fallback;}
    static visual(target){if(!target||!target.gear)return null;const items=Object.values(target.gear).map(ArmorySystem.item).filter(Boolean);return items.find(item=>item.mount)||items[items.length-1]||null;}
  }
  ArmorySystem.ITEMS=ITEMS;ns.systems.ArmorySystem=ArmorySystem;
})(globalThis.TowerFrontier);
