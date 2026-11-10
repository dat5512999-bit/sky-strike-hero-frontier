'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
function fixture(){
 const context=vm.createContext({TowerFrontier:{systems:{}}});vm.runInContext(fs.readFileSync('src/td/systems/GameDiagnostics.js','utf8'),context);
 const data=new Map();let now=10000,writes=0,summary={screen:'battle',hero:'naga',wave:24,status:'playing',paused:false,counts:{army:12}};
 const storage={getItem:k=>data.get(k)||null,setItem(k,v){writes++;data.set(k,v);},removeItem:k=>data.delete(k)};
 const D=context.TowerFrontier.systems.GameDiagnostics,create=options=>new D({storage,version:'0.85.106',snapshot:()=>summary,clock:()=>now,...options});
 return {D,data,storage,create,time(v){now=v;},set summary(v){summary=v;},get writes(){return writes;}};
}
test('diagnostics contain only whitelisted summaries, identifiers and redacted error frames',()=>{
 const f=fixture();f.summary={screen:'battle',hero:'chief',wave:20,status:'playing',wallet:{diamonds:99999},profileName:'PRIVATE_NAME',password:'PRIVATE_PASSWORD',url:'https://secret.test/?token=SECRET',counts:{army:15},art:{ready:12,rgbaBytes:90000000}};
 const d=f.create(),e=new Error('PRIVATE_ERROR_MESSAGE');e.stack='Error: PRIVATE_ERROR_MESSAGE\n at C:/Users/PRIVATE_USER/app/TDGame.js:400:12\n at https://private.test/?token=SECRET Runtime.js:3:4';d.failure('render',e);
 const raw=d.export();for(const secret of ['PRIVATE_NAME','PRIVATE_PASSWORD','PRIVATE_ERROR_MESSAGE','PRIVATE_USER','secret.test','private.test','SECRET','diamonds','wallet'])assert(!raw.includes(secret),secret);
 const row=JSON.parse(raw).sessions.at(-1);assert.equal(row.version,'0.85.106');assert.equal(row.last.hero,'chief');assert.equal(row.last.wave,20);assert.equal(row.events.at(-1).error.frames[0].file,'TDGame.js');
});
test('three sessions and sixty-four events are retained within the serialized size bound',()=>{
 const f=fixture();for(let i=0;i<6;i++){f.time(10000+i*10000);const d=f.create();for(let n=0;n<150;n++)d.record('action',{action:'skill-attempt',item:'q'});d.flush(true);assert(d.current.events.length<=64);assert(d.export().length<=f.D.MAX_CHARS);}
 const data=JSON.parse(f.data.get(f.D.KEY));assert(data.sessions.length<=3);assert(data.sessions.every(s=>s.events.length<=64));
});
test('unfinished play is marked uncertain while a normal page close is not marked as a crash',()=>{
 const f=fixture(),d=f.create();f.time(20000);d.tick();const interrupted=f.create();assert.equal(interrupted.interrupted,true);interrupted.close();f.time(30000);assert.equal(f.create().interrupted,false);
});
test('the last battle summary survives returning to a lobby and reload',()=>{
 const f=fixture(),d=f.create();d.tick();f.summary={screen:'home',status:'playing',paused:true};f.time(20000);d.tick();d.flush(true);
 const loaded=f.create();const previous=JSON.parse(loaded.export()).sessions.at(-2);assert.equal(previous.last.screen,'home');assert.equal(previous.lastBattle.wave,24);assert.equal(previous.lastBattle.hero,'naga');assert.equal(loaded.interrupted,false);
});
test('heartbeat writes are throttled and do not write every animation frame',()=>{
 const f=fixture(),d=f.create(),before=f.writes;for(let i=0;i<300;i++){f.time(10000+i*16);d.tick();}assert(f.writes-before<=1);f.time(25000);d.tick();assert.equal(f.writes,before+1);
});
test('quota and forbidden storage stay memory-only, back off and remain exportable',()=>{
 const f=fixture();let attempts=0;const d=f.create({storage:{getItem(){throw Error('blocked');},setItem(){attempts++;throw Error('quota');},removeItem(){throw Error('blocked');}}});assert.equal(d.storageStatus,'memory-only');assert.equal(attempts,1);
 for(let i=0;i<20;i++){d.failure('ui',new Error('SECRET'));d.tick();}assert.equal(attempts,1);assert(JSON.parse(d.export()).sessions.length);f.time(80000);d.tick();assert.equal(attempts,2);
 assert.equal(d.clear(),false);assert.equal(d.storageStatus,'memory-only');
});
test('clear removes only the diagnostic key and preserves all player data',()=>{
 const f=fixture();f.data.set('heroFrontierProfilesV1','PLAYER_SAVE');const d=f.create();d.record('action',{action:'q'});assert.equal(d.clear(),true);assert.equal(f.data.get('heroFrontierProfilesV1'),'PLAYER_SAVE');assert.equal(f.data.has(f.D.KEY),false);assert.equal(d.current.events.length,0);
});
test('malformed, oversized or untrusted diagnostic storage cannot leak unknown fields on export',()=>{
 const f=fixture();for(const raw of ['{broken','x'.repeat(40000),JSON.stringify({schema:1,sessions:[{id:'valid',version:'old',open:true,last:{screen:'home',private:'SECRET'},events:[],secret:'SECRET'}]})]){f.data.set(f.D.KEY,raw);const d=f.create();assert(!d.export().includes('SECRET'));assert(d.export().length<=32768);}
});
function lifecycleFixture(paused=false){
 const {ns,context}=load();const events=[];context.performance={now:()=>123};context.document={hidden:false};
 const g={status:'playing',paused,profession:{selected:'chief'},hero:{},joystick:{reset(){g.released=true;}},camera:{space:true,touches:new Map([[1,1]]),gesture:{id:1}},frameTiming:{clear(value){g.cleared=value;}},ui:{pause:{setAttribute(){}}}};
 const lifecycle=Object.create(ns.systems.GameSessionLifecycle.prototype);lifecycle.game=g;lifecycle.diagnostics={record:type=>events.push(type),flush(){}};lifecycle.resumePanel=()=>{g.notice=true;};return {g,lifecycle,events,ns,context};
}
test('background play pauses, clears gestures and returns with explicit resume instead of auto advancing',()=>{
 const {g,lifecycle}=lifecycleFixture();lifecycle.hide();assert(g.paused);assert(g.released);assert.equal(g.camera.touches.size,0);assert.equal(g.camera.gesture,null);assert.equal(g.cleared,123);lifecycle.show();assert(g.paused);assert(g.notice);
});
test('manual pauses and stale runs are not auto resumed by lifecycle events',()=>{
 const {g,lifecycle}=lifecycleFixture(true);lifecycle.hide();lifecycle.show();assert.equal(lifecycle.suspension,null);assert.equal(g.notice,undefined);assert(g.paused);
 const fresh=lifecycleFixture();fresh.lifecycle.hide();fresh.g.hero={};fresh.lifecycle.show();assert.equal(fresh.lifecycle.suspension,null);assert.equal(fresh.g.notice,undefined);
});
test('a broken diagnostic tick cannot stop the RAF chain',()=>{
 const {ns,context}=load();let scheduled=0;context.requestAnimationFrame=()=>scheduled++;
 const g={app:{root:{hidden:false}},diagnostics:{tick(){throw Error('diagnostic-fixture');}},loop(){}};
 assert.doesNotThrow(()=>ns.TDGame.prototype.loop.call(g,20));assert.equal(scheduled,1);
});
test('background and pending resume block simulation even if another handler changes paused',()=>{
 const {ns,context}=load();context.requestAnimationFrame=()=>{};let updates=0,draws=0;const hero={};
 const g={hero,paused:false,sessionLifecycle:{suspension:{hero}},update(){updates++;},draw(){draws++;},loop(){}};
 ns.TDGame.prototype.loop.call(g,20);assert(g.paused);assert.equal(updates,0);assert.equal(draws,0);
});
test('heartbeat skips background writes while an explicit lifecycle event can still flush',()=>{
 const f=fixture(),d=f.create(),before=f.writes;
 // The pure recorder's VM has no document; load an instance in the real helper VM.
 const {ns,context}=load();context.document={hidden:true};let writes=0;
 const hidden=new ns.systems.GameDiagnostics({storage:{getItem(){return null;},setItem(){writes++;}},clock:()=>20000});const initial=writes;hidden.tick();assert.equal(writes,initial);hidden.record('hidden');hidden.flush(true);assert.equal(writes,initial+1);assert.equal(f.writes,before);
});
