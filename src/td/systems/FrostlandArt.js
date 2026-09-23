(function(ns){
  'use strict';
  // Code-native prototype silhouettes. Slots can be replaced by final atlases later.
  const art=ns.systems.ArtSystem.prototype,prior={unit:art.drawCombatUnit,hero:art.drawHero,tower:art.drawBuilding};
  function polygon(ctx,points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}
  function ellipse(ctx,x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
  function crystal(ctx,x,y,size,color){polygon(ctx,[[x,y-size],[x-size*.35,y],[x,y+size*.3],[x+size*.35,y]],color);}
  function spear(ctx,level,color){ctx.strokeStyle='#bba786';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(33,-76);ctx.stroke();ctx.strokeStyle='#23333c';crystal(ctx,34,-75,14+level*2,color);for(let i=0;i<level;i++)crystal(ctx,28,-54+i*10,7,color);}
  function unit(ctx,id,x,y,level=1,attacking=false){
    ctx.save();ctx.translate(x,y);ctx.strokeStyle='#1b2a35';ctx.lineWidth=2;
    ellipse(ctx,0,8,id==='frostMammoth'?46:30,9,'#18252bb0');
    if(id==='frostBear'||id==='frostMammoth'){
      const mammoth=id==='frostMammoth',w=mammoth?43:32,h=mammoth?36:29,c=mammoth?'#8f755f':'#bcbbaa';
      for(const a of [-1,1]){polygon(ctx,[[a*w*.8,-22],[a*w*.95,9],[a*w*.35,9],[a*w*.35,-22]],c);}
      ellipse(ctx,0,-29,w,h,c);ellipse(ctx,w*.72,-36,mammoth?22:20,23,c);
      if(mammoth){polygon(ctx,[[49,-30],[60,-6],[51,12],[43,5],[45,-13],[34,-22]],c);for(const a of [0,9])polygon(ctx,[[31+a,-22],[48+a,-8],[62+a,-23],[54+a,-2],[42+a,0]],'#e0d1aa');}
      else {ellipse(ctx,13,-59,8,8,c);ellipse(ctx,34,-56,8,8,c);ellipse(ctx,31,-27,12,8,'#eee6cf');}
      for(const a of [-20,0,18])crystal(ctx,a,-56,mammoth?22:15,'#89c8d4');
    }else if(id==='frostBird'){
      const lift=attacking?7:0;polygon(ctx,[[-4,-40],[-66,-65-lift],[-49,-33],[-27,-20],[0,-25]],'#8db9d0');polygon(ctx,[[4,-40],[66,-65-lift],[49,-33],[27,-20],[0,-25]],'#9dcbdc');
      for(const a of [-1,1])polygon(ctx,[[a*20,-36],[a*58,-54-lift],[a*33,-25]],'#d1edef');
      ellipse(ctx,0,-28,12,24,'#738aa0');ellipse(ctx,5,-52,11,10,'#d1e4e5');polygon(ctx,[[14,-55],[28,-49],[13,-46]],'#c9aa70');
    }else{
      const wolf=id==='frostWolf'||id==='frostland',shaman=id==='frostShaman';
      polygon(ctx,[[-18,-35],[-21,4],[-5,4],[0,-19],[7,4],[23,4],[17,-35]],wolf?'#6e7c82':'#77634e');
      polygon(ctx,[[-24,-51],[-17,-18],[18,-18],[23,-51],[0,-67]],shaman?'#8b7995':wolf?'#8d9899':'#947453');
      ellipse(ctx,0,-67,15,17,wolf?'#c3c4b4':'#cbbfa0');
      if(wolf){polygon(ctx,[[-15,-71],[-14,-91],[-2,-80],[13,-91],[18,-64],[31,-61],[16,-52],[-2,-53]],'#bcbfb1');for(const a of [-1,1])polygon(ctx,[[a*22,-49],[a*34,-39],[a*35,-20],[a*23,-29]],'#c6c3b3');}
      else if(shaman){ctx.strokeStyle='#dfd3b0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(28,1);ctx.lineTo(28,-80);ctx.moveTo(12,-71);ctx.lineTo(44,-71);ctx.stroke();crystal(ctx,28,-82,15,'#bba7da');}
      else {ctx.strokeStyle='#d1b888';ctx.lineWidth=3;ctx.beginPath();ctx.arc(21,-38,31,-1.45,1.45);ctx.stroke();ctx.beginPath();ctx.moveTo(25,-69);ctx.lineTo(25,-7);ctx.stroke();}
      crystal(ctx,0,-40,8,'#96d7d6');if(id==='frostland')spear(ctx,level,'#a7f4cd');
    }
    if(attacking){ctx.strokeStyle='#c2fbef';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-30,44,-.7,.7);ctx.stroke();}
    ctx.restore();return true;
  }
  art.drawCombatUnit=function(ctx,u){if(!ns.config.units[u.type]?.frostland)return prior.unit.call(this,ctx,u);unit(ctx,u.type,u.x,u.y,u.level,u.state==='attack');if(u.huntTime>0){ctx.save();ctx.strokeStyle='#c6e5bb';ctx.beginPath();ctx.ellipse(u.x,u.y+7,35,13,0,0,Math.PI*2);ctx.stroke();ctx.restore();}if(Object.keys(u.gear||{}).length){ctx.save();ctx.fillStyle='#e8cd87';ctx.font='bold 12px sans-serif';ctx.fillText('◆',u.x+24,u.y-6);ctx.restore();}return true;};
  art.drawHero=function(ctx,h){if(h.classType!=='frostland')return prior.hero.call(this,ctx,h);unit(ctx,'frostland',h.x,h.y,h.equipment.spear,h.state==='attack'||h.state==='cast');ctx.save();ctx.translate(h.x,h.y);spear(ctx,h.equipment.spear,ns.systems.EquipmentSystem.weapon(h).color);ctx.restore();return true;};
  art.drawBuilding=function(ctx,type,x,y,level,branch){
    if(!ns.config.buildings[type]?.frostland)return prior.tower.call(this,ctx,type,x,y,level,branch);
    ctx.save();ctx.translate(x,y);ctx.strokeStyle='#25313c';ctx.lineWidth=2;ellipse(ctx,0,5,35,14,'#5d6570');
    const cfg=ns.config.buildings[type];
    if(type==='frostBallista'){polygon(ctx,[[-16,0],[-8,-43],[8,-43],[16,0]],'#816c52');ctx.strokeStyle='#bba786';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-41,-43);ctx.lineTo(0,-63);ctx.lineTo(41,-43);ctx.moveTo(0,-25);ctx.lineTo(0,-77);ctx.stroke();crystal(ctx,0,-80,12,cfg.color);}
    else if(type==='frostTotem'){polygon(ctx,[[-12,3],[-14,-74],[14,-74],[12,3]],'#826f60');for(const yy of [-22,-45,-69])polygon(ctx,[[-27,yy-8],[0,yy],[27,yy-8],[18,yy+7],[-18,yy+7]],'#ddcdb1');crystal(ctx,0,-87,12,cfg.color);}
    else if(type==='frostAurora'){for(const a of [-1,1])polygon(ctx,[[a*28,0],[a*21,-66],[a*14,-66],[a*13,0]],'#768b87');ellipse(ctx,0,-70,35,12,'#152c33');ctx.strokeStyle=cfg.color;ctx.lineWidth=4;ctx.stroke();crystal(ctx,0,-48,28,cfg.color);}
    else if(type==='frostBlizzard'){ellipse(ctx,0,-13,31,13,'#9faab6');for(const xx of [-25,0,25])crystal(ctx,xx,-27,26,cfg.color);}
    else if(type==='frostObelisk'){polygon(ctx,[[-15,0],[-17,-72],[0,-98],[17,-72],[15,0]],'#656479');crystal(ctx,0,-52,28,cfg.color);}
    else if(type==='frostGlacier'){for(const xx of [-28,0,28])crystal(ctx,xx,-27,xx===0?70:43,cfg.color);ellipse(ctx,0,-27,15,15,'#dcf4e5');}
    else {polygon(ctx,[[-23,0],[-17,-38],[17,-38],[23,0]],'#676d79');crystal(ctx,0,-58,34,cfg.color);}
    for(let i=0;i<level;i++){ctx.fillStyle='#f0dba9';ctx.fillRect(-level*4+i*8,9,5,4);}ctx.restore();return true;
  };
  for(const id of Object.keys(ns.config.units).filter(id=>ns.config.units[id].frostland))ns.systems.ArtSystem.PREVIEW_BOUNDS['unit:'+id]={left:120,top:165,width:148,height:124};
  for(const id of Object.keys(ns.config.buildings).filter(id=>ns.config.buildings[id].frostland))ns.systems.ArtSystem.PREVIEW_BOUNDS['building:'+id]={left:145,top:164,width:95,height:125};
})(globalThis.TowerFrontier);
