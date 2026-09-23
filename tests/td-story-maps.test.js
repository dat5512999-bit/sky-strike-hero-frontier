'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');

function setup(){const {ns,context}=load();vm.runInContext(fs.readFileSync('src/td/maps.js','utf8'),context);return ns;}
function distanceToRoute(x,y,route){let nearest=Infinity;for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));nearest=Math.min(nearest,Math.hypot(x-a.x-t*dx,y-a.y-t*dy));}return nearest;}

test('three chapter maps use production art, end at the visible keep, and offer useful tower sites',()=>{
  const ns=setup();
  for(const id of ['silverleaf','shadowfall','frostborn']){
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
    // The frozen islands have less flat ground than the two grass/stone maps.
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
    frostborn:{open:[[300,440],[900,720]],blocked:[[300,360],[520,500],[860,660]]}
  };
  for(const [id,sites] of Object.entries(landmarks)){
    ns.maps.apply(id);const build=new ns.systems.BuildSystem();
    for(const [x,y] of sites.open)assert.equal(build.canPlaceAt(x,y,'building'),true,`${id} clearing (${x},${y})`);
    for(const [x,y] of sites.blocked)assert.equal(build.canPlaceAt(x,y,'building'),false,`${id} obstacle (${x},${y})`);
  }
});

test('frostborn routes merge early and share exactly the same defensive tail',()=>{
  const ns=setup(),map=ns.maps.definitions.frostborn;assert.equal(map.routes.length,2);
  const [left,right]=map.routes,merge=left.findIndex(p=>p.x===map.merge.x&&p.y===map.merge.y);assert.ok(merge>0);
  const rightMerge=right.findIndex(p=>p.x===map.merge.x&&p.y===map.merge.y);assert.ok(rightMerge>0);
  assert.deepEqual(JSON.parse(JSON.stringify(left.slice(merge))),JSON.parse(JSON.stringify(right.slice(rightMerge))));
  assert.ok(map.sharedLength>500);
});

test('chapter missions unlock the three maps in order and the final win has no false save warning',()=>{
  const ns=setup(),missions=ns.systems.StoryCatalog.missions;
  assert.deepEqual(Array.from(missions,m=>m.map),['beginner','silverleaf','shadowfall','frostborn']);
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},store=new ns.systems.ProfileStore(storage);
  store.newRound();
  for(const mission of missions){
    assert.ok(!mission.requires||store.current().completed.includes(mission.requires));
    assert.equal(new ns.systems.StoryCatalog.StoryWaves(mission).total(),3);
    store.complete(mission);
    for(const id of mission.rewards.maps)assert.equal(store.allows('maps',id),true);
  }
  const result=ns.systems.ResultScreen.view({waves:3},{mode:'story',victory:true,saved:true,mission:missions.at(-1)});
  assert.match(result.intro,/已儲存/);assert.equal(result.showUnlock,false);
});
