(function(ns){
  'use strict';
  const BRANCHES={
    bombWorkshop:{swarm:{name:'蜂群出擊',description:'每 5 秒製造 3 台小型機器人，單台傷害降低。',mods:{robotCount:3,robotDamage:28,robotSplash:44,summonInterval:5}},heavy:{name:'重爆機型',description:'每 10 秒製造大型機器人，蓄能後大範圍爆炸。',mods:{robotCount:1,robotDamage:135,robotSplash:100,summonInterval:10,heavyRobot:true}}},

    arrow:{volley:{name:'暴雨連弩',description:'每次攻擊增加一個目標。',mods:{shots:2,interval:.82,color:'#f2cf69'}},sniper:{name:'巨獸獵塔',description:'射程與單發傷害大幅提高。',mods:{damage:1.55,range:1.22,interval:1.28,color:'#ffdca0'}}},
    iceward:{winter:{name:'永冬哨塔',description:'射程擴大，冰封持續更久。',mods:{range:1.18,slowTime:1.35,color:'#bcecff'}},rime:{name:'霜鐵棱堡',description:'攻擊更快，寒氣讓單體敵軍更難前進。',mods:{interval:.72,slow:.48,color:'#83d2ff'}}},
    frost:{blizzard:{name:'永凍高塔',description:'擴大冰爆並延長緩速。',mods:{burstRadius:1.6,slow:.52,slowTime:1.25,color:'#8beaff'}},conduit:{name:'秘法導塔',description:'攻速提升並連鎖兩名敵人。',mods:{interval:.72,chain:2,color:'#b78cff'}}},
    cannon:{cluster:{name:'爆裂火砲',description:'爆炸範圍大幅提高。',mods:{splash:1.65,color:'#ff8a51'}},siege:{name:'攻城重砲',description:'高傷害但攻擊較慢。',mods:{damage:1.7,interval:1.32,color:'#ffc15b'}}},
    storm:{tempest:{name:'風暴尖塔',description:'額外連鎖並提高攻速。',mods:{chain:2,interval:.8,color:'#70f5ff'}},surge:{name:'雷槍塔',description:'集中雷擊造成高傷害。',mods:{damage:1.5,chain:0,color:'#d7fbff'}}},
    totem:{warcry:{name:'戰吼圖騰',description:'快速震擊並擴大壓制範圍。',mods:{interval:.78,splash:1.3,color:'#ffcc65'}},quake:{name:'裂地祖柱',description:'傷害與緩速效果提高。',mods:{damage:1.45,slow:.76,color:'#ff8b54'}}},
    crypt:{legion:{name:'幽骨軍團殿',description:'提高召喚上限。',mods:{summonCap:1,color:'#d3a8ff'}},reaper:{name:'靈魂收割殿',description:'強化主體攻擊並連鎖靈魂。',mods:{damage:1.4,chain:2,color:'#ef8cff'}}},
    soul:{harvest:{name:'噬魂尖塔',description:'提高亡魂爆發傷害。',mods:{damage:1.45,color:'#e487ff'}},curse:{name:'詛咒尖塔',description:'加快收割攻擊頻率。',mods:{interval:.72,color:'#9d78ff'}}},
    barracks:{legion:{name:'獅心軍團堡',description:'齊射增加兩個目標，保留守軍戰鼓。',mods:{shots:4,interval:.9,color:'#f2cf69'}},command:{name:'皇家指揮所',description:'提高射程並將附近守軍攻速支援強化至 15%。',mods:{range:1.18,allyHaste:.15,allyHasteRadius:1.2,color:'#ffe3a0'}}},
    grove:{ancient:{name:'遠古守望樹',description:'擴大根脈纏繞範圍。',mods:{range:1.2,splash:1.55,color:'#7cff99'}},moonwell:{name:'月井古樹',description:'附近自然單位傷害加成提升至 25%。',mods:{natureAura:.25,color:'#a6efff'}}},
    graveyard:{legion:{name:'不眠軍團墓園',description:'召喚物傷害加成提升至 40%。',mods:{summonAura:.4,color:'#b49aff'}},doom:{name:'末日鎮魂堂',description:'大幅擴大召喚物強化範圍。',mods:{range:1.5,color:'#ee8cff'}}},
    ballista:{battery:{name:'雄獅連弩堡',description:'增加弩箭目標並提高攻速，優先清除敵軍支援。',mods:{shots:3,interval:.82,color:'#f4ce70'}},skybolt:{name:'破城天矛塔',description:'射程與單發威力大幅提高，優先清除敵軍支援。',mods:{damage:1.55,range:1.18,interval:1.2,color:'#fff0ae'}}},
    moonwell:{tides:{name:'月潮聖泉',description:'擴大可折射魔法的友軍範圍。',mods:{range:1.4,color:'#9eefff'}},prism:{name:'星穹稜鏡',description:'折射機率提高至 40%。',mods:{refractChance:.4,color:'#d2b0ff'}}},
    plague:{contagion:{name:'蔓延瘟疫柱',description:'擴大腐化範圍與死亡傳染。',mods:{splash:1.65,color:'#9ff064'}},venom:{name:'劇毒針塔',description:'集中腐蝕並提高攻擊速度。',mods:{damage:1.45,interval:.78,color:'#d0ff76'}}}
    ,nagaTidegate:{maelstrom:{name:'漩潮門扉',description:'標記範圍更大，潮壓持續更久。',mods:{range:1.2,vulnerability:.16,color:'#8ff7f2'}},harpoon:{name:'深海魚叉門',description:'單發潮槍威力更高、攻擊更快。',mods:{damage:1.48,interval:.76,color:'#b7ffff'}}}
    ,nagaShellBastion:{volley:{name:'珊瑚叉陣',description:'每次再射出一發穿甲叉。',mods:{shots:3,color:'#d0fff3'}},breaker:{name:'裂殼重砦',description:'增加穿甲與單發傷害，專殺重甲。',mods:{damage:1.45,armorPierce:6,color:'#fff0b5'}}}
    ,nagaAbyssShrine:{covenant:{name:'深海盟約壇',description:'娜迦共鳴攻速提高至 28%。',mods:{nagaHaste:.28,color:'#9afff8'}},ocean:{name:'潮汐回響壇',description:'大幅擴大潮衛共鳴範圍。',mods:{range:1.45,color:'#a9e8ff'}}}
    ,nagaMantaAerie:{tempest:{name:'風暴翼巢',description:'增加一段雷潮彈射並提升攻速。',mods:{chain:4,interval:.8,color:'#a2ffff'}},siren:{name:'海妖翼台',description:'提升傷害並延長潮汐緩速。',mods:{damage:1.45,slowTime:1.65,color:'#e2fffd'}}}
  };
  class TowerEvolutionSystem{
    static branches(type){return Object.keys(BRANCHES[type]||{}).map(id=>Object.assign({id:id},BRANCHES[type][id]));}
    static choose(tower,id){if(!tower||tower.kind!=='building'||tower.level<3||!BRANCHES[tower.type]||!BRANCHES[tower.type][id])return false;tower.branch=id;tower.skillPulse=1;return true;}
      static apply(tower,config){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];if(!branch)return config;const m=branch.mods,result=Object.assign({},config);['damage','range','interval','splash','slowTime','allyHasteRadius','summonDuration'].forEach(key=>{if(m[key]!==undefined)result[key]=(result[key]||0)*m[key];});['shots','chain','slow','summonCap','allyHaste','color','burstRadius','robotCount','robotDamage','robotSplash','summonInterval','heavyRobot','natureAura','summonAura','refractChance','vulnerability','armorPierce','nagaHaste'].forEach(key=>{if(m[key]!==undefined)result[key]=m[key];});result.branchName=branch.name;return result;}
    static label(tower){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];return branch?branch.name:'尚未選擇進階分支';}
  }
  TowerEvolutionSystem.BRANCHES=BRANCHES;ns.systems.TowerEvolutionSystem=TowerEvolutionSystem;
})(globalThis.TowerFrontier);
