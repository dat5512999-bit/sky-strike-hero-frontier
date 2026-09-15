'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function prototype(){
  const context=vm.createContext({console,document:{body:{dataset:{layout:'desktop'}}}});
  context.globalThis=context;
  for(const file of ['src/td/namespace.js','src/td/config.js','src/td/systems/TowerSkillSystem.js','src/td/TDGame.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  return context.TowerFrontier.TDGame.prototype;
}
function button(filter){return {dataset:{buildFilter:filter},attributes:{},setAttribute(key,value){this.attributes[key]=value;}};}

test('開局、建造 Drawer 與統一選單保留同一套 UI 入口',()=>{
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  for(const id of ['td-start-expedition','td-difficulty-detail','td-build-drawer','td-menu-screen','td-menu-confirm-restart','td-result-change'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/data-build-filter="recent"/);
  assert.match(html,/data-profession="hunter" aria-pressed="false"/);
  assert.match(html,/data-faction="hunter" aria-pressed="false"/);
  assert.match(html,/id="td-faction-heading"/);
  assert.match(html,/id="td-result-mode" href="index.html"/);
  assert.match(html,/id="td-selection-actions"/);
  assert.doesNotMatch(html,/id="td-move"|id="td-attack-move"|id="td-hold"|id="td-stop"/);
});

test('重新挑戰沿用上一局設定，並確實呼叫既有 reset',()=>{
  const calls=[],game={lastRun:{difficulty:'veteran',profession:'rogue',faction:'hunter'},ui:{menuScreen:{hidden:false}},reset(){calls.push('reset');},chooseDifficulty(id){calls.push('difficulty:'+id);},selectOpeningProfession(id){calls.push('hero:'+id);},selectOpeningFaction(id){calls.push('faction:'+id);},chooseProfession(hero,faction){calls.push('start:'+hero+'×'+faction);}};
  assert.equal(prototype().retrySameSetup.call(game),true);
  assert.deepEqual(calls,['reset','difficulty:veteran','hero:rogue','faction:hunter','start:rogue×hunter']);
  assert.equal(game.ui.menuScreen.hidden,true);
});

test('建造分類共用既有按鈕並尊重軍團可建造清單',()=>{
  const buttons=[{dataset:{buildKind:'unit',buildType:'hunter',buildCategory:'unit'}},{dataset:{buildKind:'building',buildType:'arrow',buildCategory:'tower'}},{dataset:{buildKind:'building',buildType:'iceward',buildCategory:'support'}},{dataset:{buildKind:'unit',buildType:'rogue',buildCategory:'unit'}}];
  const filters=['all','unit','tower','support','recent'].map(button),game={ui:{buildFilters:filters,buildButtons:buttons,buildDrawerEmpty:{hidden:false}},buildFilter:'support',recentBuilds:['unit:hunter'],profession:{current:()=>({})},factions:{allows:(kind,type)=>type!=='rogue'}};
  prototype().updateBuildFilter.call(game);
  assert.deepEqual(buttons.map(item=>item.hidden),[true,true,false,true]);
  game.buildFilter='recent';prototype().updateBuildFilter.call(game);
  assert.deepEqual(buttons.map(item=>item.hidden),[false,true,true,true]);
  assert.equal(filters.find(item=>item.dataset.buildFilter==='recent').attributes['aria-pressed'],'true');
});

test('遊戲選單取消會回到原暫停狀態',()=>{
  let updated=0;const pane={hidden:true},game={ui:{menuScreen:{hidden:true},menuActions:{hidden:false},menuConfirm:{hidden:true},menuSettingsPanel:{hidden:true},menuContinue:{focus(){}},},paused:false,updateUi(){updated++;},showMenuPane:prototype().showMenuPane};
  const origin={focus(){}};
  assert.equal(prototype().openMenu.call(game,origin),true);
  assert.equal(game.paused,true);
  assert.equal(game.ui.menuScreen.hidden,false);
  assert.equal(prototype().closeMenu.call(game),true);
  assert.equal(game.paused,false);
  assert.equal(game.ui.menuScreen.hidden,true);
  assert.equal(updated,2);
  assert.equal(pane.hidden,true);
});

test('勝敗結算使用共用結果面板並保留再挑戰入口',()=>{
  const game={report:{current:null,finalLine:()=> '本局 8 波'},waves:{wave:8,catalog:{total:()=>30}},ui:{overlay:{hidden:true},overlayTitle:{textContent:''},overlayMessage:{textContent:''},finalReport:{textContent:''}}};
  prototype().end.call(game,false);
  assert.equal(game.status,'gameover');
  assert.equal(game.ui.overlay.hidden,false);
  assert.match(game.ui.overlayMessage.textContent,/第 8 波/);
  prototype().end.call(game,true);
  assert.equal(game.status,'victory');
  assert.match(game.ui.overlayMessage.textContent,/30 波/);
  assert.equal(game.ui.finalReport.textContent,'本局 8 波');
});

test('橫式手機沿用同一建造 Drawer，直式手機仍使用既有指令格',()=>{
  const context=vm.createContext({console,document:{body:{dataset:{layout:'mobile',combatOrientation:'landscape'}}}});
  context.globalThis=context;
  for(const file of ['src/td/namespace.js','src/td/TDGame.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  const game={ui:{commandGrid:{dataset:{}},commandTabs:[{dataset:{commandTab:'build'},setAttribute(){}},{dataset:{commandTab:'orders'},setAttribute(){}}],buildDrawer:{hidden:true}},profession:{selected:'hunter'},status:'playing'};
  context.TowerFrontier.TDGame.prototype.showCommands.call(game,'build');
  assert.equal(game.ui.buildDrawer.hidden,false);
  context.document.body.dataset.combatOrientation='portrait';
  context.TowerFrontier.TDGame.prototype.showCommands.call(game,'build');
  assert.equal(game.ui.buildDrawer.hidden,true);
  const css=fs.readFileSync(path.join(root,'td.css'),'utf8');
  assert.match(css,/data-combat-orientation="landscape"/);
  assert.match(css,/overflow:hidden/);
  assert.match(fs.readFileSync(path.join(root,'td.html'),'utf8'),/class="td-orientation-hint"/);
});

test('戰場合法位置單擊直接提交建造，保留取消入口',()=>{
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  for(const id of ['td-placement-actions','td-placement-title','td-placement-detail','td-placement-cancel'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(!html.includes('id="td-placement-confirm"'));
  const handlers={},game={canvas:{addEventListener(type,handler){handlers[type]=handler;}},status:'playing',profession:{selected:'hunter'},hero:{x:350,y:305},build:{pending:{type:'arrow'},stagePlacement(x){return x>50;},placementMessage(){return '地圖邊界不可部署';}},canvasPoint(event){return{x:event.clientX,y:event.clientY};},flash(){},updateUi(){},confirmPlacement(){this.confirmed=(this.confirmed||0)+1;return true;}};
  prototype().attachInput.call(game);
  handlers.pointerdown({button:0,clientX:0,clientY:0});
  assert.equal(game.confirmed,undefined);
  handlers.pointerdown({button:0,clientX:480,clientY:250});
  assert.equal(game.confirmed,1);
});

test('所有建造卡只顯示定位與價格，完整能力留在第二層',()=>{
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  const cards=[...html.matchAll(/data-build-kind="(unit|building)" data-build-type="([^"]+)"[^>]*><b>[^<]+<\/b><span>[^<]+<\/span><small><\/small><\/button>/g)];
  assert.equal(cards.length,30);
  const game=Object.create(prototype());
  for(const [,kind,type] of cards){const detail=game.buildDetailDescription(kind,type);assert.ok(!detail.includes('基礎作戰'),type+' 缺少定位');assert.match(detail,/攻擊 \d+ · 射程 \d+/);assert.match(detail,/G／\d+木/);}
  const ui={buildDetail:{hidden:true},buildDetailName:{textContent:''},buildDetailText:{textContent:''}};
  game.ui=ui;
  game.showBuildDetail({dataset:{buildKind:'building',buildType:'barracks'}});
  assert.equal(ui.buildDetail.hidden,false);
  assert.match(ui.buildDetailText.textContent,/守軍攻速支援/);
  assert.match(ui.buildDetailText.textContent,/附近守軍攻速/);
});
