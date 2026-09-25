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
    ,goblinGenerator:{dynamo:{name:'超導渦輪機座',description:'供電容量額外 +2，讓一座核心可養更多機械。',mods:{networkCapacity:2,color:'#8ffff0'}},relay:{name:'高壓中繼機座',description:'供電半徑擴大 35%，更容易覆蓋遠端砲台。',mods:{range:1.35,color:'#c2f6ff'}}}
    ,goblinTurret:{burst:{name:'齒輪連發台',description:'每次射出兩發鉚釘，清除輕甲群。',mods:{shots:2,interval:.84,color:'#ffe09a'}},rail:{name:'磁軌穿甲台',description:'單發傷害與射程提高，專門處理重甲。',mods:{damage:1.55,range:1.2,armorPierce:5,color:'#bdf6ff'}}}
    ,goblinMortar:{shrapnel:{name:'裂片蒸汽砲',description:'爆炸範圍提高並加快填裝。',mods:{splash:1.55,interval:.82,color:'#ffbd7f'}},demolisher:{name:'攻城鍋爐砲',description:'炮彈傷害提高，適合處決重型敵軍。',mods:{damage:1.62,range:1.18,color:'#ffe0a5'}}}
    ,goblinSnare:{tesla:{name:'電索控制台',description:'加長電索的緩速時間並提高射程。',mods:{slow:.46,slowTime:1.65,range:1.18,color:'#adfff1'}},crusher:{name:'壓力絞盤台',description:'大幅強化單體壓制與攻擊節奏。',mods:{damage:1.45,interval:.74,slow:.38,color:'#fff0a5'}}}
    ,goblinRecycler:{mint:{name:'精煉回收站',description:'每次回收提高至 20G，單波上限 110G。',mods:{recyclerGold:20,recyclerCap:110,color:'#d7ff9e'}},salvage:{name:'戰場拆解站',description:'擴大回收範圍，並略微提高收益。',mods:{range:1.32,recyclerGold:15,recyclerCap:90,color:'#bff5bb'}}}
    ,goblinCooler:{cryoflow:{name:'深冷循環站',description:'過熱時的額外冷卻從 50% 提高至 120%。',mods:{coolingBonus:1.2,color:'#b9f6ff'}},service:{name:'維修支援站',description:'支援半徑擴大並維持原有冷卻功能。',mods:{range:1.38,coolingBonus:.5,color:'#d5fff3'}}}
    ,goblinSiege:{rocket:{name:'火箭攻城架',description:'增加一枚散射火箭並提高爆炸範圍。',mods:{shots:2,splash:1.38,color:'#ffd18a'}},overlord:{name:'霸權重載砲',description:'單發傷害提高，填裝更穩定。',mods:{damage:1.62,interval:.86,range:1.15,color:'#fff0af'}}}
    ,frostCrystal:{permafrost:{name:'永凍晶塔',description:'累寒與緩速顯著提高，穩定封住前線。',mods:{frost:1.5,slow:.5,slowTime:1.25,color:'#c4fbff'}},lance:{name:'極光冰槍塔',description:'傷害、射程與攻速提高，專注點殺。',mods:{damage:1.48,range:1.18,interval:.8,color:'#e7fbff'}}}
    ,frostBlizzard:{whiteout:{name:'白夜暴雪壇',description:'暴雪範圍與累寒提高，擅長清群。',mods:{splash:1.5,frost:1.3,color:'#e5f5ff'}},shardstorm:{name:'碎晶風暴壇',description:'提高傷害與攻速，讓冰片更密集。',mods:{damage:1.48,interval:.78,color:'#b9eaff'}}}
    ,frostBallista:{avalanche:{name:'雪崩碎冰弩',description:'碎冰傷害與半徑提高，收割凍結群。',mods:{shatter:1.55,shatterRadius:1.45,color:'#d8f7ff'}},glacier:{name:'冰河獵弩',description:'提升單發威力與射程，處理遠方精英。',mods:{damage:1.58,range:1.2,color:'#fff3be'}}}
    ,frostTotem:{rime:{name:'霜魂圖騰',description:'附近單位的累寒光環提高至 52%。',mods:{frostAura:.52,color:'#e8ddc5'}},ward:{name:'冰封守望柱',description:'支援半徑大幅提高，維持 30% 累寒光環。',mods:{range:1.45,frostAura:.3,color:'#b8edff'}}}
    ,frostObelisk:{echo:{name:'寒墓回響碑',description:'連鎖增加至四個目標並提高累寒。',mods:{chain:4,frost:1.4,color:'#d8c8ff'}},shatter:{name:'碎界尖碑',description:'強化碎冰傷害與爆裂半徑。',mods:{shatter:1.65,shatterRadius:1.45,color:'#f3e8ff'}}}
    ,frostAurora:{crown:{name:'極光王冠台',description:'凍結窗口傷害提高並延長窗口。',mods:{frozenBonus:2.35,freezeExtension:.34,color:'#d3fff0'}},beacon:{name:'霜星信標台',description:'射程與累寒提高，讓遠端目標更早進入冰封。',mods:{range:1.3,frost:1.45,color:'#c3eeff'}}}
    ,frostGlacier:{cataclysm:{name:'冰河崩解核心',description:'大幅提高範圍與累寒，打造終局封鎖。',mods:{splash:1.45,frost:1.45,color:'#ccf7ff'}},monolith:{name:'萬年霜核',description:'提高單發傷害與射程，冰核更集中。',mods:{damage:1.62,range:1.2,interval:.86,color:'#efffff'}}}
  };
  class TowerEvolutionSystem{
    static branches(type){return Object.keys(BRANCHES[type]||{}).map(id=>Object.assign({id:id},BRANCHES[type][id]));}
    static choose(tower,id){if(!tower||tower.kind!=='building'||tower.level<3||!BRANCHES[tower.type]||!BRANCHES[tower.type][id])return false;tower.branch=id;tower.skillPulse=1;return true;}
      static apply(tower,config){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];if(!branch)return config;const m=branch.mods,result=Object.assign({},config);['damage','range','interval','splash','slowTime','allyHasteRadius','summonDuration','frost','shatter','shatterRadius'].forEach(key=>{if(m[key]!==undefined)result[key]=(result[key]||0)*m[key];});['shots','chain','slow','summonCap','allyHaste','color','burstRadius','robotCount','robotDamage','robotSplash','summonInterval','heavyRobot','natureAura','summonAura','refractChance','vulnerability','armorPierce','nagaHaste','networkCapacity','recyclerGold','recyclerCap','coolingBonus','frostAura','frozenBonus','freezeExtension'].forEach(key=>{if(m[key]!==undefined)result[key]=m[key];});result.branchName=branch.name;return result;}
    static label(tower){const branch=BRANCHES[tower.type]&&BRANCHES[tower.type][tower.branch];return branch?branch.name:'尚未選擇進階分支';}
  }
  TowerEvolutionSystem.BRANCHES=BRANCHES;ns.systems.TowerEvolutionSystem=TowerEvolutionSystem;
})(globalThis.TowerFrontier);
