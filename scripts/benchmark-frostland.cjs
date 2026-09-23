'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{performance}=require('node:perf_hooks'),{load,game,enemy,tick}=require('../tests/helpers/td-runtime.cjs');
const {ns}=load();
function scenario(ids,boss=false){
 const g=game(ns);g.hero.active=false;g.waves={active:true};g.monsters=Array.from({length:boss?1:6},(_,i)=>enemy(ns,140+i*5,100,boss?'boss':'brute',1000000));g.build.items=ids.map((id,i)=>new ns.entities[ns.config.units[id]?'CombatUnit':'Building'](id,100,100+i*4));let first=null,windows=0;
 for(let i=0;i<600;i++){const prev=g.monsters.map(m=>ns.systems.FrostStatusSystem.isWindow(m));tick(g,.05);g.monsters.forEach((m,index)=>{if(ns.systems.FrostStatusSystem.isWindow(m)&&!prev[index]){first??=i*.05;windows++;}})}
 return {ids,boss,gold:ids.reduce((n,id)=>n+(ns.config.units[id]||ns.config.buildings[id]).cost,0),damage:Math.round(g.monsters.reduce((n,m)=>n+1000000-m.health,0)),firstWindowSeconds:first,windows,rootTime:g.monsters[0].rootTime||0};
}
const balance=[scenario(['frostBear','frostBear']),scenario(['frostCrystal','frostBear']),scenario(['frostWolf','frostCrystal']),scenario(['frostBird','frostBallista','frostTotem']),scenario(['frostGlacier','frostMammoth','frostObelisk']),scenario(['frostCrystal','frostBear'],true)];
assert.ok(balance[1].damage>balance[0].damage,'controller + finisher should outperform isolated finishers against a pack');assert.equal(balance[5].rootTime,0);assert.ok(balance[5].windows>0);
const g=game(ns);g.waves={active:true};g.monsters=Array.from({length:200},(_,i)=>enemy(ns,130+i%20*4,100+Math.floor(i/20)*4,'brute',10000000));g.build.items=Array.from({length:36},(_,i)=>new ns.entities.CombatUnit(ns.systems.FactionSystem.FACTIONS.frostland.units[i%6],100+i%6*6,100+Math.floor(i/6)*6));const samples=[];
for(let i=0;i<600;i++){const start=performance.now();tick(g,1/60);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);
const result={version:'0.85.0',method:'30s stationary six-target high-health armor-preserving simulation; no hero/equipment/upgrade. Performance: 200 enemies, 36 soldiers, 600 ticks; simulation only, excludes Canvas/GPU/audio.',balance,simulation:{meanMs:samples.reduce((a,b)=>a+b,0)/samples.length,p95Ms:samples[Math.floor(samples.length*.95)],maxMs:samples.at(-1),vfx:g.synergy.frostVisuals.length}};
fs.mkdirSync('artifacts/frostland',{recursive:true});fs.writeFileSync('artifacts/frostland/balance-performance.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
