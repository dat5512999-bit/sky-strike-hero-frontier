'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
function setup(){
  const runtime=load(),{ns}=runtime,A=ns.systems.GameAudio,nodes=[];
  const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
  const node=()=>{const n={connect(){},disconnect(){},start(){},stop(){},frequency:param(),gain:param(),Q:param()};nodes.push(n);return n;};
  const ctx={state:'running',currentTime:10,sampleRate:8000,destination:{},createGain:node,createOscillator:node,createBufferSource:node,createBiquadFilter:node,createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};
  ns.systems.FrostlandAudio.context=ctx;ns.systems.FrostlandAudio.enabled=true;
  return {...runtime,A,ctx,nodes,flush(){for(const n of nodes)n.onended?.();ctx.currentTime+=3;}};
}
test('all eleven heroes have distinct Q/W/E/F sound designs',()=>{
  const {ns}=load(),C=ns.systems.AudioCatalog,signatures=new Set();
  for(const id of Object.keys(ns.systems.HeroRoster.CLASSES))for(const slot of ['q','w','e','f']){const cue=C.skill(id,slot);assert(cue&&cue.layers.length>=2);signatures.add(JSON.stringify(cue.layers));}
  assert.equal(signatures.size,44);
});
test('every faction unit, tower and branch resolves to a bounded sound profile; support towers remain support',()=>{
  const {ns}=load(),C=ns.systems.AudioCatalog;
  for(const f of Object.values(ns.systems.FactionSystem.FACTIONS))for(const [kind,types] of [['unit',f.units],['building',f.buildings]])for(const type of types){
    const cfg=ns.config[kind==='unit'?'units':'buildings'][type],actor={kind,type,config:()=>cfg},cue=C.attack(actor);
    assert(cue?.layers.length>0&&cue.layers.length<=4,type);assert.equal(C.faction(type,kind),f.id);
    if(cfg.supportOnly)assert(cue.key.startsWith('support:'),type);
    if(kind==='building')for(const branch of ns.systems.TowerEvolutionSystem.branches(type)){actor.branch=branch.id;assert(C.attack(actor));}
  }
});
test('all event cues render; ordinary voices are bounded and important skills can preempt',()=>{
  const {ns,A,ctx,flush}=setup();
  for(const name of Object.keys(ns.systems.AudioCatalog.events)){assert(A.event(name),name);flush();}
  for(let i=0;i<300;i++){ctx.currentTime+=.05;A.play({key:'stress:'+i,layers:ns.systems.AudioCatalog.families.siege,priority:0});assert(A.active.size<=8);}
  assert(A.skill({classType:'bull'},'f'));assert(A.active.size<=12);A.stop();assert.equal(A.active.size,0);
});
test('muting, zero volume, hidden document and suspended context allocate no voices',()=>{
  const {ns,A,ctx,context}=setup();ns.systems.FrostlandAudio.enabled=false;assert.equal(A.event('build'),false);
  ns.systems.FrostlandAudio.enabled=true;A.setVolume(0);assert.equal(A.event('build'),false);A.setVolume(.5);
  context.document={hidden:true};assert.equal(A.event('build'),false);context.document.hidden=false;ctx.state='suspended';assert.equal(A.event('build'),false);assert.equal(A.active.size,0);
});
test('turning audio off immediately releases active sources',()=>{
  const {ns,A}=setup();A.event('victory');assert(A.active.size>0);ns.systems.FrostlandAudio.setEnabled(false);assert.equal(A.active.size,0);
});
test('partial WebAudio failures cannot leak voices or prevent projectile creation',()=>{
  const {ns,A,ctx}=setup();ctx.createBufferSource=()=>{throw Error('device gone');};A.event('build');A.stop();assert.equal(A.active.size,0);
  assert.equal(A.projectile({owner:{kind:'unit',type:'bad',config(){throw Error('bad config');}},target:{active:true}}),false);
  ctx.createOscillator=()=>{throw Error('device gone');};assert.equal(A.event('upgrade'),false);assert.equal(A.active.size,0);
  assert.doesNotThrow(()=>new ns.entities.Projectile({kind:'unit',type:'bad',x:0,y:0,config(){throw Error('bad config');}},{active:true},{damage:1}));
});
test('multishot release is deduplicated per actor; no target produces no sound; summons are covered',()=>{
  const {ns,A,ctx}=setup(),source={kind:'unit',type:'hunter',config:()=>ns.config.units.hunter},target={active:true};
  assert(A.projectile({owner:source,target}));assert.equal(A.projectile({owner:source,target}),false);ctx.currentTime+=1;
  assert.equal(A.projectile({owner:source,target:{active:false}}),false);A.stop();
  assert(A.projectile({owner:{form:'wolf',active:true,range:45},target}));
});
test('successful hero and evolution casts route to a single skill cue; cooling casts do not',()=>{
  const {ns,A}=setup(),hero=new ns.entities.Hero(100,100),calls=[];A.skill=(h,s)=>calls.push(h.classType+':'+s);
  hero.chooseClass('bull');assert(hero.castSummon([]));assert.equal(hero.castSummon([]),false);assert.deepEqual(calls,['bull:e']);
  hero.chooseClass('chief');hero.skillCooldowns.summon=0;assert(hero.castShockwave([]));assert.equal(calls.at(-1),'chief:e');
  hero.chooseClass('arcanist');hero.novaCooldown=0;assert.equal(hero.castNova([]),false);assert.equal(calls.length,2);
});
test('shop success and failure preserve transaction results and produce different cues',()=>{
  const {ns,A}=setup(),hero=new ns.entities.Hero(100,100),shop=new ns.systems.ShopSystem(hero),economy=new ns.systems.EconomySystem(),events=[];A.event=id=>events.push(id);
  economy.gold=1000;const ok=shop.buy('rune',economy);assert(ok.ok);assert.equal(events.at(-1),'purchase');
  economy.gold=0;const no=shop.buy('rune',economy);assert.equal(no.ok,false);assert.equal(events.at(-1),'error');
});
test('ambience is a single reusable source, stops on pause, page exit and silence',()=>{
  const {A,ns}=setup(),g={profession:{selected:'hunter'},status:'playing',paused:false,ui:{professionScreen:{hidden:true}}};
  A.sync(g);const first=A.ambient;assert(first);A.sync(g);assert.equal(A.ambient,first);
  g.paused=true;A.sync(g);assert.equal(A.ambient,null);g.paused=false;A.sync(g);g.app={root:{hidden:false}};A.sync(g);assert.equal(A.ambient,null);
  delete g.app;ns.config={...ns.config,mapId:'frost'};A.sync(g);assert.equal(A.ambient.kind,'wind');A.setVolume(0);assert.equal(A.ambient,null);
});
test('audio enabled/disabled preserves damage and cooldowns',()=>{
  function run(enabled){const {ns}=load(),g=game(ns);ns.systems.FrostlandAudio.enabled=enabled;const m=enemy(ns,115,100);g.hero.chooseClass('bull');g.hero.castNova([m]);return {health:m.health,cooldown:g.hero.novaCooldown};}
  assert.deepEqual(run(true),run(false));
});

test('all 44 base casts and 88 evolved casts emit exactly one matching skill event',()=>{
  const {ns}=load(),calls=[];ns.systems.GameAudio.skill=(h,s)=>calls.push(h.classType+':'+s);
  for(const type of Object.keys(ns.systems.HeroRoster.CLASSES))for(const rank of [0,1,2])for(const slot of ['q','w','e','f']){
    const g=game(ns),h=g.hero;h.chooseClass(type);h.evolution.rank=rank;h.synergy=g.synergy;g.waves={active:true};g.shockwaves=[];
    g.goblinNetwork={activate:()=>true,links:[],cooling:0};
    const faction=ns.systems.FactionSystem.FACTIONS[type==='chief'?'wild':type];
    for(const unitType of faction?.units||[]){const unit=new ns.entities.CombatUnit(unitType,105,105);unit.synergy=g.synergy;g.build.items.push(unit);}
    g.monsters=[enemy(ns,130,100,'brute',100000)];calls.length=0;
    let ok;
    if(rank)ok=ns.systems.HeroEvolutionSystem.cast(h,slot,{game:g,monsters:g.monsters,summons:g.summons,projectiles:g.projectiles,shockwaves:g.shockwaves,onKill(){},onHit(){}});
    else if(slot==='q')ok=h.castNova(g.monsters,()=>{},()=>{});
    else if(slot==='w')ok=h.castThunder(g.monsters,()=>{},g.projectiles,()=>{});
    else if(slot==='e')ok=type==='chief'?h.castShockwave(g.shockwaves):h.castSummon(g.summons);
    else ok=ns.systems.HeroUltimateSystem.cast(h,g.monsters,()=>{},()=>{});
    assert(ok,type+' '+rank+' '+slot);assert.deepEqual(calls,[type+':'+slot]);
  }
});
