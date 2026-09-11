(function(ns){
  'use strict';
  const WAVES=[
    {name:'邊境斥候',hint:'基礎輕甲部隊',groups:[['grunt',10]],reward:[24,1],threat:1},
    {name:'疾風試探',hint:'高速輕甲，注意漏怪',groups:[['runner',12]],reward:[28,1],threat:2},
    {name:'秘法前鋒',hint:'術士會遠程獵殺英雄',groups:[['grunt',8],['shaman',5]],reward:[34,1],threat:3},
    {name:'盾牆試煉',hint:'盾衛先消耗護盾再承受生命傷害',groups:[['warder',5],['brute',3],['grunt',5]],reward:[40,1],threat:4},
    {name:'戰將壓境',hint:'首領會踐踏、召援並狂暴',groups:[['boss',1],['brute',4],['healer',2],['grunt',3]],reward:[58,2],threat:5},
    {name:'旗手奔襲',hint:'優先擊殺加速軍團的旗手',groups:[['runner',18],['commander',2],['grunt',7]],reward:[46,1],threat:6},
    {name:'血契儀式',hint:'祭司會治療受傷敵軍',groups:[['healer',4],['grunt',14],['shaman',5]],reward:[52,1],threat:7},
    {name:'鋼鐵方陣',hint:'護盾與重甲需要持續魔法輸出',groups:[['warder',8],['brute',7]],reward:[59,1],threat:8},
    {name:'軍團號令',hint:'旗手藏於大量高速輕甲之中',groups:[['commander',3],['grunt',20],['runner',10]],reward:[66,1],threat:9},
    {name:'鐵壁統領',hint:'首領配合盾衛與治療祭司',groups:[['boss',1],['brute',5],['warder',6],['healer',3]],reward:[82,2],threat:10},
    {name:'虛空血潮',hint:'術士壓制英雄，祭司維持軍勢',groups:[['shaman',16],['healer',5],['runner',10]],reward:[74,1],threat:11},
    {name:'岩甲圍城',hint:'巨獸攻擊守軍，旗手提高推進速度',groups:[['brute',12],['commander',4],['warder',6]],reward:[82,1],threat:12},
    {name:'疾風軍令',hint:'高速集群受旗手與祭司支援',groups:[['runner',32],['commander',4],['healer',4]],reward:[90,1],threat:13},
    {name:'三軍合圍',hint:'先辨識治療、加速與護盾核心',groups:[['brute',10],['shaman',8],['warder',7],['healer',4],['commander',3]],reward:[102,1],threat:14},
    {name:'邊境決戰',hint:'第一戰區決戰，完整軍團開始進場',groups:[['boss',1],['brute',10],['warder',8],['healer',5],['commander',4],['runner',12]],reward:[140,2],threat:15},
    {name:'暮色再編',hint:'分散處理步兵、獵犬與後排術士',groups:[['grunt',18],['runner',12],['shaman',6]],reward:[108,1],threat:16},
    {name:'雙旗長驅',hint:'兩翼旗手讓高速軍勢持續加速',groups:[['commander',4],['runner',22],['grunt',12]],reward:[116,1],threat:17},
    {name:'血契護送',hint:'祭司藏在盾衛後方，先切斷治療',groups:[['warder',8],['healer',6],['brute',6]],reward:[124,2],threat:18},
    {name:'獵殺者之夜',hint:'術士鎖定英雄，高速單位同時壓迫城門',groups:[['shaman',12],['runner',16],['commander',3]],reward:[132,1],threat:19},
    {name:'裂地督軍',hint:'第二戰區 Boss 會帶旗手增援並踐踏前線',groups:[['boss',1],['brute',8],['warder',8],['healer',4],['commander',3]],reward:[160,2],threat:20},
    {name:'蒼鋼盾潮',hint:'密集護盾適合魔法、範圍與英雄救場',groups:[['warder',14],['grunt',18],['healer',5]],reward:[145,2],threat:21},
    {name:'雙翼突襲',hint:'左右高速軍勢掩護術士逼近英雄',groups:[['runner',34],['shaman',10],['commander',4]],reward:[155,1],threat:22},
    {name:'巨獸攻城列',hint:'大量攻城巨獸會迫使守軍換位補防',groups:[['brute',16],['commander',4],['healer',4]],reward:[165,2],threat:23},
    {name:'三層戰線',hint:'前排盾衛、中段步兵、後排治療與指揮',groups:[['warder',10],['grunt',20],['shaman',10],['healer',5],['commander',4]],reward:[175,2],threat:24},
    {name:'赤牙霸主',hint:'第三戰區 Boss 召集高速與重甲混合援軍',groups:[['boss',1],['runner',18],['brute',10],['warder',6],['healer',5],['commander',4]],reward:[205,3],threat:25},
    {name:'秘法封鎖',hint:'秘法後排受盾衛保護，物理單一路線效率下降',groups:[['shaman',18],['warder',10],['healer',6]],reward:[188,2],threat:26},
    {name:'軍團洪流',hint:'大量輕甲受旗手加速，範圍穿刺最有價值',groups:[['grunt',36],['runner',24],['commander',5]],reward:[200,2],threat:27},
    {name:'不朽方陣',hint:'重甲、護盾與治療構成高耐久推進陣線',groups:[['brute',18],['warder',14],['healer',7]],reward:[215,3],threat:28},
    {name:'終戰先鋒',hint:'所有職責同時登場，保留技能處理突破口',groups:[['grunt',20],['runner',18],['brute',10],['shaman',12],['warder',8],['healer',5],['commander',5]],reward:[230,3],threat:29},
    {name:'王城末日',hint:'最終戰將率領六軍壓境，英雄必須親自救場',groups:[['boss',1],['brute',14],['warder',12],['shaman',10],['healer',7],['commander',6],['runner',20]],reward:[300,4],threat:30}
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
