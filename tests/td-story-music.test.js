'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));

test('all 86 story beats have intentional, varied and supported music moods',()=>{
  const {ns}=load(),missions=[...ns.systems.StoryCatalog.missions,ns.systems.StoryCatalog.chapter2Preview];
  let count=0;
  for(const mission of missions){
    const moods=mission.storyCards.map(card=>card.musicMood);count+=moods.length;
    assert.ok(new Set(moods).size>=4,`${mission.id} has little musical movement`);
    for(const mood of moods)assert.ok(ns.systems.StoryMusic.THEMES[mood],`${mission.id} has unknown mood ${mood}`);
    assert.equal(moods[2],'tension',`${mission.id} objective should communicate urgency`);
  }
  assert.equal(count,86);
  assert.ok(missions.some(mission=>mission.storyCards.some(card=>card.musicMood==='joy')));
  assert.deepEqual(plain(missions.find(m=>m.id==='chapter3-nightwatch').storyCards.map(card=>card.musicMood)),['unease','sorrow','tension','heroic','hope']);
});

test('story score starts on demand, crossfades once, and leaves no scheduler in battle',()=>{
  const {ns,context}=load(),timers=new Map(),storage=new Map(),listeners={};let nextId=0,oscillators=0;
  class Param{constructor(){this.value=0;}setValueAtTime(value){this.value=value;}linearRampToValueAtTime(value){this.value=value;}exponentialRampToValueAtTime(value){this.value=value;}cancelScheduledValues(){}}
  class Node{connect(){}disconnect(){}}
  class AudioContext{
    constructor(){this.state='running';this.currentTime=0;this.destination=new Node();}
    createGain(){const node=new Node();node.gain=new Param();return node;}
    createBiquadFilter(){const node=new Node();node.frequency=new Param();return node;}
    createOscillator(){const node=new Node();node.frequency=new Param();node.start=()=>{oscillators++;};node.stop=()=>{};return node;}
    resume(){this.state='running';return Promise.resolve();}
  }
  context.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
  context.document={hidden:false,addEventListener:(name,listener)=>{listeners[name]=listener;}};
  context.AudioContext=AudioContext;
  context.setInterval=callback=>{const id=++nextId;timers.set(id,callback);return id;};
  context.clearInterval=id=>timers.delete(id);
  context.setTimeout=()=>0;
  const score=new ns.systems.StoryMusic();
  assert.equal(score.play('tension'),true);assert.equal(score.current.mood,'tension');assert.equal(timers.size,1);assert.ok(oscillators>0);
  score.play('hope');assert.equal(score.current.mood,'hope');assert.equal(timers.size,1);
  context.document.hidden=true;listeners.visibilitychange();assert.equal(timers.size,0,'background tab cannot keep scheduling notes');
  context.document.hidden=false;listeners.visibilitychange();assert.equal(score.current.mood,'hope');assert.equal(timers.size,1);
  score.stop();assert.equal(score.current,null);assert.equal(score.mood,null);assert.equal(timers.size,0);
  score.setEnabled(false);assert.equal(storage.get(ns.systems.StoryMusic.STORAGE_KEY),'false');assert.equal(score.play('joy'),false);assert.equal(timers.size,0);
  assert.equal(new ns.systems.StoryMusic().enabled,false,'local mute preference survives recreation');
});

test('story music ships in the offline shell and exposes a reachable toggle',()=>{
  const html=fs.readFileSync('td.html','utf8'),worker=fs.readFileSync('sw.js','utf8'),app=fs.readFileSync('src/td/app/FrontierApp.js','utf8');
  assert.ok(html.indexOf('src/td/app/StoryMusic.js')<html.indexOf('src/td/app/FrontierApp.js'));
  assert.match(worker,/\.\/src\/td\/app\/StoryMusic\.js/);
  assert.match(fs.readFileSync('src/td/app/StoryComicBook.js','utf8'),/data-action="story-music-toggle"/);
  assert.match(app,/aria-pressed/);
  assert.match(app,/this\.storyMusic\?\.stop\(\)/);
});

test('audio device failure leaves the story running without leaking voices',()=>{
  const {ns}=load(),score=new ns.systems.StoryMusic();score.voices=1;
  score.context={createOscillator(){throw new Error('audio device unavailable');}};
  assert.doesNotThrow(()=>score._note(60,0,1,'sine',.05,{}));
  assert.equal(score.voices,1);
});
