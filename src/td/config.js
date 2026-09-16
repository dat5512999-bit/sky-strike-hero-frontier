(function(ns){
  'use strict';
  ns.config=Object.freeze({
    width:720,height:720,roadClearance:55,roadUnits:true,startGold:240,startLumber:5,baseHealth:20,totalWaves:30,wave:{firstPreparation:18,preparation:12},
    path:[{x:-30,y:42},{x:155,y:94},{x:385,y:112},{x:540,y:164},{x:585,y:265},{x:558,y:350},{x:420,y:365},{x:235,y:350},{x:120,y:390},{x:104,y:486},{x:190,y:548},{x:390,y:574},{x:600,y:620},{x:750,y:690}],
    damageMultipliers:{pierce:{light:1.35,heavy:.75,arcane:1},magic:{light:.8,heavy:1.25,arcane:.7},chaos:{light:1,heavy:.9,arcane:1.35}},
    units:{
      kingdomMage:{name:'王國魔法師',icon:'ϟ',cost:110,wood:2,health:75,damage:19,range:162,interval:1.15,color:'#71bcff',attackType:'magic',style:'lightning',kingdomBounce:true,role:'彈射 2／3／4 次｜Lv3 感電'},
      alchemist:{name:'王國煉金術師',icon:'⚗',cost:100,wood:2,health:80,damage:7,range:172,interval:1.2,color:'#a1e96d',attackType:'magic',style:'plague',vulnerability:.25,role:'易傷標記｜其他來源傷害 +25%'},
      beastmaster:{name:'森靈馭獸師',icon:'熊',cost:138,wood:3,health:95,damage:14,range:160,interval:1.1,color:'#a6e0aa',attackType:'magic',style:'nature',natureUnit:true,role:'自然遠攻｜維持一隻可成長的森林熊'},
      bountyHunter:{name:'賞金獵人',icon:'銃',cost:155,wood:0,health:90,damage:43,range:255,interval:1.7,color:'#f8bb75',attackType:'pierce',style:'bullet',projectileSpeed:1400,armorPierce:6,bountyBonus:.6,priorityTargets:['boss','commander','healer'],role:'精英狙擊｜擊殺額外賞金'},
      pirate:{name:'海盜砲手',icon:'●',cost:160,wood:0,health:100,damage:46,range:180,interval:2.1,color:'#ff9959',attackType:'chaos',splash:64,style:'cannon',role:'慢速重砲｜群體爆破'},
      blacksmith:{name:'流浪鐵匠',icon:'⚒',cost:130,wood:0,health:100,damage:0,range:165,interval:1,color:'#ffcd87',attackType:'chaos',supportOnly:true,forgeAura:.2,role:'附近防禦塔傷害 +20%（不疊加）'},
      timeMage:{name:'時間術士',icon:'◷',cost:170,wood:0,health:80,damage:0,range:155,interval:1,color:'#9bd9ff',attackType:'magic',supportOnly:true,timeAura:.3,role:'每 8 秒加速附近友軍 3 秒'},

      hunter:{name:'王國獵手',icon:'➶',cost:70,wood:1,health:92,armor:1,damage:17,range:150,interval:.68,speed:122,color:'#e6c56c',attackType:'pierce',role:'多重箭｜Lv1 兩箭，每級增一箭'},
      arcanist:{name:'奧術學徒',icon:'✦',cost:85,wood:1,health:72,armor:0,damage:13,range:132,interval:.9,speed:104,color:'#ff8a52',attackType:'magic',splash:42,arcaneMark:true,role:'小範圍魔法｜奧術印記'},
      rogue:{name:'暗影盜賊',faction:'暗影',icon:'◆',cost:65,wood:1,health:80,armor:0,damage:11,range:118,interval:.45,speed:148,color:'#c884df',attackType:'chaos',bountyBonus:.35,role:'快速賞金收尾'},
      shield:{name:'王國盾衛',faction:'王國',icon:'盾',cost:105,wood:2,health:185,armor:5,damage:18,range:84,interval:.92,speed:92,color:'#6da4e8',attackType:'chaos',role:'定點震懾｜第四擊緩速'},
      knight:{name:'日耀騎士',faction:'王國',icon:'槌',cost:128,wood:2,health:168,armor:4,damage:26,range:210,interval:4,speed:100,color:'#e4bd58',attackType:'chaos',charge:true,role:'貫穿衝鋒｜Lv2 聖火｜Lv3 擊殺減 CD'},
      musketeer:{name:'王國火槍手',faction:'王國',icon:'銃',cost:118,wood:2,health:86,armor:1,damage:35,range:265,interval:1.45,speed:99,color:'#e8c58e',attackType:'pierce',style:'bullet',projectileSpeed:1400,armorPierce:8,priorityTargets:['boss','commander','healer','warder','shaman'],role:'超遠穿甲｜精英點殺'},
      halberdier:{name:'獅徽長戟衛',enemyOnly:true,faction:'王國',icon:'戟',cost:112,wood:2,health:154,armor:3,damage:23,range:100,interval:.94,speed:94,color:'#dfd0a7',attackType:'chaos',role:'長戟緩擊｜第四擊震懾'},
      skeleton:{name:'幽骨劍士',faction:'暗影',icon:'骷',cost:78,wood:1,health:102,armor:2,damage:21,range:82,interval:.72,speed:118,color:'#bc9aff',attackType:'chaos',role:'快速近距攻擊'},
      dragon:{name:'翡翠幼龍',faction:'精靈',icon:'龍',cost:165,wood:3,health:126,armor:2,damage:27,range:145,interval:1.05,speed:136,color:'#70d89c',attackType:'magic',splash:34,natureExplosion:true,flyby:true,role:'飛掠噴吐｜自然印記爆炸'},
      treant:{name:'銀葉樹靈',enemyOnly:true,faction:'精靈',icon:'樹',cost:138,wood:3,health:142,armor:2,damage:20,range:138,interval:1.04,speed:86,color:'#8bd9b4',attackType:'magic',splash:32,slow:.82,slowTime:1.1,role:'範圍緩速'},
      dryad:{name:'林裔獵手',faction:'精靈',icon:'鹿',cost:126,wood:2,health:105,armor:1,damage:19,range:156,interval:.79,speed:143,color:'#83d9bd',attackType:'magic',natureMark:true,style:'nature',role:'自然印記｜三次追擊觸發藤蔓爆發'},
      moonblade:{name:'月刃哨兵',faction:'精靈',icon:'刃',cost:116,wood:2,health:125,armor:2,damage:21,range:155,interval:.85,speed:148,color:'#a8c5fa',attackType:'chaos',chain:3,arcaneBounce:true,style:'moon',role:'月刃彈射｜奧術印記額外一跳'},
      golem:{name:'魂鋼魔像',faction:'暗影',icon:'像',cost:148,wood:3,health:218,armor:5,damage:32,range:84,interval:1.12,speed:76,color:'#9f72df',attackType:'chaos',splash:30,role:'重型震地'},
      banshee:{name:'暮影女妖',faction:'暗影',icon:'魅',cost:137,wood:2,health:82,armor:0,damage:16,range:154,interval:.98,speed:121,color:'#be9eff',attackType:'magic',chain:2,chainRange:104,style:'spirit',role:'靈能連鎖'},
      boneRider:{name:'幽騎骸將',faction:'暗影',icon:'騎',cost:158,wood:3,health:173,armor:3,damage:30,range:90,interval:.88,speed:153,color:'#b995ef',attackType:'chaos',splash:19,style:'spirit',role:'近距靈刃濺射'},
      orc:{name:'赤牙勇士',faction:'半獸人',icon:'斧',cost:125,wood:2,health:205,armor:4,damage:31,range:86,interval:.82,speed:106,color:'#e46c4d',attackType:'chaos',splash:24,role:'重擊戰吼'}
    },
    buildings:{
      supply:{name:'補給站',icon:'⌂',cost:90,wood:1,damage:0,range:170,interval:1,color:'#e0c997',attackType:'pierce',supportOnly:true,discount:.15,role:'附近部署與升級金幣 -15%（不疊加）'},
      battleflag:{name:'王國戰旗',icon:'⚑',cost:100,wood:2,damage:0,range:170,interval:1,color:'#e5bf61',attackType:'pierce',supportOnly:true,damageAura:.12,role:'附近守軍傷害 +12%（不疊加）'},
      armoryForge:{name:'軍械工坊',icon:'⚒',cost:110,wood:2,damage:0,range:170,interval:1,color:'#efb769',attackType:'pierce',supportOnly:true,forgeAura:.15,role:'附近防禦塔傷害 +15%（不疊加）'},
      bombWorkshop:{name:'爆破工坊',icon:'⚙',cost:180,wood:0,damage:0,range:230,interval:1,color:'#ffae61',attackType:'chaos',supportOnly:true,summonInterval:7,robotCount:1,robotDamage:48,robotSplash:58,role:'自動製造爆破機器人｜Lv3 蜂群／重爆分支'},

      arrow:{name:'林地弩塔',faction:'人族',icon:'♜',cost:100,wood:2,damage:25,range:172,interval:.82,color:'#d5bd63',attackType:'pierce',role:'廉價齊射｜輕甲防線'},
      iceward:{name:'寒鋼哨塔',faction:'王國',icon:'❄',cost:125,wood:2,damage:10,range:162,interval:1.28,color:'#a4dcff',attackType:'magic',slow:.62,slowTime:1.6,role:'定點強緩速｜火砲搭檔'},
      frost:{name:'寒霜水晶塔',faction:'秘法',icon:'❄',cost:120,wood:2,damage:18,range:150,interval:1.05,color:'#66ddff',attackType:'magic',slow:.58,slowTime:1.4,role:'單點強緩速｜週期冰爆'},
      cannon:{name:'赤焰火砲塔',faction:'矮人',icon:'●',cost:145,wood:3,damage:42,range:142,interval:1.55,color:'#ff7045',attackType:'chaos',splash:54,bonusVsSlowed:1.25,role:'緩速後爆破｜群體收割'},
      storm:{name:'星葉雷霆塔',faction:'精靈',icon:'ϟ',cost:165,wood:2,damage:19,range:165,interval:1.15,color:'#7ee9e5',attackType:'magic',bonusVsSlowed:1.2,role:'連鎖清群｜緩速追擊'},
      totem:{name:'赤牙祖靈柱',faction:'獸族',icon:'✹',cost:150,wood:2,damage:28,range:125,interval:1.25,color:'#ffbe66',attackType:'chaos',splash:25,role:'近距震地｜突破口'},
      crypt:{name:'幽骨召喚殿',faction:'亡靈',icon:'☽',cost:180,wood:3,damage:12,range:155,interval:1.3,color:'#bc9aff',attackType:'magic',summonInterval:11,summonCapBase:2,summonDuration:12,summonDamage:11,summonRange:68,summonSpeed:125,summonLeashBonus:55,role:'基礎召喚｜亡魂加速與強化'},
      soul:{name:'靈魂收割塔',faction:'暗影',icon:'魂',cost:155,wood:2,damage:24,range:158,interval:1.08,color:'#d283ff',attackType:'magic',soulHarvest:true,role:'死亡收魂｜消耗亡魂強化爆發'},
      barracks:{name:'王國戰鼓堡',faction:'王國',icon:'旗',cost:135,wood:2,damage:16,range:146,interval:.72,color:'#e7c76d',attackType:'pierce',shots:2,allyHaste:.08,allyHasteRadius:165,role:'守軍攻速支援｜近距齊射'},
      grove:{name:'翠靈古樹',faction:'精靈',icon:'樹',cost:150,wood:3,damage:22,range:154,interval:1.02,color:'#72dc87',attackType:'magic',splash:34,rootPulse:true,natureAura:.15,role:'週期群體纏繞｜自然單位強化'},
      graveyard:{name:'冥燈墓園',faction:'暗影',icon:'墓',cost:165,wood:3,damage:14,range:148,interval:1.16,color:'#a985ed',attackType:'magic',supportOnly:true,summonAura:.25,role:'召喚物傷害強化｜亡靈、靈獸與機械通用'},
      ballista:{name:'獅翼弩砲台',faction:'王國',icon:'獅',cost:155,wood:3,damage:26,range:190,interval:1.18,color:'#f0c76a',attackType:'pierce',shots:2,priorityTargets:['healer','commander','shaman','revenant','boss'],role:'遠距點殺｜優先支援怪'},
      moonwell:{name:'月泉稜鏡塔',faction:'精靈',icon:'月',cost:160,wood:3,damage:18,range:168,interval:1.08,color:'#a9c8ff',attackType:'magic',supportOnly:true,refractChance:.25,role:'折射附近魔法｜25% 複製一發（不連鎖複製）'},
      plague:{name:'瘟疫尖碑',faction:'暗影',icon:'疫',cost:150,wood:2,damage:18,range:150,interval:1.18,color:'#8fe45d',attackType:'chaos',splash:38,plague:true,role:'瘟疫持續傷害｜死亡擴散一次'}
    },
    hero:{maxHealth:100,speed:215,range:152,damage:18,interval:.58,novaDamage:30,novaRange:118,novaCooldown:9,respawnTime:8,respawnHealth:.65,invulnerability:2}
  });
})(globalThis.TowerFrontier);
