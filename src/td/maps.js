(function(ns){
 'use strict';
 const classic=ns.config;
 const MAPS=Object.freeze({
  classic:Object.freeze({id:'classic',name:'銀葉邊境',visible:false,developmentOnly:true,width:720,height:720,path:classic.path,heroSpawn:{x:350,y:305},roadClearance:55,roadUnits:true,heroVulnerable:true}),
  frontier:Object.freeze({id:'frontier',name:'銀葉隘口 · 戰術原型',visible:false,developmentOnly:true,width:1280,height:900,
   path:[{x:-30,y:180},{x:230,y:180},{x:440,y:360},{x:650,y:360},{x:820,y:210},{x:1010,y:360},{x:849.336216192233,y:570},{x:1020,y:750},{x:1310,y:750}],
   heroSpawn:{x:520,y:250},roadClearance:55,roadUnits:true,heroVulnerable:true,
   // Presentation anchors, not reserved build slots or stat bonuses.
   openingFocus:{x:640,y:300},
   zones:[{x:325,y:400,name:'西側彎道',hint:'彎道覆蓋 · 適合範圍火力'},{x:810,y:355,name:'中央折返',hint:'雙段覆蓋 · 留意實際射程'},{x:1100,y:640,name:'城門防線',hint:'末段補漏 · 單體與緩速'}]}),
  beginner:Object.freeze({
   id:'beginner',name:'新手谷地',visible:true,width:1536,height:1024,asset:'assets/td/beginner-valley-v1.png',
   // Recalibrated against the unannotated 1536 x 1024 production art. Dense
   // curve samples keep the logical route on the painted road without physics.
   path:[{x:-28,y:370},{x:120,y:370},{x:240,y:378},{x:340,y:382},{x:400,y:380},{x:450,y:345},{x:480,y:290},{x:500,y:230},{x:545,y:190},{x:620,y:182},{x:690,y:194},{x:735,y:225},{x:765,y:285},{x:790,y:360},{x:795,y:440},{x:825,y:510},{x:900,y:550},{x:1000,y:555},{x:1100,y:560},{x:1200,y:555},{x:1280,y:575},{x:1350,y:620},{x:1430,y:650},{x:1564,y:650}],
   spawn:{x:36,y:370},gate:{x:1500,y:650},heroSpawn:{x:525,y:470},roadClearance:60,roadUnits:true,heroVulnerable:false,
   openingFocus:{x:768,y:490},
   safeArea:{x:40,y:125,width:1460,height:650},
   camera:Object.freeze({minUnitPixels:42,referenceUnitSize:112,maxZoom:1.65}),
   // Only these meadow polygons accept deployment; the road is checked separately.
   buildAreas:Object.freeze([
    Object.freeze([{x:104,y:218},{x:326,y:205},{x:405,y:248},{x:420,y:316},{x:360,y:340},{x:112,y:326}]),
    Object.freeze([{x:450,y:68},{x:800,y:58},{x:842,y:118},{x:770,y:158},{x:620,y:142},{x:505,y:168},{x:430,y:218},{x:390,y:180}]),
    Object.freeze([{x:510,y:255},{x:610,y:220},{x:700,y:230},{x:738,y:272},{x:752,y:350},{x:756,y:446},{x:790,y:510},{x:850,y:545},{x:820,y:590},{x:720,y:615},{x:420,y:605},{x:350,y:555},{x:325,y:450},{x:405,y:410},{x:465,y:380}]),
    Object.freeze([{x:76,y:440},{x:292,y:420},{x:330,y:456},{x:350,y:566},{x:310,y:640},{x:96,y:630}]),
    Object.freeze([{x:850,y:270},{x:960,y:265},{x:1008,y:330},{x:978,y:456},{x:850,y:495},{x:825,y:420}]),
    Object.freeze([{x:1120,y:350},{x:1370,y:335},{x:1440,y:382},{x:1400,y:500},{x:1260,y:525},{x:1120,y:500}]),
    Object.freeze([{x:1160,y:660},{x:1380,y:690},{x:1430,y:780},{x:1180,y:780},{x:1100,y:700}])
   ]),
   zones:[]
  })
 });
 function length(points){return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);}
 ns.maps={definitions:MAPS,defaultId:'beginner',length,
  publicMaps(){return Object.values(MAPS).filter(map=>map.visible!==false);},
  apply(id){const map=MAPS[id];if(!map)return null;ns.config=Object.freeze(Object.assign({},classic,{width:map.width,height:map.height,path:map.path,spawn:map.spawn,gate:map.gate,heroSpawn:map.heroSpawn,mapId:map.id,mapName:map.name,mapAsset:map.asset||null,roadClearance:map.roadClearance,roadUnits:map.roadUnits,heroVulnerable:map.heroVulnerable!==false,buildAreas:map.buildAreas||null,safeArea:map.safeArea||null,camera:map.camera||null}));return map;}
 };
})(globalThis.TowerFrontier);
