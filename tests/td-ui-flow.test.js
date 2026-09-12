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
  for(const file of ['src/td/namespace.js','src/td/TDGame.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  return context.TowerFrontier.TDGame.prototype;
}
function button(filter){return {dataset:{buildFilter:filter},attributes:{},setAttribute(key,value){this.attributes[key]=value;}};}

test('開局、建造 Drawer 與統一選單保留同一套 UI 入口',()=>{
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  for(const id of ['td-start-expedition','td-difficulty-detail','td-build-drawer','td-menu-screen','td-menu-confirm-restart','td-result-change'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/data-build-filter="recent"/);
  assert.match(html,/data-profession="hunter" aria-pressed="false"/);
  assert.match(html,/id="td-result-mode" href="index.html"/);
});

test('重新挑戰沿用上一局設定，並確實呼叫既有 reset',()=>{
  const calls=[],game={lastRun:{difficulty:'veteran',profession:'rogue'},ui:{menuScreen:{hidden:false}},reset(){calls.push('reset');},chooseDifficulty(id){calls.push('difficulty:'+id);},selectOpeningProfession(id){calls.push('select:'+id);},chooseProfession(id){calls.push('profession:'+id);}};
  assert.equal(prototype().retrySameSetup.call(game),true);
  assert.deepEqual(calls,['reset','difficulty:veteran','select:rogue','profession:rogue']);
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
