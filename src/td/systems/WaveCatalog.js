(function(ns){
  'use strict';
  const WAVES=[
    {name:'邊境斥候',hint:'基礎輕甲部隊',groups:[['grunt',10]],reward:[24,1],threat:1},
    {name:'疾風試探',hint:'高速輕甲，注意漏怪',groups:[['runner',12]],reward:[28,1],threat:2},
    {name:'秘法前鋒',hint:'秘法護甲混編',groups:[['grunt',8],['shaman',6]],reward:[32,1],threat:3},
    {name:'岩甲戰列',hint:'重甲高血，需要魔法',groups:[['brute',6],['grunt',6]],reward:[38,1],threat:4},
    {name:'戰將壓境',hint:'首領與重甲護衛',groups:[['boss',1],['brute',5]],reward:[55,2],threat:5},
    {name:'獵犬奔襲',hint:'大量高速單位',groups:[['runner',24],['grunt',8]],reward:[44,1],threat:6},
    {name:'術士集會',hint:'秘法單位密集出現',groups:[['shaman',16],['runner',6]],reward:[50,1],threat:7},
    {name:'巨獸推進',hint:'重甲主力與輕甲掩護',groups:[['brute',11],['grunt',6]],reward:[56,1],threat:8},
    {name:'邊境軍團',hint:'大型輕甲混合軍勢',groups:[['grunt',28],['runner',12]],reward:[62,1],threat:9},
    {name:'鐵壁統領',hint:'強化首領與重甲軍團',groups:[['boss',1],['brute',11]],reward:[78,2],threat:10},
    {name:'虛空洪流',hint:'高密度秘法護甲',groups:[['shaman',25],['runner',8]],reward:[70,1],threat:11},
    {name:'岩甲圍城',hint:'重甲巨獸正面壓境',groups:[['brute',16],['grunt',8]],reward:[78,1],threat:12},
    {name:'疾風獸潮',hint:'極大量高速輕甲',groups:[['runner',50],['shaman',10]],reward:[86,1],threat:13},
    {name:'三軍合圍',hint:'重甲與秘法聯軍',groups:[['brute',18],['shaman',8]],reward:[96,1],threat:14},
    {name:'邊境決戰',hint:'最終首領與巨獸親衛',groups:[['boss',1],['brute',24]],reward:[130,2],threat:15}
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
