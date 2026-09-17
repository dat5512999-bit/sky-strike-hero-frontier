(function(ns){
  'use strict';
  const WAVES=[
    {name:'邊境斥候',hint:'基礎輕甲部隊',groups:[['grunt',10]],reward:[24,1],threat:1},
    {name:'疾風試探',hint:'獵犬與裂風狼群分兩速突進',groups:[['runner',9],['direwolf',3]],reward:[28,1],threat:2},
    {name:'秘法前鋒',hint:'術士後方混入會近身攻擊英雄的赤牙掠奪者',groups:[['grunt',6],['shaman',5],['raider',2]],reward:[34,1],threat:3},
    {name:'盾牆試煉',hint:'盾衛先消耗護盾再承受生命傷害',groups:[['warder',5],['brute',3],['grunt',5]],reward:[40,1],threat:4},
    {name:'戰將壓境',hint:'首領率岩獸與赤牙掠奪者踐踏前線',groups:[['boss',1],['brute',4],['healer',2],['grunt',2],['raider',1]],reward:[58,2],threat:5},
    {name:'旗手奔襲',hint:'先擊倒旗手，再攔截高速狼群',groups:[['runner',14],['direwolf',6],['commander',2],['grunt',5]],reward:[46,1],threat:6},
    {name:'血契儀式',hint:'蒼燄怨靈獵殺英雄，祭司治療前排',groups:[['healer',4],['grunt',10],['shaman',5],['revenant',3]],reward:[52,1],threat:7},
    {name:'鋼鐵方陣',hint:'叛軍長戟衛與腐化樹靈加入敵軍，混合傷害應對',groups:[['warder',7],['treant',3],['brute',3],['halberdier',3]],reward:[59,1],threat:8},
    {name:'軍團號令',hint:'旗手藏於步兵、獵犬與狼群之中',groups:[['commander',3],['grunt',15],['runner',9],['direwolf',6]],reward:[66,1],threat:9},
    {name:'鐵壁統領',hint:'首領配合盾衛、赤牙與治療祭司',groups:[['boss',1],['brute',5],['warder',6],['healer',3],['raider',2]],reward:[82,2],threat:10},
    {name:'虛空血潮',hint:'術士與怨靈同時壓制英雄',groups:[['shaman',13],['revenant',5],['healer',5],['runner',8]],reward:[74,1],threat:11},
    {name:'岩甲圍城',hint:'荒野翡翠龍與失誓騎士進攻；龍為秘法甲，沿道路前進',groups:[['brute',5],['wildDragon',2],['treant',3],['fallenKnight',4],['commander',4],['warder',6]],reward:[82,1],threat:12},
    {name:'疾風軍令',hint:'獵犬與狼群受旗手、祭司支援',groups:[['runner',26],['direwolf',8],['commander',4],['healer',4]],reward:[90,1],threat:13},
    {name:'三軍合圍',hint:'前排重甲、後排治療、怨靈獵殺英雄',groups:[['brute',9],['shaman',8],['warder',7],['healer',4],['commander',3],['revenant',4]],reward:[102,1],threat:14},
    {name:'邊境決戰',hint:'第一戰區決戰，重甲與狼群同時進場',groups:[['boss',1],['brute',10],['warder',8],['healer',5],['commander',4],['runner',9],['direwolf',4]],reward:[140,2],threat:15},
    {name:'暮色再編',hint:'步兵、赤牙與怨靈分散衝擊前線',groups:[['grunt',14],['runner',10],['shaman',6],['raider',3],['revenant',3]],reward:[108,1],threat:16},
    {name:'雙旗長驅',hint:'雙旗加速獵犬、狼群與步兵',groups:[['commander',4],['runner',17],['direwolf',7],['grunt',12]],reward:[116,1],threat:17},
    {name:'血契護送',hint:'祭司藏盾衛後，怨靈干擾英雄',groups:[['warder',8],['healer',6],['brute',6],['revenant',3]],reward:[124,2],threat:18},
    {name:'獵殺者之夜',hint:'術士與怨靈鎖定英雄，狼群直衝城門',groups:[['shaman',10],['revenant',4],['runner',12],['direwolf',6],['commander',3]],reward:[132,1],threat:19},
    {name:'裂地督軍',hint:'第二戰區 Boss 帶赤牙、旗手與重甲踐踏前線',groups:[['boss',1],['brute',8],['warder',8],['healer',4],['commander',3],['raider',3]],reward:[160,2],threat:20},
    {name:'蒼鋼盾潮',hint:'密集盾衛與赤牙重甲需要魔法救場',groups:[['warder',13],['grunt',15],['healer',5],['raider',4]],reward:[145,2],threat:21},
    {name:'雙翼突襲',hint:'狼群與獵犬掩護術士逼近英雄',groups:[['runner',27],['direwolf',9],['shaman',10],['commander',4]],reward:[155,1],threat:22},
    {name:'巨獸攻城列',hint:'荒野翡翠龍、巨獸與赤牙考驗混合火力',groups:[['brute',11],['wildDragon',3],['raider',4],['commander',4],['healer',4]],reward:[165,2],threat:23},
    {name:'三層戰線',hint:'盾衛、步兵、怨靈與後排治療同進',groups:[['warder',10],['grunt',16],['shaman',10],['revenant',5],['healer',5],['commander',4]],reward:[175,2],threat:24},
    {name:'赤牙霸主',hint:'第三戰區 Boss 帶赤牙與狼群混合援軍',groups:[['boss',1],['runner',14],['direwolf',5],['brute',10],['raider',4],['warder',6],['healer',5],['commander',4]],reward:[205,3],threat:25},
    {name:'秘法封鎖',hint:'術士與怨靈受盾衛保護，物理單一路線失效',groups:[['shaman',15],['revenant',5],['warder',10],['healer',6]],reward:[188,2],threat:26},
    {name:'軍團洪流',hint:'步兵、狼群與赤牙受旗手加速',groups:[['grunt',30],['runner',20],['direwolf',8],['raider',4],['commander',5]],reward:[200,2],threat:27},
    {name:'不朽方陣',hint:'巨獸、赤牙、護盾與治療形成重甲陣線',groups:[['brute',16],['raider',4],['warder',14],['healer',7]],reward:[215,3],threat:28},
    {name:'終戰先鋒',hint:'狼群、怨靈與各職責同時登場',groups:[['grunt',18],['runner',14],['direwolf',5],['brute',10],['shaman',12],['revenant',4],['warder',8],['healer',5],['commander',5]],reward:[230,3],threat:29},
    {name:'王城末日',hint:'最終戰將率領狼群、赤牙、怨靈與軍團壓境',groups:[['boss',1],['brute',14],['warder',12],['shaman',10],['revenant',4],['raider',4],['healer',7],['commander',6],['runner',16],['direwolf',5]],reward:[300,4],threat:30}
  ];
  class WaveCatalog{
    total(){return WAVES.length;}
    get(wave){
      const source=WAVES[wave-1];
      if(!source)return null;
      return{wave:wave,name:source.name,hint:source.hint,threat:source.threat,groups:source.groups.map(function(group){return{type:group[0],count:group[1]};}),reward:{gold:source.reward[0],lumber:source.reward[1]}};
    }
  }
  WaveCatalog.WAVES=WAVES;
  ns.systems.WaveCatalog=WaveCatalog;
})(globalThis.TowerFrontier);
