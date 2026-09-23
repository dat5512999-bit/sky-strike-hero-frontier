(function(ns){
  'use strict';
  const MODES={
    story:{name:'遠征見習',description:'基礎軍備教學；終極士兵與高階戰術塔鎖定。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'0% 0%',enemyHealth:.85,enemySpeed:.96,enemyDamage:.72,enemyCount:.85,reward:.78,baseHealth:25,preparation:1.25,spawnRate:1.15,content:'基礎軍備'},
    standard:{name:'邊境守衛',description:'正式配隊挑戰；開放全部普通軍備，終極士兵鎖定。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'100% 0%',enemyHealth:1.2,healthGrowth:.008,enemySpeed:1.02,enemyDamage:1.08,enemyCount:1.15,reward:.55,baseHealth:20,preparation:1,spawnRate:.92,content:'完整普通軍備'},
    veteran:{name:'軍團老兵',description:'完整軍備開放；更密集且後段成長更快。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'0% 100%',enemyHealth:1.65,healthGrowth:.03,enemySpeed:1.09,enemyDamage:1.45,enemyCount:1.35,reward:.45,baseHealth:18,preparation:.85,spawnRate:.78,content:'全部軍備'},
    calamity:{name:'災厄遠征',description:'完整軍備開放；最高密度與致命 Boss 壓力。',selectionArt:'assets/td/opening/difficulty-scenes-v1.png',selectionPosition:'100% 100%',enemyHealth:2.25,healthGrowth:.045,enemySpeed:1.16,enemyDamage:2,enemyCount:1.6,reward:.38,baseHealth:15,preparation:.7,spawnRate:.65,content:'全部軍備'}
  };
  const ULTIMATE_UNITS=['royalCommander','dragon','soulsteel'];
  const STORY_TOWERS=['armoryForge','ballista','moonwell','graveyard','boulder','thunderTotem'];
  class TDDifficultySystem{
    constructor(){this.reset();}
    reset(){this.selected='standard';}
    choose(id){if(!MODES[id])return false;this.selected=id;return true;}
    current(){return MODES[this.selected];}
    allows(kind,id){if(this.selected==='story'&&kind==='unit'&&['minotaur','shaman'].includes(id))return false;if((this.selected==='story'||this.selected==='standard')&&kind==='unit'&&ULTIMATE_UNITS.includes(id))return false;if(this.selected==='story'&&kind==='building'&&STORY_TOWERS.includes(id))return false;return true;}
    lockReason(kind,id){if(this.allows(kind,id))return'';return kind==='unit'?'軍團老兵以上開放':'邊境守衛以上開放';}
    summary(totalWaves){const mode=this.current(),last=mode.enemyHealth*(1+(mode.healthGrowth||0)*(totalWaves-1)),score=ns.systems.BattleReportSystem&&ns.systems.BattleReportSystem.DIFFICULTY_MULTIPLIERS[this.selected]||1;return totalWaves+' 關 · 城門耐久 '+mode.baseHealth+' 點｜積分 ×'+score+'｜敵軍血量 '+Math.round(mode.enemyHealth*100)+'%'+(last>mode.enemyHealth?' → '+Math.round(last*100)+'%':'')+'｜敵量約 '+Math.round(mode.enemyCount*100)+'%｜金幣 '+Math.round(mode.reward*100)+'%｜'+mode.content+'｜士兵定點作戰且不承受傷害';}
    modifiers(){const mode=this.current();return{enemyHealth:mode.enemyHealth,healthGrowth:mode.healthGrowth||0,enemySpeed:mode.enemySpeed,enemyDamage:mode.enemyDamage,enemyCount:mode.enemyCount,preparation:mode.preparation,spawnRate:mode.spawnRate};}
  }
  TDDifficultySystem.MODES=MODES;TDDifficultySystem.ULTIMATE_UNITS=ULTIMATE_UNITS;TDDifficultySystem.STORY_TOWERS=STORY_TOWERS;ns.systems.TDDifficultySystem=TDDifficultySystem;
})(globalThis.TowerFrontier);
