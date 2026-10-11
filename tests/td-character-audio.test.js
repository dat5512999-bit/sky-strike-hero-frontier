'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function setup(){
  const runtime=load(),{ns,context}=runtime,A=ns.systems.GameAudio,V=ns.systems.HeroVoice,nodes=[];
  const param=()=>({value:0,setValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(){},setTargetAtTime(v){this.value=v;}});
  const node=()=>{const n={stopped:false,disconnected:false,connect(){},disconnect(){this.disconnected=true;},start(){},stop(){this.stopped=true;},gain:param(),frequency:param(),Q:param()};nodes.push(n);return n;};
  const ctx={state:'running',currentTime:100,sampleRate:8000,destination:{},createGain:node,createBufferSource:node,createOscillator:node,createBuffer:(c,n)=>{const data=new Float32Array(n);return {duration:n/8000,getChannelData:()=>data};}};
  A.context=ctx;ns.systems.FrostlandAudio.enabled=true;context.document={hidden:false};
  for(const cue of Object.values(V.catalog.bull)){cue.src='assets/audio/voices/bull/test.wav';}
  V.cache.set('assets/audio/voices/bull/test.wav',Promise.resolve({duration:1}));
  return {...runtime,A,V,ctx,nodes};
}
test('bull material buffers are finite, bounded, reusable and varied without consuming combat RNG',()=>{
  const {ns,ctx,context}=setup();context.Math.random=()=>{throw Error('combat RNG consumed');};
  const M=ns.systems.BullAudioMaterials;
  for(const name of Object.keys(M.profiles)){
    const b=M.buffer(ctx,name,0),data=b.getChannelData(0);assert.equal(M.buffer(ctx,name,0),b);
    assert(data.every(Number.isFinite));assert(Math.max(...data.map(Math.abs))<=.851);assert(data.some(v=>Math.abs(v)>.1));
    assert.notDeepEqual(data,M.buffer(ctx,name,1).getChannelData(0));assert(Math.abs(data.at(-1))<.01);
  }
  assert.equal(M.contexts.get(ctx).size,12);
});
test('bull skills retain material layers and their legacy comparison remains available',()=>{
  const {ns}=load(),C=ns.systems.AudioCatalog;
  for(const slot of ['q','w','e','f']){assert(C.skill('bull',slot).layers.every(l=>l.material));assert(C.skill('bull',slot,true).layers.every(l=>!l.material));}
  assert.equal(C.bull('hit').priority,0);assert.equal(C.skill('bull','f').priority,3);
  assert.equal(C.skill('unknown','w'),null);
});
test('missing or unsupported voice assets never fetch placeholder files',async()=>{
  const {ns,context}=load();let fetches=0;context.fetch=()=>{fetches++;throw Error('must not request');};
  ns.systems.HeroVoice.catalog.bull.q.src=null;
  for(const [hero,slot] of [['bull','q'],['bull','missing'],['naga','q']]){assert.equal(ns.systems.HeroVoice.available(hero,slot),false);assert.equal(await ns.systems.HeroVoice.play(hero,slot),false);}
  assert.equal(fetches,0);
});

test('five shipped bull WAV files match provenance hashes, stay short, finite and unclipped, and are precached',()=>{
  const {ns}=load(),V=ns.systems.HeroVoice,manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/audio/voices/bull/manifest.json'))),worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.equal(Object.keys(manifest.lines).length,5);
  for(const [slot,cue] of Object.entries(V.catalog.bull)){
    assert(V.available('bull',slot));const metadata=manifest.lines[slot];assert.equal(cue.src,metadata.file);assert(worker.includes("'./"+cue.src+"'"));
    const wav=fs.readFileSync(path.join(root,cue.src));assert.equal(crypto.createHash('sha256').update(wav).digest('hex'),metadata.sha256);assert(wav.length<2*1024*1024);
    assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');let pcm,rate;
    for(let p=12;p+8<=wav.length;){const size=wav.readUInt32LE(p+4),name=wav.toString('ascii',p,p+4);assert(p+8+size<=wav.length);if(name==='fmt '){assert.equal(wav.readUInt16LE(p+8),1);assert.equal(wav.readUInt16LE(p+10),1);rate=wav.readUInt32LE(p+12);assert.equal(wav.readUInt16LE(p+22),16);}if(name==='data')pcm=wav.subarray(p+8,p+8+size);p+=8+size+(size%2);}
    assert(pcm);assert.equal(rate,24000);assert(Math.abs(pcm.length/2/rate-metadata.duration)<.002);assert(metadata.duration>0&&metadata.duration<=8);
    let peak=0,energy=0;for(let p=0;p<pcm.length;p+=2){const value=pcm.readInt16LE(p)/32768;peak=Math.max(peak,Math.abs(value));energy+=value*value;}assert(peak>.01&&peak<.82);assert(energy>1);
  }
});

test('audition bypasses chatter cooldown without changing battle cooldown or mute safeguards',async()=>{
  const {V,ns}=setup();assert(await V.play('bull','w'));const previous=V.cooldownUntil;
  assert(await V.play('bull','e',{preview:true}));assert(await V.play('bull','e',{preview:true}));assert.equal(V.cooldownUntil,previous);assert.equal(V.last.has('bull:e'),false);
  V.stop();assert.equal(await V.play('bull','e'),false);ns.systems.FrostlandAudio.setEnabled(false);assert.equal(await V.play('bull','f',{preview:true}),false);
});

test('real bull projectile impact uses material sound while shields and immunity retain feedback',()=>{
  const {ns,A}=setup(),cues=[];A.play=cue=>{cues.push(cue.key);return true;};
  const shot=new ns.entities.Projectile({classType:'bull',x:0,y:0},{active:true},{damage:10,attackType:'chaos'});
  assert(shot.style);ns.systems.FrostlandAudio.playImpact(shot,{},10);assert.equal(cues.at(-1),'bull:hit');
  ns.systems.FrostlandAudio.playImpact(shot,{barrier:10},10);assert.equal(cues.at(-1),'impact-shield');
  ns.systems.FrostlandAudio.playImpact(shot,{},0);assert.equal(cues.at(-1),'impact-immune');
});
test('voice cooldown limits chatter and ultimate interrupts only lower-priority speech',async()=>{
  const {V,ctx}=setup();assert(await V.play('bull','w'));const first=V.active;
  assert.equal(await V.play('bull','e'),false);assert(await V.play('bull','f'));assert.notEqual(V.active,first);
  assert.equal(await V.play('bull','f'),false);V.stop();assert.equal(await V.play('bull','q'),false);
  ctx.currentTime+=30;assert(await V.play('bull','q'));
});
test('voice and effects volumes are independent; mute and stop release speech and restore the effect bus',async()=>{
  const {A,V,ns}=setup();A.setVolume(0);assert(await V.play('bull','w'));assert.equal(A.effects.gain.value,.38);
  V.setVolume(.25);assert.equal(V.active.gain.gain.value,.2);V.setVolume(0);assert.equal(V.active,null);assert.equal(A.effects.gain.value,1);
  V.setVolume(.8);assert(await V.play('bull','f'));ns.systems.FrostlandAudio.setEnabled(false);assert.equal(V.active,null);
});
test('late voice downloads cannot play after navigation or mute',async()=>{
  const {V}=setup();let resolve;V.cache.set('assets/audio/voices/bull/test.wav',new Promise(r=>resolve=r));
  const pending=V.play('bull','w');V.stop();resolve({duration:1});assert.equal(await pending,false);assert.equal(V.active,null);
});
test('a late normal voice cannot replace an ultimate and a failed voice can be retried',async()=>{
  const {V}=setup();let resolve;const src='assets/audio/voices/bull/normal.wav';V.catalog.bull.w.src=src;V.cache.set(src,new Promise(r=>resolve=r));
  const normal=V.play('bull','w');assert(await V.play('bull','f'));const ultimate=V.active;resolve({duration:1});assert.equal(await normal,false);assert.equal(V.active,ultimate);
  V.stop();V.cooldownUntil=0;V.cache.set(src,Promise.reject(Error('decode failed')));assert.equal(await V.play('bull','w'),false);assert.equal(V.pending,null);
  V.cache.set(src,Promise.resolve({duration:1}));assert(await V.play('bull','w'));
});
test('paused battle, hidden page and suspended audio cannot leave speech running',async()=>{
  const {A,V,ctx,context}=setup();assert(await V.play('bull','w'));A.sync({paused:true});assert.equal(V.active,null);
  context.document.hidden=true;assert.equal(await V.play('bull','f'),false);context.document.hidden=false;ctx.state='suspended';assert.equal(await V.play('bull','f'),false);
});
test('voice settings persist without modifying player progress and tolerate unavailable storage',()=>{
  const {V,context}=setup(),memory=new Map();context.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  V.setVolume(.35);V.enabled=false;V.save();V.volume=1;V.enabled=true;V.load();assert.equal(V.volume,.35);assert.equal(V.enabled,false);assert.equal(memory.size,1);
  context.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.doesNotThrow(()=>V.setVolume(.5));assert.doesNotThrow(()=>V.load());
});

test('partial voice allocation failure disconnects the source and allows retry',async()=>{
  const {V,ctx,nodes}=setup(),createGain=ctx.createGain;
  ctx.createGain=()=>{throw Error('audio unavailable');};
  assert.equal(await V.play('bull','w'),false);assert.equal(nodes.at(-1).disconnected,true);
  assert.equal(V.pending,null);assert.equal(V.active,null);ctx.createGain=createGain;
  assert(await V.play('bull','w'));
});
