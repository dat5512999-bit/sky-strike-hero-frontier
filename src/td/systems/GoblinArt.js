(function(ns){
  'use strict';
  const art=ns.systems.ArtSystem.prototype;
  ns.systems.ArtSystem.UNIT_HEIGHTS=Object.freeze({...ns.systems.ArtSystem.UNIT_HEIGHTS,goblinEngineer:74,goblinGunner:82,goblinRiveter:87,goblinRecycler:78,goblinMech:112});
  for(const key of ['goblinEngineer','goblinGunner','goblinRiveter','goblinRecycler','goblinMech'])
    ns.systems.ArtSystem.PREVIEW_BOUNDS['unit:'+key]={left:key==='goblinMech'?137:153,top:key==='goblinMech'?150:key==='goblinRiveter'?178:184,width:key==='goblinMech'?110:86,height:key==='goblinMech'?125:key==='goblinRiveter'?100:94};
  for(const key of ['goblinGenerator','goblinTurret','goblinMortar','goblinSnare','goblinRecycler','goblinCooler','goblinSiege'])
    ns.systems.ArtSystem.PREVIEW_BOUNDS['building:'+key]={left:150,top:192,width:91,height:100};
  const priorTower=art.drawBuilding,priorUnit=art.drawCombatUnit,priorHero=art.drawHero,priorSummon=art.drawSummon;
  function drawHeroWeapon(system,ctx,hero){
    const level=Math.max(0,Math.min(3,hero.equipment?.spear||0));
    if(!level)return;
    const goblin=hero.classType==='goblin',key=goblin?'goblinToolsAtlas':'chiefAxesAtlas',path=goblin?'goblin-tools-v1.png':'chief-axes-v1.png';
    const atlas=system[key]||(system[key]=system.load('assets/td/items/'+path));
    if(!atlas.ready)return;
    const sw=atlas.width/3,sh=atlas.height,height=goblin?45:55,width=height*sw/sh;
    ctx.save();ctx.translate(hero.x,hero.y);if(Math.cos(hero.facing||0)<0)ctx.scale(-1,1);
    ctx.translate(goblin?21:26,goblin?-37:-52);ctx.rotate(hero.state==='attack'?-.5:-.14);
    ctx.shadowColor=goblin?'#72e9da':'#ff9b4a';ctx.shadowBlur=level===3?7:0;
    ctx.drawImage(atlas,(level-1)*sw,0,sw,sh,-width/2,-height/2,width,height);ctx.restore();
  }
  const soldierFrames={goblinEngineer:[0,160,360,500],goblinGunner:[360,155,450,505],goblinRiveter:[800,70,420,590],goblinRecycler:[1210,120,430,540],goblinMech:[1640,0,532,665]};
  const soldierRows={goblinEngineer:0,goblinGunner:1,goblinRiveter:2,goblinRecycler:3,goblinMech:4};
  function actionFrame(ctx,image,column,row,height){
    const sw=image.width/4,sh=image.height/5,w=height*sw/sh;
    ctx.drawImage(image,column*sw,row*sh,sw,sh,-w/2,-height,w,height);
  }
  function actionAtlas(system,kind){
    const key=kind==='hero'?'goblinHeroActions':'goblinSoldierActions';
    if(system[key])return system[key];
    const image=system[key]=system.load('assets/td/goblin/'+kind+'-actions-v2.png');
    image.addEventListener?.('load',()=>{for(const id of Object.keys(soldierRows))system.previewCache?.delete('unit:'+id);if(typeof document!=='undefined')document.querySelectorAll('[data-roster-unit^="goblin"],[data-build-type^="goblin"],[data-mercenary^="goblin"]').forEach(card=>delete card.dataset.previewReady);system.game?.refreshRosterPreviews?.();system.game?.updateUi?.();},{once:true});
    return image;
  }
  const buildingFrames={goblinGenerator:['a',4,0,93],goblinTurret:['a',4,1,92],goblinMortar:['a',4,2,98],goblinSnare:['a',4,3,94],goblinRecycler:['b',3,0,96],goblinCooler:['b',3,1,96],goblinSiege:['b',3,2,116]};
  ns.systems.ArtSystem.GOBLIN_BUILDING_FRAMES=Object.freeze(buildingFrames);
  art.goblinBuildingImage=function(set){
    const path='assets/td/combat-art/goblin-buildings-'+set+'-v1.png';
    this.goblinBuildingImages ||= {};
    if(this.goblinBuildingImages[path])return this.goblinBuildingImages[path];
    const image=this.goblinBuildingImages[path]=this.load(path);
    const refresh=()=>{
      for(const type of Object.keys(buildingFrames))this.previewCache?.delete('building:'+type);
      if(typeof document!=='undefined')document.querySelectorAll('[data-build-kind="building"][data-build-type^="goblin"]').forEach(card=>delete card.dataset.previewReady);
      this.game?.refreshRosterPreviews?.();
    };
    if(image.ready)refresh();
    image.addEventListener?.('load',refresh);
    return image;
  };
  function soldierAtlas(system){
    if(system.goblinSoldierAtlas)return system.goblinSoldierAtlas;
    const image=system.goblinSoldierAtlas=system.load('assets/td/goblin-soldiers-atlas-v2.png');
    const refreshPreviews=()=>{
      for(const key of Object.keys(soldierFrames))system.previewCache?.delete('unit:'+key);
      if(typeof document!=='undefined')document.querySelectorAll('[data-roster-unit^="goblin"],[data-build-type^="goblin"],[data-mercenary^="goblin"]').forEach(card=>delete card.dataset.previewReady);
      system.game?.refreshRosterPreviews?.();system.game?.updateUi?.();
    };
    if(image.ready)refreshPreviews();
    else image.addEventListener?.('load',refreshPreviews,{once:true});
    return image;
  }
  function chassis(ctx,x,y,w,h,color){
    ctx.fillStyle='#292d2c';ctx.fillRect(x-w/2-3,y-h-3,w+6,h+7);
    ctx.fillStyle=color;ctx.fillRect(x-w/2,y-h,w,h);
    ctx.strokeStyle='#f5d58e';ctx.lineWidth=2;ctx.strokeRect(x-w/2,y-h,w,h);
    ctx.fillStyle='#293331';for(const offset of [-w*.3,w*.3]){ctx.beginPath();ctx.arc(x+offset,y-h*.5,4,0,Math.PI*2);ctx.fill();}
  }
  function gear(ctx,x,y,r,t){ctx.save();ctx.translate(x,y);ctx.rotate(t);ctx.strokeStyle='#d5a45f';ctx.lineWidth=3;ctx.setLineDash([6,3]);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#334146';ctx.beginPath();ctx.arc(0,0,r*.72,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#91e5d9';ctx.beginPath();ctx.arc(0,0,r*.27,0,Math.PI*2);ctx.fill();ctx.restore();}
  function signal(ctx,x,y,item){if(!item)return;ctx.save();const t=item.visualAge??item.frameClock??0;ctx.strokeStyle=item.networkCooling?'#abbfc4':item.networkOverloaded?'#ffbd70':'#82e8d9';ctx.globalAlpha=.65+.22*Math.sin(t*6);ctx.lineWidth=item.networkOverloaded?3:2;ctx.setLineDash(item.networkCooling?[4,5]:[]);ctx.beginPath();ctx.ellipse(x,y+3,30,11,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(item.networkCooling){for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-12+i*11,y-60);ctx.quadraticCurveTo(x-20+i*11,y-75,x-11+i*11,y-82);ctx.stroke();}}ctx.restore();}
  // Clear, physical tier markers: bolts, powered collar, stabilisers and an endgame rotor.
  // These sit outside the painted silhouette, so an upgrade is recognisable at gameplay scale.
  function evolutionKit(ctx,x,y,level,color,building,clock){if(level<2)return;const t=clock||0,wide=building?1.35:1;ctx.save();ctx.translate(x,y);ctx.strokeStyle='#f3c976';ctx.fillStyle=color;ctx.shadowColor=color;ctx.lineWidth=2;ctx.globalAlpha=.92;
    for(const side of [-1,1]){ctx.beginPath();ctx.arc(side*17*wide,-(building?43:31),3.4,0,Math.PI*2);ctx.fill();ctx.stroke();}
    if(level>=3){ctx.globalAlpha=.55+.25*Math.sin(t*5);ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(0,building?-48:-35,23*wide,7,0,0,Math.PI*2);ctx.stroke();}
    if(level>=4){ctx.shadowBlur=0;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*20*wide,-(building?56:42));ctx.lineTo(side*34*wide,-(building?48:34));ctx.lineTo(side*19*wide,-(building?36:27));ctx.closePath();ctx.fill();ctx.stroke();}}
    if(level>=5){ctx.globalAlpha=.82;ctx.shadowBlur=10;ctx.translate(0,building?-72:-56);ctx.rotate(t*2);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillRect(-2,-13,4,12);}ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();}
    ctx.restore();}
  art.drawBuilding=function(ctx,type,x,y,level,branch){
    if(!type.startsWith('goblin'))return priorTower.call(this,ctx,type,x,y,level,branch);
    const [set,columns,index,baseHeight]=buildingFrames[type]||[];
    if(!set)return priorTower.call(this,ctx,type,x,y,level,branch);
    const image=this.goblinBuildingImage(set);
    if(!image.ready)return false;
    const item=this.game?.build?.items?.find(o=>o.kind==='building'&&o.type===type&&o.x===x&&o.y===y);
    const height=baseHeight*(1+.05*Math.min(4,(level||1)-1)),cell=image.width/columns,width=height*cell/image.height;
    ctx.save();ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x,y+5,Math.min(38,width*.38),8,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(image,index*cell,0,cell,image.height,x-width/2,y-height+8,width,height);
    signal(ctx,x,y,item);ctx.restore();evolutionKit(ctx,x,y,level||1,'#d9ad65',true,item?.visualAge);this.drawRank?.(ctx,x,y,level||1,'#d9ad65',true,type);return true;
  };
  art.drawCombatUnit=function(ctx,unit){
    if(!unit?.type?.startsWith('goblin'))return priorUnit.call(this,ctx,unit);
    const actions=actionAtlas(this,'soldier');
    if(actions.ready&&soldierRows[unit.type]!==undefined){
      const level=unit.level||1,height=ns.systems.ArtSystem.UNIT_HEIGHTS[unit.type]*(1+.05*Math.min(4,level-1)),column=ns.systems.GoblinAnimation.frame(unit),t=unit.frameClock||0;
      ctx.save();ctx.translate(unit.x,unit.y+8-(column===0?Math.sin(t*.9)*1.2:0));if(Math.cos(unit.facing||0)<0)ctx.scale(-1,1);
      ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.ellipse(0,3,unit.type==='goblinMech'?34:23,7,0,0,Math.PI*2);ctx.fill();
      actionFrame(ctx,actions,column,soldierRows[unit.type],height);
      if(unit.goblinAction&&column===2){ctx.globalAlpha=.55;ctx.fillStyle='#ffe0a0';ctx.shadowColor='#ff9f3b';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(height*.42,-height*.47,unit.type==='goblinMech'?9:5,0,Math.PI*2);ctx.fill();}
      ctx.restore();signal(ctx,unit.x,unit.y,unit);const color=unit.config?.().color||ns.config.units[unit.type].color;evolutionKit(ctx,unit.x,unit.y,level,color,false,t);this.drawRank?.(ctx,unit.x,unit.y,level,color,false,unit.type);return true;
    }
    const atlas=soldierAtlas(this),frame=soldierFrames[unit.type];
    if(atlas.ready&&frame){
      const level=unit.level||1,height=ns.systems.ArtSystem.UNIT_HEIGHTS[unit.type]*(1+.05*Math.min(4,level-1)),width=height*frame[2]/frame[3],clock=unit.frameClock||0;
      const walking=unit.state==='walk',firing=unit.state==='attack'||unit.attackTimer>0;
      const bob=walking?Math.abs(Math.sin(clock*8))*3:0,recoil=firing?Math.sin(Math.min(1,(unit.attackTimer||.18)*5)*Math.PI)*3:0;
      ctx.save();ctx.translate(unit.x,unit.y-bob);if(Math.cos(unit.facing||0)<0)ctx.scale(-1,1);
      ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,4,Math.max(12,width*.3),6,0,0,Math.PI*2);ctx.fill();
      ctx.drawImage(atlas,...frame,-width/2-recoil,-height,width,height);
      if(firing){const muzzleX=width*(unit.type==='goblinMech'?.45:.48),muzzleY=-height*(unit.type==='goblinMech'?.55:.48);
        ctx.fillStyle='#ffedb5';ctx.shadowColor='#ff9f3b';ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(muzzleX+13,muzzleY);ctx.lineTo(muzzleX-3,muzzleY-6);ctx.lineTo(muzzleX-3,muzzleY+6);ctx.fill();}
      ctx.restore();signal(ctx,unit.x,unit.y,unit);const color=unit.config?.().color||ns.config.units[unit.type].color;evolutionKit(ctx,unit.x,unit.y,level,color,false,clock);this.drawRank?.(ctx,unit.x,unit.y,level,color,false,unit.type);return true;
    }
    const cfg=unit.config(),mech=unit.type==='goblinMech',s=mech?1.15:.84;ctx.save();ctx.translate(unit.x,unit.y);ctx.scale(s*(Math.cos(unit.facing||0)<0?-1:1),s);
    ctx.fillStyle='#10202477';ctx.beginPath();ctx.ellipse(0,5,mech?32:23,9,0,0,Math.PI*2);ctx.fill();
    for(const dx of [-12,12]){ctx.fillStyle='#3d443d';ctx.fillRect(dx-8,-13,15,20);ctx.strokeStyle='#aa8753';ctx.lineWidth=2;ctx.strokeRect(dx-8,-13,15,20);}
    chassis(ctx,0,-9,mech?48:34,mech?40:31,mech?'#5b5d53':'#6f5e48');
    ctx.fillStyle='#4b6060';ctx.fillRect(-25,-44,11,25);gear(ctx,-20,-29,5,0);
    if(mech){chassis(ctx,0,-48,40,30,'#746b54');gear(ctx,0,-65,13,0);}
    else{ctx.fillStyle='#9daf79';ctx.beginPath();ctx.moveTo(-13,-47);ctx.lineTo(-29,-56);ctx.lineTo(-18,-39);ctx.lineTo(18,-39);ctx.lineTo(29,-56);ctx.lineTo(13,-47);ctx.arc(0,-48,15,0,Math.PI,true);ctx.fill();ctx.fillStyle='#614b38';ctx.fillRect(-15,-61,30,7);for(const dx of [-7,7]){gear(ctx,dx,-53,5,0);}}
    const barrel=mech?43:unit.type==='goblinRiveter'?36:unit.type==='goblinRecycler'?15:25;
    ctx.fillStyle='#344044';ctx.fillRect(11,-37,barrel,mech?14:8);ctx.strokeStyle=cfg.color;ctx.strokeRect(11,-37,barrel,mech?14:8);
    if(unit.attackTimer>0){ctx.fillStyle='#ffe3a2';ctx.beginPath();ctx.arc(13+barrel,-33,mech?9:5,0,Math.PI*2);ctx.fill();}
    signal(ctx,0,0,unit);ctx.restore();return true;
  };
  art.drawHero=function(ctx,hero){
    if(hero.classType!=='goblin'){const drawn=priorHero.call(this,ctx,hero);if(drawn&&hero.classType==='chief')drawHeroWeapon(this,ctx,hero);return drawn;}
    const actions=actionAtlas(this,'hero');
    if(actions.ready){
      const row={idle:0,walk:1,attack:2,cast:3}[hero.state]||0,column=Math.max(0,Math.min(3,hero.frame||0));
      ctx.save();ctx.translate(hero.x,hero.y+8);if(Math.cos(hero.facing||0)<0)ctx.scale(-1,1);
      ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(0,4,24,7,0,0,Math.PI*2);ctx.fill();
      const sw=actions.width/4,sh=actions.height/4,height=94,w=height*sw/sh;ctx.drawImage(actions,column*sw,row*sh,sw,sh,-w/2,-height,w,height);
      ctx.restore();if(hero.equipment?.spear>0)drawHeroWeapon(this,ctx,hero);return true;
    }
    const image=this.goblinChiefImage||(this.goblinChiefImage=this.load('assets/td/combat-art/goblin-chief-v1.png'));
    if(!image.ready)return false;
    const height=90,width=height*image.width/image.height,clock=hero.frameClock||0;
    const walking=hero.state==='walk',casting=hero.state==='cast',attacking=hero.state==='attack';
    const bob=walking?Math.abs(Math.sin(clock*8))*3:0,lunge=attacking?3:0;
    ctx.save();ctx.translate(hero.x,hero.y+8-bob);if(Math.cos(hero.facing||0)<0)ctx.scale(-1,1);
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,3,23,6,0,0,Math.PI*2);ctx.fill();
    if(casting){ctx.shadowColor='#8bf5df';ctx.shadowBlur=16;}
    ctx.drawImage(image,-width/2+lunge,-height,width,height);
    ctx.restore();drawHeroWeapon(this,ctx,hero);return true;
  };
  art.drawSummon=function(ctx,summon){
    if(summon.form!=='goblin')return priorSummon.call(this,ctx,summon);
    const actions=actionAtlas(this,'soldier');
    if(actions.ready){const column=summon.state==='attack'?(summon.attackTimer>.17?2:3):summon.state==='walk'?1:0;
      ctx.save();ctx.translate(summon.x,summon.y+5);if(Math.cos(summon.facing||0)<0)ctx.scale(-1,1);
      ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,3,18,5,0,0,Math.PI*2);ctx.fill();actionFrame(ctx,actions,column,4,58);
      ctx.strokeStyle='#79ead9';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,2,20,7,0,0,Math.PI*2);ctx.stroke();ctx.restore();return true;}
    const atlas=soldierAtlas(this),frame=soldierFrames.goblinMech;
    if(!atlas.ready)return false;
    const height=54,width=height*frame[2]/frame[3],bob=summon.state==='walk'?Math.abs(Math.sin((summon.frameClock||0)*8))*2:0;
    ctx.save();ctx.translate(summon.x,summon.y-bob);if(Math.cos(summon.facing||0)<0)ctx.scale(-1,1);
    ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,3,18,5,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(atlas,...frame,-width/2,-height,width,height);
    ctx.strokeStyle='#79ead9';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,2,20,7,0,0,Math.PI*2);ctx.stroke();ctx.restore();return true;
  };
  const previousStatus=art.coreStatus;art.coreStatus=function(type){const base=previousStatus.call(this,type);if(type!=='goblin')return base;const images=[actionAtlas(this,'hero'),actionAtlas(this,'soldier')],loaded=images.filter(image=>image.ready).length;return{loaded:base.loaded+loaded,total:base.total+images.length,failed:base.failed||images.some(image=>image.failed),ready:base.ready&&loaded===images.length};};
  const previousRetry=art.retryFailed;art.retryFailed=function(){previousRetry.call(this);for(const image of [this.goblinHeroActions,this.goblinSoldierActions])if(image?.failed){image.failed=false;image.attempts=0;this.request(image);}};
  const previousFailures=art.failedAssets;art.failedAssets=function(){return previousFailures.call(this).concat([this.goblinHeroActions,this.goblinSoldierActions].filter(image=>image?.failed));};
})(globalThis.TowerFrontier);
