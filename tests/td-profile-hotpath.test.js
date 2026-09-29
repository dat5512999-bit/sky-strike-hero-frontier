'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');
function setup(){const {ns}=load(),data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}),app=Object.create(ns.systems.FrontierApp.prototype);app.store=store;return {ns,store,app};}

test('permission checks never read or serialize profile payloads, even for large saves',()=>{
 const {store,app}=setup();let reads=0;
 Object.defineProperty(store.state.profiles.test.data,'large',{enumerable:true,get(){reads++;throw Error('hot path read save payload');}});
 store.current=()=>{throw Error('hot path cloned profile');};
 for(let i=0;i<1000;i++){assert.equal(app.isAdmin(),false);assert.equal(app.allows('heroes','hunter'),true);assert.equal(app.allows('heroes','dwarf'),false);}
 assert.equal(reads,0);
});
test('permissions reflect switches, imported unlocks and restored rounds without cached authority',()=>{
 const {store,app}=setup();assert.equal(app.isAdmin(),false);
 store.switchTo('admin');assert.equal(app.isAdmin(),true);assert.equal(app.allows('heroes','dwarf'),true);
 store.switchTo('test');assert.equal(app.isAdmin(),false);assert.equal(app.allows('heroes','dwarf'),false);
 const backup=JSON.parse(store.export());backup.profiles.test.unlocks.heroes.push('dwarf');store.import(JSON.stringify(backup));assert.equal(app.allows('heroes','dwarf'),true);
 store.newRound();assert.equal(app.allows('heroes','dwarf'),false);store.restoreRound(1);assert.equal(app.allows('heroes','dwarf'),true);
 const snapshot=store.current();snapshot.kind='admin';snapshot.unlocks.heroes.length=0;assert.equal(app.isAdmin(),false);assert.equal(app.allows('heroes','dwarf'),true);
 assert.equal(app.allows('missing','missing'),false);
});
test('monitor separates UI and simulation while retaining aggregate update and draw readings',()=>{
 const {ns}=setup(),panel={dataset:{}},monitor=new ns.systems.PerformanceMonitor(panel);monitor.toggle();
 monitor.record({timestamp:1000,realMs:16.7,updateMs:8,uiMs:6,simulationMs:2,drawMs:1,backlogMs:0,discardedMs:0,monsters:11,frostVfx:0,speed:2});
 assert.match(panel.textContent,/更新 P95 8.0ms/);assert.match(panel.textContent,/戰鬥運算 P95 2.0ms · 介面 P95 6.0ms/);
});
test('frame loop accounts for UI once, clears the previous frame and preserves simulation cadence',()=>{
 const {ns,context}=load();let now=0,last;
 context.performance={now:()=>now};context.requestAnimationFrame=()=>{};
 const g={status:'playing',paused:false,profession:{selected:true},gameSpeed:2,lastTime:0,boundLoop(){},
  frameTiming:{next:()=>({steps:2,step:1/60,realMs:16.7,backlogMs:0,discardedMs:0})},
  speedLoadGuard:{speed:v=>v,observe:()=>false},performanceMonitor:{enabled:true,record:s=>{last=s;}},
  update(dt,refresh){now+=3;if(refresh){now+=6;this.frameUiMs+=6;}},draw(){now++;}};
 ns.TDGame.prototype.loop.call(g,1000);assert.equal(last.updateMs,12);assert.equal(last.uiMs,6);assert.equal(last.simulationMs,6);assert.equal(last.drawMs,1);
 ns.TDGame.prototype.loop.call(g,1017);assert.equal(last.updateMs,6);assert.equal(last.uiMs,0);assert.equal(last.simulationMs,6);
});
