'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game,enemy}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs');
const {rgba}=require('./png-pixels.cjs');
function artFixture(ns){
  const art=Object.create(ns.systems.ArtSystem.prototype);art.drawRank=()=>{};art.drawGearPieces=()=>{};
  art.load=path=>{const png=fs.readFileSync(path);return{ready:true,width:png.readUInt32BE(16),height:png.readUInt32BE(20),assetSrc:path};};
  return art;
}
test('southern soldier atlases contain all 32 poses with real alpha gutters, matching measured idle body scale',()=>{
  const {ns}=load(),art=ns.systems.ImperialFactionArt,cache=fs.readFileSync('sw.js','utf8');
  for(const [group,path] of Object.entries(art.SOLDIERS)){
    const png=rgba(path);assert.equal(png.width,1254);assert.equal(png.height,1254);assert.ok(cache.includes('./'+path));
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const x0=Math.round(col*png.width/4),x1=Math.round((col+1)*png.width/4),y0=Math.round(row*png.height/4),y1=Math.round((row+1)*png.height/4);let body=0,clear=0,edge=0,top=y1,bottom=y0;
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
        const alpha=png.pixels[(y*png.width+x)*4+3];if(alpha<16)clear++;if(alpha>50){body++;top=Math.min(top,y);bottom=Math.max(bottom,y);}
        if(alpha>=16&&(x-x0<4||x1-x<5||y-y0<4||y1-y<5))edge++;
      }
      assert.ok(body>3000,group+' nonempty pose '+row+','+col);assert.ok(clear>30000,group+' transparent space');assert.equal(edge,0,group+' full weapons/effects stay in pose '+row+','+col);
      if(col===0){const type=Object.keys(art.UNIT_ROWS).find(type=>ns.config.units[type][group]&&art.UNIT_ROWS[type]===row),profile=art.SOLDIER_PROFILES[type];assert.equal(bottom-top+1,profile.bodyHeight,type+' calibrated world scale');assert.equal(bottom-y0+1,profile.feet[0],type+' measured idle foot');}
    }
  }
});
test('southern building source rectangles have transparent borders and contain full nonempty painted towers',()=>{
  const art=load().ns.systems.ImperialFactionArt,cache=fs.readFileSync('sw.js','utf8');
  for(const [group,profile] of Object.entries(art.BUILDING_PROFILES)){
    const path=art.BUILDINGS[group],png=rgba(path);assert.equal(png.width,profile.width);assert.equal(png.height,profile.height);assert.ok(cache.includes('./'+path));assert.equal(profile.frames.length,4);
    for(const [x0,y0,w,h] of profile.frames){
      assert.ok(x0>=0&&y0>=0&&x0+w<=png.width&&y0+h<=png.height);let edge=0,body=0;
      for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const alpha=png.pixels[(y*png.width+x)*4+3];if(alpha>50)body++;if(alpha>=16&&(x-x0<3||x0+w-x<4||y-y0<3||y0+h-y<4))edge++;}
      assert.ok(body>1000,group+' complete painted tower');assert.equal(edge,0,group+' no body or neighbouring tower cropped at source border');
    }
  }
});
test('southern soldiers have real flight/contact textures without changing damage or element',()=>{
  const {ns}=load(),g=game(ns);g.art={towerPaintedAtlas:{ready:true,width:1254,height:1254},towerMagicAtlas:{ready:true,width:1254,height:1254},soldierAtlas:{ready:true,width:1254,height:1254}};
  for(const faction of ['dwarf','dragonkin'])for(const type of ns.systems.FactionSystem.FACTIONS[faction].units)for(const level of [1,5]){
    const unit=new ns.entities.CombatUnit(type,100,100);unit.level=level;unit.synergy=g.synergy;unit.cooldown=0;
    const targets=[enemy(ns,145),enemy(ns,166)],shots=[];unit.attack(targets[0],unit.config(),shots,targets);const shot=shots[0];
    assert.ok(shot&&ns.systems.UnitVFX.PROFILES[shot.unitVfx],type);assert.equal(shot.damage,unit.config().damage);
    ns.entities.Projectile.beginFrame(96);const flight=strictCanvas();shot.draw(flight.ctx);assert.ok(flight.calls.some(c=>c[0]==='drawImage'),type+' flight');
    shot.update(1,targets);assert.ok(shot.hitResolved,type+' reaches contact');const health=targets.map(t=>t.health);
    ns.entities.Projectile.beginFrame(96);const contact=strictCanvas();shot.draw(contact.ctx);assert.ok(contact.calls.some(c=>c[0]==='drawImage'),type+' contact');
    assert.deepEqual(targets.map(t=>t.health),health);assert.equal(flight.depth+contact.depth,0);
  }
});
test('southern support towers emit no fake attacks and only highlight real eligible beneficiaries',()=>{
  const {ns}=load(),g=game(ns);g.art={towerPaintedAtlas:{ready:true,width:1254,height:1254}};
  for(const [type,ally,wrong] of [['dwarfRuneForge','dwarfRifle','dragonkinLancer'],['dragonkinRoost','dragonkinLancer','dwarfRifle']]){
    const tower=new ns.entities.Building(type,100,100),unit=new ns.entities.CombatUnit(ally,120,100),other=new ns.entities.CombatUnit(wrong,130,100);tower.synergy=g.synergy;
    g.build.items=[tower,unit,other];g.hero.x=1000;g.hero.y=1000;
    const shots=[];tower.cooldown=0;tower.update(1,[enemy(ns,140)],shots,[]);assert.equal(shots.length,0);assert.equal(ns.systems.TowerVFX.key(tower),null);
    ns.entities.Projectile.beginFrame(96);const quiet=strictCanvas();ns.systems.TowerVFX.building(quiet.ctx,tower);assert.equal(quiet.calls.length,0);
    g.synergy.update(.1);assert.equal(unit.supportHasteSource,tower);assert.notEqual(other.supportHasteSource,tower);
    ns.entities.Projectile.beginFrame(96);const active=strictCanvas();ns.systems.TowerVFX.building(active.ctx,tower);assert.ok(active.calls.some(c=>c[0]==='drawImage'));assert.equal(active.depth,0);
    unit.x=1000;g.synergy.update(.1);const expired=strictCanvas();ns.systems.TowerVFX.building(expired.ctx,tower);assert.equal(expired.calls.length,0);
  }
});
test('southern body scale, ground anchors and preview metadata stay stable at levels 1 and 5 in both directions',()=>{
  const {ns}=load(),art=artFixture(ns),imperial=ns.systems.ImperialFactionArt,A=ns.systems.ArtSystem;
  for(const [type,row] of Object.entries(imperial.UNIT_ROWS)){
    const unit=new ns.entities.CombatUnit(type,100,200),scales=new Set();
    for(const state of ['idle','walk','attack','hit'])for(const level of [1,5])for(const facing of [0,Math.PI])for(const frame of [0,3]){
      Object.assign(unit,{state,level,facing,frame});const c=strictCanvas();assert.equal(art.drawCombatUnit(c.ctx,unit),true,type);
      const drawn=c.calls.find(call=>call[0]==='drawImage'&&call[1].assetSrc.includes('/soldiers-actions-'));assert.ok(drawn,type);
      const [,atlas,sx,sy,sw,sh,dx,dy,dw,dh]=drawn;assert.ok(sx>=0&&sy>=0&&sx+sw<=atlas.width&&sy+sh<=atlas.height,type+' source bounds');
      assert.ok(Math.abs(dw/sw-dh/sh)<1e-9,type+' aspect ratio');scales.add((dw/sw).toFixed(8));
      let column={idle:0,walk:1,attack:2,hit:3}[state];if(type==='dwarfMortar'&&state==='attack'&&frame>=2)column=3;
      const profile=imperial.SOLDIER_PROFILES[type],scale=A.UNIT_HEIGHTS[type]/profile.bodyHeight,sourceTop=sy/atlas.height*1254-row*1254/4;
      assert.ok(Math.abs(dy+(profile.feet[column]-sourceTop)*scale-12)<1e-8,type+' exact ground anchor');
      assert.equal(c.depth,0);assert.equal(unit.x,100);assert.equal(unit.y,200);
      if(facing)assert.ok(c.calls.some(v=>v[0]==='scale'&&v[1]===-1&&v[2]===1),type+' mirror');
    }
    assert.equal(scales.size,1,type+' no level/frame stretch');assert.ok(A.UNIT_HEIGHTS[type]>0);const bounds=A.previewBounds('unit',type);assert.ok(bounds.width>0&&bounds.left>=0&&bounds.left+bounds.width<=384);
    const cfg=ns.config.units[type],group=cfg.dwarf?'dwarf':'dragonkin';art.imperialImages['soldier:'+group].ready=false;
    assert.equal(art.drawCombatUnit(strictCanvas().ctx,unit),false,type+' delegates missing sprite to entity fallback');art.imperialImages['soldier:'+group].ready=true;
    const broken=strictCanvas();broken.ctx.drawImage=()=>{throw Error('canvas fault');};assert.throws(()=>art.drawCombatUnit(broken.ctx,unit),/canvas fault/);assert.equal(broken.depth,0);
  }
  assert.doesNotMatch(fs.readFileSync('src/td/systems/ImperialFactionArt.js','utf8'),/getImageData|toDataURL|toBlob/);
});
test('southern towers keep painted previews and a functional missing-asset fallback without Canvas leakage',()=>{
  const {ns}=load(),art=artFixture(ns);
  for(const faction of ['dwarf','dragonkin'])for(const type of ns.systems.FactionSystem.FACTIONS[faction].buildings){
    for(const level of [1,5]){const c=strictCanvas();assert.equal(art.drawBuilding(c.ctx,type,100,180,level),true);assert.ok(c.calls.some(v=>v[0]==='drawImage'));assert.equal(c.depth,0);}
    art.imperialImages['building:'+faction].ready=false;const fallback=strictCanvas();assert.equal(art.drawBuilding(fallback.ctx,type,100,180,5),true);assert.equal(fallback.calls.filter(v=>v[0]==='drawImage').length,0);assert.equal(fallback.depth,0);
    art.imperialImages['building:'+faction].ready=true;const fault=strictCanvas();fault.ctx.drawImage=()=>{throw Error('paint fault');};assert.throws(()=>art.drawBuilding(fault.ctx,type,100,180,1),/paint fault/);assert.equal(fault.depth,0);
  }
});
test('southern hero poses and highest weapons draw safely mirrored and fall back when the atlas fails',()=>{
  const {ns}=load(),art=artFixture(ns);
  for(const type of ['dwarf','dragonkin','egypt']){
    const hero=new ns.entities.Hero(140,180);hero.chooseClass(type);hero.equipment.spear=3;
    for(const state of ['idle','walk','attack','cast'])for(const frame of [0,1,2,3])for(const facing of [0,Math.PI]){
      Object.assign(hero,{state,frame,facing});const c=strictCanvas();assert.equal(art.drawHero(c.ctx,hero),true);assert.equal(c.depth,0);assert.ok(c.calls.some(v=>v[0]==='drawImage'));assert.equal(hero.x,140);assert.equal(hero.y,180);
    }
    art.imperialImages['hero:'+type].ready=false;assert.equal(art.drawHero(strictCanvas().ctx,hero),false);art.imperialImages['hero:'+type].ready=true;
    const fault=strictCanvas();fault.ctx.drawImage=()=>{throw Error('hero fault');};assert.throws(()=>art.drawHero(fault.ctx,hero),/hero fault/);assert.equal(fault.depth,0);
  }
});
test('southern hero and deployment atlases participate in loading, error reporting and retry',()=>{
  const vm=require('node:vm'),requests=[];
  class Art{
    load(path){return{assetSrc:path,ready:false,failed:false};}drawHero(){return false;}drawCombatUnitSprite(){return false;}drawBuilding(){return false;}
    preloadFaction(){}preloadDeploy(){}coreStatus(){return{total:1,loaded:1,ready:true,failed:false};}failedAssets(){return [];}retryFailed(){}request(atlas){requests.push(atlas);}
  }
  Art.UNIT_HEIGHTS={};Art.SPRITE_METRICS={};Art.PREVIEW_BOUNDS={};const {ns}=load();
  const sandbox=vm.createContext({TowerFrontier:{systems:{ArtSystem:Art},config:ns.config}});sandbox.globalThis=sandbox;
  vm.runInContext(fs.readFileSync('src/td/systems/ImperialFactionArt.js','utf8'),sandbox);
  const art=new Art();assert.equal(art.coreStatus('dwarf').ready,false);art.preloadDeploy('unit','dragonkinLancer');art.preloadDeploy('building','dwarfRuneForge');
  const profiles=sandbox.TowerFrontier.systems.ImperialFactionArt;
  assert.deepEqual(requests.map(i=>i.assetSrc),[profiles.SOLDIERS.dragonkin,profiles.BUILDINGS.dwarf]);
  for(const image of Object.values(art.imperialImages))image.failed=true;assert.equal(art.failedAssets().length,3);assert.equal(art.coreStatus('dwarf').failed,true);
  requests.length=0;art.retryFailed();assert.equal(requests.length,3);assert.ok(requests.every(image=>!image.failed&&image.attempts===0));
  art.imperialImages['hero:dwarf'].ready=true;assert.equal(art.coreStatus('dwarf').ready,true);
});
