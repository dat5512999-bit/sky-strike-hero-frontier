'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game,enemy}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs'),{rgba}=require('./png-pixels.cjs');
const ready={ready:true,width:1254,height:1254},magicReady={ready:true,width:1254,height:1254};
test('painted atlas has real alpha and sixteen separated, nonempty material cells',()=>{
  const {ns}=load(),p=rgba(ns.systems.PaintedTowerVFX.PATH);assert.equal(p.width,1254);assert.equal(p.height,1254);
  for(let k=0;k<16;k++){
    const x0=Math.round(k%4*p.width/4),x1=Math.round((k%4+1)*p.width/4),y0=Math.round(Math.floor(k/4)*p.height/4),y1=Math.round((Math.floor(k/4)+1)*p.height/4);let clear=0,body=0,edge=0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const a=p.pixels[(y*p.width+x)*4+3];if(a===0)clear++;if(a>50){body++;if(x-x0<3||x1-x<4||y-y0<3||y1-y<4)edge++;}}
    assert.ok(clear>10000,'transparent padding '+k);assert.ok(body>10000,'painted detail '+k);assert.equal(edge,0,'no cell-edge bleed '+k);
  }
  assert.ok(fs.readFileSync('sw.js','utf8').includes(ns.systems.PaintedTowerVFX.PATH));
});
test('all seven factions use painted flight and contact when assets are ready; every branch stays within its atlas cells',()=>{
  const {ns}=load(),g=game(ns);g.art={towerPaintedAtlas:ready,towerMagicAtlas:magicReady};let covered=0;
  for(const faction of Object.values(ns.systems.FactionSystem.FACTIONS))for(const type of faction.buildings){
    for(const branch of [null,...ns.systems.TowerEvolutionSystem.branches(type).map(b=>b.id)]){
      const tower=new ns.entities.Building(type,100,100);tower.synergy=g.synergy;tower.level=branch?3:1;if(branch)tower.chooseBranch(branch);tower.networkPowered=true;tower.cooldown=0;
      const monsters=[enemy(ns,160,100),enemy(ns,180,110),enemy(ns,210,100)],shots=[];tower.update(.01,monsters,shots,[]);
      if(tower.config().supportOnly){ns.entities.Projectile.beginFrame(96);ns.systems.TowerVFX.signal(tower,12);const c=strictCanvas();ns.systems.TowerVFX.building(c.ctx,tower);assert.ok(c.calls.some(a=>a[0]==='drawImage'),type);assert.equal(c.depth,0);continue;}
      if(!branch)covered++;const p=shots[0];assert.ok(p,type);assert.ok(ns.systems.PaintedTowerVFX.PROFILES[p.towerVfx],type);
      for(const phase of ['flight','hit']){if(phase==='hit')p.update(.5,monsters);const health=monsters.map(m=>m.health);
        for(const t of [0,.025,.1,.2,.319]){p.flightAge=t;if(phase==='hit')p.trail=.32-t;ns.entities.Projectile.beginFrame(96);const c=strictCanvas();p.draw(c.ctx);assert.equal(c.depth,0);assert.equal(c.ctx.globalAlpha,1);const images=c.calls.filter(a=>a[0]==='drawImage');assert.ok(images.length,type+' '+phase);
          for(const [,image,sx,sy,w,h]of images){assert.ok(image===ready||image===magicReady);assert.ok(Number.isInteger(sx)&&Number.isInteger(sy));assert.ok(sx>=0&&sy>=0&&sx+w<=1254&&sy+h<=1254);}
        }assert.deepEqual(monsters.map(m=>m.health),health);
      }
    }
  }assert.equal(covered,27);
});
test('painted rendering handles zero budgets, reduced effects, asset failure and draw faults without leaking Canvas state',()=>{
  const {ns}=load(),g=game(ns);g.art={towerPaintedAtlas:ready,towerMagicAtlas:magicReady};const tower=new ns.entities.Building('boulder',100,100);tower.synergy=g.synergy;tower.cooldown=0;const monsters=[enemy(ns,150)],shots=[];tower.update(.01,monsters,shots,[]);const p=shots[0];
  const fault=strictCanvas();fault.ctx.drawImage=()=>{throw Error('paint');};assert.throws(()=>p.draw(fault.ctx),/paint/);assert.equal(fault.depth,0);assert.equal(fault.ctx.globalAlpha,1);
  p.update(.5,monsters);ns.entities.Projectile.beginFrame(0);const capped=strictCanvas();p.draw(capped.ctx);assert.equal(capped.calls.length,0);
  ns.entities.Projectile.beginFrame(96);g.feedback.reducedFx=true;const simple=strictCanvas();p.draw(simple.ctx);assert.equal(simple.calls.filter(a=>a[0]==='drawImage').length,1);
  g.art.towerPaintedAtlas={ready:false,failed:true};ns.entities.Projectile.beginFrame(96);const fallback=strictCanvas();p.draw(fallback.ctx);assert.ok(fallback.calls.some(a=>a[0]==='lineTo'));assert.equal(fallback.depth,0);
});
test('painted support stays quiet without real work and expires after successful events',()=>{
  const {ns}=load(),g=game(ns);g.art={towerPaintedAtlas:ready,towerMagicAtlas:magicReady};const tower=new ns.entities.Building('supply',100,100);tower.synergy=g.synergy;
  ns.entities.Projectile.beginFrame(96);const quiet=strictCanvas();ns.systems.TowerVFX.building(quiet.ctx,tower);assert.equal(quiet.calls.length,0);
  ns.systems.TowerVFX.signal(tower,24);const c=strictCanvas();ns.systems.TowerVFX.building(c.ctx,tower);assert.ok(c.calls.some(a=>a[0]==='fillText'&&a[1]==='省 24G'));
  tower.visualAge=1;const expired=strictCanvas();ns.systems.TowerVFX.building(expired.ctx,tower);assert.equal(expired.calls.length,0);
});
test('electricity and poison atlas has four separate transparent cells, and both atlases participate in load and retry',()=>{
  const {ns}=load(),p=rgba(ns.systems.PaintedTowerVFX.MAGIC_PATH);
  for(let cell=0;cell<4;cell++){let body=0,clear=0,edge=0;const x0=Math.round(cell%2*p.width/2),x1=Math.round((cell%2+1)*p.width/2),y0=Math.round(Math.floor(cell/2)*p.height/2),y1=Math.round((Math.floor(cell/2)+1)*p.height/2);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const a=p.pixels[(y*p.width+x)*4+3];if(!a)clear++;if(a>50){body++;if(x-x0<3||x1-x<4||y-y0<3||y1-y<4)edge++;}}
    assert.ok(body>10000);assert.ok(clear>10000);assert.equal(edge,0);
  }
  const vm=require('node:vm'),requests=[];class Art{load(path){return{assetSrc:path,ready:false,failed:false};}preloadFaction(){}coreStatus(){return{loaded:0,total:0,ready:true,failed:false};}failedAssets(){return [];}retryFailed(){}request(i){requests.push(i);}}
  const context=vm.createContext({Image:function(){},TowerFrontier:{systems:{ArtSystem:Art}}});vm.runInContext(fs.readFileSync('src/td/systems/PaintedTowerVFX.js','utf8'),context);
  const art=new Art();art.preloadFaction();assert.equal(art.coreStatus().ready,false);art.towerPaintedAtlas.ready=true;art.towerMagicAtlas.failed=true;assert.equal(art.coreStatus().failed,true);assert.equal(art.failedAssets().length,1);art.retryFailed();assert.equal(requests.length,1);art.towerMagicAtlas.ready=true;assert.equal(art.coreStatus().ready,true);
});
