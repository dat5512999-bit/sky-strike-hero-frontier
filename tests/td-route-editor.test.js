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

test('改動路段會拒絕太短節點與穿越禁行障礙',()=>{
  const {ns}=runtime();
  const map=ns.maps.definitions.emberroad;
  const short=ns.mapTools.MapRoute.routesOf(map);short[0].splice(4,0,{x:190,y:198});
  assert.equal(ns.mapTools.MapRoute.validate(map,short).valid,false);
  const obstacle=ns.mapTools.MapRoute.routesOf(map);obstacle[0][8]={x:610,y:350};
  assert.match(ns.mapTools.MapRoute.validate(map,obstacle).problems.join(' '),/禁行障礙/);
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
