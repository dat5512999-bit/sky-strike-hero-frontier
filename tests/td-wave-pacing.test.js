'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');

test('only pressure waves slow their spawn interval without changing composition or rewards',()=>{
  const {ns}=load(),waves=new ns.systems.WaveSystem(),baseline=new ns.systems.WaveCatalog();
  waves.setModifiers({spawnRate:.92,enemyCount:1.15});
  for(const [wave,pace] of [[13,1],[14,1.2],[19,1],[20,1.2],[27,1],[28,1.3],[29,1]]){
    waves.wave=wave;
    const base=wave%5===0?Math.max(.78,.98-Math.max(0,wave-15)*.01):Math.max(.72,.96-wave*.008);
    assert.ok(Math.abs(waves.spawnInterval()-Math.max(.66,base*.92)*pace)<1e-10);
    const source=baseline.get(wave),actual=waves.definition(wave);
    assert.deepEqual(actual.reward,source.reward);
    assert.equal(actual.groups.reduce((sum,group)=>sum+group.count,0),source.groups.reduce((sum,group)=>sum+(group.type==='boss'?group.count:Math.max(1,Math.round(group.count*1.15))),0));
  }
});

test('slowed wave waits for its full interval before spawning the next monster',()=>{
  const {ns}=load(),waves=new ns.systems.WaveSystem(),monsters=[];
  waves.setModifiers({spawnRate:.92});waves.wave=13;assert.equal(waves.start(),true);
  waves.update(.15,monsters);assert.equal(monsters.length,1);
  const interval=waves.spawnInterval();
  waves.update(interval*.99,monsters);assert.equal(monsters.length,1);
  waves.update(interval*.02,monsters);assert.equal(monsters.length,2);
});
