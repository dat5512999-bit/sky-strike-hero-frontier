'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {load,enemy}=require('./helpers/td-runtime.cjs'),{rgba}=require('./png-pixels.cjs');
test('six frost soldiers have 96 distinct transparent complete frames and offline delivery',()=>{
  const {ns}=load(),manifest=fs.readFileSync('sw.js','utf8');
  for(const [type,meta] of Object.entries(ns.systems.FrostlandMotionAtlas)){
    assert.ok(manifest.includes(meta.path));const {width,height,pixels}=rgba(meta.path);
    assert.equal(width,meta.width);assert.equal(height,meta.height);assert.equal(meta.frames.length,16);
    const hashes=new Set();
    for(const f of meta.frames){
      const [x,y,w,h]=f.rect;assert.ok(x>=0&&y>=0&&x+w<=width&&y+h<=height,type);
      assert.ok(f.anchorX>=x&&f.anchorX<x+w&&f.foot>=y&&f.foot<=y+h);
      const hash=crypto.createHash('sha256');let visible=0;
      for(let py=y;py<y+h;py++){hash.update(pixels.subarray((py*width+x)*4,(py*width+x+w)*4));for(let px=x;px<x+w;px++){
        const alpha=pixels[(py*width+px)*4+3];if(alpha>=80)visible++;
      }}
      assert.ok(visible>1800,type);hashes.add(hash.digest('hex'));
      // Neighbouring source rectangles cannot sample another soldier pose.
      for(const other of meta.frames){if(other===f)continue;const [ox,oy,ow,oh]=other.rect;assert.ok(x+w<=ox||ox+ow<=x||y+h<=oy||oy+oh<=y,type+' overlap');}
    }
    assert.equal(hashes.size,16,type);
    // Generated alpha may contain 1/255 quantization dust outside the measured
    // rectangles. It is never sampled; no visible silhouette may touch the sheet.
    for(let x=0;x<width;x++){assert.ok(pixels[x*4+3]<=1);assert.ok(pixels[((height-1)*width+x)*4+3]<=1);}
    for(let y=0;y<height;y++){assert.ok(pixels[y*width*4+3]<=1);assert.ok(pixels[(y*width+width-1)*4+3]<=1);}
  }
});
test('idle visits eight frames, stops with dt=0, and visual clocks survive state changes',()=>{
  const {ns}=load(),A=ns.systems.FrostlandAnimation;
  for(const type of Object.keys(ns.systems.FrostlandMotionAtlas)){
    const u=new ns.entities.CombatUnit(type,100,100),seen=new Set();
    for(let i=0;i<400;i++){A.update(u,.01,[],[]);seen.add(A.motionPose(u).index);}
    assert.equal(seen.size,8,type);const clock=u.frostVisualTime;A.update(u,0,[],[]);assert.equal(u.frostVisualTime,clock);
    u.setState('attack');u.setState('idle');assert.equal(u.frostVisualTime,clock);assert.equal(u.x,100);assert.equal(u.y,100);
  }
  const other=new ns.entities.CombatUnit('hunter',0,0);A.update(other,.1,[],[]);assert.equal(other.frostVisualTime,undefined);
});
test('new attack release frame coincides with existing projectile event, every level and haste',()=>{
  const {ns}=load(),A=ns.systems.FrostlandAnimation;
  for(const type of Object.keys(ns.systems.FrostlandMotionAtlas))for(const level of [1,5])for(const haste of [0,2]){
    const u=new ns.entities.CombatUnit(type,100,100);u.level=level;u.supportHaste=haste;
    const target=enemy(ns,120),shots=[];A.queue(u,[target],{damage:10});const duration=u.frostAction.duration;
    A.update(u,duration*.44,[target],shots);assert.equal(shots.length,0);assert.ok(A.motionPose(u).index<11);
    A.update(u,duration*.011,[target],shots);assert.equal(shots.length,1);assert.equal(A.motionPose(u).index,11);
    A.update(u,duration,[target],shots);assert.equal(shots.length,1);assert.equal(u.frostAction,null);
    A.queue(u,[target],{});u.retired=true;A.update(u,duration,[target],shots);assert.equal(shots.length,1);assert.equal(u.frostAction,null);
  }
});
test('renderer uses measured frames, one image draw, mirrors safely and falls back on failed art',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),calls=[],transforms=[];let depth=0;
  art.load=path=>({assetSrc:path,ready:true,addEventListener(){}});
  const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>calls.push(args):key==='save'?()=>depth++:key==='restore'?()=>depth--:key==='scale'?(...args)=>transforms.push(args):()=>{}});
  for(const [type,meta] of Object.entries(ns.systems.FrostlandMotionAtlas))for(const facing of [0,Math.PI]){
    const u=new ns.entities.CombatUnit(type,100,100);u.facing=facing;
    for(let frame=0;frame<16;frame++){
      if(frame<8){u.frostAction=null;u.frostVisualTime=frame/(type==='frostBird'?8:3);}
      else{u.frostAction={age:frame<11?(frame-8)*.15+.001:.45+(frame-11)*.11+.001,duration:1,released:frame>=11};}
      const p=ns.systems.FrostlandAnimation.motionPose(u),f=meta.frames[p.index];const before=calls.length;
      assert.equal(art.drawCombatUnit(ctx,u),true);assert.equal(calls.length,before+1);const draw=calls.at(-1);
      assert.equal(draw[0].assetSrc,meta.path);assert.deepEqual(draw.slice(1,5),Array.from(f.rect));assert.equal(depth,0);
      assert.ok(draw.slice(1).every(Number.isFinite));
    }
    art.frostAtlases['motion:'+type].ready=false;art.frostAtlases['motion:'+type].failed=true;
    art.drawCombatUnit(ctx,u);assert.equal(calls.at(-1)[0].assetSrc,ns.systems.FrostlandAtlas.soldiers.path);
    art.frostAtlases['motion:'+type].ready=true;
  }
  assert.ok(transforms.some(([x,y])=>x===-1&&y===1));
});
