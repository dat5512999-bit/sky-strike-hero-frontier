(function(ns){
  'use strict';
  const DEFINITIONS={
    hunter:{name:'王國獵手',title:'直線壓制',description:'射程最遠，升級後可同時狙擊多個目標。',color:'#e6c56c'},
    arcanist:{name:'奧術學院',title:'範圍法術',description:'以火焰濺射重甲軍團，但對秘法生物較弱。',color:'#ff8a52'},
    rogue:{name:'暗影行會',title:'偷竊經濟',description:'攻速快，擊殺可奪取額外金幣。',color:'#c884df'}
  };
  class ProfessionSystem{
    constructor(){this.selected=null;}
    choose(type){if(!DEFINITIONS[type])return false;this.selected=type;return true;}
    current(){return this.selected?DEFINITIONS[this.selected]:null;}
    reset(){this.selected=null;}
  }
  ProfessionSystem.DEFINITIONS=DEFINITIONS;ns.systems.ProfessionSystem=ProfessionSystem;
})(globalThis.TowerFrontier);
