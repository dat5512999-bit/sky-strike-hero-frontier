'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {load}=require('./helpers/td-runtime.cjs');
const approved=require('./fixtures/td-approved-audio-v13.json');
const added=['hunter','arcanist','rogue','chief','frostland','dwarf','dragonkin','egypt'];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
test('all 11 heroes have six distinct bounded production cues and legacy skill comparisons',()=>{
  const {ns}=load(),{AudioCatalog:C,HeroRoster:R,CharacterAudioMaterials:M,BullAudioMaterials:B}=ns.systems,signatures=new Set();
  assert.equal(Object.keys(R.CLASSES).length,11);
  for(const hero of Object.keys(R.CLASSES))for(const action of ['attack','hit','q','w','e','f']){
    const cue=C.character(hero,action);assert(cue,hero+':'+action);assert(cue.layers.length>0&&cue.layers.length<=4);
    assert.equal(cue.priority,action==='f'?3:['attack','hit'].includes(action)?0:2);
    for(const layer of cue.layers){assert((layer.materialBank==='character'?M:B).profiles[layer.material]);assert(layer.d>0&&layer.at>=0&&layer.at+layer.d<2);assert(layer.level>0&&layer.level<=1);}
    signatures.add(JSON.stringify(cue.layers));
    if(['q','w','e','f'].includes(action))assert.notDeepEqual(C.skill(hero,action).layers,C.skill(hero,action,true).layers);
  }
  assert.equal(signatures.size,66);assert.equal(C.character('unknown','q'),null);assert.equal(C.character('hunter','unknown'),null);
});
test('eight new hero attack and impact cues are used without replacing shield and immunity feedback',()=>{
  const {ns}=load(),A=ns.systems.GameAudio,L=ns.systems.FrostlandAudio,calls=[];A.play=cue=>{calls.push(cue.key);return true;};
  for(const hero of added){
    L.playAttack(hero);assert.equal(calls.at(-1),hero+':attack');
    const shot={owner:{classType:hero},style:'arcane'};L.playImpact(shot,{},10);assert.equal(calls.at(-1),hero+':hit');
    L.playImpact(shot,{barrier:1},10);assert.equal(calls.at(-1),'impact-shield');
    L.playImpact(shot,{},0);assert.equal(calls.at(-1),'impact-immune');
  }
});
test('approved bull, goblin and naga cue recipes remain identical to the pre-expansion snapshot',()=>{
  const {ns}=load();for(const [key,expected] of Object.entries(approved.cues)){const [hero,action]=key.split(':');assert.equal(hash(JSON.stringify(ns.systems.AudioCatalog.character(hero,action))),expected,key);}
});
test('approved material variants retain their original deterministic sample hashes',()=>{
  const {ns}=load(),ctx={sampleRate:8000,createBuffer:(_,n)=>{const data=new Float32Array(n);return {getChannelData:()=>data};}};
  for(const [key,expected] of Object.entries(approved.materials)){const [bank,name,variant]=key.split(':'),M=bank==='bull'?ns.systems.BullAudioMaterials:ns.systems.CharacterAudioMaterials;assert.equal(hash(Buffer.from(M.buffer(ctx,name,Number(variant)).getChannelData(0).buffer)),expected,key);}
});
test('new character effects do not claim or fetch unavailable character dialogue',async()=>{
  const {ns,context}=load();context.fetch=()=>{throw Error('unvoiced hero must not fetch audio');};
  for(const hero of added)for(const action of ['select','q','w','e','f']){assert.equal(ns.systems.HeroVoice.available(hero,action),false);assert.equal(await ns.systems.HeroVoice.play(hero,action),false);}
});
