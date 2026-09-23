(function(ns){
  'use strict';
  const art=ns.systems.ArtSystem.prototype,prior={unit:art.drawCombatUnit,hero:art.drawHero};
  const heights={frostWolf:83,frostBear:102,frostBird:100,frostHunter:83,frostShaman:93,frostMammoth:128};
  function atlas(system,key){
    system.frostAtlases||={};if(system.frostAtlases[key])return system.frostAtlases[key];
    const img=system.frostAtlases[key]=system.load(ns.systems.FrostlandAtlas[key].path);
    img.addEventListener?.('load',()=>{for(const id of Object.keys(heights))system.previewCache?.delete('unit:'+id);if(typeof document!=='undefined')document.querySelectorAll('[data-roster-unit^="frost"],[data-build-type^="frost"]').forEach(card=>delete card.dataset.previewReady);system.game?.refreshRosterPreviews?.();},{once:true});return img;
  }
  function frame(ctx,image,meta,index,height){
    const f=meta.frames[index],r=f.rect,scale=height/meta.maxHeight;
    ctx.save();if(f.cuts?.length){ctx.beginPath();ctx.rect((r[0]-f.anchorX)*scale,(r[1]-f.foot)*scale,r[2]*scale,r[3]*scale);for(const c of f.cuts)ctx.rect((c[0]-f.anchorX)*scale,(c[1]-f.foot)*scale,c[2]*scale,c[3]*scale);ctx.clip('evenodd');}
    ctx.drawImage(image,...r,(r[0]-f.anchorX)*scale,(r[1]-f.foot)*scale,r[2]*scale,r[3]*scale);
    ctx.restore();
  }
  function shadow(ctx,width,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#0b1826';ctx.beginPath();ctx.ellipse(0,6,width,9,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  function weapon(ctx,system,hero,pose){
    const img=atlas(system,'weapons');if(!img.ready)return;
    const level=hero.equipment.spear||0,meta=ns.systems.FrostlandAtlas.weapons,f=meta.frames[level],r=f.rect,scale=106/meta.maxHeight;
    const hands={idle:[[30,-44],[30,-43],[29,-44],[30,-44]],walk:[[30,-44],[33,-43],[27,-49],[29,-44]],attack:[[37,-43],[34,-60],[49,-67],[40,-58]],cast:[[25,-32],[25,-42],[17,-89],[49,-65]]};
    const p=(hands[hero.state]||hands.idle)[pose.frame];
    const angle=hero.state==='attack'?[-.4,-.8,1.22,.8][pose.frame]:hero.state==='cast'?[.3,.1,-.25,1.05][pose.frame]:.16;
    const gripX=[302,750,1238,1734][level]/1983*meta.width,gripY=.69*meta.height;
    ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(angle);ctx.drawImage(img,...r,(r[0]-gripX)*scale,(r[1]-gripY)*scale,r[2]*scale,r[3]*scale);ctx.restore();
  }
  art.drawCombatUnit=function(ctx,u){
    if(!ns.config.units[u.type]?.frostland)return prior.unit.call(this,ctx,u);
    const img=atlas(this,'soldiers');if(!img.ready)return prior.unit.call(this,ctx,u);
    const pose=ns.systems.FrostlandAnimation.pose(u),meta=ns.systems.FrostlandAtlas.soldiers;
    ctx.save();ctx.translate(u.x,u.y+12);shadow(ctx,u.type==='frostMammoth'?42:26,.38);
    if(Math.cos(u.facing||0)<0)ctx.scale(-1,1);
    const flying=u.type==='frostBird';if(flying)ctx.translate(0,-9-Math.sin((u.frameClock||0)*.75)*2);
    frame(ctx,img,meta,pose.row*4+pose.frame,heights[u.type]);
    if(Object.keys(u.gear||{}).length){ctx.fillStyle='#e5c778';ctx.font='bold 12px sans-serif';ctx.fillText('◆',20,-8);}
    if(u.huntTime>0){ctx.strokeStyle='#bdddc0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,3,30,10,0,0,Math.PI*2);ctx.stroke();}ctx.restore();return true;
  };
  art.drawHero=function(ctx,h){
    if(h.classType!=='frostland')return prior.hero.call(this,ctx,h);
    const img=atlas(this,'hero');if(!img.ready)return prior.hero.call(this,ctx,h);
    const pose=ns.systems.FrostlandAnimation.pose(h,true);ctx.save();ctx.translate(h.x,h.y+12);shadow(ctx,31,.38);if(Math.cos(h.facing||0)<0)ctx.scale(-1,1);
    frame(ctx,img,ns.systems.FrostlandAtlas.hero,pose.row*4+pose.frame,106);weapon(ctx,this,h,pose);ctx.restore();return true;
  };
  const oldRetry=art.retryFailed;art.retryFailed=function(){oldRetry.call(this);for(const image of Object.values(this.frostAtlases||{}))if(image.failed){image.failed=false;image.attempts=0;this.request(image);}};
  const oldStatus=art.coreStatus;art.coreStatus=function(type){const base=oldStatus.call(this,type);if(type!=='frostland')return base;const needed=['hero','weapons','soldiers'].map(k=>atlas(this,k));const loaded=needed.filter(i=>i.ready).length;return {loaded:base.loaded+loaded,total:base.total+needed.length,failed:base.failed||needed.some(i=>i.failed),ready:base.ready&&loaded===needed.length};};
  const oldFailures=art.failedAssets;art.failedAssets=function(){return oldFailures.call(this).concat(Object.values(this.frostAtlases||{}).filter(i=>i.failed));};
  // Legacy atlas viewport helper; selection UI now uses dedicated portrait paintings.
  ns.systems.FrostlandSprites={heights,frame,atlas};
})(globalThis.TowerFrontier);
