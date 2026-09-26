'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('fresh touch-device layout matches simulator layout at the same game viewport',()=>{
  const vm=require('node:vm'),context=vm.createContext({});context.globalThis=context;context.TowerFrontier={systems:{}};
  vm.runInContext(fs.readFileSync(path.join(root,'src/td/systems/LayoutSystem.js'),'utf8'),context);
  const Layout=context.TowerFrontier.systems.LayoutSystem;
  for(const size of [{width:932,height:430},{width:844,height:390}]){
    const phone={dataset:{}},simulator={dataset:{}};
    new Layout(phone,{getItem:()=>null},()=>({...size,coarse:true}));
    new Layout(simulator,null,()=>({...size,coarse:true}));
    assert.deepEqual(phone.dataset,simulator.dataset);assert.equal(phone.dataset.layout,'mobile');
  }
});

test('iPhone 15 Pro Max 模擬器提供與真實直向入口一致的檢視模式', () => {
  const html = fs.readFileSync(path.join(root, 'mobile-simulator.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'mobile-simulator.css'), 'utf8');
  const script = fs.readFileSync(path.join(root, 'src/td/mobile-simulator.js'), 'utf8');
  assert.match(html, /id="simulator-game"/);
  assert.match(html, /data-simulator-mode="portrait"/);
  assert.match(html, /data-simulator-mode="landscape"/);
  assert.match(html, /mobile-simulator\.css/);
  assert.match(html, /src\/td\/mobile-simulator\.js/);
  assert.match(css, /width:430px;height:932px/);
  assert.match(css, /width:932px;height:430px/);
  assert.match(script, /entry: 'td-mobile\.html'/);
  assert.match(script, /entry: 'td\.html'/);
  assert.match(script, /set\('preview', 'iphone15promax'\)/);
  assert.match(script, /function setMode/);
  assert.match(script, /ResizeObserver/);
  assert.match(script, /requestFullscreen/);
});

test('手機預覽模式不會讀寫玩家的桌機版型偏好', () => {
  const main = fs.readFileSync(path.join(root, 'src/td/main.js'), 'utf8');
  assert.match(main, /previewMobile/);
  assert.match(main, /layoutStorage=previewMobile\?null/);
  assert.match(main, /coarse:previewMobile\|\|/);
});
