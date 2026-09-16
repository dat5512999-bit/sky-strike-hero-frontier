(function(ns){
  'use strict';
  function availableStorage(){try{return globalThis.localStorage||null;}catch(error){return null;}}
  class BattleReportSystem{
    constructor(storage){this.storage=storage===undefined?availableStorage():storage;this.records=[];this.bestScore=0;this.loadRecords();this.reset();}
    loadRecords(){if(!this.storage)return;try{const saved=JSON.parse(this.storage.getItem(BattleReportSystem.STORAGE_KEY)||'null');if(saved&&Array.isArray(saved.runs)){this.records=saved.runs.slice(0,BattleReportSystem.MAX_RECORDS);this.bestScore=Math.max(Number(saved.bestScore)||0,...this.records.map(item=>Number(item.score)||0));}}catch(error){this.records=[];this.bestScore=0;}}
    saveRecords(){if(!this.storage)return false;try{this.storage.setItem(BattleReportSystem.STORAGE_KEY,JSON.stringify({version:1,bestScore:this.bestScore,runs:this.records.slice(0,BattleReportSystem.MAX_RECORDS)}));return true;}catch(error){return false;}}
    reset(){this.run={difficulty:'standard',difficultyName:'邊境守衛',profession:null,professionName:null,faction:null,factionName:null,maxBaseHealth:20};this.waves=[];this.current=null;this.finalResult=null;}
    beginRun(details){this.run=Object.assign({},this.run,details||{});}
    startWave(wave,snapshot){if(this.current&&this.current.wave===wave)return false;const parTime=Math.max(1,Number(snapshot&&snapshot.parTime)||BattleReportSystem.targetTime(wave));this.current={wave:wave,time:0,parTime:parTime,kills:0,killScore:0,killGold:0,leaks:0,gateDamage:0,heroDowns:0,unitDowns:0,unitLosses:0,baseBefore:snapshot.baseHealth,goldBefore:snapshot.gold,lumberBefore:snapshot.lumber};return true;}
    update(dt){if(this.current)this.current.time+=Math.max(0,dt||0);}
    recordKill(monster,reward){if(!this.current)return;this.current.kills+=1;this.current.killGold+=(reward&&reward.gold)||0;const type=monster&&monster.type||'unknown';this.current.killScore+=BattleReportSystem.KILL_SCORES[type]||BattleReportSystem.KILL_SCORES.default;this.current.types=this.current.types||{};this.current.types[type]=(this.current.types[type]||0)+1;}
    recordLeak(damage){if(!this.current)return;this.current.leaks+=1;this.current.gateDamage+=Math.max(0,Math.round(damage||0));}
    recordDefeat(target){if(!this.current||target&&target.kind==='unit')return;this.current.heroDowns+=1;}
    finish(snapshot,payout,cleared){if(!this.current)return null;const record=Object.assign({},this.current,{cleared:cleared!==false,baseAfter:snapshot.baseHealth,goldAfter:snapshot.gold,lumberAfter:snapshot.lumber,waveGold:(payout&&payout.gold)||0,waveLumber:(payout&&payout.lumber)||0});record.totalGold=record.killGold+record.waveGold;record.rank=this.rank(record);record.clearBonus=record.cleared?80+record.wave*5:0;record.perfectBonus=record.cleared&&record.gateDamage===0&&record.heroDowns===0?120:0;record.timeBonus=record.cleared?BattleReportSystem.timeBonus(record.time,record.parTime):0;record.scorePenalty=record.leaks*35+record.gateDamage*15+record.heroDowns*50;record.scoreMultiplier=this.multiplier();record.score=Math.max(0,Math.round((record.killScore+record.clearBonus+record.perfectBonus+record.timeBonus-record.scorePenalty)*record.scoreMultiplier));this.waves.push(record);this.current=null;return record;}
    completeWave(snapshot,payout){return this.finish(snapshot,payout,true);}
    abortWave(snapshot){return this.finish(snapshot,{gold:0,lumber:0},false);}
    rank(record){if(!record.cleared)return'潰敗';if(record.gateDamage===0&&record.heroDowns===0)return'完美';if(record.gateDamage<=2&&record.heroDowns<=1)return'穩固';if(record.gateDamage<=5)return'苦戰';return'險守';}
    latest(){return this.waves[this.waves.length-1]||null;}
    multiplier(){return BattleReportSystem.DIFFICULTY_MULTIPLIERS[this.run.difficulty]||1;}
    grade(score,waves){if(!waves)return'--';const average=score/waves;if(average>=360)return'SS';if(average>=300)return'S';if(average>=240)return'A';if(average>=170)return'B';if(average>=100)return'C';return'D';}
    totals(){return this.waves.reduce(function(total,wave){total.kills+=wave.kills;total.leaks+=wave.leaks;total.gateDamage+=wave.gateDamage;total.heroDowns+=wave.heroDowns;total.unitDowns+=wave.unitDowns||0;total.unitLosses+=wave.unitLosses;total.gold+=wave.totalGold;total.time+=wave.time;total.timeBonus+=wave.timeBonus||0;total.score+=wave.score||0;return total;},{kills:0,leaks:0,gateDamage:0,heroDowns:0,unitDowns:0,unitLosses:0,gold:0,time:0,timeBonus:0,score:0});}
    scoreState(){const total=this.totals(),live=this.current?Math.round((this.current.killScore||0)*this.multiplier()):0,waves=this.waves.length+(this.current?1:0),score=total.score+live;return{score:score,completedScore:total.score,liveScore:live,grade:this.grade(score,waves),waves:waves,multiplier:this.multiplier(),bestScore:this.bestScore,time:total.time,timeBonus:total.timeBonus};}
    finalize(victory){if(this.finalResult)return this.finalResult;const total=this.totals(),previousBest=this.bestScore,result={outcome:victory?'success':'failure',victory:Boolean(victory),score:total.score,grade:this.grade(total.score,this.waves.length),waves:this.waves.length,time:Number(total.time.toFixed(1)),timeBonus:total.timeBonus,difficulty:this.run.difficulty,difficultyName:this.run.difficultyName,profession:this.run.profession,professionName:this.run.professionName,faction:this.run.faction,factionName:this.run.factionName,completedAt:new Date().toISOString()};this.bestScore=Math.max(previousBest,result.score);result.bestScore=this.bestScore;result.isNewBest=result.score>previousBest;this.records.unshift(result);this.records=this.records.slice(0,BattleReportSystem.MAX_RECORDS);this.saveRecords();this.finalResult=result;return result;}
    milestone(record){return Boolean(record&&record.cleared&&record.wave%5===0);}
    line(record){if(!record)return'尚無完成波次';return'第 '+record.wave+' 波 '+record.rank+'｜'+record.time.toFixed(1)+' 秒｜速度 +'+record.timeBonus+'｜積分 '+record.score+'｜擊破 '+record.kills+'｜漏怪 '+record.leaks+'｜城門 -'+record.gateDamage+'｜英雄倒下 '+record.heroDowns+'｜+'+record.totalGold+'G';}
    finalLine(result){const total=this.totals(),final=result||this.finalResult;return'總擊破 '+total.kills+'｜總漏怪 '+total.leaks+'｜城門損失 '+total.gateDamage+'｜英雄倒下 '+total.heroDowns+'｜用時 '+total.time.toFixed(1)+' 秒（速度 +'+total.timeBonus+'）｜積分 '+total.score+'｜評級 '+this.grade(total.score,this.waves.length)+'｜最佳紀錄 '+(final?final.bestScore:this.bestScore);}
  }
  BattleReportSystem.STORAGE_KEY='heroFrontierScoreRecordsV1';
  BattleReportSystem.MAX_RECORDS=20;
  BattleReportSystem.TIME_POINTS_PER_SECOND=5;
  BattleReportSystem.targetTime=function(wave,enemyCount,spawnInterval){if(Number.isFinite(enemyCount)&&Number.isFinite(spawnInterval))return Math.max(20,Math.round(18+enemyCount*spawnInterval*1.15+Math.max(1,wave)*.8));return Math.round(28+Math.max(1,wave)*1.5);};
  BattleReportSystem.timeBonus=function(time,parTime){return Math.max(0,Math.round((Math.max(1,parTime)-Math.max(0,time))*BattleReportSystem.TIME_POINTS_PER_SECOND));};
  BattleReportSystem.KILL_SCORES={grunt:10,runner:12,raider:14,shaman:16,healer:18,revenant:18,brute:22,direwolf:16,warder:24,commander:30,boss:200,default:10};
  BattleReportSystem.DIFFICULTY_MULTIPLIERS={story:.8,standard:1,veteran:1.25,calamity:1.6};
  ns.systems.BattleReportSystem=BattleReportSystem;
})(globalThis.TowerFrontier);
