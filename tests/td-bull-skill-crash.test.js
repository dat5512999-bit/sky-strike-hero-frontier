'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,enemy}=require('./helpers/td-runtime.cjs');
const {strictCanvas}=require('./helpers/strict-canvas.cjs');

function setup(){const {ns,context}=load(),hero=new ns.entities.Hero(180,220);hero.chooseClass('bull');return {ns,context,hero};}
function cast(ns,hero,skill,monster){return skill==='Q'?hero.castNova([monster],()=>{},()=>{}):skill==='W'?hero.castThunder([monster],()=>{},[],()=>{}):skill==='E'?hero.castSummon([]):ns.systems.HeroUltimateSystem.cast(hero,[monster],()=>{},()=>{});}

for(const skill of ['Q','W','E','F'])test('戰牛 '+skill+' 出生幀至完整生命週期都符合 Canvas 半徑契約',()=>{
  const {ns,hero}=setup(),monster=enemy(ns,210,220,'brute',10000);assert.ok(cast(ns,hero,skill,monster));
  const v=hero.skillVfx.at(-1),canvas=strictCanvas(),before=JSON.stringify({health:monster.health,cooldowns:hero.skillCooldowns,fields:hero.fields});
  for(let frame=0;frame<=120;frame++){v.age=v.duration*frame/120;ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);ns.systems.HeroRoster.drawFields(canvas.ctx,hero);assert.equal(hero.bullVfxFault,undefined);assert.equal(hero.bullFieldFault,undefined);assert.equal(canvas.depth,0);}
  assert.equal(JSON.stringify({health:monster.health,cooldowns:hero.skillCooldowns,fields:hero.fields}),before);ns.systems.HeroSkillVFX.update(hero,2);assert.equal(hero.skillVfx.length,0);
});

for(const skill of ['Q','E'])for(const fps of [30,60,120])for(const speed of [1,2,3])test(`戰牛 ${skill} 在 ${fps} FPS / ${speed}x 後仍排入下一個 RAF`,()=>{
  const {ns,context,hero}=setup(),monster=enemy(ns,210,220,'brute',10000),canvas=strictCanvas(),queue=[];let draws=0;
  context.requestAnimationFrame=callback=>queue.push(callback);
  const g=Object.create(ns.TDGame.prototype);Object.assign(g,{hero,gameSpeed:speed,status:'playing',paused:false,profession:{selected:'bull'},update(dt){hero.update(dt,[],[]);ns.systems.HeroRoster.updateFields(hero,dt,[monster],()=>{},()=>{});},draw(){draws++;ns.systems.HeroRoster.drawFields(canvas.ctx,hero);ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);},updateUi(){},updateSpeedStatus(){}});
  assert.ok(cast(ns,hero,skill,monster));g.loop(1000);
  for(let frame=1;frame<=fps;frame++){assert.equal(queue.length,1);queue.shift()(1000+frame*1000/fps);assert.equal(canvas.depth,0);}
  assert.equal(queue.length,1);assert.equal(draws,fps+1);assert.equal(hero.bullVfxFault,undefined);assert.equal(hero.bullFieldFault,undefined);
});

for(const type of ['bull-hammerfall','bull-arena','bull-ascend','ultimate-bull'])test(type+' 的繪製故障只略過該特效',()=>{
  const {ns,context,hero}=setup(),canvas=strictCanvas(),logs=[];context.console={error:(...args)=>logs.push(args)};
  ns.systems.HeroSkillVFX.emit(hero,type,{radius:92,duration:.8});ns.systems.HeroSkillVFX.emit(hero,'bull-arena',{radius:88,duration:.8});
  const fault=hero.skillVfx[0],healthy=hero.skillVfx[1],ellipse=canvas.ctx.ellipse;let fired=false;
  canvas.ctx.ellipse=(...args)=>{if(!fired){fired=true;throw new Error('injected '+type+' fault');}return ellipse(...args);};canvas.ctx.globalAlpha=.73;canvas.ctx.lineWidth=9;
  assert.doesNotThrow(()=>ns.systems.HeroSkillVFX.draw(canvas.ctx,hero));assert.ok(fired);assert.equal(canvas.depth,0);assert.equal(canvas.ctx.globalAlpha,.73);assert.equal(canvas.ctx.lineWidth,9);
  assert.equal(hero.skillVfx.includes(fault),false);assert.equal(hero.skillVfx.includes(healthy),true);assert.equal(hero.bullVfxFault.type,type);assert.match(hero.bullVfxFault.stack,/injected/);assert.equal(logs.length,1);
});

test('戰牛震域繪製故障只移除該領域並還原 Canvas 狀態',()=>{
  const {ns,hero}=setup(),canvas=strictCanvas();hero.fields=[{type:'bull',x:180,y:220,time:6},{type:'bull',x:190,y:220,time:6}];
  const healthy=hero.fields[1],arc=canvas.ctx.arc;let calls=0;canvas.ctx.arc=(...args)=>{if(calls++===0)throw new Error('injected bull field fault');return arc(...args);};canvas.ctx.globalAlpha=.61;
  assert.doesNotThrow(()=>ns.systems.HeroRoster.drawFields(canvas.ctx,hero));assert.equal(canvas.depth,0);assert.equal(canvas.ctx.globalAlpha,.61);assert.equal(hero.fields.length,1);assert.equal(hero.fields[0],healthy);assert.match(hero.bullFieldFault,/injected bull field fault/);
});

test('戰牛凍結修正與正式快取版本一起發佈',()=>{
  const fs=require('node:fs'),version=JSON.parse(fs.readFileSync('package.json','utf8')).version,worker=fs.readFileSync('sw.js','utf8');assert.ok(worker.includes("'sky-strike-v"+version+"'"));
  for(const source of ['src/td/systems/HeroSkillVFX.js','src/td/systems/HeroRoster.js','src/td/entities/Hero.js','src/td/TDGame.js'])assert.ok(worker.includes("'./"+source+"'"),source);
  for(const source of ['src/td/app/ProfileStore.js','src/td/app/FrontierApp.js','src/td/systems/BattleReportSystem.js','update.html','td.html'])assert.ok(fs.readFileSync(source,'utf8').includes(version),source+' release version');
});
