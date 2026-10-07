'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');

test('手動士兵索敵策略覆蓋預設菁英優先，預設模式仍保留專長',()=>{
  const {ns}=load(),unit=new ns.entities.CombatUnit('musketeer',100,100);
  const boss=enemy(ns,140,100,'boss',900),weak=enemy(ns,145,100,'grunt',12);
  unit.setTargetStrategy('lowestHealth');assert.equal(unit.acquireTarget([boss,weak],unit.config()),weak);
  unit.setTargetStrategy('front');assert.equal(unit.acquireTarget([boss,weak],unit.config()),boss);
});

test('選取資訊區分射程、隱形、對空、免疫與當前目標；升級預覽不改實體',()=>{
  const {ns}=load(),clarity=ns.systems.CombatClaritySystem,unit=new ns.entities.CombatUnit('musketeer',100,100),m=enemy(ns,150,100,'grunt');
  const before=unit.level,preview=clarity.upgradePreview(unit);assert.match(preview,/攻擊.*→.*射程/);assert.equal(unit.level,before);
  assert.match(clarity.selectionStatus(unit,[]),/沒有敵軍/);
  m.x=1000;assert.match(clarity.selectionStatus(unit,[m]),/射程/);
  m.x=150;m.concealed=true;m.revealed=false;assert.match(clarity.selectionStatus(unit,[m]),/未揭露/);
  m.concealed=false;m.flying=true;unit.canHitAir=false;assert.match(clarity.selectionStatus(unit,[m]),/無法對空/);
  m.flying=false;m.immuneAttackTypes=['pierce'];assert.match(clarity.selectionStatus(unit,[m]),/免疫/);
  unit.lockedTarget=m;assert.match(clarity.selectionStatus(unit,[m]),/免疫/);
});

test('城門預警只標示真正接近的存活敵軍，波後診斷保留漏怪種類',()=>{
  const {ns}=load(),clarity=ns.systems.CombatClaritySystem,far={active:true,speed:50,remainingDistance:()=>400},near={active:true,speed:50,remainingDistance:()=>80,type:'runner'};
  assert.equal(clarity.gateThreat([far,near]),near);near.leaked=true;assert.equal(clarity.gateThreat([far,near]),null);
  const report=new ns.systems.BattleReportSystem(null);report.startWave(1,{baseHealth:20});report.recordLeak(2,{type:'runner'});const record=report.completeWave({baseHealth:18},{gold:0,lumber:0});
  assert.equal(record.leakTypes.runner,1);assert.match(clarity.waveAdvice(record),/漏怪 1 隻/);
});

test('遠征結束後清除戰鬥預警，不讓提示蓋在結果畫面',()=>{
  const {ns,context}=load(),g=game(ns),toast={hidden:false,textContent:'舊警告',dataset:{}};
  context.document={getElementById(){return null;}};g.clarityUi={toast};g.ui={};g.waves={active:true};g.status='gameover';g.gateThreat={active:true};g.clarityNotice={text:'舊建議',time:5};
  g.refreshClarityUi();assert.equal(toast.hidden,true);assert.equal(toast.textContent,'');
});

test('快捷鍵在冷卻中有明確回應，無效攻擊不顯示假傷害',()=>{
  const {ns}=load(),g=game(ns),messages=[];g.profession.selected='hunter';g.status='playing';g.paused=false;g.flash=text=>messages.push(text);
  g.hero.skillCooldowns.ultimate=5;assert.equal(g.castUltimate(),false);assert.match(messages.at(-1),/5\.0 秒/);
  g.hero.novaCooldown=3;g.castNova();assert.match(messages.at(-1),/3\.0 秒/);
  const feedback=new ns.systems.CombatFeedbackSystem(),m=enemy(ns);feedback.immune(m);assert.ok(feedback.items.some(item=>item.type==='immune'));assert.ok(!feedback.items.some(item=>item.type==='damage'));
});

test('戰鬥清晰度模組加入入口、離線快取，音效仍受聲道與重播上限限制',()=>{
  const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'td.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.match(html,/src\/td\/systems\/CombatClaritySystem\.js/);assert.match(html,/id="td-clarity-toast"/);assert.match(sw,/CombatClaritySystem\.js/);
  const {ns}=load(),audio=ns.systems.FrostlandAudio;audio.enabled=true;audio.context={state:'running',currentTime:0,destination:{},createOscillator(){return{frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){this.onended?.();}};},createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
  assert.equal(audio.playImpact({attackType:'pierce'},{barrier:0},10),true);
  assert.equal(audio.playImpact({attackType:'pierce'},{barrier:0},10),false);
});
