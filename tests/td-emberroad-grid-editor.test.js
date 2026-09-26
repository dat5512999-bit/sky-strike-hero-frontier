'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
const root=path.resolve(__dirname,'..');
function setup(){const {ns,context}=load();for(const file of ['src/td/maps.js','src/td/map-tools/EmberroadGridModel.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});return ns;}

test('2-2 建造格工具使用正式地圖規則，並把道路、障礙與邊界鎖定',()=>{
  const ns=setup(),map=ns.maps.definitions.emberroad,grid=ns.mapTools.EmberroadGrid,cells=grid.cells(map),baseline=new Set(grid.baseline(map));
  assert.equal(grid.CELL_SIZE,64);assert.equal(cells.length,24*16);assert.equal(cells.every(cell=>cell.x===cell.column*64+32&&cell.y===cell.row*64+32),true);
  assert.ok(cells.some(cell=>cell.state==='locked'));assert.ok(cells.some(cell=>cell.state==='candidate'));assert.ok(baseline.size>=10);
  for(const cell of cells.filter(cell=>baseline.has(cell.key)))assert.equal(cell.state,'gameLegal');
  const locked=cells.find(cell=>cell.state==='locked'),legal=cells.find(cell=>cell.state==='gameLegal');
  const payload=grid.selectionPayload(map,new Set([locked.key,legal.key]));
  assert.deepEqual(JSON.parse(JSON.stringify(payload)),{format:'hero-frontier-grid-v1',map:'emberroad',cellSize:64,buildable:[{column:legal.column,row:legal.row,x:legal.x,y:legal.y}]});
});

test('2-2 格線編輯頁可離線開啟，並提供還原、清空、複製與下載標註',()=>{
  const html=fs.readFileSync(path.join(root,'emberroad-grid-editor.html'),'utf8');
  for(const file of ['src/td/namespace.js','src/td/config.js','src/td/maps.js','src/td/map-tools/EmberroadGridModel.js','src/td/map-tools/EmberroadGridEditor.js'])assert.match(html,new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  for(const action of ['data-grid-reset','data-grid-clear','data-grid-copy','data-grid-download'])assert.match(html,new RegExp(action));
  assert.match(html,/道路／障礙／邊界/);assert.match(html,/不會立即改動玩家地圖/);
});
