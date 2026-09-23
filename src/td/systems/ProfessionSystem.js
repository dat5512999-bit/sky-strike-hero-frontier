(function(ns){
  'use strict';
  const DEFINITIONS={
    frostland:{name:'霜牙・凜',title:'英雄 · 冰原獵首',description:'狩獵領袖：先累積寒冷，再用碎冰與獵群追击；身世 CONCEPT / UNKNOWN。',color:'#9bdbd5'},
    hunter:{name:'守誓者・雷恩',title:'英雄 · 遠程壓制',description:'遠程穿刺、陷阱緩速與戰狼協戰。',color:'#e6c56c'},
    arcanist:{name:'森語者・希爾芙',title:'英雄 · 法術控場',description:'冰霜新星、連鎖雷擊與元素召喚。',color:'#70e7ff'},
    rogue:{name:'影行者・維菈',title:'英雄 · 近戰突襲',description:'閃擊、持續傷害毒霧與分身。',color:'#c884df'},
    chief:{name:'大酋長・戈爾',title:'英雄 · 戰團爆發',description:'戰吼引爆荒野狂潮，以近戰重斧帶領戰團。',color:'#df6548'},
    goblin:{name:'銅齒・奇克',title:'首席工程師 · 機械調度',description:'臨場改裝、蒸汽洩壓、巡修機偶與全網超載。',color:'#d9ad65'}
  };
  class ProfessionSystem{
    constructor(){this.selected=null;}
    choose(type){if(!DEFINITIONS[type])return false;this.selected=type;return true;}
    current(){return this.selected?DEFINITIONS[this.selected]:null;}
    reset(){this.selected=null;}
  }
  ProfessionSystem.DEFINITIONS=DEFINITIONS;ns.systems.ProfessionSystem=ProfessionSystem;
})(globalThis.TowerFrontier);
