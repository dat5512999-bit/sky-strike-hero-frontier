'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,enemy}=require('./helpers/td-runtime.cjs');
const {strictCanvas}=require('./helpers/strict-canvas.cjs');

function setup(type){
  const {ns,context}=load(),hero=new ns.entities.Hero(180,220);hero.chooseClass(type);
  const unitType=type==='dwarf'?'dwarfRifle':type==='dragonkin'?'dragonkinEmberwing':null;
  const ally=unitType?new ns.entities.CombatUnit(unitType,190,230):null;
  hero.synergy={flagRate:()=>0,game:{build:{combatUnits:()=>ally?[ally]:[]}}};
  return {ns,context,hero,ally};
}
function cast(hero,skill,monsters){
  if(skill==='Q')return hero.castNova(monsters,()=>{},()=>{});
  if(skill==='W')return hero.castThunder(monsters,()=>{},[],()=>{});
  if(skill==='E')return hero.castSummon([]);
  return null;
}

for(const type of ['dwarf','dragonkin','egypt'])for(const skill of ['Q','W','E','F'])test(type+' '+skill+' survives all 121 presentation frames without mutating gameplay',()=>{
  const {ns,hero,ally}=setup(type),monster=enemy(ns,210,220,'brute',10000);
  const result=skill==='F'?ns.systems.HeroUltimateSystem.cast(hero,[monster],()=>{},()=>{}):cast(hero,skill,[monster]);
  assert.ok(result,skill+' must cast');
  if(skill==='E'&&ally)assert.equal(ally.nagaCommand,5);
  const canvas=strictCanvas(),before=JSON.stringify({health:monster.health,cooldowns:hero.skillCooldowns,fields:hero.fields,watch:hero.egyptSunwatchTime||0,command:ally&&ally.nagaCommand});
  for(let frame=0;frame<=120;frame++){
    for(const v of hero.skillVfx||[])v.age=v.duration*frame/120;
    assert.doesNotThrow(()=>{ns.systems.HeroSkillVFX.draw(canvas.ctx,hero);ns.systems.HeroRoster.drawFields(canvas.ctx,hero);});
    assert.equal(canvas.depth,0);
    assert.equal(hero.southernVfxFault,undefined);
  }
  assert.equal(JSON.stringify({health:monster.health,cooldowns:hero.skillCooldowns,fields:hero.fields,watch:hero.egyptSunwatchTime||0,command:ally&&ally.nagaCommand}),before);
});

for(const type of ['dwarf','dragonkin','egypt'])test(type+' VFX faults remove only the failed visual and restore Canvas state',()=>{
  const {ns,context,hero}=setup(type),canvas=strictCanvas(),logs=[];
  context.console={error:(...args)=>logs.push(args)};
  const effect=type==='dwarf'?'dwarf-command':type==='dragonkin'?'dragonkin-command':'egypt-sunwatch';
  ns.systems.HeroSkillVFX.emit(hero,effect,{radius:92,targets:[{x:190,y:220}]});
  ns.systems.HeroSkillVFX.emit(hero,'egypt-sunwatch',{radius:92});
  const failed=hero.skillVfx[0],healthy=hero.skillVfx[1],method=type==='egypt'?'ellipse':'arc',original=canvas.ctx[method];let fired=false;
  canvas.ctx[method]=(...args)=>{if(!fired){fired=true;throw new Error('injected '+type+' fault');}return original(...args);};
  canvas.ctx.globalAlpha=.73;canvas.ctx.lineWidth=9;
  assert.doesNotThrow(()=>ns.systems.HeroSkillVFX.draw(canvas.ctx,hero));
  assert.ok(fired);assert.equal(canvas.depth,0);assert.equal(canvas.ctx.globalAlpha,.73);assert.equal(canvas.ctx.lineWidth,9);
  assert.equal(hero.skillVfx.includes(failed),false);assert.equal(hero.skillVfx.includes(healthy),true);assert.equal(hero.southernVfxFault.type,effect);assert.equal(logs.length,1);
});

test('new heroes and factions select in the opening screen without missing-presentation crash',()=>{
  const {ns}=load(),hint={textContent:''},g=Object.create(ns.TDGame.prototype);
  Object.assign(g,{app:null,art:{cosmeticEquipped:{}},profession:{selected:null},difficulty:{current:()=>({name:'測試'})},selectedProfession:'chief',selectedFaction:'wild',ui:{combinationHint:hint},updateUi(){}});
  assert.doesNotThrow(()=>g.selectOpeningProfession('dwarf'));assert.match(hint.textContent,/符文工事/);
  assert.doesNotThrow(()=>g.selectOpeningFaction('dwarf'));assert.match(hint.textContent,/破盾守口/);assert.match(hint.textContent,/符文增幅/);
  g.selectedProfession='chief';assert.doesNotThrow(()=>g.selectOpeningProfession('dragonkin'));assert.match(hint.textContent,/雷槍連鎖/);
  assert.doesNotThrow(()=>g.selectOpeningFaction('dragonkin'));assert.match(hint.textContent,/燼翼點殺/);
  g.selectedFaction='wild';assert.doesNotThrow(()=>g.selectOpeningProfession('egypt'));assert.match(hint.textContent,/日輪近戰/);
});

test('balance audit covers every testable faction and keeps targets in its approved bands',()=>{
  const {runAudit}=require('../scripts/faction-balance-audit.cjs'),report=runAudit();
  assert.deepEqual(Array.from(report.rows,row=>row.id),['frostland','hunter','arcanist','rogue','wild','goblin','naga','dwarf','dragonkin','egypt']);
  for(const row of report.rows){assert.ok(row.heroDps>=report.heroBand[0]&&row.heroDps<=report.heroBand[1],row.faction+' hero DPS');assert.ok(row.openingPower>=report.openingPowerBand[0]&&row.openingPower<=report.openingPowerBand[1],row.faction+' opening pressure');}
});
