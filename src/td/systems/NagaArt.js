(function(ns){
  'use strict';
  const art=ns.systems.ArtSystem.prototype,types=['nagaTidegate','nagaShellBastion','nagaAbyssShrine','nagaMantaAerie'],prior=art.drawBuilding;
  const frames=Object.freeze({nagaTidegate:[0,0,122],nagaShellBastion:[1,0,104],nagaAbyssShrine:[0,1,112],nagaMantaAerie:[1,1,112]});
  ns.systems.ArtSystem.NAGA_BUILDING_FRAMES=frames;
  for(const type of types)ns.systems.ArtSystem.PREVIEW_BOUNDS['building:'+type]={left:126,top:142,width:132,height:142};
  function image(system){
    if(system.nagaBuildingAtlas)return system.nagaBuildingAtlas;
    const atlas=system.nagaBuildingAtlas=system.load('assets/td/naga/naga-buildings-v1.png');
    const refresh=()=>{for(const type of types)system.previewCache?.delete('building:'+type);if(typeof document!=='undefined')document.querySelectorAll('[data-build-type^="naga"]').forEach(card=>delete card.dataset.previewReady);system.game?.refreshRosterPreviews?.();system.game?.updateUi?.();};
    if(atlas.ready)refresh();else atlas.addEventListener?.('load',refresh,{once:true});
    return atlas;
  }
  art.drawBuilding=function(ctx,type,x,y,level,branch){
    if(!types.includes(type))return prior.call(this,ctx,type,x,y,level,branch);
    const atlas=image(this),frame=frames[type];if(!atlas.ready||!frame)return false;
    const [column,row,height]=frame,sw=atlas.width/2,sh=atlas.height/2,scale=1+Math.min(4,(level||1)-1)*.035,width=height*sw/sh;
    if(type==='nagaAbyssShrine'){const phase=(this.game?.elapsed||0)*2.4;ctx.save();ctx.globalAlpha=.2+.08*Math.sin(phase);ctx.strokeStyle='#72f4ed';ctx.shadowColor='#38cfd2';ctx.shadowBlur=8;ctx.lineWidth=1.6;for(let arc=0;arc<3;arc++){const angle=phase+arc*Math.PI*2/3;ctx.beginPath();ctx.ellipse(x+Math.cos(angle)*15*scale,y-31*scale+Math.sin(angle)*6*scale,9*scale,3*scale,angle,0,Math.PI*2);ctx.stroke();}ctx.restore();}
    ctx.save();ctx.globalAlpha=.26;ctx.fillStyle='#010e11';ctx.beginPath();ctx.ellipse(x,y+5,width*.33,10,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.drawImage(atlas,column*sw,row*sh,sw,sh,x-width*scale/2,y-height*scale,width*scale,height*scale);
    if(branch){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.35+.16*Math.sin((this.game?.elapsed||0)*5);ctx.strokeStyle=ns.config.buildings[type].color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y-42*scale,width*.28,12*scale,0,0,Math.PI*2);ctx.stroke();}
    this.drawRank(ctx,x,y,level,ns.config.buildings[type].color,true,type);ctx.restore();return true;
  };
})(globalThis.TowerFrontier);
