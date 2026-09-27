'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');

test('所有怪物都有戰術定位、壓力來源與可讀反制，沒有未稽核的隱藏類型',()=>{
  const {ns}=load(),types=Object.keys(ns.entities.Monster.TYPES),profiles=ns.systems.EnemyBalanceCatalog.profiles(),roles=new Set(ns.systems.EnemyBalanceCatalog.roles());
  assert.deepEqual(Object.keys(profiles).sort(),types.sort());
  types.forEach(type=>{const profile=ns.systems.EnemyBalanceCatalog.get(type);assert.ok(roles.has(profile.role),type+' role');assert.ok(profile.pressure.length>=6,type+' pressure');assert.ok(profile.answer.length>=6,type+' answer');});
});

test('五十波只使用已分類怪物，並覆蓋數量、速度、重甲、支援、特性與首領解題',()=>{
  const {ns}=load(),catalog=new ns.systems.WaveCatalog(),seen=new Set();
  for(let wave=1;wave<=catalog.total();wave++)catalog.get(wave).groups.forEach(group=>{assert.ok(ns.systems.EnemyBalanceCatalog.get(group.type),wave+' '+group.type);seen.add(ns.systems.EnemyBalanceCatalog.get(group.type).role);});
  ['swarm','runner','heavy','siege','hunter','shield','support','trait','boss'].forEach(role=>assert.ok(seen.has(role),role));
});

test('標準難度壓力跨章節持續上升，後段轉場不再有過大的休息斷層，終局高於前一波',()=>{
  const {ns}=load(),mode=ns.systems.TDDifficultySystem.MODES.standard,rows=ns.systems.EnemyBalanceCatalog.audit(mode);
  [10,20,30,40,50].forEach((wave,index,checkpoints)=>{if(index)assert.ok(rows[wave-1].pressure>rows[checkpoints[index-1]-1].pressure,checkpoints[index-1]+'→'+wave);});
  for(let wave=31;wave<=50;wave++)assert.ok(rows[wave-1].pressure/rows[wave-2].pressure>=.85,(wave-1)+'→'+wave+' '+Math.round(rows[wave-2].pressure)+'→'+Math.round(rows[wave-1].pressure));
  assert.ok(rows[49].pressure>rows[48].pressure*1.10,'49→50 '+Math.round(rows[48].pressure)+'→'+Math.round(rows[49].pressure));
});

test('首領二階援軍、支援光環與終局編隊均計入可重跑的壓力稽核',()=>{
  const {ns}=load(),mode=ns.systems.TDDifficultySystem.MODES.standard,rows=ns.systems.EnemyBalanceCatalog.audit(mode);
  [5,30,35,40,45,50].forEach(wave=>assert.ok(rows[wave-1].bossReinforcement>0,'boss '+wave));
  assert.ok(rows[40].support>0,'wave 41 support');assert.ok(rows[49].groups.some(group=>group.type==='nagaShellbreaker'&&group.count>=18),'final shellbreakers');
});
