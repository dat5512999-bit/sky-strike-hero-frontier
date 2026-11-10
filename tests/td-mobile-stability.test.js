'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
function storeFixture(options={}){
 let now=0,next=0;const timers=new Map(),starts=[];
 const context=vm.createContext({TowerFrontier:{systems:{}}});vm.runInContext(fs.readFileSync('src/td/systems/ArtAssetStore.js','utf8'),context);
 const store=new context.TowerFrontier.systems.ArtAssetStore({now:()=>now,createImage:()=>({loading:'auto',naturalWidth:1024,naturalHeight:1024,set src(v){this.path=v;starts.push(this);},removeAttribute(){this.removed=true;}}),setTimer:(fn,ms)=>{timers.set(++next,{fn,ms});return next;},clearTimer:id=>timers.delete(id),...options});
 return {store,starts,timers,time(v){now=v;},runRetry(){const entry=[...timers].find(([,v])=>v.ms<20000);assert.ok(entry);timers.delete(entry[0]);entry[1].fn();}};
}
test('lazy image handles share paths and first loads obey four slots despite native Image.loading string',()=>{
 const {store,starts}=storeFixture(),images=Array.from({length:8},(_,i)=>store.image('image-'+i));assert.equal(starts.length,0);assert.equal(store.image('image-0'),images[0]);
 for(const image of images)assert.equal(image.ready,false);assert.equal(starts.length,4);assert.equal(store.stats().active,4);assert.equal(store.stats().queued,4);
 for(let i=0;i<8;i++){starts[i].onload();assert.ok(store.active<=4);}assert.equal(store.stats().active,0);assert.equal(store.stats().ready,8);assert.equal(images[0].loading,'auto');
});
test('automatic retries are bounded and a manual retry can recover a failed image',()=>{
 const f=storeFixture(),image=f.store.image('broken.png');f.store.request(image);
 image.onerror();f.runRetry();image.onerror();f.runRetry();image.onerror();assert.equal(image.failed,true);assert.equal(image.attempts,3);assert.equal(f.store.active,0);assert.equal(f.timers.size,0);
 assert.equal(image.ready,false);assert.equal(f.starts.length,3);f.store.retryFailed();assert.equal(image.failed,false);assert.equal(image.attempts,1);image.onload();assert.equal(image.ready,true);
});
test('idle images are evicted under budget and reload through the original handle; stale callbacks do nothing',()=>{
 const f=storeFixture({budget:4*1024*1024}),a=f.store.image('a'),b=f.store.image('b');f.store.request(a);a.onload();f.store.request(b);b.onload();
 f.time(6001);assert.equal(b.ready,true);f.store.trim(true);assert.equal(f.store.stats().ready,1);assert.equal(f.store.bytes,4*1024*1024);assert.equal(a.removed,true);assert.equal(f.store.image('a'),a);
 assert.equal(a.ready,false);const old=a.onload;f.time(40000);f.store.trim(true);old();assert.equal(f.store.active,0);assert.equal(f.store.bytes,0);assert.equal(a.ready,false);a.onload();assert.equal(a.ready,true);
});
test('working-set budget stays soft for recently used images, avoiding reload thrashing',()=>{
 const f=storeFixture({budget:1}),image=f.store.image('live');assert.equal(image.ready,false);image.onload();f.time(4000);assert.equal(image.ready,true);f.store.trim(true);assert.equal(f.store.stats().ready,1);assert.equal(f.starts.length,1);
});
test('scene switches cancel obsolete pending work and make previous scene art immediately eligible for eviction',()=>{
 const f=storeFixture({budget:4*1024*1024}),a=f.store.image('old-ready'),b=f.store.image('old-pending');f.store.request(a);a.onload();f.store.request(b);const stale=b.onload;
 f.store.advanceScene();assert.equal(f.store.active,0);stale();assert.equal(f.store.stats().ready,1);
 const c=f.store.image('new-ready');f.store.request(c);c.onload();f.store.trim(true);assert.equal(f.store.stats().ready,1);assert.equal(c.ready,true);assert.equal(a.ready,false);
});
function previewFixture(noContext=false){
 const {ns,context}=load(),surfaces=[];let draws=0,now=0;
 context.performance={now:()=>now};context.document={createElement(){const c={width:0,height:0,setAttribute(){},getContext(){return noContext?null:{drawImage(){},clearRect(){}};},remove(){this.removed=true;}};surfaces.push(c);return c;}};
 const art=Object.create(ns.systems.ArtSystem.prototype);art.drawCombatUnitSprite=()=>{draws++;return true;};
 const button=()=>({dataset:{},hidden:false,getClientRects:()=>[1],closest:()=>null,querySelector(){return this.canvas&&!this.canvas.removed?this.canvas:null;},hasAttribute:()=>false,prepend(c){this.canvas=c;}});
 return {art,button,surfaces,get draws(){return draws;},time(v){now=v;}};
}
test('hidden cards do not allocate a canvas or request art',()=>{const f=previewFixture(),b=f.button();b.hidden=true;f.art.preview(b,'unit','hunter');assert.equal(f.surfaces.length,0);assert.equal(f.draws,0);});
test('canvas allocation failure stays local and backs off instead of retrying every HUD tick',()=>{
 const f=previewFixture(true),b=f.button();assert.doesNotThrow(()=>f.art.preview(b,'unit','hunter'));assert.equal(f.art.previewFault.message,'preview-context-unavailable');assert.equal(f.surfaces[0].width,0);
 for(let i=0;i<30;i++)f.art.preview(b,'unit','hunter');assert.equal(f.surfaces.length,1);assert.notEqual(b.dataset.previewReady,'true');f.time(5001);f.art.preview(b,'unit','hunter');assert.equal(f.surfaces.length,2);
});
test('preview cache retains at most 32 compact images and releases all temporary source canvases',()=>{
 const f=previewFixture();for(let i=0;i<45;i++)f.art.preview(f.button(),'unit','test-'+i);
 assert.equal(f.art.previewCache.size,32);for(const entry of f.art.previewCache.values()){assert.equal(entry.source.width,128);assert.equal(entry.source.height,128);}
 assert.equal(f.surfaces.filter(c=>c.width===384||c.height===384).length,0);
 const b=f.button();f.art.preview(b,'unit','hunter');b.hidden=true;f.art.preview(b,'unit','hunter');assert.equal(b.canvas.width,0);assert.equal(b.canvas.removed,true);
});
test('render and simulation failures pause safely and keep one RAF chain alive',()=>{
 for(const phase of ['render','simulation']){
  const {ns,context}=load();let scheduled=0,updates=0,draws=0;context.requestAnimationFrame=()=>scheduled++;
  const g={status:'playing',profession:{selected:true},gameSpeed:1,paused:false,frameTiming:new ns.systems.FrameTimingSystem(0),update(){updates++;if(phase==='simulation')throw Error('simulation-fixture');},draw(){draws++;if(phase==='render')throw Error('render-fixture');},updateSpeedStatus(){}};
  g.loop=ns.TDGame.prototype.loop;g.loop(17);assert.equal(g.runtimeFault.phase,phase);assert.equal(g.paused,true);g.loop(34);assert.equal(scheduled,2);assert.equal(updates,1);assert.equal(draws,phase==='render'?1:0);
 }
});
test('a covered lobby does not render or advance the hidden battle',()=>{
 const {ns,context}=load();context.requestAnimationFrame=()=>{};let draws=0,updates=0,maintenance=0;
 ns.TDGame.prototype.loop.call({app:{root:{hidden:false}},art:{maintainAssets(){maintenance++;}},draw(){draws++;},update(){updates++;},loop(){}},20);
 assert.equal(draws,0);assert.equal(updates,0);assert.equal(maintenance,1);
});
