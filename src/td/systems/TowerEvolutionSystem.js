(function(ns){
  'use strict';
  const BRANCHES={
    arrow:{volley:{name:'暴雨連弩',description:'每次攻擊增加一個目標。',mods:{shots:2,interval:.82,color:'#f2cf69'}},sniper:{name:'巨獸獵塔',description:'射程與單發傷害大幅提高。',mods:{damage:1.55,range:1.22,interval:1.28,color:'#ffdca0'}}},
    frost:{blizzard:{name:'永凍高塔',description:'擴大冰爆並延長緩速。',mods:{splash:1.6,slow:.78,color:'#8beaff'}},conduit:{name:'秘法導塔',description:'攻速提升並連鎖兩名敵人。',mods:{interval:.72,chain:2,color:'#b78cff'}}},
    cannon:{cluster:{name:'爆裂火砲',description:'爆炸範圍大幅提高。',mods:{splash:1.65,color:'#ff8a51'}},siege:{name:'攻城重砲',description:'高傷害但攻擊較慢。',mods:{damage:1.7,interval:1.32,color:'#ffc15b'}}},
    storm:{tempest:{name:'風暴尖塔',description:'額外連鎖並提高攻速。',mods:{chain:2,interval:.8,color:'#70f5ff'}},surge:{name:'雷槍塔',description:'集中雷擊造成高傷害。',mods:{damage:1.5,chain:0,color:'#d7fbff'}}},
    totem:{warcry:{name:'戰吼圖騰',description:'快速震擊並擴大壓制範圍。',mods:{interval:.78,splash:1.3,color:'#ffcc65'}},quake:{name:'裂地祖柱',description:'傷害與緩速效果提高。',mods:{damage:1.45,slow:.76,color:'#ff8b54'}}},
    crypt:{legion:{name:'幽骨軍團殿',description:'提高召喚上限。',mods:{summonCap:1,color:'#d3a8ff'}},reaper:{name:'靈魂收割殿',description:'強化主體攻擊並連鎖靈魂。',mods:{damage:1.4,chain:2,color:'#ef8cff'}}},
    soul:{harvest:{name:'噬魂尖塔',description:'高傷連鎖靈魂。',mods:{damage:1.45,chain:2,color:'#e487ff'}},curse:{name:'詛咒尖塔',description:'快速攻擊並使敵軍遲緩。',mods:{interval:.72,slow:.82,color:'#9d78ff'}}},
    barracks:{legion:{name:'獅心軍團堡',description:'齊射增加兩個目標。',mods:{shots:4,interval:.9,color:'#f2cf69'}},command:{name:'皇家指揮所',description:'提高射程與單發威力。',mods:{damage:1.4,range:1.18,color:'#ffe3a0'}}},
    grove:{ancient:{name:'遠古守望樹',description:'擴大自然爆發與緩速。',mods:{splash:1.55,slow:.62,color:'#7cff99'}},moonwell:{name:'月井古樹',description:'高速施放可連鎖的月光。',mods:{interval:.72,chain:2,color:'#a6efff'}}},
    graveyard:{legion:{name:'不眠軍團墓園',description:'增加幽靈守衛召喚上限。',mods:{summonCap:2,color:'#b49aff'}},doom:{name:'末日鎮魂堂',description:'主體攻擊轉為高傷連鎖。',mods:{damage:1.5,chain:2,color:'#ee8cff'}}}
  };
  class TowerEvolutionSystem{
    static branches(type){return Object.keys(BRANCHES[type]||{}).map(id=>Object.assign({id:id},BRANCHES[type][id]));}
    static choose(tower,id){if(!tower||tower.kind!=='building'||tower.level<3||!BRANCHES[tower.type]||!BRANCHES[tower.type][id])return false;tower.branch=id;tower.skillPulse=1;return true;}
    static apply(tower,config){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];if(!branch)return config;const m=branch.mods,result=Object.assign({},config);['damage','range','interval','splash'].forEach(key=>{if(m[key]!==undefined)result[key]=(result[key]||0)*m[key];});['shots','chain','slow','summonCap','color'].forEach(key=>{if(m[key]!==undefined)result[key]=m[key];});result.branchName=branch.name;return result;}
    static label(tower){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];return branch?branch.name:'尚未選擇進階分支';}
  }
  TowerEvolutionSystem.BRANCHES=BRANCHES;ns.systems.TowerEvolutionSystem=TowerEvolutionSystem;
})(globalThis.TowerFrontier);
