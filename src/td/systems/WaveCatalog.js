(function(ns){
  'use strict';
  const WAVES=[
    {name:'邊境斥候',hint:'基礎輕甲部隊',groups:[['grunt',10]],reward:[24,1],threat:1},
    {name:'疾風試探',hint:'高速輕甲，注意漏怪',groups:[['runner',12]],reward:[28,1],threat:2},
    {name:'秘法前鋒',hint:'術士會遠程獵殺英雄',groups:[['grunt',8],['shaman',5]],reward:[34,1],threat:3},
    {name:'盾牆試煉',hint:'盾衛先消耗護盾再承受生命傷害',groups:[['warder',5],['brute',3],['grunt',5]],reward:[40,1],threat:4},
    {name:'戰將壓境',hint:'首領會踐踏、召援並狂暴',groups:[['boss',1],['brute',4],['healer',2]],reward:[58,2],threat:5},
    {name:'旗手奔襲',hint:'優先擊殺加速軍團的旗手',groups:[['runner',18],['commander',2],['grunt',7]],reward:[46,1],threat:6},
    {name:'血契儀式',hint:'祭司會治療受傷敵軍',groups:[['healer',4],['grunt',14],['shaman',5]],reward:[52,1],threat:7},
    {name:'鋼鐵方陣',hint:'護盾與重甲需要持續魔法輸出',groups:[['warder',8],['brute',7]],reward:[59,1],threat:8},
    {name:'軍團號令',hint:'旗手藏於大量高速輕甲之中',groups:[['commander',3],['grunt',20],['runner',10]],reward:[66,1],threat:9},
    {name:'鐵壁統領',hint:'首領配合盾衛與治療祭司',groups:[['boss',1],['brute',5],['warder',6],['healer',3]],reward:[82,2],threat:10},
    {name:'虛空血潮',hint:'術士壓制英雄，祭司維持軍勢',groups:[['shaman',16],['healer',5],['runner',10]],reward:[74,1],threat:11},
    {name:'岩甲圍城',hint:'巨獸攻擊守軍，旗手提高推進速度',groups:[['brute',12],['commander',4],['warder',6]],reward:[82,1],threat:12},
    {name:'疾風軍令',hint:'高速集群受旗手與祭司支援',groups:[['runner',32],['commander',4],['healer',4]],reward:[90,1],threat:13},
    {name:'三軍合圍',hint:'先辨識治療、加速與護盾核心',groups:[['brute',10],['shaman',8],['warder',7],['healer',4],['commander',3]],reward:[102,1],threat:14},
    {name:'邊境決戰',hint:'最終戰將率領完整軍團',groups:[['boss',1],['brute',10],['warder',8],['healer',5],['commander',4],['runner',12]],reward:[140,2],threat:15}
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
