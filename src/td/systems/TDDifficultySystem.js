(function(ns){
  'use strict';
  const MODES={
    story:{name:'遠征見習',description:'較多容錯，適合熟悉英雄與建造。',enemyHealth:.82,enemySpeed:.96,enemyDamage:.72,reward:1.14,baseHealth:25,preparation:1.25,spawnRate:1.08,unitRecovery:{enabled:true,time:6,health:.75,guard:2}},
    standard:{name:'邊境守衛',description:'設計基準，推薦第一次正式挑戰。',enemyHealth:1,enemySpeed:1,enemyDamage:1,reward:1,baseHealth:20,preparation:1,spawnRate:1,unitRecovery:{enabled:true,time:10,health:.6,guard:1.5}},
    veteran:{name:'軍團老兵',description:'敵軍更耐打，失誤代價更高。',enemyHealth:1.65,healthGrowth:.02,enemySpeed:1.08,enemyDamage:1.4,reward:.85,baseHealth:18,preparation:.85,spawnRate:.82,unitRecovery:{enabled:true,time:16,health:.45,guard:1}},
    calamity:{name:'災厄遠征',description:'高壓進軍與致命 Boss，為熟練玩家準備。',enemyHealth:2.4,healthGrowth:.04,enemySpeed:1.14,enemyDamage:1.9,reward:.7,baseHealth:15,preparation:.7,spawnRate:.68,unitRecovery:{enabled:false,time:0,health:0,guard:0}}
  };
  class TDDifficultySystem{
    constructor(){this.reset();}
    reset(){this.selected='standard';}
    choose(id){if(!MODES[id])return false;this.selected=id;return true;}
    current(){return MODES[this.selected];}
    summary(totalWaves){const mode=this.current(),last=mode.enemyHealth*(1+(mode.healthGrowth||0)*(totalWaves-1));return totalWaves+' 關 · 城門耐久 '+mode.baseHealth+' 點｜敵軍血量 '+Math.round(mode.enemyHealth*100)+'%'+(last>mode.enemyHealth?' → '+Math.round(last*100)+'%':'')+'｜金幣 '+Math.round(mode.reward*100)+'%｜'+(mode.unitRecovery.enabled?'守軍 '+mode.unitRecovery.time+' 秒歸隊':'守軍永久陣亡');}
    modifiers(){const mode=this.current();return{enemyHealth:mode.enemyHealth,healthGrowth:mode.healthGrowth||0,enemySpeed:mode.enemySpeed,enemyDamage:mode.enemyDamage,preparation:mode.preparation,spawnRate:mode.spawnRate};}
  }
  TDDifficultySystem.MODES=MODES;ns.systems.TDDifficultySystem=TDDifficultySystem;
})(globalThis.TowerFrontier);
