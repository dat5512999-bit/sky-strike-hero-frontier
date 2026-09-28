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
  for(const size of [{width:430,height:932},{width:932,height:430},{width:844,height:390}]){
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

test('手機容器與模擬器都保留同一個橫向遊戲畫面',()=>{
  const shell=fs.readFileSync(path.join(root,'td-mobile.html'),'utf8');
  const main=fs.readFileSync(path.join(root,'src/td/main.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'td.css'),'utf8');
  const combat=fs.readFileSync(path.join(root,'td-combat.css'),'utf8');
  const lobby=fs.readFileSync(path.join(root,'td-lobby.css'),'utf8');
  const pwa=fs.readFileSync(path.join(root,'src/td/mobile-pwa.js'),'utf8');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'td.webmanifest'),'utf8'));
  assert.match(shell,/searchParams\.set\('mobileShell','1'\)/);
  assert.match(shell,/searchParams\.get\('preview'\)/);
  assert.match(shell,/searchParams\.set\('preview',preview\)/);
  assert.match(shell,/rotate\(90deg\)/);
  assert.match(shell,/safeTopProbe\.getBoundingClientRect\(\)\.height/);
  assert.match(shell,/frame\.style\.width=\(portrait\?h:w\)\+'px'/);
  assert.match(shell,/postMessage\(\{type:'tower-frontier-shell-inset'/);
  assert.doesNotMatch(shell,/translateY\(/);
  assert.match(shell,/id="install-open"/);
  assert.match(main,/mobileShell=params\.get\('mobileShell'\)==='1'/);
  assert.match(main,/document\.body\.dataset\.mobilePreview='true'/);
  assert.match(main,/shellSafeInset/);
  assert.match(main,/tower-frontier-shell-inset/);
  assert.match(main,/requestFullscreen\(\{navigationUI:'hide'\}\)/);
  assert.match(css,/--mobile-shell-system-inset/);
  assert.doesNotMatch(combat,/data-mobile-shell="true"[^\n]*data-game-screen="battle"[^\n]*\.orientation-gate\{display:grid/);
  assert.match(lobby,/body\[data-mobile-preview="true"\] #frontier-app\[data-page=home\] \.lobby-content\{display:grid;grid-template-areas:'motto promo' 'modes promo'/);
  assert.match(pwa,/document\.getElementById\('install-open'\)/);
  assert.match(pwa,/const reveal=.*open\.hidden=false/);
  assert.equal(manifest.orientation,'landscape');
  assert.equal(manifest.display,'fullscreen');
});

test('手機預覽模式不會讀寫玩家的桌機版型偏好', () => {
  const main = fs.readFileSync(path.join(root, 'src/td/main.js'), 'utf8');
  assert.match(main, /previewMobile/);
  assert.match(main, /layoutStorage=forceMobile\?null/);
  assert.match(main, /coarse:forceMobile\|\|/);
});
