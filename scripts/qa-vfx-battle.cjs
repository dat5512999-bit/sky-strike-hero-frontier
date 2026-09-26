'use strict';
// Local production logic + native Canvas, NOT a browser/GPU or physical phone test.
const {createCanvas,loadImage}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const {load,game,enemy,tick}=require('../tests/helpers/td-runtime.cjs');
const out=path.resolve('artifacts/vfx-battle-qa');
const percent=(a,p)=>a.slice().sort((x,y)=>x-y)[Math.floor((a.length-1)*p)];
(async()=>{
 const {ns,context}=load(),cache=new Map(),requested=new Set();context.Image=function(){};
 ns.systems.ArtSystem.prototype.load=function(src){if(cache.has(src))return cache.get(src);return{assetSrc:src,get ready(){requested.add(src);return false;}};};
 const unitTypes=['hunter','orc','shield','knight','dragon','soulsteel','frostWolf','frostBear','frostHunter','goblinGunner','goblinMech','nagaDeepWargod'];
 const towerTypes=['arrow','cannon','plague','storm','frostCrystal','nagaTidegate'];
 function scene(mobile,reduced){context.document={body:{dataset:{layout:mobile?'mobile':'desktop'}},querySelectorAll:()=>[]};const g=game(ns);g.art=new ns.systems.ArtSystem();g.feedback.mobile=mobile;g.feedback.reducedFx=reduced;g.waves={active:true};g.hero.chooseClass('frostland');g.hero.x=340;g.hero.y=360;
  g.build.items=Array.from({length:48},(_,i)=>new ns.entities.CombatUnit(unitTypes[i%unitTypes.length],100+i%12*44,280+Math.floor(i/12)*56));
  for(let i=0;i<12;i++)g.build.items.push(new ns.entities.Building(towerTypes[i%6],100+i%12*44,170));
  g.monsters=Array.from({length:100},(_,i)=>enemy(ns,95+i%20*28,240+Math.floor(i/20)*42,'brute',10000000));g.build.items.forEach(u=>{u.synergy=g.synergy;u.networkPowered=true;u.cooldown=(u.x%4)*.03;});
  return g;
 }
 function cast(g){g.hero.novaCooldown=0;ns.systems.FrostlandHero.cast(g.hero,0,g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));}
 const canvas=createCanvas(852,480),ctx=canvas.getContext('2d');
 function draw(g){
  ctx.fillStyle='#a89271';ctx.fillRect(0,0,852,480);ctx.save();ctx.scale(852/720,480/600);
  ctx.fillStyle='#b4a17e';for(let row=0;row<16;row++)ctx.fillRect(row%2*15,120+row*26,710,21);
  const expected=JSON.stringify(ctx.getTransform()),check=label=>{if(JSON.stringify(ctx.getTransform())!==expected)throw Error('Canvas transform leak: '+label+' '+JSON.stringify(ctx.getTransform()));};
  ns.entities.Projectile.beginFrame(g.feedback.mobile?48:96);
  g.build.items.forEach(u=>{u.draw(ctx,false,g.art);check(u.type);});g.monsters.forEach(m=>{m.draw(ctx,g.art);check(m.type);});g.projectiles.forEach(p=>{p.draw(ctx);check(p.owner.type+' projectile');});g.hero.draw(ctx,g.art);check('hero');g.synergy.draw(ctx);check('synergy');g.feedback.draw(ctx);check('feedback');
  // Same ordering as the game: health bars above projectile sprites.
  g.monsters.forEach(m=>m.drawHealthBar(ctx));ctx.restore();
  ctx.fillStyle='#14232e';ctx.fillRect(0,0,852,57);ctx.fillStyle='#f5e7c8';ctx.font='bold 19px sans-serif';ctx.fillText('48 soldiers + 12 towers + 100 enemies | native Canvas fixture',16,25);ctx.font='13px sans-serif';ctx.fillText((g.feedback.mobile?'Mobile budget':'Desktop budget')+' / '+(g.feedback.reducedFx?'Reduced FX':'Full FX')+' — not a browser or real-device screenshot',16,46);
 }
 // Discover only assets actually touched by drawing the fixture, then recreate
 // ArtSystem so all image slots contain real decoded native Canvas images.
 for(let pass=0;pass<5;pass++){
  requested.clear();const g=scene(false,false);tick(g,.1);cast(g);draw(g);const missing=[...requested].filter(src=>!cache.has(src));if(!missing.length)break;
  for(const src of missing){const image=await loadImage(path.resolve(src));image.ready=true;image.assetSrc=src;cache.set(src,image);}
 }
 fs.mkdirSync(out,{recursive:true});const scenarios=[];
 for(const [mobile,reduced]of [[false,false],[true,false],[true,true]]){
  const g=scene(mobile,reduced),sim=[],render=[];let maxShots=0,peak=0,negativeBudget=false;
  for(let frame=0;frame<240;frame++){
   const a=performance.now();if(frame%90===0)cast(g);g.hero.update(1/60,g.monsters,g.projectiles);tick(g,1/60);if(g.feedback.mobile!==mobile)throw Error('fixture layout drift');const b=performance.now();draw(g);const c=performance.now();
   if(frame>=30){sim.push(b-a);render.push(c-b);}maxShots=Math.max(maxShots,g.projectiles.length);negativeBudget||=ns.entities.Projectile.effectBudget<0;
   if(g.projectiles.length>peak){peak=g.projectiles.length;fs.writeFileSync(path.join(out,(mobile?'mobile':'desktop')+(reduced?'-reduced':'-full')+'.png'),canvas.toBuffer('image/png'));}
  }
  if(negativeBudget)throw Error('negative effect budget');
  scenarios.push({mobile,reduced,frames:240,maxProjectiles:maxShots,simulationP95Ms:+percent(sim,.95).toFixed(2),nativeDrawP95Ms:+percent(render,.95).toFixed(2),nativeDrawMedianMs:+percent(render,.5).toFixed(2),remainingProjectiles:g.projectiles.length});
  g.build.items=[];for(let i=0;i<180;i++)tick(g,1/60);if(g.projectiles.length)throw Error('projectiles did not expire');
 }
 const report={scope:'Production combat tick and sprite renderers with static high-health targets and accelerated Frost hero casts. Native Canvas, 852x480 viewport; no browser/GPU/audio/device claim, no player state accessed.',actors:{soldiers:48,towers:12,enemies:100,hero:1},decodedAssets:cache.size,scenarios,cleanupPassed:true,canvasTransformChecksPassed:true};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
