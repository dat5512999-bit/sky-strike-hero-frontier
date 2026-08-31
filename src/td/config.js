(function(ns){
  'use strict';
  ns.config=Object.freeze({
    width:720,height:720,startGold:240,startLumber:5,baseHealth:20,totalWaves:15,
    path:[{x:-30,y:42},{x:155,y:94},{x:385,y:112},{x:540,y:164},{x:585,y:265},{x:558,y:350},{x:420,y:365},{x:235,y:350},{x:120,y:390},{x:104,y:486},{x:190,y:548},{x:390,y:574},{x:600,y:620},{x:750,y:690}],
    damageMultipliers:{pierce:{light:1.35,heavy:.75,arcane:1},magic:{light:.8,heavy:1.25,arcane:.7},chaos:{light:1,heavy:.9,arcane:1.35}},
    towers:{
      hunter:{name:'王國獵手',icon:'➶',cost:70,wood:1,damage:17,range:150,interval:.68,color:'#e6c56c',attackType:'pierce'},
      arcanist:{name:'奧術學徒',icon:'✦',cost:85,wood:1,damage:13,range:132,interval:.9,color:'#ff8a52',attackType:'magic',splash:42},
      rogue:{name:'暗影盜賊',icon:'◆',cost:65,wood:1,damage:11,range:118,interval:.45,color:'#c884df',attackType:'chaos',bountyBonus:.35}
    },
    hero:{maxHealth:100,speed:215,range:152,damage:18,interval:.58,novaDamage:30,novaRange:118,novaCooldown:9}
  });
})(globalThis.TowerFrontier);
