'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function load(){const c=vm.createContext({console});c.globalThis=c;for(const file of ['namespace','config','maps','systems/PathSystem','systems/NavigationSystem','systems/BuildSystem','systems/BattlefieldCamera','systems/FrontierTerrain','entities/Monster','TDGame'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/td/'+file+'.js'),'utf8'),c);return c.TowerFrontier;}
test('地圖美術更新保留同尺寸原版供回復，未增加執行期下載容量級別',()=>{
 const root=path.join(__dirname,'..'),old=fs.readFileSync(path.join(root,'assets/td/beginner-valley-v1.png')),current=fs.readFileSync(path.join(root,'assets/td/beginner-valley-v2.png'));
 assert.equal(current.readUInt32BE(16),old.readUInt32BE(16));assert.equal(current.readUInt32BE(20),old.readUInt32BE(20));assert.ok(current.length<old.length*1.5);assert.notDeepEqual(current,old);
});
test('正常玩家只看到正式新手谷地，兩張舊圖仍保留作回歸測試',()=>{
 const ns=load(),maps=ns.maps.publicMaps();assert.deepEqual(Array.from(maps,map=>map.id),['twinpass','autumn','silverleaf','shadowfall','frostborn','beginner']);assert.equal(ns.maps.defaultId,'beginner');
 assert.equal(ns.maps.definitions.classic.developmentOnly,true);assert.equal(ns.maps.definitions.frontier.developmentOnly,true);
 const html=fs.readFileSync(path.join(__dirname,'../td.html'),'utf8');assert.match(html,/value="beginner"/);assert.doesNotMatch(html,/value="frontier"|value="classic"/);
});
test('正式地圖以 1536×1024 原圖作世界，不拉伸且資料化 U 型路線',()=>{
 const ns=load(),map=ns.maps.definitions.beginner,asset=fs.readFileSync(path.join(__dirname,'../assets/td/beginner-valley-v2.png'));
 assert.equal(asset.toString('ascii',1,4),'PNG');assert.equal(asset.readUInt32BE(16),1536);assert.equal(asset.readUInt32BE(20),1024);
 assert.equal(map.width,1536);assert.equal(map.height,1024);assert.equal(map.asset,'assets/td/beginner-valley-v2.png');assert.deepEqual(Array.from(map.path,p=>[p.x,p.y]),[[-28,370],[120,370],[240,378],[340,382],[400,380],[450,345],[480,290],[500,230],[545,190],[620,182],[690,194],[735,225],[765,285],[790,360],[795,440],[825,510],[900,550],[1000,555],[1100,560],[1200,555],[1280,575],[1350,620],[1430,650],[1564,650]]);
 assert.deepEqual({x:map.spawn.x,y:map.spawn.y},{x:36,y:370});assert.deepEqual({x:map.gate.x,y:map.gate.y},{x:1500,y:650});
 assert.equal(map.heroVulnerable,false);assert.equal(map.camera.maxZoom,1.65);
 for(const file of ['src/td/systems/ArtSystem.js','sw.js'])assert.match(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),/beginner-valley-v2\.png/);
});
test('新手谷地關閉英雄受傷，舊回歸地圖仍可重用英雄戰鬥機制',()=>{
 const ns=load();ns.maps.apply('beginner');assert.equal(ns.config.heroVulnerable,false);ns.maps.apply('classic');assert.equal(ns.config.heroVulnerable,true);
});
test('正式地圖繪製使用原始寬高，不傳入拉伸尺寸',()=>{
 const ns=load();ns.maps.apply('beginner');const image={ready:true},calls=[],ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(object,key)=>object[key]||((...args)=>calls.push([key,...args]))}),renderer=new ns.systems.FrontierTerrain();
 assert.equal(renderer.draw(ctx,{mapAssets:{beginner:image}}),true);const draw=calls.find(call=>call[0]==='drawImage');assert.deepEqual(draw,['drawImage',image,0,0]);assert.equal(renderer.cache,image);
});

test('選擇部署時不再把合法點與禁建框鋪滿整張地圖',()=>{
 const ns=load();ns.maps.apply('silverleaf');
 const image={ready:true},art={mapAssets:{silverleaf:image}},build=new ns.systems.BuildSystem();
 const calls=()=>{const list=[],ctx=new Proxy({},{get:(_,key)=>(...args)=>list.push([key,...args])});assert.equal(new ns.systems.FrontierTerrain().draw(ctx,art,build),true);return list;};
 const idle=calls();build.queue('arrow','building');const pending=calls();
 assert.deepEqual(pending,idle);
 assert.deepEqual(pending.filter(call=>call[0]==='drawImage'),[['drawImage',image,0,0]]);
});

test('建造預覽只在指標進入戰場後顯示，重新選卡不殘留紅圈',()=>{
 const ns=load();ns.maps.apply('beginner');const build=new ns.systems.BuildSystem(),calls=[];
 const ctx=new Proxy({},{get:(_,key)=>(...args)=>calls.push([key,...args])});
 assert.equal(build.queue('arrow','building'),true);build.draw(ctx);assert.equal(calls.length,0);
 build.updatePointer(600,400);assert.equal(build.pointer.valid,true);build.draw(ctx);
 assert.ok(calls.some(call=>call[0]==='arc'));
 calls.length=0;build.queue('frost','building');build.draw(ctx);assert.equal(calls.length,0);
});
test('新手圖只在清楚的草地部署，樹林、巨石、營地與道路拒絕',()=>{
 const ns=load();ns.maps.apply('beginner');const build=new ns.systems.BuildSystem();
 for(const p of [[600,400],[330,465],[560,110],[900,350],[1250,455],[1250,655]])for(const kind of ['unit','building'])assert.equal(build.canPlaceAt(p[0],p[1],kind),true,p.join(','));
 for(const p of [[80,350],[760,450],[250,300],[900,420],[180,520],[900,900],[1200,100]])for(const kind of ['unit','building'])assert.equal(build.canPlaceAt(p[0],p[1],kind),false,p.join(','));
 assert.equal(build.placementIssue(80,350,'unit'),'road');assert.equal(build.placementIssue(900,900,'unit'),'terrain');assert.match(build.placementMessage(900,900,'unit'),/平坦|森林|山壁|水域/);assert.doesNotMatch(build.placementMessage(900,900,'unit'),/亮點/);
});
test('大地圖可回復原圖，共用戰鬥資料且路線長度完全相同',()=>{
 const ns=load(),classic=ns.config;ns.maps.apply('frontier');assert.equal(ns.config.width,1280);assert.equal(ns.config.height,900);assert.equal(ns.config.units,classic.units);assert.equal(ns.config.buildings,classic.buildings);
 assert.ok(Math.abs(ns.maps.length(ns.config.path)-ns.maps.length(classic.path))<1e-6);
 assert.equal(ns.maps.apply('missing'),null);assert.equal(ns.config.mapId,'frontier');ns.maps.apply('classic');assert.equal(ns.config.path,classic.path);assert.equal(ns.config.width,720);
});
test('新圖每段道路禁止士兵與塔部署，原 720 之外草地可建',()=>{
 const ns=load();ns.maps.apply('frontier');const build=new ns.systems.BuildSystem();
 ns.config.path.slice(1).forEach((b,i)=>{const a=ns.config.path[i];for(const kind of ['unit','building'])assert.equal(build.canPlaceAt((a.x+b.x)/2,(a.y+b.y)/2,kind),false);});
 for(const kind of ['unit','building']){assert.equal(build.canPlaceAt(1100,640,kind),true);assert.equal(build.canPlaceAt(1270,640,kind),false);assert.equal(build.canPlaceAt(1100,890,kind),false);}
 const economy={gold:999,lumber:99};build.queue('hunter','unit');assert.equal(build.placeQueued(230,180,economy),false);assert.equal(economy.gold,999);
 ns.maps.apply('classic');assert.equal(build.canPlaceAt(585,265,'unit'),false);assert.equal(build.canPlaceAt(350,250,'unit'),true);assert.equal(build.canPlaceAt(900,640,'unit'),false);
});
test('四種怪物在 ×1／×2／×3 的無干擾抵達時間與原圖一致，進度不倒退',()=>{
 const ns=load();for(const type of ['grunt','runner','brute','boss'])for(const speed of [1,2,3]){
  function simulate(map){ns.maps.apply(map);const m=new ns.entities.Monster(type,1);let ticks=0,previous=0;while(m.active&&ticks<10000){m.update(speed/60);if(map==='frontier'){assert.ok(m.progress()>=previous-1e-8);previous=m.progress();}ticks++;}assert.equal(m.leaked,true);return ticks;}
  assert.ok(Math.abs(simulate('classic')-simulate('frontier'))<=1,type+' x'+speed);
 }
});
test('新圖導航可到達舊邊界外，鏡頭各尺寸反算世界座標正確',()=>{
 const ns=load();ns.maps.apply('frontier');const nav=new ns.systems.NavigationSystem(),route=nav.findPath({x:520,y:250},{x:1100,y:640},[]);assert.ok(route.length);assert.ok(route.at(-1).x>1000);
 for(const [w,h]of [[1920,1080],[1366,768],[845,390],[390,845]]){const c=new ns.systems.BattlefieldCamera(1280,900);c.resize(w,h);c.changeZoom(1.2);c.focus(1100,640);const s=c.worldToScreen(1100,640),p=c.screenToWorld(s.x,s.y);assert.ok(Math.abs(p.x-1100)<1e-7&&Math.abs(p.y-640)<1e-7);}
});
test('切圖共用原遊戲實例，更新英雄出生点、路線及鏡頭；開戰拒絕切圖',()=>{
 const ns=load(),g={profession:{selected:null},hero:{},ui:{mapChoice:{}},camera:new ns.systems.BattlefieldCamera(720,720),updateUi(){}};
 assert.equal(ns.TDGame.prototype.chooseMap.call(g,'frontier'),true);assert.equal(g.hero.spawnX,520);assert.equal(g.path.points,ns.config.path);assert.equal(g.camera.worldWidth,1280);
 g.profession.selected='hunter';assert.equal(ns.TDGame.prototype.chooseMap.call(g,'classic'),false);assert.equal(ns.config.mapId,'frontier');
});
test('重新挑戰沿用上一局地圖，不建立第二套 reset',()=>{
 const ns=load(),calls=[],g={lastRun:{map:'frontier',difficulty:'veteran',profession:'hunter',faction:'rogue'},ui:{},reset(){calls.push('reset');},chooseMap(id){calls.push(id);},chooseDifficulty(){},selectOpeningProfession(){},selectOpeningFaction(){},chooseProfession(){calls.push('start');}};
 ns.TDGame.prototype.retrySameSetup.call(g);assert.deepEqual(calls,['reset','frontier','start']);
});

test('部署原因沿用原判定：完整地圖取樣無合法區變動，提示不扣資源',()=>{
 const ns=load();ns.maps.apply('frontier');const build=new ns.systems.BuildSystem();
 function distance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
 build.items=[{kind:'building',x:810,y:355}];
 for(const kind of ['unit','building'])for(let x=0;x<=1280;x+=16)for(let y=0;y<=900;y+=12){
  const expected=x>=42&&x<=1238&&y>=62&&y<=854&&!ns.config.path.some((p,i)=>i&&distance({x,y},ns.config.path[i-1],p)<55)&&Math.hypot(x-810,y-355)>=58;
  assert.equal(build.canPlaceAt(x,y,kind),expected);
 }
 assert.equal(build.placementIssue(0,0,'unit'),'boundary');assert.equal(build.placementIssue(230,180,'unit'),'road');
 assert.equal(build.placementIssue(810,355,'unit'),'occupied');assert.match(build.placementMessage(230,180,'unit'),/道路禁建/);
});

test('三個區域提示中心均在合法草地，沒有固定槽位或額外戰鬥倍率',()=>{
 const ns=load();ns.maps.apply('frontier');const build=new ns.systems.BuildSystem();
 for(const z of ns.maps.definitions.frontier.zones){assert.equal(build.canPlaceAt(z.x,z.y,'building'),true,z.name);assert.equal(build.canPlaceAt(z.x,z.y,'unit'),true);assert.ok(z.hint);}
 for(const [w,h]of [[1920,1080],[1366,768],[845,390]]){
  const c=new ns.systems.BattlefieldCamera(1280,900);c.resize(w,h);const p=ns.maps.definitions.frontier.openingFocus;c.focus(p.x,p.y);
  const hero=c.worldToScreen(520,250),entry=c.worldToScreen(70,180);
  assert.ok(hero.x>0&&hero.x<w&&hero.y>100&&hero.y<h-100);assert.ok(entry.y>90&&entry.y<h);
 }
});

test('新版地表本機資產與載入、離線清單同步，舊材質保留可回復',()=>{
 const root=path.join(__dirname,'..'),asset=fs.readFileSync(path.join(root,'assets/td/frontier-ground-v2.png'));
 assert.equal(asset.toString('ascii',1,4),'PNG');assert.ok(asset.readUInt32BE(16)>1000);
 for(const file of ['src/td/systems/ArtSystem.js','sw.js'])assert.match(fs.readFileSync(path.join(root,file),'utf8'),/frontier-ground-v2\.png/);
 assert.ok(fs.existsSync(path.join(root,'assets/td/frontier-ground-v1.png')));
});
test('原型地景僅首次繪製建立快取，不在每幀重製地圖',()=>{
 let canvases=0;const ctx=new Proxy({createPattern:()=>({}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(obj,key)=>obj[key]||(()=>{})});
 const c=vm.createContext({document:{createElement(){canvases++;return {getContext:()=>ctx};}}});c.globalThis=c;
 for(const file of ['namespace','config','maps','systems/FrontierTerrain'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/td/'+file+'.js'),'utf8'),c);
 const ns=c.TowerFrontier;ns.maps.apply('frontier');const renderer=new ns.systems.FrontierTerrain(),art={background:{ready:false,naturalWidth:1254,naturalHeight:1254}};
 assert.equal(renderer.draw(ctx,art),false);assert.equal(canvases,0);art.background.ready=true;assert.equal(renderer.draw(ctx,art),true);const first=canvases;for(let i=0;i<100;i++)renderer.draw(ctx,art);assert.equal(canvases,first);assert.equal(renderer.cache.width,1280);const fallback=renderer.cache;art.frontierGround={ready:true};renderer.draw(ctx,art);assert.notEqual(renderer.cache,fallback);const upgraded=renderer.cache;renderer.draw(ctx,art);assert.equal(renderer.cache,upgraded);
 let keepDraws=0;art.keep={ready:true};art.drawKeep=(surface,x,y,size)=>{keepDraws++;assert.equal(surface,ctx);assert.equal(x,1204);assert.equal(y,750);assert.equal(size,168);return true;};renderer.draw(ctx,art);assert.equal(keepDraws,1);assert.equal(renderer.cache,upgraded,'晚載入地標不應重建地表快取');
 const build={pending:{kind:'building'},calls:0,canPlaceAt(){this.calls++;return true;}},saved=JSON.stringify(ns.config.path);
 renderer.draw(ctx,art,build);assert.equal(build.calls,0);assert.equal(renderer.cache,upgraded);const drawn=canvases;
 build.pending=null;renderer.draw(ctx,art,build);assert.equal(build.calls,0);assert.equal(canvases,drawn);assert.equal(JSON.stringify(ns.config.path),saved);
});
