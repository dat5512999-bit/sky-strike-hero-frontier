(function(ns){
  'use strict';
  ns.config=Object.freeze({
    width:720,height:720,startGold:190,baseHealth:20,totalWaves:20,
    path:[{x:-35,y:5},{x:120,y:58},{x:300,y:112},{x:410,y:145},{x:430,y:220},{x:350,y:286},{x:235,y:326},{x:255,y:390},{x:405,y:414},{x:525,y:466},{x:535,y:590},{x:750,y:690}],
    pads:[{x:170,y:194},{x:322,y:210},{x:535,y:180},{x:145,y:423},{x:352,y:520},{x:612,y:395},{x:335,y:620},{x:185,y:555}],
    towers:{
      arrow:{name:'遊俠塔',icon:'➶',cost:60,damage:14,range:140,interval:.62,color:'#ffd36a'},
      frost:{name:'霜語塔',icon:'❄',cost:90,damage:8,range:132,interval:.92,color:'#63ddff',slow:.55,slowTime:1.6},
      cannon:{name:'星火塔',icon:'✦',cost:125,damage:28,range:118,interval:1.3,color:'#ff765c',splash:48}
    },
    hero:{maxHealth:100,speed:215,range:152,damage:18,interval:.58,novaDamage:30,novaRange:118,novaCooldown:9}
  });
})(globalThis.TowerFrontier);
