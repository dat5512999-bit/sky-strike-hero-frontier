(function(ns){
  'use strict';
  const FACTIONS={
    hunter:{id:'hunter',name:'王國遠征軍',theme:'王國',color:'#e6c56c',selectionArt:'assets/td/opening/faction-kingdom-selection-v1.png',selectionFocus:'62% 50%',units:['hunter','shield','musketeer','knight','kingdomMage','alchemist'],buildings:['arrow','iceward','cannon','barracks','ballista','supply','battleflag','armoryForge']},
    arcanist:{id:'arcanist',name:'月影守望者',theme:'精靈',color:'#70e7ff',selectionArt:'assets/td/opening/faction-silverleaf-selection-v1.png',selectionFocus:'64% 50%',units:['arcanist','dragon','beastmaster','dryad','moonblade'],buildings:['frost','storm','grove','moonwell']},
    rogue:{id:'rogue',name:'暗影軍團',theme:'暗影',color:'#c884df',selectionArt:'assets/td/opening/faction-twilight-selection-v1.png',selectionFocus:'64% 50%',units:['rogue','skeleton','golem','banshee','boneRider'],buildings:['crypt','soul','graveyard','plague']}
  };
  class FactionSystem{
    constructor(){this.reset();}
    reset(){this.selected=null;this.unlockedUnits=new Set();this.unlockedBuildings=new Set();}
    choose(id){if(!FACTIONS[id])return false;this.selected=id;return true;}
    current(){return this.selected?FACTIONS[this.selected]:null;}
    unlock(kind,id){const catalog=kind==='building'?ns.config.buildings:ns.config.units;if(!catalog[id]||catalog[id].enemyOnly)return false;(kind==='building'?this.unlockedBuildings:this.unlockedUnits).add(id);return true;}
    available(kind){const faction=this.current(),base=faction?(kind==='building'?faction.buildings:faction.units):[],bonus=kind==='building'?this.unlockedBuildings:this.unlockedUnits;return Array.from(new Set(base.concat(Array.from(bonus))));}
    allows(kind,id){return this.available(kind).indexOf(id)>=0;}
    canHire(id,kind){kind=kind||'unit';const cfg=(kind==='building'?ns.config.buildings:ns.config.units)[id];return Boolean(this.selected&&cfg&&!cfg.enemyOnly&&!this.allows(kind,id));}
    summary(){const faction=this.current();return faction?faction.name+'｜守軍 '+this.available('unit').length+'｜建築 '+this.available('building').length:'尚未選擇軍團';}
  }
  FactionSystem.FACTIONS=FACTIONS;ns.systems.FactionSystem=FactionSystem;
})(globalThis.TowerFrontier);
