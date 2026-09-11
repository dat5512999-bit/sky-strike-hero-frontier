(function(ns){
  'use strict';
  const FACTIONS={
    hunter:{id:'hunter',name:'王國遠征軍',theme:'王國',color:'#e6c56c',units:['hunter','shield'],buildings:['arrow','cannon','barracks','ballista']},
    arcanist:{id:'arcanist',name:'銀葉秘法庭',theme:'精靈',color:'#70e7ff',units:['arcanist','dragon'],buildings:['frost','storm','grove','moonwell']},
    rogue:{id:'rogue',name:'暮影盟約',theme:'暗影',color:'#c884df',units:['rogue','skeleton'],buildings:['crypt','soul','graveyard','plague']}
  };
  class FactionSystem{
    constructor(){this.reset();}
    reset(){this.selected=null;this.unlockedUnits=new Set();this.unlockedBuildings=new Set();}
    choose(id){if(!FACTIONS[id])return false;this.selected=id;return true;}
    current(){return this.selected?FACTIONS[this.selected]:null;}
    unlock(kind,id){const catalog=kind==='building'?ns.config.buildings:ns.config.units;if(!catalog[id])return false;(kind==='building'?this.unlockedBuildings:this.unlockedUnits).add(id);return true;}
    available(kind){const faction=this.current(),base=faction?(kind==='building'?faction.buildings:faction.units):[],bonus=kind==='building'?this.unlockedBuildings:this.unlockedUnits;return Array.from(new Set(base.concat(Array.from(bonus))));}
    allows(kind,id){return this.available(kind).indexOf(id)>=0;}
    summary(){const faction=this.current();return faction?faction.name+'｜守軍 '+this.available('unit').length+'｜建築 '+this.available('building').length:'尚未選擇軍團';}
  }
  FactionSystem.FACTIONS=FACTIONS;ns.systems.FactionSystem=FactionSystem;
})(globalThis.TowerFrontier);
