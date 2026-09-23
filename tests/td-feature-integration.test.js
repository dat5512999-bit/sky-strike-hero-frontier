'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
const disk=()=>{const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)}};
const plain=v=>JSON.parse(JSON.stringify(v));
test('Codex uses actual spawned enemies and never the unspawned wave forecast',()=>{
 const {ns}=load(),store=new ns.systems.ProfileStore(disk());store.newRound();
 const progression=new ns.codex.StoryCodexBridge({profileStore:store,storage:null}),app=Object.create(ns.systems.FrontierApp.prototype);
 app.store=store;app.mode='story';app.onWave(1);assert.equal(store.current().encountered.length,0);
 const game={waves:{update(dt,monsters){monsters.push({type:'halberdier'});}},build:{items:[],placeQueued(){this.items.push({kind:'unit',type:'shield'});}},reset(){},end(){}};
 const binding=ns.codex.CodexBattleBridge.install(game,progression);
 game.waves.update(.1,[]);assert.deepEqual(plain(store.current().encountered),['halberdier']);
 assert.ok(!store.current().encountered.includes('fallenKnight'));binding.dispose();
});
test('profile-backed Codex preserves prologue and unlocks only the actual completed mission reward',()=>{
 const {ns}=load(),store=new ns.systems.ProfileStore(disk());store.newRound();
 const cinematic=new ns.cinematic.PrologueProgress(store),id=ns.cinematic.prologue.cinematicId;
 cinematic.complete({cinematicId:id,watched:true,reason:'skipped'});
 const mission=ns.systems.StoryCatalog.mission,bridge=new ns.codex.StoryCodexBridge({profileStore:store,storage:null,seeds:[...ns.codex.chronicleSeed,ns.cinematic.prologueChronicle],getMission:key=>key===mission.id?mission:null,entryIds:new Set(['map:twinpass','map:silverleaf'])});
 assert.equal(bridge.chronicleProgress.view(ns.cinematic.prologueChronicle).discovered,true);
 const before=plain(store.current().data.codexProgression.chronicle.milestones);
 store.complete(mission);bridge.save.load();bridge.refresh();bridge.handleStoryEvent({type:'mission-completed',id:mission.id});
 assert.equal(store.allows('maps','twinpass'),true);assert.equal(store.allows('factions','arcanist'),false);
 assert.deepEqual(plain(store.current().data.codexProgression.chronicle.milestones),before);
 assert.equal(cinematic.prologueSeen,true);
});
test('integrated Chronicle replay is read-only even when CodexIntegration observes completion',async()=>{
 const {ns,context}=load();vm.runInContext(fs.readFileSync('src/td/codex/CodexIntegration.js','utf8'),context);
 const store=new ns.systems.ProfileStore(disk()),p=new ns.cinematic.PrologueProgress(store),id=ns.cinematic.prologue.cinematicId;
 p.complete({cinematicId:id,watched:true,reason:'ended'});const before=store.export();
 const integration=new ns.codex.CodexIntegration({ingest(){throw Error('Replay must not write');}},{readOnlyReplay:true,player:{play:clip=>p.replay(clip,{play:async()=>({watched:true,reason:'skipped'})})}});
 assert.equal((await integration.replay({cinematicId:id,archive:true,discoveryState:{watched:true,unlocked:true}})).ok,true);
 assert.equal(store.export(),before);
});
test('feature pages, styles, scripts and preload entries all reference shipped files',()=>{
 for(const file of ['codex.html','td.html','skin-lab.html']){
  const html=fs.readFileSync(file,'utf8');for(const [,src] of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(!src.startsWith('data:'))assert.ok(fs.existsSync(src.split('?')[0]),src);}
 }
 const app=fs.readFileSync('src/td/app/FrontierApp.js','utf8');
 assert.match(app,/if\(action==='shop'\)return this\.openShop\(\)/);assert.match(app,/location\.href='codex\.html'/);
 assert.match(app,/shopView\.destroy\(\)/);
 const sw=fs.readFileSync('sw.js','utf8');for(const f of ['codex.html','shop.css','skin-lab.html','src/td/codex/CodexHost.js'])assert.ok(sw.includes("'./"+f+"'"),f);
});
