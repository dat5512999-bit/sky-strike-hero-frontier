'use strict';
const {createCanvas,loadImage}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const {load}=require('../tests/helpers/td-runtime.cjs');
(async()=>{
 const {ns}=load();ns.systems.CombatTextCache.surface=createCanvas;
 const image=await loadImage('assets/td/beginner-valley-v2.png'),canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d'),terrain=new ns.systems.FrontierTerrain(),feedback=new ns.systems.CombatFeedbackSystem();
 feedback.items=Array.from({length:60},(_,i)=>({type:i%5?'damage':'gold',x:100+i%12*85,y:180+Math.floor(i/12)*70,time:.6,max:.78,value:100+i%12,critical:i%7===0}));
 function run(cached){const times=[];feedback.textCache=cached?new ns.systems.CombatTextCache():null;const cold=performance.now(),background=cached?terrain.filteredImage(image):null,coldMs=performance.now()-cold;
  for(let frame=0;frame<100;frame++){const start=performance.now();ctx.save();if(!cached)ctx.filter='contrast(1.035) saturate(1.045)';ctx.drawImage(background||image,0,0);ctx.restore();feedback.draw(ctx);ctx.getImageData(0,0,1,1);if(frame>=10)times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);return{cache:cached,frames:100,p95Ms:+times[Math.floor(times.length*.95)].toFixed(2),medianMs:+times[Math.floor(times.length*.5)].toFixed(2),mapColdMs:+coldMs.toFixed(2),labelEntries:feedback.textCache?.entries.size||0,labelPixels:feedback.textCache?.pixels||0};
 }
 const baseline=run(false),optimized=run(true),out=path.resolve('artifacts/desktop-performance-v1');fs.mkdirSync(out,{recursive:true});
 // Verify unchanged label pixels at the integer coordinates used in this sample.
 const direct=createCanvas(260,80),cached=createCanvas(260,80),cache=new ns.systems.CombatTextCache();for(const c of [direct,cached]){const x=c.getContext('2d');x.font='800 14px Segoe UI';x.textAlign='center';x.lineWidth=3;x.strokeStyle='rgba(3,5,5,.9)';x.fillStyle='#fff1d2';}
 const a=direct.getContext('2d'),b=cached.getContext('2d');a.strokeText('-132',130,40);a.fillText('-132',130,40);cache.draw(b,'-132',130,40);const pa=a.getImageData(0,0,260,80).data,pb=b.getImageData(0,0,260,80).data;let differingChannels=0;for(let i=0;i<pa.length;i++)if(Math.abs(pa[i]-pb[i])>2)differingChannels++;
 const report={scope:'Native Canvas repeated filtered map and 60 floating labels; not whole-game/browser FPS. HUD call-count checked separately.',baseline,optimized,labelDifferingChannels:differingChannels};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(out,'cached-render.png'),canvas.toBuffer('image/png'));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
