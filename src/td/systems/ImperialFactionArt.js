(function(ns){
  'use strict';
  const Art=ns.systems.ArtSystem;
  if(!Art)return;
  const HERO={dwarf:'assets/td/dwarf/hero-actions-v2.png',dragonkin:'assets/td/dragonkin/hero-actions-v2.png',egypt:'assets/td/egypt/hero-actions-v2.png'};
  // Fixed body scale, with visually inspected sole anchors (not the spell halo).
  const HERO_PROFILES={
    dwarf:{height:78,bodyHeight:113,feet:[241,241,242,240,241,243,242,242,236,220,220,224,204,204,207,204]},
    dragonkin:{height:88,bodyHeight:136,feet:[246,247,247,247,249,250,249,240,221,222,217,219,215,216,217,219]},
    egypt:{height:82,bodyHeight:156,feet:[255,254,255,254,245,243,245,248,226,230,228,231,212,213,213,213]}
  };
  const SOLDIERS={dwarf:'assets/td/dwarf/soldiers-actions-v2.png',dragonkin:'assets/td/dragonkin/soldiers-actions-v2.png'};
  const BUILDINGS={dwarf:'assets/td/dwarf/buildings-atlas-v1.png',dragonkin:'assets/td/dragonkin/buildings-atlas-v2.png'};
  // The dwarf atlas is not an equal-column grid. These measured, padded source
  // rectangles exclude the neighbouring tower's translucent fringe without
  // cropping any tower body. Coordinates are in the original PNG dimensions.
  const BUILDING_PROFILES={
    dwarf:{width:2089,height:753,frames:[[23,147,462,543],[516,102,509,576],[1045,111,487,579],[1562,44,512,642]],bodyHeights:[533,566,569,632],feet:[685,673,685,681]},
    dragonkin:{width:1983,height:793,frames:[[146,242,201,338],[663,243,197,341],[1133,248,202,333],[1620,251,232,328]],bodyHeights:[329,329,324,319],feet:[576,579,577,574]}
  };
  const unitRow={dwarfRifle:0,dwarfShield:1,dwarfRunesmith:2,dwarfMortar:3,dragonkinEmberwing:0,dragonkinLancer:1,dragonkinOracle:2,dragonkinElder:3};
  const SOLDIER_PROFILES={
    dwarfRifle:{bodyHeight:92,feet:[238,240,237,239],idle:[125,146,101,92]},dwarfShield:{bodyHeight:111,feet:[239,246,241,243],idle:[114,128,115,111]},
    dwarfRunesmith:{bodyHeight:132,feet:[223,222,224,224],idle:[119,91,88,132]},dwarfMortar:{bodyHeight:121,feet:[201,200,200,199],idle:[123,80,110,121]},
    dragonkinEmberwing:{bodyHeight:100,feet:[227,224,224,231],idle:[108,127,112,100]},dragonkinLancer:{bodyHeight:133,feet:[243,242,242,254],idle:[98,110,112,133]},
    dragonkinOracle:{bodyHeight:125,feet:[241,246,244,253],idle:[93,116,122,125]},dragonkinElder:{bodyHeight:118,feet:[194,196,191,210],idle:[83,76,147,118]}
  };
  const buildingCell={dwarfBoltTower:[0,100],dwarfRuneForge:[1,102],dwarfMortarTower:[2,106],dwarfCitadel:[3,116],dragonkinFlameSpire:[0,112],dragonkinStormObelisk:[1,116],dragonkinRoost:[2,108],dragonkinWyrmNest:[3,120]};
  // World-space body heights are shared by previews and battle rendering.
  Art.UNIT_HEIGHTS=Object.freeze({...Art.UNIT_HEIGHTS,dwarfRifle:60,dwarfShield:64,dwarfRunesmith:64,dwarfMortar:68,dragonkinEmberwing:72,dragonkinLancer:74,dragonkinOracle:70,dragonkinElder:94});
  for(const [type,p] of Object.entries(SOLDIER_PROFILES)){
    const scale=Art.UNIT_HEIGHTS[type]/p.bodyHeight,[x,y,w,h]=p.idle;
    Art.SPRITE_METRICS[type]={visible:p.bodyHeight/(1254/4),foot:p.feet[0]/(1254/4)};
    Art.PREVIEW_BOUNDS['unit:'+type]={left:Math.floor(192+(x-1254/8)*scale)-3,top:Math.floor(282+(y-p.feet[0])*scale)-3,width:Math.ceil(w*scale)+6,height:Math.ceil(h*scale)+6};
  }
  const originalHero=Art.prototype.drawHero,originalUnit=Art.prototype.drawCombatUnitSprite,originalBuilding=Art.prototype.drawBuilding,originalPreload=Art.prototype.preloadFaction;
  const originalDeploy=Art.prototype.preloadDeploy,originalStatus=Art.prototype.coreStatus,originalFailed=Art.prototype.failedAssets,originalRetry=Art.prototype.retryFailed;
  function image(art,key,path){art.imperialImages||={};return art.imperialImages[key]||(art.imperialImages[key]=art.load(path));}
  function buildingImage(system,group){
    const atlas=image(system,'building:'+group,BUILDINGS[group]);
    if(atlas.previewRefreshBound)return atlas;
    atlas.previewRefreshBound=true;
    const refresh=()=>{
      for(const type of Object.keys(buildingCell))if(ns.config.buildings[type]?.[group])system.previewCache?.delete('building:'+type);
      if(typeof document!=='undefined')document.querySelectorAll('[data-build-type]').forEach(card=>{if(buildingCell[card.dataset.buildType])delete card.dataset.previewReady;});
      system.game?.updateUi?.();
    };
    if(atlas.ready)refresh();else atlas.addEventListener?.('load',refresh,{once:true});
    return atlas;
  }
  function drawPaintedBuilding(system,ctx,type,x,y,level){
    const cfg=ns.config.buildings[type],cell=buildingCell[type],group=cfg?.dwarf?'dwarf':cfg?.dragonkin?'dragonkin':null;
    if(!cell||!group)return false;
    const atlas=buildingImage(system,group);if(!atlas?.ready)return false;
    const [index,baseHeight]=cell,profile=BUILDING_PROFILES[group],scale=1+Math.min(4,Math.max(0,(level||1)-1))*.04;
    const rect=profile?.frames[index]||[index*atlas.width/4,0,atlas.width/4,atlas.height],ratio=baseHeight*scale/(profile?.bodyHeights[index]||atlas.height),height=rect[3]*ratio,width=rect[2]*ratio;
    const pixelX=atlas.width/(profile?.width||atlas.width),pixelY=atlas.height/(profile?.height||atlas.height),top=y+9-((profile?.feet[index]||atlas.height)-rect[1])*ratio;
    ctx.save();try{ctx.fillStyle='rgba(2,12,15,.27)';ctx.beginPath();ctx.ellipse(x,y+6,Math.min(39,width*.38),8,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(atlas,rect[0]*pixelX,rect[1]*pixelY,rect[2]*pixelX,rect[3]*pixelY,x-width/2,top,width,height);
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=.22;ctx.strokeStyle=cfg.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-42*scale,Math.min(30,width*.3),7,0,0,Math.PI*2);ctx.stroke();
    system.drawRank(ctx,x,y,level||1,cfg.color,true,type);}finally{ctx.restore();}return true;
  }
  for(const [type,[index,height]] of Object.entries(buildingCell)){
    const group=ns.config.buildings[type].dwarf?'dwarf':'dragonkin',p=BUILDING_PROFILES[group];
    if(!p){Art.PREVIEW_BOUNDS['building:'+type]={left:122,top:132,width:140,height:150};continue;}
    const r=p.frames[index],scale=height/p.bodyHeights[index],w=r[2]*scale,h=r[3]*scale;
    Art.PREVIEW_BOUNDS['building:'+type]={left:Math.floor(192-w/2)-3,top:Math.floor(279-(p.feet[index]-r[1])*scale)-3,width:Math.ceil(w)+6,height:Math.ceil(h)+6};
  }
  // Keep southern buildings on their own renderer. Later art decorators may
  // wrap ArtSystem.prototype, but Building can always reach this painter.
  function drawBuilding(ctx,type,x,y,level,branch,motion){
    const cfg=ns.config.buildings[type];if(!cfg||(!cfg.dwarf&&!cfg.dragonkin))return false;
    const dwarf=Boolean(cfg.dwarf),color=cfg.color,scale=1+Math.min(4,Math.max(0,(level||1)-1))*.04,fire=motion?.fireFlash||0;
    const stone=dwarf?'#514a3e':'#28495a',edge=dwarf?'#b69d72':'#8ad1e5',metal=dwarf?'#9b8260':'#507c91',glow=dwarf?'#65e7df':'#8bd9ff';
    const rect=(left,top,width,height,fill=stone)=>{ctx.fillStyle=fill;ctx.fillRect(left,top,width,height);ctx.strokeStyle=edge;ctx.lineWidth=2.4;ctx.strokeRect(left,top,width,height);};
    const rune=(px,py,radius=7)=>{ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowColor=color;ctx.shadowBlur=9;ctx.fillStyle=color;ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);ctx.fill();ctx.restore();};
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='rgba(2,12,15,.31)';ctx.beginPath();ctx.ellipse(0,10,34,9,0,0,Math.PI*2);ctx.fill();
    if(type==='dwarfBoltTower'){
      rect(-23,-44,46,52);rect(-29,-15,58,23,metal);ctx.fillStyle='#30323a';ctx.fillRect(-17,-57,34,15);ctx.strokeStyle=edge;ctx.strokeRect(-17,-57,34,15);ctx.strokeStyle='#d2bf8c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-31,-40);ctx.lineTo(31,-40);ctx.moveTo(-21,-51);ctx.lineTo(21,-51);ctx.stroke();rune(0,-31,8);
    }else if(type==='dwarfRuneForge'){
      rect(-28,-13,56,22,metal);ctx.fillStyle=stone;ctx.beginPath();ctx.arc(0,-15,29,Math.PI,0);ctx.lineTo(29,7);ctx.lineTo(-29,7);ctx.closePath();ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=2.5;ctx.stroke();rect(17,-54,12,37,'#3e403f');ctx.fillStyle='#f5a64f';ctx.beginPath();ctx.arc(23,-57,7+Math.sin((motion?.visualAge||0)*5)*1.5,0,Math.PI*2);ctx.fill();rune(0,-17,12);
    }else if(type==='dwarfMortarTower'){
      rect(-32,-19,64,28,metal);rect(-24,-43,48,26);ctx.fillStyle='#2c3032';ctx.beginPath();ctx.arc(0,-43,22,Math.PI,0);ctx.fill();ctx.strokeStyle=edge;ctx.stroke();ctx.save();ctx.rotate(motion?.aim||-.45);rect(1,-50,45,12,'#81694c');ctx.restore();rune(-15,-27,5);rune(15,-27,5);
    }else if(type==='dwarfCitadel'){
      rect(-35,-25,70,34,stone);rect(-31,-57,24,34,metal);rect(7,-57,24,34,metal);ctx.fillStyle='#303036';ctx.fillRect(-39,-18,78,9);ctx.strokeStyle=edge;ctx.strokeRect(-39,-18,78,9);ctx.strokeStyle='#d2bf8c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-36,-43);ctx.lineTo(-54,-54);ctx.moveTo(36,-43);ctx.lineTo(54,-54);ctx.stroke();rune(0,-32,9);
    }else if(type==='dragonkinFlameSpire'){
      ctx.fillStyle=stone;ctx.beginPath();ctx.moveTo(-25,8);ctx.lineTo(0,-63);ctx.lineTo(25,8);ctx.closePath();ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=2.5;ctx.stroke();rune(0,-28,11);
    }else if(type==='dragonkinStormObelisk'){
      ctx.fillStyle=stone;ctx.beginPath();ctx.moveTo(-25,8);ctx.lineTo(-16,-50);ctx.lineTo(0,-67);ctx.lineTo(16,-50);ctx.lineTo(25,8);ctx.closePath();ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=2.5;ctx.stroke();ctx.strokeStyle='#d7fbff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-4,-46);ctx.lineTo(8,-32);ctx.lineTo(-2,-17);ctx.lineTo(10,-4);ctx.stroke();
    }else if(type==='dragonkinRoost'){
      rect(-32,-10,64,18,metal);ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-10,30,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.arc(0,-10,19,Math.PI,0);ctx.stroke();rune(0,-20,9);
    }else {
      rect(-34,-22,68,30,metal);ctx.fillStyle=stone;ctx.beginPath();ctx.ellipse(0,-26,31,24,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=2.5;ctx.stroke();ctx.strokeStyle='#e1f9ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-26,14,0,Math.PI*2);ctx.stroke();rune(0,-26,7);
    }
    if(fire){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.18+.42*fire;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-30,22+fire*16,0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.restore();return true;
  }
  ns.systems.ImperialFactionArt={drawBuilding,HERO,SOLDIERS,BUILDINGS,UNIT_ROWS:unitRow,SOLDIER_PROFILES,BUILDING_PROFILES,HERO_PROFILES};
  Art.prototype.drawHero=function(ctx,hero){
    const path=HERO[hero.classType];if(!path)return originalHero.call(this,ctx,hero);
    const atlas=image(this,'hero:'+hero.classType,path);if(!atlas.ready)return false;
    const row={idle:0,walk:1,attack:2,cast:3}[hero.state]||0,frame=Math.max(0,Math.min(3,Math.floor(hero.frame||0))),profile=HERO_PROFILES[hero.classType],scale=profile.height/profile.bodyHeight,h=1254/4*scale,w=h;
    ctx.save();try{ctx.translate(hero.x,hero.y);if(Math.cos(hero.facing||0)<0)ctx.scale(-1,1);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,10,22,5,0,0,Math.PI*2);ctx.fill();Art.drawFrame(ctx,atlas,frame,row,-w/2,12-profile.feet[row*4+frame]*scale,w,h);const weapon=ns.systems.EquipmentSystem.weapon(hero);if((hero.equipment.spear||0)>0){ctx.strokeStyle=weapon.color;ctx.shadowColor=weapon.color;ctx.shadowBlur=8;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,-34);ctx.lineTo(30,-46);ctx.stroke();}}finally{ctx.restore();}return true;
  };
  Art.prototype.drawCombatUnitSprite=function(ctx,unit){
    const cfg=unit.config(),group=cfg.dwarf?'dwarf':cfg.dragonkin?'dragonkin':null;if(!group)return originalUnit.call(this,ctx,unit);
    const atlas=image(this,'soldier:'+group,SOLDIERS[group]);if(!atlas.ready)return false;
    let column={idle:0,walk:1,attack:2,hit:3,death:3}[unit.state]||0;
    // The mortar's third pose is loading; its fourth is the real release.
    if(unit.type==='dwarfMortar'&&unit.state==='attack'&&(unit.frame||0)>=2)column=3;
    const row=unitRow[unit.type],profile=SOLDIER_PROFILES[unit.type];if(!profile)return originalUnit.call(this,ctx,unit);
    const scale=Art.UNIT_HEIGHTS[unit.type]/profile.bodyHeight,h=1254/4*scale,w=h;
    ctx.save();try{ctx.translate(unit.x,unit.y);if(Math.cos(unit.facing||0)<0)ctx.scale(-1,1);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,9,18,4,0,0,Math.PI*2);ctx.fill();Art.drawFrame(ctx,atlas,column,row,-w/2,12-profile.feet[column]*scale,w,h);this.drawGearPieces(ctx,unit,false);}finally{ctx.restore();}this.drawRank(ctx,unit.x,unit.y,unit.level||1,cfg.color,false,unit.type);return true;
  };
  Art.prototype.drawBuilding=function(ctx,type,x,y,level,branch,motion){return drawPaintedBuilding(this,ctx,type,x,y,level)||drawBuilding(ctx,type,x,y,level,branch,motion)||originalBuilding.call(this,ctx,type,x,y,level,branch,motion);};
  Art.prototype.preloadFaction=function(type,buildings){originalPreload.call(this,type,buildings);if(HERO[type])this.request(image(this,'hero:'+type,HERO[type]));if(type==='dwarf'||type==='dragonkin'){this.request(image(this,'soldier:'+type,SOLDIERS[type]));this.request(buildingImage(this,type));}};
  Art.prototype.preloadDeploy=function(kind,type){
    const cfg=(kind==='building'?ns.config.buildings:ns.config.units)[type],group=cfg?.dwarf?'dwarf':cfg?.dragonkin?'dragonkin':null;
    if(group){this.request(kind==='building'?buildingImage(this,group):image(this,'soldier:'+group,SOLDIERS[group]));return;}
    return originalDeploy.call(this,kind,type);
  };
  Art.prototype.coreStatus=function(type){
    const status=originalStatus.call(this,type);if(!HERO[type])return status;
    const atlas=image(this,'hero:'+type,HERO[type]);status.total++;if(atlas.ready)status.loaded++;
    status.ready=status.ready&&!!atlas.ready;status.failed=status.failed||!!atlas.failed;return status;
  };
  Art.prototype.failedAssets=function(){return Array.from(new Set(originalFailed.call(this).concat(Object.values(this.imperialImages||{}).filter(atlas=>atlas.failed))));};
  Art.prototype.retryFailed=function(){originalRetry.call(this);for(const atlas of Object.values(this.imperialImages||{}))if(atlas.failed){atlas.failed=false;atlas.attempts=0;this.request(atlas);}};
})(globalThis.TowerFrontier);
