'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
const {rgba}=require('./png-pixels.cjs');
test('ranking requires 16 CLEARED waves including historical failure/retreat boundaries',()=>{
 const {ns}=load(),R=ns.ranking.RankingDataSource,base={mode:'free',map:'beginner',difficulty:'standard',score:100,outcome:'success'};
 for(const n of [0,14,15,16,17])assert.equal(R.valid({...base,waves:n,clearedWaves:n}),n>=16);
 for(const outcome of ['failure','retreated']){assert.equal(R.valid({...base,outcome,waves:16}),false);assert.equal(R.valid({...base,outcome,waves:17}),true);}
 assert.equal(R.valid({...base,waves:16}),true);assert.equal(R.valid({...base,waves:99,clearedWaves:15}),false);assert.equal(R.valid({...base,waves:30,mode:'story'}),false);
 for(const map of ['beginner','twinpass','autumn','silverleaf','shadowfall','frostborn'])assert.equal(R.valid({...base,map,clearedWaves:16}),true);
});
test('report counts completed waves, not the current/aborted sixteenth wave',()=>{
 const {ns}=load();for(const cleared of [15,16])for(const result of [false,'retreated',true]){
  const report=new ns.systems.BattleReportSystem(null);report.beginRun({mode:'free'});
  for(let i=1;i<=cleared;i++){report.startWave(i,{});report.completeWave({},{});}
  if(result!==true){report.startWave(cleared+1,{});if(result===false)report.abortWave({});}
  const run=report.finalize(result);assert.equal(run.clearedWaves,cleared);assert.equal(run.rankingEligible,cleared>=16);
 }
});
test('seven painted tower cells are transparent, nonempty, distinct and locally cached',()=>{
 const {ns}=load(),cells=ns.systems.ArtSystem.FROST_TOWER_CELLS,png=rgba('assets/td/frostland/towers-atlas-v1.png');
 assert.equal(Object.keys(cells).length,7);assert.equal(png.width/4,png.height/2);
 for(const cell of Object.values(cells)){let opaque=0,transparent=0;const sw=png.width/4,sh=png.height/2;for(let y=0;y<sh;y+=4)for(let x=0;x<sw;x+=4){const a=png.pixels[(Math.floor(Math.floor(cell/4)*sh+y)*png.width+Math.floor(cell%4*sw+x))*4+3];if(a>100)opaque++;if(!a)transparent++;}assert.ok(opaque>300);assert.ok(transparent>100);}
 const sw=fs.readFileSync('sw.js','utf8');for(const path of ['td-polish.css','FrostlandTowerArt.js','FrostlandSpellArt.js','towers-atlas-v1.png','skill-icons-v1.png'])assert.ok(sw.includes(path));
});
test('tower construction and firing motion never alter targeting anchors or fire extra shots',()=>{
 const {ns}=load(),b=new ns.entities.Building('frostCrystal',100,100),shots=[];b.cooldown=0;b.update(.01,[enemy(ns)],shots,[]);
 assert.equal(b.shotsFired,1);assert.equal(b.fireFlash,1);assert.equal(b.x,100);assert.equal(b.y,100);b.update(.05,[],shots,[]);assert.ok(b.fireFlash<1);assert.equal(b.shotsFired,1);
});
test('all four spells render bounded layered effects without damage and release canvas state',()=>{
 const {ns}=load(),g=game(ns),calls=[],gradient={addColorStop(){}};
 const ctx=new Proxy({globalAlpha:1,createRadialGradient:()=>gradient,createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(...a)=>calls.push([k,...a])});
 for(const type of ['mark','spear','hunt','winter'])for(const age of [0,.3,.99]){
  calls.length=0;assert.equal(ns.systems.FrostlandSpellArt.draw(ctx,{type,x:100,y:100,target:{x:200,y:100},age,duration:1},g.synergy),true);
  assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);assert.ok(calls.length<1800);
 }
 assert.equal(g.projectiles.length,0);
});
test('painted spell sprites use separate atlas cells and do not remain stuck in Canvas state',()=>{
 const {ns}=load(),g=game(ns),calls=[],image={ready:true,width:1024,height:1024},gradient={addColorStop(){}};
 g.art={frostSpellAtlas:image,drawCombatUnit(){}};
 const ctx=new Proxy({globalAlpha:1,createRadialGradient:()=>gradient,createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(...a)=>calls.push([k,...a])});
 for(const type of ['mark','spear','hunt','winter'])ns.systems.FrostlandSpellArt.draw(ctx,{type,x:100,y:100,target:{x:200,y:100},age:.25,duration:1},g.synergy);
 assert.equal(new Set(calls.filter(c=>c[0]==='drawImage').map(c=>c.slice(2,4).join(','))).size,4);
 assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
});
test('cosmetic wrapper forwards construction and recoil state to the painted tower renderer',()=>{
 const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),calls=[],gradient={addColorStop(){}};
 art.frostTowerAtlas={ready:true,width:1774,height:887};
 const ctx=new Proxy({globalAlpha:1,createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(...a)=>calls.push([k,...a])});
 art.drawBuilding(ctx,'frostCrystal',100,100,1,null,{visualAge:0,fireFlash:1,aim:0});
 assert.ok(calls.some(c=>c[0]==='scale'&&c[2]===.55),'construction reaches renderer');
 assert.ok(calls.some(c=>c[0]==='translate'&&c[1]===-9),'recoil reaches renderer');
 assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
});
test('painted VFX atlas preserves genuine transparent alpha and is included offline',()=>{
 const p=rgba('assets/td/frostland/spell-effects-v1.png');let clear=0;for(let i=3;i<p.pixels.length;i+=4)if(p.pixels[i]===0)clear++;
 assert.ok(clear/(p.width*p.height)>.2);assert.equal(p.width,p.height);
 assert.ok(fs.readFileSync('sw.js','utf8').includes('assets/td/frostland/spell-effects-v1.png'));
});
