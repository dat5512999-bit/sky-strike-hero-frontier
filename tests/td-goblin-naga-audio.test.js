'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');
test('22 character materials have bounded deterministic variants, reusable buffers and clean tails',()=>{
  const {ns,context}=load(),M=ns.systems.CharacterAudioMaterials;
  context.Math.random=()=>{throw Error('combat RNG must stay unchanged');};
  const ctx={sampleRate:8000,createBuffer:(_,n)=>{const data=new Float32Array(n);return {getChannelData:()=>data};}};
  assert.equal(Object.keys(M.profiles).length,22);
  for(const name of Object.keys(M.profiles)){
    const buffer=M.buffer(ctx,name,0),data=buffer.getChannelData(0);assert.equal(buffer,M.buffer(ctx,name,0));
    assert(data.every(Number.isFinite));assert(Math.max(...data.map(Math.abs))<=.801);assert(data.some(v=>Math.abs(v)>.1));assert.equal(Math.abs(data[0]),0);assert.equal(Math.abs(data.at(-1)),0);
    assert.notDeepEqual(data,M.buffer(ctx,name,1).getChannelData(0));M.buffer(ctx,name,2);assert.equal(buffer,M.buffer(ctx,name,3));
  }
  assert.equal(M.contexts.get(ctx).size,66);assert.equal(M.buffer(ctx,'unknown'),null);
});
test('goblin and naga have distinct attacks and four skill textures with correct priorities and old comparisons',()=>{
  const {ns}=load(),C=ns.systems.AudioCatalog,M=ns.systems.CharacterAudioMaterials,signatures=new Set();
  for(const hero of ['goblin','naga'])for(const action of ['attack','hit','q','w','e','f']){
    const cue=C.character(hero,action);assert(cue.layers.length<=4);assert.equal(cue.priority,action==='f'?3:['attack','hit'].includes(action)?0:2);
    for(const layer of cue.layers){assert.equal(layer.materialBank,'character');assert(M.profiles[layer.material]);assert(layer.at+layer.d<2);}
    signatures.add(JSON.stringify(cue.layers));
    if(['q','w','e','f'].includes(action)){assert.equal(C.skill(hero,action).key,'skill:'+hero+':'+action);assert.notDeepEqual(C.skill(hero,action).layers,C.skill(hero,action,true).layers);}
  }
  assert.equal(signatures.size,12);assert.equal(C.character('unknown','q'),null);assert.equal(C.skill('naga','unknown'),null);
  assert.deepEqual(C.character('bull','f'),C.bull('f'));assert(C.bull('f').layers.every(l=>!l.materialBank));
});
test('attack and impact routing uses character cues, shields and immunity keep their feedback',()=>{
  const {ns}=load(),A=ns.systems.GameAudio,L=ns.systems.FrostlandAudio,calls=[];A.play=cue=>{calls.push(cue.key);return true;};
  for(const hero of ['goblin','naga']){
    L.playAttack(hero);assert.equal(calls.at(-1),hero+':attack');
    const shot={owner:{classType:hero},style:hero==='goblin'?'goblin-rivet':'tide'};
    L.playImpact(shot,{},10);assert.equal(calls.at(-1),hero+':hit');
    L.playImpact(shot,{barrier:1},10);assert.equal(calls.at(-1),'impact-shield');
    L.playImpact(shot,{},0);assert.equal(calls.at(-1),'impact-immune');
  }
});
test('new material loading failure never leaks audio nodes or throws through combat',()=>{
  const {ns}=load(),A=ns.systems.GameAudio;let disconnected=0;
  const ctx={currentTime:0,createGain:()=>({disconnect(){disconnected++;}}),createBufferSource:()=>({disconnect(){disconnected++;}})};
  A.context=ctx;assert.equal(A.voice({material:'unknown',materialBank:'character'},{},0,1),false);assert.equal(A.active.size,0);assert.equal(disconnected,2);
});
test('new bank ships in game, preview and offline shell without external dependencies',()=>{
  for(const file of ['td.html','audio-preview.html','sw.js'])assert(fs.readFileSync(file,'utf8').includes('src/td/systems/CharacterAudioMaterials.js'),file);
});
