(function(ns){
  'use strict';
  ns.config=Object.freeze({
    width:720,height:720,startGold:190,baseHealth:20,totalWaves:20,
    path:[{x:-30,y:108},{x:154,y:108},{x:154,y:258},{x:355,y:258},{x:355,y:445},{x:570,y:445},{x:570,y:615},{x:750,y:615}],
    pads:[{x:82,y:202},{x:244,y:172},{x:265,y:350},{x:448,y:342},{x:477,y:535},{x:650,y:522},{x:110,y:510},{x:627,y:225}],
    towers:{
      arrow:{name:'遊俠塔',icon:'➶',cost:60,damage:14,range:140,interval:.62,color:'#ffd36a'},
      frost:{name:'霜語塔',icon:'❄',cost:90,damage:8,range:132,interval:.92,color:'#63ddff',slow:.55,slowTime:1.6},
      cannon:{name:'星火塔',icon:'✦',cost:125,damage:28,range:118,interval:1.3,color:'#ff765c',splash:48}
    },
    hero:{maxHealth:100,speed:215,range:152,damage:18,interval:.58,novaDamage:30,novaRange:118,novaCooldown:9}
  });
})(globalThis.TowerFrontier);
