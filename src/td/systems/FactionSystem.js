(function(ns){
  'use strict';
  const FACTIONS={
    frostland:{"id":"frostland","name":"霜原盟族","theme":"寒冷累積 · 狩獵窗口 · 碎冰","color":"#9bdbd5","status":"TESTABLE","storyStatus":"CONCEPT","selectionArt":"assets/td/frostland/faction-selection-v1.png","codexArt":"assets/td/codex/faction-frostland-v2.jpg","selectionFocus":"50% 50%","units":["frostWolf","frostBear","frostBird","frostHunter","frostShaman","frostMammoth"],"buildings":["frostCrystal","frostBlizzard","frostBallista","frostTotem","frostObelisk","frostAurora","frostGlacier"]},
    hunter:{id:'hunter',name:'王國遠征軍',theme:'王國',color:'#e6c56c',selectionArt:'assets/td/opening/faction-kingdom-selection-v1.png',codexArt:'assets/td/codex/faction-hunter-v2.jpg',selectionFocus:'62% 50%',units:['hunter','shield','musketeer','knight','kingdomMage','alchemist','royalCommander'],buildings:['arrow','iceward','cannon','barracks','ballista','supply','battleflag','armoryForge']},
    arcanist:{id:'arcanist',name:'月影守望者',theme:'精靈',color:'#70e7ff',selectionArt:'assets/td/opening/faction-silverleaf-selection-v1.png',codexArt:'assets/td/codex/faction-arcanist-v2.jpg',selectionFocus:'64% 50%',units:['arcanist','dragon','beastmaster','dryad','moonblade'],buildings:['frost','storm','grove','moonwell']},
    rogue:{id:'rogue',name:'暗影軍團',theme:'暗影',color:'#c884df',selectionArt:'assets/td/opening/faction-twilight-selection-v1.png',codexArt:'assets/td/codex/faction-rogue-v2.jpg',selectionFocus:'64% 50%',units:['rogue','skeleton','golem','banshee','boneRider','soulsteel'],buildings:['crypt','soul','graveyard','plague']},
    wild:{id:'wild',name:'荒野部族',theme:'獸族',color:'#df6548',selectionArt:'assets/td/opening/faction-wild-selection-v1.png',codexArt:'assets/td/codex/faction-wild-v2.jpg',selectionFocus:'56% 50%',units:['orc','centaur','boarRider','minotaur','shaman'],buildings:['warDrum','boulder','thunderTotem','totem']},
    goblin:{id:'goblin',name:'地精工程團',theme:'工程 · 機械網路',color:'#d9ad65',status:'TESTABLE',storyStatus:'STORY_LOCKED',selectionArt:'assets/td/goblin/faction-selection-v1.png',codexArt:'assets/td/codex/faction-goblin-v2.jpg',selectionFocus:'50% 50%',units:['goblinEngineer','goblinGunner','goblinRiveter','goblinRecycler','goblinMech'],buildings:['goblinGenerator','goblinTurret','goblinMortar','goblinSnare','goblinRecycler','goblinCooler','goblinSiege']}
    ,naga:{id:'naga',name:'娜迦潮衛',theme:'潮門 · 潮壓 · 陣線',color:'#55d3d0',status:'AVAILABLE',storyStatus:'FREE_EXPEDITION',selectionArt:'assets/td/concepts/naga-v1/naga-concept-board-v1.png',selectionFocus:'50% 14%',units:['nagaTideguard','nagaShellbreaker','nagaDeepWargod','nagaMantaRaider','nagaVenomStalker'],buildings:['nagaTidegate','nagaShellBastion','nagaAbyssShrine','nagaMantaAerie']}
  };
  class FactionSystem{
    constructor(){this.reset();}
    reset(){this.selected=null;this.unlockedUnits=new Set();this.unlockedBuildings=new Set();}
    choose(id){if(!FACTIONS[id])return false;this.selected=id;return true;}
    current(){return this.selected?FACTIONS[this.selected]:null;}
    unlock(kind,id){const catalog=kind==='building'?ns.config.buildings:ns.config.units;if(!catalog[id]||catalog[id].enemyOnly)return false;(kind==='building'?this.unlockedBuildings:this.unlockedUnits).add(id);return true;}
    available(kind){const faction=this.current(),base=faction?(kind==='building'?faction.buildings:faction.units):[],bonus=kind==='building'?this.unlockedBuildings:this.unlockedUnits;return Array.from(new Set(base.concat(Array.from(bonus))));}
    allows(kind,id){return this.available(kind).indexOf(id)>=0;}
    canHire(id,kind){kind=kind||'unit';const cfg=(kind==='building'?ns.config.buildings:ns.config.units)[id],contentAllowed=!this.contentGate||this.contentGate(kind,id);return Boolean(this.selected&&cfg&&!cfg.enemyOnly&&!this.allows(kind,id)&&contentAllowed);}
    summary(){const faction=this.current();return faction?faction.name+'｜守軍 '+this.available('unit').length+'｜建築 '+this.available('building').length:'尚未選擇軍團';}
  }
  FactionSystem.FACTIONS=FACTIONS;ns.systems.FactionSystem=FactionSystem;
})(globalThis.TowerFrontier);
