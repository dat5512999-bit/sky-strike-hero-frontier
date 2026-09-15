(function(ns){
  'use strict';
  const BRANCHES={
    arrow:{volley:{name:'暴雨連弩',description:'每次攻擊增加一個目標。',mods:{shots:2,interval:.82,color:'#f2cf69'}},sniper:{name:'巨獸獵塔',description:'射程與單發傷害大幅提高。',mods:{damage:1.55,range:1.22,interval:1.28,color:'#ffdca0'}}},
    iceward:{winter:{name:'永冬哨塔',description:'射程擴大，冰封持續更久。',mods:{range:1.18,slowTime:1.35,color:'#bcecff'}},rime:{name:'霜鐵棱堡',description:'攻擊更快，寒氣讓單體敵軍更難前進。',mods:{interval:.72,slow:.48,color:'#83d2ff'}}},
    frost:{blizzard:{name:'永凍高塔',description:'擴大冰爆並延長緩速。',mods:{burstRadius:1.6,slow:.52,slowTime:1.25,color:'#8beaff'}},conduit:{name:'秘法導塔',description:'攻速提升並連鎖兩名敵人。',mods:{interval:.72,chain:2,color:'#b78cff'}}},
    cannon:{cluster:{name:'爆裂火砲',description:'爆炸範圍大幅提高。',mods:{splash:1.65,color:'#ff8a51'}},siege:{name:'攻城重砲',description:'高傷害但攻擊較慢。',mods:{damage:1.7,interval:1.32,color:'#ffc15b'}}},
    storm:{tempest:{name:'風暴尖塔',description:'額外連鎖並提高攻速。',mods:{chain:2,interval:.8,color:'#70f5ff'}},surge:{name:'雷槍塔',description:'集中雷擊造成高傷害。',mods:{damage:1.5,chain:0,color:'#d7fbff'}}},
    totem:{warcry:{name:'戰吼圖騰',description:'快速震擊並擴大壓制範圍。',mods:{interval:.78,splash:1.3,color:'#ffcc65'}},quake:{name:'裂地祖柱',description:'傷害與緩速效果提高。',mods:{damage:1.45,slow:.76,color:'#ff8b54'}}},
    crypt:{legion:{name:'幽骨軍團殿',description:'提高召喚上限。',mods:{summonCap:1,color:'#d3a8ff'}},reaper:{name:'靈魂收割殿',description:'強化主體攻擊並連鎖靈魂。',mods:{damage:1.4,chain:2,color:'#ef8cff'}}},
    soul:{harvest:{name:'噬魂尖塔',description:'高傷連鎖靈魂。',mods:{damage:1.45,chain:2,color:'#e487ff'}},curse:{name:'詛咒尖塔',description:'快速攻擊並使敵軍遲緩。',mods:{interval:.72,slow:.82,color:'#9d78ff'}}},
    barracks:{legion:{name:'獅心軍團堡',description:'齊射增加兩個目標，保留守軍戰鼓。',mods:{shots:4,interval:.9,color:'#f2cf69'}},command:{name:'皇家指揮所',description:'提高射程並將附近守軍攻速支援強化至 15%。',mods:{range:1.18,allyHaste:.15,allyHasteRadius:1.2,color:'#ffe3a0'}}},
    grove:{ancient:{name:'遠古守望樹',description:'擴大自然爆發與緩速。',mods:{splash:1.55,slow:.62,color:'#7cff99'}},moonwell:{name:'月井古樹',description:'高速施放可連鎖的月光。',mods:{interval:.72,chain:2,color:'#a6efff'}}},
    graveyard:{legion:{name:'不眠軍團墓園',description:'增加遠程亡靈上限並延長存續時間。',mods:{summonCap:2,summonDuration:1.4,color:'#b49aff'}},doom:{name:'末日鎮魂堂',description:'主體攻擊轉為高傷連鎖。',mods:{damage:1.5,chain:2,color:'#ee8cff'}}},
    ballista:{battery:{name:'雄獅連弩堡',description:'增加弩箭目標並提高攻速，優先清除敵軍支援。',mods:{shots:3,interval:.82,color:'#f4ce70'}},skybolt:{name:'破城天矛塔',description:'射程與單發威力大幅提高，優先清除敵軍支援。',mods:{damage:1.55,range:1.18,interval:1.2,color:'#fff0ae'}}},
    moonwell:{tides:{name:'月潮聖泉',description:'月光擴散並延長緩速。',mods:{burstRadius:1.45,slow:.65,slowTime:1.25,color:'#9eefff'}},prism:{name:'星穹稜鏡',description:'增加連鎖目標並提高攻速。',mods:{chain:4,interval:.78,color:'#d2b0ff'}}},
    plague:{contagion:{name:'蔓延瘟疫柱',description:'擴大腐化範圍並強化遲緩。',mods:{splash:1.65,slow:.72,color:'#9ff064'}},venom:{name:'劇毒針塔',description:'集中腐蝕並提高攻擊速度。',mods:{damage:1.45,interval:.78,color:'#d0ff76'}}}
  };
  class TowerEvolutionSystem{
    static branches(type){return Object.keys(BRANCHES[type]||{}).map(id=>Object.assign({id:id},BRANCHES[type][id]));}
    static choose(tower,id){if(!tower||tower.kind!=='building'||tower.level<3||!BRANCHES[tower.type]||!BRANCHES[tower.type][id])return false;tower.branch=id;tower.skillPulse=1;return true;}
      static apply(tower,config){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];if(!branch)return config;const m=branch.mods,result=Object.assign({},config);['damage','range','interval','splash','slowTime','allyHasteRadius','summonDuration'].forEach(key=>{if(m[key]!==undefined)result[key]=(result[key]||0)*m[key];});['shots','chain','slow','summonCap','allyHaste','color','burstRadius'].forEach(key=>{if(m[key]!==undefined)result[key]=m[key];});result.branchName=branch.name;return result;}
    static label(tower){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];return branch?branch.name:'尚未選擇進階分支';}
  }
  TowerEvolutionSystem.BRANCHES=BRANCHES;ns.systems.TowerEvolutionSystem=TowerEvolutionSystem;
})(globalThis.TowerFrontier);
