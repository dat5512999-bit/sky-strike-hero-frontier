'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,enemy}=require('./helpers/td-runtime.cjs');
const {strictCanvas}=require('./helpers/strict-canvas.cjs');

function setup(){
  const {ns,context}=load(),hero=new ns.entities.Hero(180,220);hero.chooseClass('naga');
  const guard=new ns.entities.CombatUnit('nagaTideguard',190,230);
  hero.synergy={flagRate:()=>0,game:{build:{combatUnits:()=>[guard]}}};
  return {ns,context,hero,guard};
}

test('Naga W birth frame and first 120 ms obey real Canvas radius rules',()=>{
  const {ns,hero}=setup();assert.equal(hero.castThunder([],()=>{},[],()=>{}),true);
  const v=hero.skillVfx[0],canvas=strictCanvas();
  for(const age of [0,1/240,1/120,1/60,1/30,.05,.08,.1,.11,.12]){
    v.age=age;ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);
    assert.equal(hero.nagaVfxFault,undefined,'normal animation must not rely on the failsafe');
    assert.equal(hero.skillVfx.length,1);assert.equal(hero.fields.length,1);assert.equal(canvas.depth,0);
  }
  assert.ok(canvas.calls.some(c=>c[0]==='ellipse'&&c[3]>0));
});

for(const skill of ['Q','W','E','F'])test('Naga '+skill+' renders its full lifetime with no gameplay mutation',()=>{
  const {ns,hero}=setup(),monster=enemy(ns,210,220,'brute',10000);
  const cast=()=>skill==='Q'?hero.castNova([monster],()=>{},()=>{}):skill==='W'?hero.castThunder([monster],()=>{},[],()=>{}):skill==='E'?hero.castSummon([]):ns.systems.HeroUltimateSystem.cast(hero,[monster],()=>{},()=>{});
  assert.ok(cast());const count=hero.skillVfx.length;assert.ok(!cast());assert.equal(hero.skillVfx.length,count);
  const v=hero.skillVfx.at(-1),canvas=strictCanvas(),before=JSON.stringify({health:monster.health,cooldowns:hero.skillCooldowns,fields:hero.fields});
  for(let frame=0;frame<=120;frame++){v.age=v.duration*frame/120;ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);ns.systems.HeroRoster.drawFields(canvas.ctx,hero);assert.equal(hero.nagaVfxFault,undefined);assert.equal(hero.nagaFieldFault,undefined);assert.equal(canvas.depth,0);}
  assert.equal(JSON.stringify({health:monster.health,cooldowns:hero.skillCooldowns,fields:hero.fields}),before);
  ns.systems.HeroSkillVFX.update(hero,2);assert.equal(hero.skillVfx.length,0);
});

for(const fps of [30,60,120])for(const speed of [1,2,3])test(`Naga W keeps the production RAF loop alive at ${fps} FPS / ${speed}x`,()=>{
  const {ns,context,hero}=setup(),canvas=strictCanvas(),monster=enemy(ns,190,220,'brute',10000),queue=[];let hits=0,draws=0;
  context.requestAnimationFrame=callback=>queue.push(callback);
  const g=Object.create(ns.TDGame.prototype);Object.assign(g,{hero,gameSpeed:speed,status:'playing',paused:false,profession:{selected:'naga'},
    update(dt){hero.update(dt,[],[]);ns.systems.HeroRoster.updateFields(hero,dt,[monster],()=>{},()=>hits++);},
    draw(){draws++;ns.systems.HeroRoster.drawFields(canvas.ctx,hero);ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);},updateUi(){},updateSpeedStatus(){}});
  assert.equal(hero.castThunder([monster],()=>{},[],()=>{}),true);
  g.loop(1000);
  for(let frame=1;frame<=fps*7;frame++){assert.equal(queue.length,1);queue.shift()(1000+frame*1000/fps);assert.equal(canvas.depth,0);}
  assert.equal(queue.length,1);assert.equal(draws,fps*7+1);assert.ok(hits>=10&&hits<=12);assert.equal(hero.fields.length,0);assert.equal(hero.nagaVfxFault,undefined);assert.equal(hero.nagaFieldFault,undefined);assert.ok(monster.health<10000);
});

for(const type of ['naga-tidegate','naga-maelstrom','naga-command','ultimate-naga'])test(type+' drawing fault restores Canvas state and preserves combat',()=>{
  const {ns,context,hero}=setup(),canvas=strictCanvas(),logs=[];
  context.console={error:(...args)=>logs.push(args)};
  hero.castThunder([],()=>{},[],()=>{});hero.skillVfx=[];
  ns.systems.HeroSkillVFX.emit(hero,type,{radius:76,targets:[{x:190,y:220}]});
  ns.systems.HeroSkillVFX.emit(hero,'naga-command',{radius:220,targets:[]});
  const fault=hero.skillVfx[0],healthy=hero.skillVfx[1],before=JSON.stringify({fields:hero.fields,cooldowns:hero.skillCooldowns,health:hero.health});
  const method=type==='naga-tidegate'||type==='naga-command'?'arc':'ellipse',original=canvas.ctx[method];let fired=false;
  canvas.ctx[method]=(...args)=>{if(!fired){fired=true;throw new Error('injected '+type+' fault');}return original(...args);};
  canvas.ctx.globalAlpha=.73;canvas.ctx.lineWidth=9;
  assert.doesNotThrow(()=>ns.systems.HeroSkillVFX.draw(canvas.ctx,hero));
  assert.ok(fired);assert.equal(canvas.depth,0);assert.equal(canvas.ctx.globalAlpha,.73);assert.equal(canvas.ctx.lineWidth,9);
  assert.equal(hero.skillVfx.includes(fault),false);assert.equal(hero.skillVfx.includes(healthy),true);
  assert.equal(hero.nagaVfxFault.type,type);assert.match(hero.nagaVfxFault.stack,/injected/);assert.equal(logs.length,1);
  assert.equal(JSON.stringify({fields:hero.fields,cooldowns:hero.skillCooldowns,health:hero.health}),before);
  ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);assert.equal(logs.length,1,'failed animation must not retry every frame');assert.equal(canvas.depth,0);
});

test('Naga field fault restores transform/alpha scope and still draws the next field',()=>{
  const {ns,hero}=setup(),canvas=strictCanvas();hero.fields=[{type:'naga',x:180,y:220,time:6},{type:'naga',x:190,y:220,time:6}];
  const healthy=hero.fields[1],arc=canvas.ctx.arc;let calls=0;
  canvas.ctx.arc=(...args)=>{if(calls++===0)throw new Error('injected ground fault');return arc(...args);};
  canvas.ctx.globalAlpha=.61;ns.systems.HeroRoster.drawFields(canvas.ctx,hero);
  assert.equal(canvas.depth,0);assert.equal(canvas.ctx.globalAlpha,.61);assert.equal(hero.fields.length,1);assert.equal(hero.fields[0],healthy);assert.equal(calls,2);assert.match(hero.nagaFieldFault,/injected ground fault/);
});

test('Rapid W taps, a dense swarm and background resume stay bounded',()=>{
  const {ns,hero}=setup(),canvas=strictCanvas(),monsters=Array.from({length:54},()=>enemy(ns,190,220,'brute',10000));let hits=0;
  assert.equal(hero.castThunder(monsters),true);
  for(let i=0;i<100;i++)assert.equal(hero.castThunder(monsters),false);
  assert.equal(hero.fields.length,1);assert.equal(hero.skillVfx.length,1);
  ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);ns.systems.HeroRoster.updateFields(hero,20,monsters,()=>{},()=>hits++);
  ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);assert.equal(hits,12);assert.equal(hero.fields.length,0);assert.equal(hero.skillVfx.length,0);assert.equal(hero.nagaVfxFault,undefined);assert.equal(canvas.depth,0);
});

test('Naga renderer and all release markers ship in the same cache generation',()=>{
  const fs=require('node:fs'),version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
  const worker=fs.readFileSync('sw.js','utf8');assert.ok(worker.includes("'sky-strike-v"+version+"'"));
  for(const source of ['src/td/systems/HeroSkillVFX.js','src/td/systems/HeroRoster.js','src/td/TDGame.js'])assert.ok(worker.includes("'./"+source+"'"),source);
  for(const source of ['src/td/app/ProfileStore.js','src/td/app/FrontierApp.js','src/td/systems/BattleReportSystem.js','update.html','td.html'])assert.ok(fs.readFileSync(source,'utf8').includes(version),source+' release version');
});
