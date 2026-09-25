'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');

function setup(){const {ns,context}=load();vm.runInContext(fs.readFileSync('src/td/maps.js','utf8'),context);return ns;}
function distanceToRoute(x,y,route){let nearest=Infinity;for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));nearest=Math.min(nearest,Math.hypot(x-a.x-t*dx,y-a.y-t*dy));}return nearest;}

test('chapter maps use production art, end at the visible keep, and offer useful tower sites',()=>{
  const ns=setup();
  for(const id of ['silverleaf','shadowfall','frostborn','westernsignal','emberroad']){
    const map=ns.maps.definitions[id],png=fs.readFileSync(map.asset);assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
    ns.maps.apply(id);const routes=ns.config.routes,build=new ns.systems.BuildSystem();
    assert.ok(Math.hypot(routes[0][0].x-map.spawn.x,routes[0][0].y-map.spawn.y)<120);
    for(const route of routes)assert.ok(Math.hypot(route.at(-1).x-map.gate.x,route.at(-1).y-map.gate.y)<=10);
    let sites=0;const open=[];
    for(let y=80;y<920;y+=20)for(let x=80;x<1450;x+=20){
      if(!build.canPlaceAt(x,y,'building'))continue;
      sites++;open.push([x,y]);const nearest=Math.min(...routes.map(route=>distanceToRoute(x,y,route)));
      assert.ok(nearest<=180,`${id}: (${x},${y}) is too far from every road: ${nearest}`);
    }
    // The frozen islands have less flat ground than the grass/stone maps.
    assert.ok(sites>=(id==='frostborn'?45:70),`${id}: too few useful build sites (${sites})`);
    const separate=[];for(const point of open)if(separate.every(other=>Math.hypot(point[0]-other[0],point[1]-other[1])>=58))separate.push(point);
    assert.ok(separate.length>=10,`${id}: fewer than ten distinct tower footprints fit near the road`);
    const tower=Object.keys(ns.config.buildings)[0],economy={gold:9999,lumber:999,merit:999};
    assert.equal(build.queue(tower,'building'),true);
    assert.equal(build.placeQueued(...separate[0],economy),true,`${id}: a highlighted position must accept a real tower`);
    assert.equal(build.canPlaceAt(...separate[0],'building'),false,`${id}: a placed tower must block the same position`);
    for(const p of routes.flat().filter(p=>p.x>42&&p.x<1494&&p.y>62&&p.y<978))assert.equal(build.canPlaceAt(p.x,p.y,'building'),false);
  }
  ns.maps.apply('frostborn');const snow=new ns.systems.BuildSystem();
  for(const [x,y] of [[400,700],[1100,210],[800,480]])assert.equal(snow.canPlaceAt(x,y,'building'),false,`ice, cliff or shrine at ${x},${y} must reject towers`);
});

test('chapter map deployment matches visible clearings and rejects painted obstacles',()=>{
  const ns=setup();
  const landmarks={
    beginner:{open:[[600,400]],blocked:[[250,300],[900,420]]},
    silverleaf:{open:[[620,500],[1200,540]],blocked:[[260,300],[360,500],[720,800]]},
    shadowfall:{open:[[700,400],[420,640]],blocked:[[800,480],[500,500]]},
    frostborn:{open:[[300,440],[900,720]],blocked:[[300,360],[520,500],[860,660]]},
    westernsignal:{open:[[500,220],[840,430],[700,650]],blocked:[[820,145],[1335,560],[1280,840]]},
    emberroad:{open:[[520,120],[970,295],[625,705]],blocked:[[600,350],[250,480],[1370,720]]}
  };
  for(const [id,sites] of Object.entries(landmarks)){
    ns.maps.apply(id);const build=new ns.systems.BuildSystem();
    for(const [x,y] of sites.open)assert.equal(build.canPlaceAt(x,y,'building'),true,`${id} clearing (${x},${y})`);
    for(const [x,y] of sites.blocked)assert.equal(build.canPlaceAt(x,y,'building'),false,`${id} obstacle (${x},${y})`);
  }
});

test('first mission highlights one legal hunter position that can actually reach the road',()=>{
  const ns=setup(),point=ns.systems.StoryCatalog.mission.tutorial.recommendedPositions[0];ns.maps.apply('beginner');
  const build=new ns.systems.BuildSystem(),range=ns.config.units.hunter.range;
  assert.equal(ns.systems.StoryCatalog.mission.tutorial.recommendedPositions.length,1);
  assert.deepEqual({x:point.x,y:point.y},{x:680,y:415},'教學點應保留在 U 形彎道內側草地');
  assert.equal(build.canPlaceAt(point.x,point.y,'unit'),true);
  assert.equal(build.canPlaceAt(point.x,point.y,'building'),true);
  assert.ok(point.radius>=18,'tutorial ring must expose a comfortable click target');
  assert.ok(distanceToRoute(point.x,point.y,ns.config.path)<range,`recommended position must be inside ${range} range`);
});

test('frostborn routes merge early and share exactly the same defensive tail',()=>{
  const ns=setup(),map=ns.maps.definitions.frostborn;assert.equal(map.routes.length,2);
  const [left,right]=map.routes,merge=left.findIndex(p=>p.x===map.merge.x&&p.y===map.merge.y);assert.ok(merge>0);
  const rightMerge=right.findIndex(p=>p.x===map.merge.x&&p.y===map.merge.y);assert.ok(rightMerge>0);
  assert.deepEqual(JSON.parse(JSON.stringify(left.slice(merge))),JSON.parse(JSON.stringify(right.slice(rightMerge))));
  assert.ok(map.sharedLength>500);
});

test('chapter missions preserve first-chapter unlock order and keep Chapter II map access story-only',()=>{
  const ns=setup(),missions=ns.systems.StoryCatalog.missions;
  const chapter1=missions.filter(m=>m.chapter===1),chapter2=missions.filter(m=>m.chapter===2);
  assert.deepEqual(Array.from(chapter1,m=>m.map),['beginner','silverleaf','shadowfall','frostborn']);
  assert.deepEqual(Array.from(chapter1,m=>m.waves.length),[5,6,7,8],'第一章關卡波數必須逐關增加');
  assert.deepEqual(Array.from(chapter2,m=>[m.id,m.map,m.waves.length]),[['chapter2-western-signal','westernsignal',6],['chapter2-ember-road','emberroad',7]]);
  assert.equal(chapter2[0].requires,'chapter1-frostborn');assert.equal(chapter2[1].requires,chapter2[0].id);assert.equal(chapter2[0].rewards.maps.length,0,'2-1 不應提前把西境圖給自由遠征');assert.equal(chapter2[1].rewards.maps.length,0,'2-2 不應提前把荒野內容給自由遠征');
  const totals=Array.from(chapter1,m=>m.waves.reduce((sum,wave)=>sum+wave.groups.reduce((n,group)=>n+group.count,0),0));
  for(let i=1;i<totals.length;i++)assert.ok(totals[i]>totals[i-1],`第 ${i+1} 關總敵量必須高於前關`);
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},store=new ns.systems.ProfileStore(storage);
  store.newRound();
  for(const mission of chapter1){
    assert.ok(!mission.requires||store.current().completed.includes(mission.requires));
    assert.equal(new ns.systems.StoryCatalog.StoryWaves(mission).total(),[5,6,7,8][chapter1.indexOf(mission)]);
    store.complete(mission);
    for(const id of mission.rewards.maps)assert.equal(store.allows('maps',id),true);
  }
  assert.ok(store.current().completed.includes(chapter2[0].requires));assert.equal(new ns.systems.StoryCatalog.StoryWaves(chapter2[0]).total(),6);store.complete(chapter2[0]);assert.ok(store.current().completed.includes(chapter2[1].requires));assert.equal(new ns.systems.StoryCatalog.StoryWaves(chapter2[1]).total(),7);
  const result=ns.systems.ResultScreen.view({waves:3},{mode:'story',victory:true,saved:true,mission:chapter1.at(-1)});
  assert.match(result.intro,/已儲存/);assert.match(result.intro,/線索推進/);assert.equal(result.showUnlock,false);
});

test('western signal keeps its logical road, obstacles and camera targets separate from painted art',()=>{
  const ns=setup(),map=ns.maps.definitions.westernsignal;ns.maps.apply(map.id);
  assert.equal(map.visible,false,'2-1 is a story map, not an unearned free-expedition map');
  assert.equal(map.roadClearance,62);assert.equal(map.path.length>=16,true);
  assert.deepEqual(JSON.parse(JSON.stringify(map.mapPressure.segments)),[{startIndex:7,endIndex:12}]);assert.equal(map.mapPressure.startsAtWave,2);
  const build=new ns.systems.BuildSystem();
  for(const point of map.path.slice(1,-1))assert.equal(build.canPlaceAt(point.x,point.y,'building'),false,'road must remain non-buildable');
  for(const [x,y] of [[820,145],[1335,560],[1280,840]])assert.equal(build.canPlaceAt(x,y,'building'),false,'painted obstacle needs explicit collision');
  assert.ok(map.safeArea.width>1200&&map.safeArea.height>650);assert.ok(map.camera.mobileInitialZoom>=1.2);
});

test('ember road keeps the burning caravan, rock shelf and escort gate out of deployable ground',()=>{
  const ns=setup(),map=ns.maps.definitions.emberroad;ns.maps.apply(map.id);const build=new ns.systems.BuildSystem();
  assert.equal(map.visible,false,'2-2 is a story map, not an unearned free-expedition map');assert.equal(map.path.length>=18,true);assert.equal(map.mapPressure.startsAtWave,3);
  for(const point of map.path.slice(1,-1))assert.equal(build.canPlaceAt(point.x,point.y,'building'),false,'road must remain non-buildable');
  for(const [x,y] of [[600,350],[250,480],[1370,720]])assert.equal(build.canPlaceAt(x,y,'building'),false,'painted obstacle needs explicit collision');
  assert.ok(map.safeArea.width>1200&&map.safeArea.height>650);assert.ok(map.camera.mobileInitialZoom>=1.2);
});
