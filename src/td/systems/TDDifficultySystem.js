(function(ns){
  'use strict';
  const MODES={
    story:{name:'遠征見習',description:'較多容錯，適合熟悉英雄與建造。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'0% 0%',enemyHealth:.82,enemySpeed:.96,enemyDamage:.72,enemyCount:1.08,reward:1.14,baseHealth:25,preparation:1.25,spawnRate:1.08},
    standard:{name:'邊境守衛',description:'設計基準，推薦第一次正式挑戰。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'100% 0%',enemyHealth:1,enemySpeed:1,enemyDamage:1,enemyCount:1.14,reward:1,baseHealth:20,preparation:1,spawnRate:1},
    veteran:{name:'軍團老兵',description:'敵軍後段成長更快，需持續調整陣線。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'0% 100%',enemyHealth:1.65,healthGrowth:.03,enemySpeed:1.08,enemyDamage:1.4,enemyCount:1.18,reward:.85,baseHealth:18,preparation:.85,spawnRate:.78},
    calamity:{name:'災厄遠征',description:'高壓進軍與致命 Boss，為熟練玩家準備。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'100% 100%',enemyHealth:2.4,healthGrowth:.04,enemySpeed:1.14,enemyDamage:1.9,enemyCount:1.18,reward:.7,baseHealth:15,preparation:.7,spawnRate:.68}
  };
  class TDDifficultySystem{
    constructor(){this.reset();}
    reset(){this.selected='standard';}
    choose(id){if(!MODES[id])return false;this.selected=id;return true;}
    current(){return MODES[this.selected];}
    summary(totalWaves){const mode=this.current(),last=mode.enemyHealth*(1+(mode.healthGrowth||0)*(totalWaves-1));return totalWaves+' 關 · 城門耐久 '+mode.baseHealth+' 點｜敵軍血量 '+Math.round(mode.enemyHealth*100)+'%'+(last>mode.enemyHealth?' → '+Math.round(last*100)+'%':'')+'｜敵量約 '+Math.round(mode.enemyCount*100)+'%｜金幣 '+Math.round(mode.reward*100)+'%｜士兵定點作戰且不承受傷害';}
    modifiers(){const mode=this.current();return{enemyHealth:mode.enemyHealth,healthGrowth:mode.healthGrowth||0,enemySpeed:mode.enemySpeed,enemyDamage:mode.enemyDamage,enemyCount:mode.enemyCount,preparation:mode.preparation,spawnRate:mode.spawnRate};}
  }
  TDDifficultySystem.MODES=MODES;ns.systems.TDDifficultySystem=TDDifficultySystem;
})(globalThis.TowerFrontier);
