'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function runtime(){
  const values=new Map();
  const context=vm.createContext({console,Math:Object.create(Math),localStorage:{getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)}});
  context.globalThis=context;
  for(const file of ['src/td/namespace.js','src/td/config.js','src/td/maps.js','src/td/map-tools/MapRouteModel.js','src/td/map-tools/MapRouteOverrides.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  return {ns:context.TowerFrontier,context,values};
}

test('正式地圖的官方路線全數能通過路點驗證',()=>{
  const {ns}=runtime();
  for(const map of ns.maps.publicMaps()){const result=ns.mapTools.MapRoute.validate(map,ns.mapTools.MapRoute.routesOf(map));assert.equal(result.valid,true,map.id);assert.equal(result.problems.length,0,map.id);}
});

test('已發佈的赤土終站與石環盆地保留關卡設計者指定的自訂走線',()=>{
  const {ns,context}=runtime();
  vm.runInContext(fs.readFileSync(path.join(root,'src/td/map-tools/published-maps.js'),'utf8'),context,{filename:'published-maps.js'});
  const published=context.HeroFrontierPublishedMaps;
  assert.equal(published.maps.redmesa.routes[0].length,28);
  assert.equal(published.maps.stonecircle.routes[0].length,24);
  for(const id of ['redmesa','stonecircle'])assert.equal(ns.mapTools.MapRoute.validate(ns.maps.definitions[id],published.maps[id].routes).valid,true,id+' 的已發佈路線必須可載入');
});

test('路線只阻擋無效座標或移動起終點，不限制玩家設定的地形位置',()=>{
  const {ns}=runtime();
  const map=ns.maps.definitions.emberroad;
  const arbitrary=ns.mapTools.MapRoute.routesOf(map);arbitrary[0].splice(4,0,{x:610,y:350},{x:610,y:350});
  assert.equal(ns.mapTools.MapRoute.validate(map,arbitrary).valid,true);
  const malformed=ns.mapTools.MapRoute.routesOf(map);malformed[0][8]={x:NaN,y:350};
  assert.match(ns.mapTools.MapRoute.validate(map,malformed).problems.join(' '),/座標無效/);
  const movedStart=ns.mapTools.MapRoute.routesOf(map);movedStart[0][0]={x:0,y:0};
  assert.match(ns.mapTools.MapRoute.validate(map,movedStart).problems.join(' '),/出生點與城門點不可移動/);
});

test('赤土終站與石環盆地的道路加點和跨越舊障礙設定都可儲存',()=>{
  const {ns}=runtime(),model=ns.mapTools.MapRoute;
  for(const [id,segment] of [['redmesa',17],['stonecircle',8]]){
    const map=ns.maps.definitions[id],routes=model.routesOf(map),route=routes[0],a=route[segment-1],b=route[segment];
    route.splice(segment,0,{x:Math.round((a.x+b.x)/2),y:Math.round((a.y+b.y)/2)});
    const review=model.validate(map,routes);assert.equal(review.valid,true,id+' 的道路中點應保有通行權');assert.equal(review.problems.length,0,id+' 不應誤報障礙');
  }
  const map=ns.maps.definitions.redmesa,routes=model.routesOf(map);routes[0][15]={x:900,y:400};
  assert.equal(model.validate(map,routes).valid,true,'地形不再限制關卡設計者的路線');
});

test('已儲存的路點覆寫會在套用地圖時更新怪物路線，移除後回復官方資料',()=>{
  const {ns,values}=runtime();
  const map=ns.maps.definitions.emberroad;
  const routes=ns.mapTools.MapRoute.routesOf(map);routes[0][4]={x:300,y:250};
  assert.equal(ns.systems.MapRouteOverrides.save(map,routes).valid,true);
  ns.maps.apply('emberroad');
  assert.equal(ns.config.path[4].x,300);
  assert.equal(ns.config.path[4].y,250);
  assert.ok(values.get(ns.systems.MapRouteOverrides.KEY));
  assert.equal(ns.systems.MapRouteOverrides.remove('emberroad'),true);
  ns.maps.apply('emberroad');
  assert.equal(ns.config.path[4].x,290);
  assert.equal(ns.config.path[4].y,220);
});

test('開發者工作台與路點編輯器只提供獨立入口，不被玩家戰場載入',()=>{
  const studio=fs.readFileSync(path.join(root,'developer-studio.html'),'utf8');
  const editor=fs.readFileSync(path.join(root,'route-editor.html'),'utf8');
  const battlefield=fs.readFileSync(path.join(root,'td.html'),'utf8');
  assert.match(studio,/href="route-editor\.html"/);
  assert.match(editor,/管理者|管理者檔案/);
  assert.match(editor,/MapRouteOverrides\.js/);
  assert.doesNotMatch(battlefield,/route-editor\.html/);
  assert.match(battlefield,/MapRouteOverrides\.js/);
});
