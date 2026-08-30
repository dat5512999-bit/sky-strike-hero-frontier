(function (ns) {
  'use strict';
  const STORAGE_KEY='sky-strike-difficulty';
  const MODES=[
    { id:'casual', name:'休閒', icon:'🌤', description:'敵人較慢，防線 7 點，果實較多', defenseIntegrity:7, threatStep:18, spawnMultiplier:1.12, enemySpeed:0.86, firstFruit:4, fruitInterval:10, dropChance:0.20, weights:{strawberry:.30,banana:.30,grape:.30,pineapple:.10}, unlimited:false, challengeInterval:20, challengeScale:.8 },
    { id:'normal', name:'標準', icon:'🎯', description:'完整詞綴與防線壓力，推薦遊玩', defenseIntegrity:5, threatStep:12, spawnMultiplier:1, enemySpeed:1, firstFruit:5, fruitInterval:12, dropChance:0.16, weights:{strawberry:.34,banana:.34,grape:.26,pineapple:.06}, unlimited:false, challengeInterval:18, challengeScale:1 },
    { id:'hard', name:'困難', icon:'🔥', description:'防線僅 4 點，敵人更快且果實更少', defenseIntegrity:4, threatStep:9, spawnMultiplier:.76, enemySpeed:1.18, firstFruit:6, fruitInterval:15, dropChance:0.11, weights:{strawberry:.36,banana:.36,grape:.24,pineapple:.04}, unlimited:false, challengeInterval:17, challengeScale:1.25 },
    { id:'musou', name:'無雙', icon:'⚡', description:'技能不限時、敵潮極快，防線 4 點', defenseIntegrity:4, threatStep:6, spawnMultiplier:.52, enemySpeed:1.38, firstFruit:2.5, fruitInterval:5, dropChance:0.28, weights:{strawberry:.40,banana:.38,grape:.20,pineapple:.02}, unlimited:true, challengeInterval:14, challengeScale:1.6 }
  ];
  class DifficultySystem {
    constructor(){ this.selectedId='normal'; }
    all(){ return MODES.slice(); }
    current(){ return MODES.find(function(mode){return mode.id===this.selectedId;},this)||MODES[1]; }
    select(id,persist){ if(!MODES.some(function(mode){return mode.id===id;})) return false; this.selectedId=id; if(persist!==false){try{globalThis.localStorage.setItem(STORAGE_KEY,id);}catch(_){}} return true; }
    restore(){ try{this.select(globalThis.localStorage.getItem(STORAGE_KEY),false);}catch(_){} return this.selectedId; }
  }
  ns.difficulty=new DifficultySystem();
  ns.systems.DifficultySystem=DifficultySystem;
})(globalThis.SkyStrike);
