'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
function load(){const c=vm.createContext({console});c.globalThis=c;for(const f of ['namespace','config','maps','systems/BuildSystem','systems/WaveCatalog','systems/WaveSystem','entities/Monster','TDGame'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/td/'+f+'.js'),'utf8'),c);c.TowerFrontier.maps.apply('autumn');return c.TowerFrontier;}
test('暮秋遺跡為第三張獨立單路地圖，來回 U 彎不斷路且正確到城門',()=>{
 const ns=load(),map=ns.maps.definitions.autumn,png=fs.readFileSync(path.join(__dirname,'../'+map.asset));assert.equal(ns.maps.publicMaps().length,8);assert.equal(ns.config.routes.length,1);assert.equal(ns.config.sharedLength,0);assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
 for(const speed of [1,2,3]){const m=new ns.entities.Monster('runner',1);for(let i=0;i<12000&&m.active;i++)m.update(speed/60);assert.equal(m.leaked,true);assert.equal(m.x,map.path.at(-1).x);assert.equal(m.y,map.path.at(-1).y);}
 const w=new ns.systems.WaveSystem(),enemies=[];w.start();const count=w.queue.length;for(let i=0;i<200&&w.queue.length;i++)w.update(1,enemies);assert.equal(enemies.length,count);assert.ok(enemies.every(m=>m.path===map.path));
});
test('兩個 U 內圈可建造並覆蓋道路，祭壇、石堆、路面與水域拒絕',()=>{
 const ns=load(),b=new ns.systems.BuildSystem();for(const p of [[630,380],[700,590],[700,820],[500,150]])assert.equal(b.canPlaceAt(...p,'building'),true,p.join(','));
 for(const p of [[960,365],[440,585],[1190,382],[174,577],[1210,700],[1360,600]])assert.equal(b.canPlaceAt(...p,'building'),false,p.join(','));
 for(const p of ns.config.path.filter(p=>p.x>42&&p.x<1494))assert.equal(b.placementIssue(p.x,p.y,'building'),'road');
 ns.maps.apply('twinpass');assert.equal(ns.config.routes.length,2);ns.maps.apply('autumn');assert.equal(ns.config.routes.length,1);assert.equal(ns.config.sharedLength,0);
});
