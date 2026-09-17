'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
function load(){const c=vm.createContext({console});c.globalThis=c;for(const f of ['namespace','config','maps','systems/BuildSystem','systems/WaveCatalog','systems/WaveSystem','systems/TargetSelector','entities/Monster','TDGame'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/td/'+f+'.js'),'utf8'),c);c.TowerFrontier.maps.apply('twinpass');return c.TowerFrontier;}
function game(ns,monsters){return {monsters,baseHealth:100000,report:{recordLeak(){}},flash(){}};}
test('雙路中心線落於獨立量測路面中央，包含節點之間的彎道，不切向路緣',()=>{
 const ns=load(),survey=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/twinpass-road-survey.json')));
 survey.routes.forEach((rows,n)=>rows.forEach(({x,top,bottom})=>{
  const route=ns.config.routes[n],i=route.findIndex((p,i)=>i&&p.x>=x),a=route[i-1],b=route[i],y=a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x),middle=(top+bottom)/2;
  assert.ok(Math.abs(y-middle)<=5,`route ${n}, x=${x}: centre ${y}, surveyed ${middle}`);
 }));
});
test('双隘口兩路共享末段、正式素材與合法塔位，各路禁建且遺跡禁建',()=>{
 const ns=load(),m=ns.maps.definitions.twinpass,b=new ns.systems.BuildSystem(),png=fs.readFileSync(path.join(__dirname,'../'+m.asset));
 assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
 assert.deepEqual(m.routes[0].slice(-6),m.routes[1].slice(-6));assert.equal(ns.maps.length(m.routes[0].slice(-6)),m.sharedLength);
 for(const route of m.routes)for(const p of route.filter(p=>p.x>42&&p.x<1494))assert.equal(b.canPlaceAt(p.x,p.y,'building'),false);
 for(const p of [[440,130],[430,335],[450,530],[510,770],[1160,355],[1160,585]])assert.equal(b.canPlaceAt(...p,'building'),true,p.join(','));
 for(const p of [[665,380],[140,440],[1480,400]])assert.equal(b.canPlaceAt(...p,'building'),false);
 ns.maps.apply('beginner');assert.equal(ns.config.routes.length,1);assert.equal(ns.config.blockedAreas,null);assert.equal(ns.config.sharedLength,0);
});
test('波次總量不加倍，逐隻交替雙路，重置恢復上路先出兵',()=>{
 const ns=load(),w=new ns.systems.WaveSystem(),monsters=[];w.start();const count=w.queue.length;
 for(let i=0;i<200&&w.queue.length;i++)w.update(1,monsters);
 assert.equal(monsters.length,count);monsters.forEach((m,i)=>assert.equal(m.path,ns.config.routes[i%2]));w.reset();w.start();const fresh=[];w.update(1,fresh);assert.equal(fresh[0].path,ns.config.routes[0]);
});
test('不同分支獨立前進、匯流後保持間距，兩路最終都能抵達城門且只扣一次血',()=>{
 const ns=load(),routes=ns.config.routes,a=new ns.entities.Monster('brute',1,routes[0]),b=new ns.entities.Monster('runner',1,routes[1]);
 a.setRouteDistance(100);b.setRouteDistance(100);const g=game(ns,[a,b]);ns.TDGame.prototype.updateMonsterConvoy.call(g,1);assert.ok(a.routeDistance>100&&b.routeDistance>100);
 for(const speed of [1,2,3]){
  const enemies=Array.from({length:20},(_,i)=>{const m=new ns.entities.Monster(i%3?'runner':'brute',1,routes[i%2]);m.setRouteDistance(m.routeLength-700-(i>>1)*65);return m;});
  const state=game(ns,enemies);let leaks=0;state.report.recordLeak=()=>leaks++;
  for(let tick=0;tick<18000&&enemies.some(m=>m.active);tick++){
   ns.TDGame.prototype.updateMonsterConvoy.call(state,speed/60);
   const merged=enemies.filter(m=>m.active&&m.remainingDistance()<ns.config.sharedLength).sort((a,b)=>a.remainingDistance()-b.remainingDistance());
   for(let i=1;i<merged.length;i++)assert.ok(merged[i].remainingDistance()-merged[i-1].remainingDistance()>=ns.entities.Monster.minimumHeadway(merged[i-1],merged[i])-1e-6);
  }
  assert.equal(enemies.some(m=>m.active),false);assert.equal(leaks,20);ns.TDGame.prototype.updateMonsterConvoy.call(state,1);assert.equal(leaks,20);
 }
});
test('最接近城門索敵使用剩餘距離，不因上下路長短與節點數而顛倒',()=>{
 const ns=load(),a=new ns.entities.Monster('grunt',1,ns.config.routes[0]),b=new ns.entities.Monster('grunt',1,ns.config.routes[1]);a.setRouteDistance(a.routeLength-300);b.setRouteDistance(b.routeLength-200);assert.equal(ns.systems.TargetSelector.select({x:0,y:0},[a,b],'front'),b);
});
test('雙路 30 波生成、行進、清場與獎勵流程可完成，不增減原波次敵量',()=>{
 const ns=load(),w=new ns.systems.WaveSystem(),g=game(ns,[]);let cleared=0,spawned=0;
 for(let wave=1;wave<=30;wave++){
  assert.equal(w.start(),true);const expected=w.queue.length;
  for(let tick=0;tick<5000&&w.phase!=='reward';tick++){
   const before=g.monsters.length;w.update(.1,g.monsters);spawned+=g.monsters.length-before;
   ns.TDGame.prototype.updateMonsterConvoy.call(g,.1);g.monsters=g.monsters.filter(m=>m.active);
  }
  assert.equal(w.phase,'reward','wave '+wave);assert.equal(spawned,expected);assert.equal(g.monsters.length,0);assert.equal(w.acknowledgeReward(),true);spawned=0;cleared++;
 }
 assert.equal(cleared,30);assert.equal(w.complete,true);
});
