'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
const root=path.resolve(__dirname,'..');
function setup(){const {ns,context}=load();context.HeroFrontierPublishedMaps={schemaVersion:1,revision:0,maps:{}};for(const file of ['src/td/maps.js','src/td/map-tools/EmberroadGridModel.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});return {ns,context};}

test('2-2 建造格工具使用正式地圖規則，並把道路、障礙與邊界鎖定',()=>{
  const {ns}=setup(),map=ns.maps.definitions.emberroad,grid=ns.mapTools.MapGrid,cells=grid.cells(map),baseline=new Set(grid.baseline(map));
  assert.equal(grid.CELL_SIZE,64);assert.equal(cells.length,24*16);assert.equal(cells.every(cell=>cell.x===cell.column*64+32&&cell.y===cell.row*64+32),true);
  assert.ok(cells.some(cell=>cell.state==='restricted'));assert.ok(cells.some(cell=>cell.state==='candidate'));assert.ok(baseline.size>=10);
  for(const cell of cells.filter(cell=>baseline.has(cell.key)))assert.equal(cell.state,'gameLegal');
  const restricted=cells.find(cell=>cell.state==='restricted'),legal=cells.find(cell=>cell.state==='gameLegal');
  const payload=grid.selectionPayload(map,new Set([restricted.key,legal.key]));
  assert.deepEqual(JSON.parse(JSON.stringify(payload)),{format:'hero-frontier-grid-v2',map:'emberroad',cellSize:64,buildable:[{column:restricted.column,row:restricted.row,x:restricted.x,y:restricted.y,originalState:'restricted',requiresReview:true},{column:legal.column,row:legal.row,x:legal.x,y:legal.y,originalState:'gameLegal',requiresReview:false}]});
});

test('本機草稿不能修改正式遊戲；發佈格線才取代地形規則，且可完整還原',()=>{
  const {ns,context}=setup(),data=new Map();context.localStorage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};vm.runInContext(fs.readFileSync(path.join(root,'src/td/map-tools/MapLayoutOverrides.js'),'utf8'),context,{filename:'MapLayoutOverrides.js'});
  const map=ns.maps.definitions.emberroad,grid=ns.mapTools.MapGrid,restricted=grid.cells(map).find(cell=>cell.state==='restricted'&&cell.x>100&&cell.y>100&&cell.x<1400&&cell.y<900),payload=grid.selectionPayload(map,new Set([restricted.key]));
  assert.equal(ns.systems.MapLayoutOverrides.save(map,payload),true);ns.maps.apply(map.id);let build=new ns.systems.BuildSystem();assert.equal(build.canPlaceAt(restricted.x,restricted.y,'building'),false,'未發佈的本機草稿不更改正式遊戲');
  context.HeroFrontierPublishedMaps={schemaVersion:1,revision:1,maps:{emberroad:{layout:payload}}};
  assert.equal(build.canPlaceAt(restricted.x,restricted.y,'building'),true,'正式發佈後，受限制格可作為配置的一部分');
  context.HeroFrontierPublishedMaps={schemaVersion:1,revision:2,maps:{}};ns.maps.apply(map.id);build=new ns.systems.BuildSystem();assert.equal(build.canPlaceAt(restricted.x,restricted.y,'building'),false,'正式版還原後舊草稿不會重新蓋回');
});

test('地圖格線編輯頁可離線開啟，支援所有正式地圖、縮放與套用',()=>{
  const html=fs.readFileSync(path.join(root,'emberroad-grid-editor.html'),'utf8');
  for(const file of ['src/td/namespace.js','src/td/config.js','src/td/maps.js','src/td/map-tools/MapLayoutOverrides.js','src/td/map-tools/EmberroadGridModel.js','src/td/map-tools/EmberroadGridEditor.js'])assert.match(html,new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  for(const action of ['data-grid-reset','data-grid-clear','data-grid-copy','data-grid-download','data-grid-save','data-grid-remove','data-grid-zoom-in','data-grid-zoom-out'])assert.match(html,new RegExp(action));
  assert.match(html,/紅格點成綠色/);assert.match(html,/儲存到遊戲/);
  const studio=fs.readFileSync(path.join(root,'developer-studio.html'),'utf8');assert.match(studio,/heroFrontierProfilesV1/);assert.match(studio,/map-grid-editor\.html/);assert.match(studio,/不會出現在遊戲大廳/);
});
