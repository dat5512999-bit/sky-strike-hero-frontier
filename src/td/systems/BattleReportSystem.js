(function(ns){
  'use strict';
  class BattleReportSystem{
    constructor(){this.reset();}
    reset(){this.run={difficulty:'standard',difficultyName:'邊境守衛',profession:null,professionName:null,faction:null,factionName:null,maxBaseHealth:20};this.waves=[];this.current=null;}
    beginRun(details){this.run=Object.assign({},this.run,details||{});}
    startWave(wave,snapshot){if(this.current&&this.current.wave===wave)return false;this.current={wave:wave,time:0,kills:0,killGold:0,leaks:0,gateDamage:0,heroDowns:0,unitDowns:0,unitLosses:0,baseBefore:snapshot.baseHealth,goldBefore:snapshot.gold,lumberBefore:snapshot.lumber};return true;}
    update(dt){if(this.current)this.current.time+=Math.max(0,dt||0);}
    recordKill(monster,reward){if(!this.current)return;this.current.kills+=1;this.current.killGold+=(reward&&reward.gold)||0;const type=monster&&monster.type||'unknown';this.current.types=this.current.types||{};this.current.types[type]=(this.current.types[type]||0)+1;}
    recordLeak(damage){if(!this.current)return;this.current.leaks+=1;this.current.gateDamage+=Math.max(0,Math.round(damage||0));}
    recordDefeat(target){if(!this.current||target&&target.kind==='unit')return;this.current.heroDowns+=1;}
    finish(snapshot,payout,cleared){if(!this.current)return null;const record=Object.assign({},this.current,{cleared:cleared!==false,baseAfter:snapshot.baseHealth,goldAfter:snapshot.gold,lumberAfter:snapshot.lumber,waveGold:(payout&&payout.gold)||0,waveLumber:(payout&&payout.lumber)||0});record.totalGold=record.killGold+record.waveGold;record.rank=this.rank(record);this.waves.push(record);this.current=null;return record;}
    completeWave(snapshot,payout){return this.finish(snapshot,payout,true);}
    abortWave(snapshot){return this.finish(snapshot,{gold:0,lumber:0},false);}
    rank(record){if(!record.cleared)return'潰敗';if(record.gateDamage===0&&record.heroDowns===0)return'完美';if(record.gateDamage<=2&&record.heroDowns<=1)return'穩固';if(record.gateDamage<=5)return'苦戰';return'險守';}
    latest(){return this.waves[this.waves.length-1]||null;}
    totals(){return this.waves.reduce(function(total,wave){total.kills+=wave.kills;total.leaks+=wave.leaks;total.gateDamage+=wave.gateDamage;total.heroDowns+=wave.heroDowns;total.unitDowns+=wave.unitDowns||0;total.unitLosses+=wave.unitLosses;total.gold+=wave.totalGold;total.time+=wave.time;return total;},{kills:0,leaks:0,gateDamage:0,heroDowns:0,unitDowns:0,unitLosses:0,gold:0,time:0});}
    milestone(record){return Boolean(record&&record.cleared&&record.wave%5===0);}
    line(record){if(!record)return'尚無完成波次';return'第 '+record.wave+' 波 '+record.rank+'｜擊破 '+record.kills+'｜漏怪 '+record.leaks+'｜城門 -'+record.gateDamage+'｜英雄倒下 '+record.heroDowns+'｜+'+record.totalGold+'G';}
    finalLine(){const total=this.totals();return'總擊破 '+total.kills+'｜總漏怪 '+total.leaks+'｜城門損失 '+total.gateDamage+'｜英雄倒下 '+total.heroDowns+'｜戰鬥收入 '+total.gold+'G';}
  }
  ns.systems.BattleReportSystem=BattleReportSystem;
})(globalThis.TowerFrontier);
