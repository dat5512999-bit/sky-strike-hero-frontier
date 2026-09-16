(function(ns){
  'use strict';
  const DEFINITIONS={
    hunter:{name:'守誓者・雷恩',title:'英雄 · 遠程壓制',description:'遠程穿刺、陷阱緩速與戰狼協戰。',color:'#e6c56c'},
    arcanist:{name:'森語者・希爾芙',title:'英雄 · 法術控場',description:'冰霜新星、連鎖雷擊與元素召喚。',color:'#70e7ff'},
    rogue:{name:'影行者・維菈',title:'英雄 · 近戰突襲',description:'閃擊、持續傷害毒霧與分身。',color:'#c884df'}
  };
  class ProfessionSystem{
    constructor(){this.selected=null;}
    choose(type){if(!DEFINITIONS[type])return false;this.selected=type;return true;}
    current(){return this.selected?DEFINITIONS[this.selected]:null;}
    reset(){this.selected=null;}
  }
  ProfessionSystem.DEFINITIONS=DEFINITIONS;ns.systems.ProfessionSystem=ProfessionSystem;
})(globalThis.TowerFrontier);
