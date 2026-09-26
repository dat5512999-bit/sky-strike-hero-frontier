'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs');
test('60 FPS simulation and drawing stay full rate while passive DOM refresh is bounded to 10 Hz',()=>{
 const {ns,context}=load();context.requestAnimationFrame=()=>{};let updates=0,draws=0,hud=0;const g={status:'playing',paused:false,gameSpeed:2,lastTime:0,profession:{selected:true},frameTiming:new ns.systems.FrameTimingSystem(0),update(dt,refresh){updates++;if(refresh)hud++;},draw(){draws++;},updateSpeedStatus(){},updateUi(){hud++;}};g.loop=ns.TDGame.prototype.loop;
 for(let i=1;i<=60;i++)g.loop(i*1000/60);
 assert.ok(updates>=60);assert.equal(draws,60);assert.ok(hud>=8&&hud<=10,'HUD calls '+hud);const count=hud;g.updateUi();assert.equal(hud,count+1,'user action refresh remains immediate');
});
test('map filter rasterizes once, invalidates on source or size change, and falls back when canvas is unavailable',()=>{
 const {ns}=load(),terrain=new ns.systems.FrontierTerrain();let rasterized=0;ns.systems.CombatTextCache.surface=(w,h)=>({width:w,height:h,getContext:()=>({drawImage(){rasterized++;}})});
 const source={width:1254,height:839};for(let i=0;i<60;i++)assert.ok(terrain.filteredImage(source));assert.equal(rasterized,1);
 source.width=1280;terrain.filteredImage(source);assert.equal(rasterized,2);terrain.filteredImage({...source});assert.equal(rasterized,3);
 ns.systems.CombatTextCache.surface=()=>null;assert.equal(terrain.filteredImage({width:20,height:20}),null);assert.equal(terrain.filteredImage({width:10000,height:10000}),null);
});
test('floating labels rasterize once, reuse alpha at compositing, and have bounded memory',()=>{
 const {ns}=load();let texts=0;ns.systems.CombatTextCache.surface=(w,h)=>({width:w,height:h,getContext:()=>({strokeText(){texts++;},fillText(){texts++;}})});
 const cache=new ns.systems.CombatTextCache(),c=strictCanvas();Object.assign(c.ctx,{font:'800 14px Segoe UI',fillStyle:'#fff',strokeStyle:'#000',lineWidth:3,shadowBlur:0});c.ctx.getTransform=()=>({a:1,b:0,c:0,d:1});c.ctx.measureText=()=>({width:55,actualBoundingBoxAscent:12,actualBoundingBoxDescent:3});
 for(let frame=0;frame<60;frame++){c.ctx.globalAlpha=1-frame/60;assert.equal(cache.draw(c.ctx,'-132',100,100-frame),true);assert.equal(c.ctx.globalAlpha,1-frame/60);}
 assert.equal(texts,2);assert.equal(c.calls.filter(a=>a[0]==='drawImage').length,60);
 c.ctx.getTransform=()=>({a:2,b:0,c:0,d:2});cache.draw(c.ctx,'-132',100,100);assert.equal(cache.entries.size,2);const hi=[...cache.entries.values()][1];assert.equal(hi.image.width,hi.width*2);
 for(let i=0;i<400;i++)cache.draw(c.ctx,String(i),0,0);assert.ok(cache.entries.size<=128);assert.ok(cache.pixels<=524288);cache.clear();assert.equal(cache.pixels,0);assert.equal(cache.entries.size,0);
});
test('no canvas support keeps the existing text rendering path',()=>{
 const {ns}=load(),c=strictCanvas(),feedback=new ns.systems.CombatFeedbackSystem();feedback.items=[{type:'damage',x:100,y:100,time:.5,max:.78,value:132}];feedback.draw(c.ctx);assert.ok(c.calls.some(a=>a[0]==='fillText'&&a[1]==='-132'));assert.equal(c.depth,0);
});
