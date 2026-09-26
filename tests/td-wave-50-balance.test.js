'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');

function pressure(ns,wave,difficulty='standard'){
  const mode=ns.systems.TDDifficultySystem.MODES[difficulty],waves=new ns.systems.WaveSystem();
  waves.setModifiers(mode);const definition=waves.definition(wave);
  return definition.groups.reduce((total,group)=>total+Array.from({length:group.count},()=>new ns.entities.Monster(group.type,wave,ns.config.path,Object.assign({},mode,{bountyScale:group.type==='boss'?1:definition.bountyScale})).effectiveHealth()).reduce((sum,value)=>sum+value,0),0);
}

test('標準難度第 31 波承接第 30 波，31–50 不再出現章節重置式壓力斷層',()=>{
  const {ns}=load(),values=Array.from({length:21},(_,index)=>pressure(ns,index+30));
  assert.ok(values[1]/values[0]>=.87,'30→31 '+values[0]+'→'+values[1]);
  for(let index=2;index<values.length;index++)assert.ok(values[index]/values[index-1]>=.85,(index+30)+'→'+(index+31)+' '+values[index-1]+'→'+values[index]);
  assert.ok(values[10]>=125000,'wave 40 '+values[10]);
  assert.ok(values[20]>=190000,'wave 50 '+values[20]);
});

test('後段四難度保有相同連續曲線且難度越高總壓力越高',()=>{
  const {ns}=load(),ids=['story','standard','veteran','calamity'];let previous=0;
  ids.forEach(id=>{let total=0;for(let wave=31;wave<=50;wave++)total+=pressure(ns,wave,id);assert.ok(total>previous,id+' '+total);previous=total;});
});

test('濁潮小魔王二階只召喚四族終局援軍，不回退成舊制通用援軍',()=>{
  const {ns}=load(),combat=new ns.systems.EnemyCombatSystem(),boss=new ns.entities.Monster('nagaSiltwaterDemonlord',50),monsters=[boss];
  boss.health=boss.maxHealth*.6;combat.update(.01,monsters,null,[],{});
  assert.deepEqual(monsters.slice(1).map(monster=>monster.type),['nagaSiltImp','frostRimeStalker','goblinSapper','orcBanner']);
});
