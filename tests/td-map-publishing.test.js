'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {createStudio}=require('../scripts/developer-server.cjs');
const source=path.resolve(__dirname,'..');
async function fixture(t){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'frontier-studio-'));
  for(const file of ['namespace.js','config.js','maps.js','map-tools/MapRouteModel.js','map-tools/MapRouteOverrides.js','map-tools/MapLayoutOverrides.js','map-tools/published-maps.js','systems/BuildSystem.js','systems/PathSystem.js','systems/WaveSystem.js','systems/WaveCatalog.js','entities/Monster.js']){const dest=path.join(root,'src/td',file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(source,'src/td',file),dest);}
  fs.writeFileSync(path.join(root,'src/td/map-tools/published-maps.js'),'globalThis.HeroFrontierPublishedMaps = {"schemaVersion":1,"revision":0,"maps":{}};\n');
  const server=createStudio(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});fs.rmSync(root,{recursive:true,force:true});});
  const url='http://127.0.0.1:'+server.address().port,state=await (await fetch(url+'/api/studio/state')).json();
  const post=(endpoint,body,headers={})=>fetch(url+'/api/studio/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json',Origin:url,'X-Studio-Token':state.token,...headers},body:JSON.stringify(body)});
  function game(){const c=vm.createContext({console,localStorage:{getItem:()=>JSON.stringify({version:1,maps:{emberroad:{cellSize:64,buildable:[],routes:[[{x:0,y:0},{x:1,y:1}]]}}})}});c.globalThis=c;for(const file of ['namespace.js','config.js','maps.js','map-tools/published-maps.js','map-tools/MapRouteModel.js','map-tools/MapRouteOverrides.js','map-tools/MapLayoutOverrides.js','systems/BuildSystem.js','systems/PathSystem.js','entities/Monster.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/td',file),'utf8'),c);return c.TowerFrontier;}
  return {root,url,post,game,state};
}
test('發佈後，新遊戲的塔位、PathSystem 與 Monster 都讀專案資料，還原有獨立版本與備份',async t=>{
  const f=await fixture(t),ns=f.game(),routes=ns.mapTools.MapRoute.routesOf(ns.maps.definitions.emberroad);routes[0][4]={x:300,y:250};
  const res=await f.post('publish',{baseRevision:0,changes:{emberroad:{layout:{cellSize:64,buildable:[{column:3,row:3}]},routes}}});assert.equal(res.status,200);assert.equal((await res.json()).state.revision,1);
  const fresh=f.game();fresh.maps.apply('emberroad');assert.equal(new fresh.systems.PathSystem().points[4].y,250);assert.equal(new fresh.entities.Monster('grunt',1).path[4].y,250);
  const build=new fresh.systems.BuildSystem();assert.equal(build.terrainIssue(224,224,'building'),null);assert.equal(build.terrainIssue(288,224,'building'),'terrain');
  assert.ok(fs.existsSync(path.join(f.root,'artifacts/map-history/0.json')));
  const restored=await f.post('restore',{baseRevision:1,revision:0});assert.equal(restored.status,200);assert.equal((await restored.json()).state.revision,2);
  const original=f.game();original.maps.apply('emberroad');assert.equal(original.config.path[4].y,220);assert.equal(original.systems.MapLayoutOverrides.get('emberroad'),null,'舊 localStorage 不能蓋回還原結果');
  assert.ok(fs.existsSync(path.join(f.root,'artifacts/map-history/1.json')));
});
test('新增格線不能抹去已發佈路線，過期編輯頁拒絕覆蓋',async t=>{
  const f=await fixture(t),ns=f.game(),routes=ns.mapTools.MapRoute.routesOf(ns.maps.definitions.emberroad);
  assert.equal((await f.post('publish',{baseRevision:0,changes:{emberroad:{routes}}})).status,200);
  assert.equal((await f.post('publish',{baseRevision:0,changes:{emberroad:{layout:{cellSize:64,buildable:[]}}}})).status,409);
  const result=await f.post('publish',{baseRevision:1,changes:{emberroad:{layout:{cellSize:64,buildable:[]}}}});assert.equal(result.status,200);const data=await result.json();assert.equal(data.state.maps.emberroad.routes[0].length,routes[0].length);
});
test('多地圖發佈驗證全部成功才写入；拒絕未知地圖、越界格、損壞路線',async t=>{
  const f=await fixture(t);
  for(const changes of [{emberroad:{layout:{cellSize:64,buildable:[{column:999,row:0}]}}},{missing:{layout:{cellSize:64,buildable:[]}}},{emberroad:{routes:[[null,null]]}},{beginner:{layout:{cellSize:64,buildable:[]}},emberroad:{routes:[]}}])assert.equal((await f.post('publish',{baseRevision:0,changes})).status,400);
  const current=await (await fetch(f.url+'/api/studio/state')).json();assert.equal(current.state.revision,0);assert.equal(Object.keys(current.state.maps).length,0);
});
test('無權限與跨來源不能發佈，備份與原始後台程式不可透過 HTTP 讀取',async t=>{
  const f=await fixture(t),body={baseRevision:0,changes:{emberroad:{layout:{cellSize:64,buildable:[]}}}};
  assert.equal((await f.post('publish',body,{'X-Studio-Token':'invalid'})).status,403);assert.equal((await f.post('publish',body,{Origin:'https://example.org'})).status,403);
  for(const p of ['/scripts/developer-server.cjs','/artifacts/map-history/0.json','/.git/config'])assert.equal((await fetch(f.url+p)).status,403);
  assert.equal((await fetch(f.url+'/api/studio/state',{headers:{Origin:'https://example.org'}})).status,403);
});
