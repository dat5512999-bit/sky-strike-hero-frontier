(function(ns){
  'use strict';
  const KEY='heroFrontierScoreRecordsV1';
  const maps={beginner:['新手谷地','assets/td/beginner-valley-v2.png'],twinpass:['雙隘口要塞','assets/td/twin-pass-v1.png'],autumn:['暮秋遺跡','assets/td/autumn-ruins-v1.png']};
  Object.assign(maps,{silverleaf:['銀葉溪谷','assets/td/silverleaf-valley-v4.png'],shadowfall:['暮影舊城','assets/td/shadowfall-ruins-v3.png'],frostborn:['冰原裂谷','assets/td/frostborn-chasm-v3.png']});
  const heroes={hunter:['守誓者・雷恩','assets/td/opening/hero-hunter-selection-v1.png'],arcanist:['森語者・希爾芙','assets/td/opening/hero-arcanist-selection-v1.png'],rogue:['影行者・維菈','assets/td/opening/hero-rogue-selection-v1.png'],chief:['大酋長・戈爾','assets/td/opening/hero-chief-selection-v2.png'],goblin:['銅齒・奇克','assets/td/goblin-chief-engineer-v1.png']};
  heroes.frostland=['霜牙・凜','assets/td/frostland/hero-selection-v1.png'];
  const factions={frostland:'霜原盟族',hunter:'王國遠征軍',arcanist:'月影守望者',rogue:'暗影軍團',wild:'荒野部族',goblin:'地精工程團'};
  const difficulties={story:'遠征見習',standard:'邊境守衛',veteran:'軍團老兵',calamity:'災厄遠征'};
  // Older failed/retreated runs counted their unfinished wave. Never count it as cleared.
  const clearedWaves=r=>Number.isInteger(r.clearedWaves)?r.clearedWaves:Math.max(0,(Number(r.waves)||0)-(r.outcome==='success'||r.victory?0:1));
  const valid=r=>r&&clearedWaves(r)>=16&&r.rankingEligible!==false&&r.mode!=='story'&&r.map in maps&&r.difficulty in difficulties&&Number.isSafeInteger(Number(r.score))&&Number(r.score)>=0&&['success','failure','retreated',undefined].includes(r.outcome);
  class RankingDataSource{
    constructor(profileStore){this.profileStore=profileStore;}
    read(){
      try{
        const raw=this.profileStore.adapter('free').getItem(KEY);
        if(!raw)return {records:[],status:'empty'};
        const data=JSON.parse(raw);
        if(!Array.isArray(data.runs))throw new Error('格式不符');
        const records=data.runs.filter(valid).map((r,index)=>({runId:r.runId||'legacy-'+index+'-'+r.completedAt,playerName:'我的遠征',heroId:r.profession,factionId:r.faction,mapId:r.map,difficultyId:r.difficulty,finalScore:Number(r.score),clearTime:r.time,waveCount:clearedWaves(r),outcome:r.outcome||(r.victory?'success':'failure'),remainingBaseHP:r.remainingBaseHP,maxBaseHP:r.maxBaseHP,equipmentLoadout:r.finalArmy,timestamp:r.completedAt,scoreVersion:'BATTLE_V1'}));
        return {records,status:records.length?'ready':'empty'};
      }catch(error){return {records:[],status:'error'};}
    }
    static display(record){const map=maps[record.mapId]||[record.mapId,maps.beginner[1]],hero=heroes[record.heroId]||['未記錄英雄',heroes.hunter[1]];return {...record,mapName:map[0],mapImage:map[1],heroName:hero[0],heroImage:hero[1],factionName:factions[record.factionId]||'未指定陣營',difficultyName:difficulties[record.difficultyId]||record.difficultyId};}
  }
  RankingDataSource.clearedWaves=clearedWaves;RankingDataSource.MIN_CLEARED_WAVES=16;RankingDataSource.KEY=KEY;RankingDataSource.valid=valid;RankingDataSource.maps=maps;
  ns.ranking=ns.ranking||{};ns.ranking.RankingDataSource=RankingDataSource;
})(globalThis.TowerFrontier);
