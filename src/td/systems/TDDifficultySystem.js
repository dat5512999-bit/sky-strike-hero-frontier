(function(ns){
  'use strict';
  const MODES={
    story:{name:'遠征見習',description:'較多容錯，適合熟悉英雄與建造。',enemyHealth:.82,enemySpeed:.96,enemyDamage:.72,reward:1.14,baseHealth:25,preparation:1.25,spawnRate:1.08},
    standard:{name:'邊境守衛',description:'設計基準，推薦第一次正式挑戰。',enemyHealth:1,enemySpeed:1,enemyDamage:1,reward:1,baseHealth:20,preparation:1,spawnRate:1},
    veteran:{name:'軍團老兵',description:'敵軍更耐打，失誤代價更高。',enemyHealth:1.16,enemySpeed:1.05,enemyDamage:1.22,reward:.98,baseHealth:18,preparation:.85,spawnRate:.9},
    calamity:{name:'災厄遠征',description:'高壓進軍與致命 Boss，為熟練玩家準備。',enemyHealth:1.34,enemySpeed:1.1,enemyDamage:1.48,reward:.94,baseHealth:15,preparation:.7,spawnRate:.8}
  };
  class TDDifficultySystem{
    constructor(){this.reset();}
    reset(){this.selected='standard';}
    choose(id){if(!MODES[id])return false;this.selected=id;return true;}
    current(){return MODES[this.selected];}
    modifiers(){const mode=this.current();return{enemyHealth:mode.enemyHealth,enemySpeed:mode.enemySpeed,enemyDamage:mode.enemyDamage,preparation:mode.preparation,spawnRate:mode.spawnRate};}
  }
  TDDifficultySystem.MODES=MODES;ns.systems.TDDifficultySystem=TDDifficultySystem;
})(globalThis.TowerFrontier);
