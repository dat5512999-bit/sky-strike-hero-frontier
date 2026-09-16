'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

test('邊緣 HUD 保留唯一操作入口、原始 Canvas 與離線樣式',()=>{
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  assert.match(html,/<canvas id="td-game" width="720" height="720"/);
  assert.match(html,/href="td-combat.css"/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'不能複製技能或建造 DOM ID');
  for(const id of ['td-hero-select','td-skill-button','td-thunder','td-summon','td-shop-open','td-ultimate','td-stat-attack','td-upgrade','td-sell','td-menu-open'])assert.ok(ids.includes(id));
  assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/'\.\/td-combat\.css'/);
});

test('商店在戰場快捷列獨立於四格英雄技能，大絕名稱與冷卻分開呈現',()=>{
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  const rail=html.match(/<div class="td-quick-rail"[^>]*>(.*?)<\/div>/s)?.[1];
  const skills=html.match(/<div class="td-hero-dock">(.*?)<\/div>/s)?.[1];
  assert.ok(rail&&skills);
  assert.match(rail,/id="td-shop-open"[^>]*aria-keyshortcuts="R"/);
  assert.doesNotMatch(skills,/td-shop-open|商店城/);
  assert.equal([...skills.matchAll(/class="skill-button/g)].length,4);
  assert.match(skills,/id="td-ultimate"[^>]*aria-keyshortcuts="F"/);
  assert.match(skills,/class="skill-cooldown"/);
  const game=fs.readFileSync(path.join(root,'src/td/TDGame.js'),'utf8');
  assert.match(game,/if\(key==='r'\)\{self\.openShop\(\)/);
  assert.match(game,/querySelector\('span'\)\.textContent=ultimate\.name/);
});

test('固定士兵不再打開舊指令面板，PC／橫向／直向仍重用原建造按鈕',()=>{
  const elements=new Map(),tasks=[];
  function element(key){
    if(elements.has(key))return elements.get(key);
    const e={dataset:{},listeners:{},hidden:false,open:false,value:'',parentElement:null,
      addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);},
      emit(type,event={}){for(const fn of this.listeners[type]||[])fn(event);while(tasks.length)tasks.shift()();},
      setAttribute(key,value){this[key]=value;},appendChild(child){child.parentElement=this;},insertBefore(child){child.parentElement=this;}};
    elements.set(key,e);return e;
  }
  const body=element('body'),classes=new Set();body.classList={toggle(key,on){on?classes.add(key):classes.delete(key);}};
  const commands=element('.td-command .command-grid'),drawer=element('.build-drawer-grid');
  const cards=['hunter','arrow'].map((type,i)=>{const e=element(type);e.dataset={buildType:type,buildKind:i?'building':'unit'};e.parentElement=commands;return e;});
  const tabs=['build','orders'].map(type=>{const e=element('tab:'+type);e.dataset.commandTab=type;return e;});
  const win=element('window');
  const context=vm.createContext({console,queueMicrotask:fn=>tasks.push(fn),innerWidth:1366,innerHeight:768,
    localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),addEventListener:win.addEventListener.bind(win),
    document:{body,getElementById:element,querySelector:s=>s==='.command-grid'?commands:element(s),querySelectorAll:s=>s==='[data-build-type]'?cards:s==='[data-command-tab]'?tabs:[]}});
  context.globalThis=context;context.TowerFrontier={systems:{},TDGame:class{
    constructor(){this.calls=[];this.build={cancel(){}};}attachBuildDetails(){}showCommands(panel){this.calls.push(panel);}updateUi(){}
    openArmory(){this.calls.push('armory');}
  }};
  for(const file of ['src/td/systems/LayoutSystem.js','src/td/main.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  assert.ok(classes.has('edge-combat'));
  assert.ok(cards.every(card=>card.parentElement===drawer));
  tabs[1].emit('click');assert.equal(body.dataset.edgeOrders,'false');
  tabs[0].emit('click');assert.equal(body.dataset.edgeOrders,'false');
  tabs[1].emit('click');const details=element('.selection-details');details.open=true;details.emit('toggle');assert.equal(body.dataset.edgeOrders,'false');
  tabs[1].emit('click');win.emit('keydown',{key:'Escape'});assert.equal(body.dataset.edgeOrders,'false');assert.equal(details.open,false);
  const menu=element('td-menu-layout-mode');menu.value='mobile';context.innerWidth=845;context.innerHeight=390;menu.emit('change');
  assert.ok(classes.has('edge-combat'));assert.equal(body.dataset.combatOrientation,'landscape');
  context.innerWidth=390;context.innerHeight=845;win.emit('resize');
  assert.equal(classes.has('edge-combat'),false);assert.ok(cards.every(card=>card.parentElement===commands));
  context.innerWidth=845;context.innerHeight=390;win.emit('resize');
  assert.ok(classes.has('edge-combat'));assert.ok(cards.every(card=>card.parentElement===drawer));
  details.open=false;element('td-selection-shortcut').emit('click');assert.equal(details.open,true);
  details.emit('toggle');assert.equal(element('td-selection-shortcut')['aria-expanded'],'true');
  element('td-armory-shortcut').emit('click');assert.equal(details.open,false);
  assert.equal(context.towerFrontierGame.calls.at(-1),'armory');
});
test('精簡 HUD 折疊保留原情報與全部鏡頭操作，無重複控件',()=>{
 const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
 assert.match(html,/<details class="wave-intel"><summary>下一波情報<\/summary><small id="td-wave-preview">/);
 assert.match(html,/<details id="td-camera-controls"[^>]*><summary>⌖ 鏡頭<\/summary>/);
 for(const id of ['td-camera-close','td-camera-inspect','td-camera-home','td-camera-follow','td-camera-all','td-camera-out','td-camera-in'])assert.equal(html.split('id="'+id+'"').length-1,1);
 const css=fs.readFileSync(path.join(root,'td-combat.css'),'utf8');
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.wave-intel\[open\] #td-wave-preview/);
 assert.match(css,/\.camera-controls\[open\]/);
});
test('戰鬥資源列使用單行圖示數值與既有暫停／選單入口',()=>{
 const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
 const css=fs.readFileSync(path.join(root,'td-combat.css'),'utf8');
 for(const id of ['td-gold','td-lumber','td-merit','td-health'])assert.match(html,new RegExp('class="resource"[^>]*><span class="resource-icon[^"]*"[^>]*>[^<]+<\\/span><small>[^<]+<\\/small><strong id="'+id+'"'));
 for(const id of ['td-pause','td-menu-open'])assert.equal(html.split('id="'+id+'"').length-1,1);
 assert.match(css,/\.td-header>\.resource small\{[\s\S]*?clip-path:inset\(50%\)/);
 assert.match(html,/<header class="td-header">[\s\S]*?id="td-pause"[\s\S]*?<\/header>/);
 assert.match(css,/#td-pause\{[\s\S]*?position:static/);
 assert.match(html,/class="resource-icon merit-icon"[^>]*>🏅<\/span><small>功勳/);
 assert.doesNotMatch(html,/>💎<\/span><small>功勳/);
});
test('桌面瀏覽器縮放只調整 HUD 密度，窄視窗速度列仍保持置中',()=>{
 const css=fs.readFileSync(path.join(root,'td-combat.css'),'utf8');
 assert.match(css,/@media \(min-width:1600px\) and \(min-height:700px\)\{[\s\S]*?--hero-width:162px/);
 assert.match(css,/@media \(min-width:701px\) and \(max-width:1199px\)\{[\s\S]*?\.hud-controls\{left:calc\(50% - 206px\);right:auto;width:412px;[\s\S]*?transform:none/);
 assert.match(css,/@media \(min-width:701px\) and \(max-width:1199px\) and \(max-height:600px\)\{[\s\S]*?left:calc\(50% - 186\.5px\);width:373px/);
 assert.match(css,/@media \(min-width:1200px\) and \(max-height:600px\)\{[\s\S]*?left:calc\(50% - 202\.5px\);right:auto;width:405px/);
 assert.doesNotMatch(css,/data-layout="desktop"[^}]*\.hud-controls\{[^}]*transform:translateX/);
 assert.doesNotMatch(css,/\.td-shell\{[^}]*transform:scale\(/);
});

test('手機橫向 HUD、確認建造、資源兌換與直式提示都有獨立介面',()=>{const html=fs.readFileSync(path.join(root,'td.html'),'utf8'),css=fs.readFileSync(path.join(root,'td-combat.css'),'utf8'),main=fs.readFileSync(path.join(root,'src/td/main.js'),'utf8');for(const id of ['td-orientation-gate','td-orientation-lock','td-placement-confirm','td-camera-close','td-shop-merit'])assert.equal(html.split('id="'+id+'"').length-1,1);assert.equal([...html.matchAll(/data-shop-exchange=/g)].length,2);assert.match(html,/1000 → 🏅 1/);assert.match(html,/🏅 1 → 🪙 1000/);assert.match(css,/data-combat-orientation="portrait"[^}]*\.orientation-gate\{display:grid/);assert.match(css,/data-combat-orientation="landscape"[^}]*\.hud-controls[\s\S]*?transform:translateX\(-50%\)/);assert.match(css,/data-combat-orientation="landscape"[^}]*\.selection-actions button[\s\S]*?min-height:29px/);assert.match(css,/\.shop-exchange/);assert.match(main,/screen\.orientation/);assert.match(main,/placementConfirm\.onclick/);});

test('本局積分使用右側小圖塊、可關閉面板並併入含清場時間的逐波戰報',()=>{const html=fs.readFileSync(path.join(root,'td.html'),'utf8'),main=fs.readFileSync(path.join(root,'src/td/main.js'),'utf8'),game=fs.readFileSync(path.join(root,'src/td/TDGame.js'),'utf8');for(const id of ['td-score-shortcut','td-score-value','td-score-panel','td-score-close','td-score-total','td-score-grade','td-score-detail','td-score-best'])assert.equal(html.split('id="'+id+'"').length-1,1);assert.match(html,/🏆<\/b><small>積分/);assert.match(html,/<span>積分<\/span><span>清場時間<\/span><span>擊破<\/span>/);assert.match(main,/scoreShortcut\.addEventListener\('click'/);assert.match(game,/scoreState\(\)/);assert.match(game,/record\.timeBonus/);assert.match(game,/本次積分/);});

test('祭司標記使用小型圓章，不再繪製遮住怪物的大十字方塊',()=>{const art=fs.readFileSync(path.join(root,'src/td/systems/ArtSystem.js'),'utf8');assert.match(art,/monster\.type==='healer'[\s\S]*?y=monster\.y-71[\s\S]*?ctx\.arc\(x,y,6\.5/);assert.doesNotMatch(art,/fillRect\(-2,-31,4,18\)/);});
test('技能美術依英雄分列、保留文字 fallback，素材在專案及離線清單內',()=>{
 const css=fs.readFileSync(path.join(root,'td-combat.css'),'utf8');
 for(const hero of ['hunter','arcanist','rogue'])assert.ok(css.includes('body[data-hero-class="'+hero+'"]'));
 assert.ok(css.includes('body[data-skill-art="ready"]'));
 const game=fs.readFileSync(path.join(root,'src/td/TDGame.js'),'utf8');assert.ok(game.includes('this.art.skillIcons.ready'));
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 for(const file of ['frontier-ground-v1.png','hero-skill-icons-v1.png']){
  const data=fs.readFileSync(path.join(root,'assets/td',file));
  assert.equal(data.toString('ascii',1,4),'PNG');assert.ok(data.readUInt32BE(16)>=1024);assert.ok(sw.includes('./assets/td/'+file));
 }
});
test('英雄戰鬥小卡只常駐 HP／MP，詳細資訊仍保留 XP、能力與原裝備更新節點',()=>{
 const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
 const css=fs.readFileSync(path.join(root,'td-combat.css'),'utf8');
 const card=html.match(/<div class="hero-profile">([\s\S]*?)<\/details>\s*<\/div>/)?.[1];
 assert.ok(card,'英雄小卡必須存在');
 const main=card.split('<details class="hero-more">')[0];
 for(const id of ['td-hero-select','td-hero-level','td-hero-hp-text','td-hero-hp-fill','td-hero-mp-text','td-hero-mp-fill'])assert.ok(main.includes('id="'+id+'"'));
 for(const id of ['td-hero-xp-text','td-hero-xp-fill','td-stat-attack','td-stat-range','td-stat-speed','td-stat-move','td-hero-weapon']){
  assert.ok(card.includes('id="'+id+'"'));
  assert.ok(!main.includes('id="'+id+'"'),'次要資訊不應常駐：'+id);
 }
 assert.ok(card.includes('<summary>英雄資訊</summary>'));
 assert.match(css,/\.hero-extra\{[\s\S]*?position:absolute/);
 assert.match(css,/\.hero-profile\{width:min\(162px/);
 assert.match(css,/\.hero-equipment:has\(>i\[hidden\]\)\{grid-template-columns:minmax\(0,1fr\) auto/);
 const baseCss=fs.readFileSync(path.join(root,'td.css'),'utf8');
 assert.match(baseCss,/\[data-mobile-panel="compact"\] \.hero-more\[open\] \.hero-equipment/);
});
