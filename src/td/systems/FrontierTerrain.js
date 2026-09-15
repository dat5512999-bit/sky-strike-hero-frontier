(function(ns){
 'use strict';
 // Static presentation only; no obstacles, placement rules or path changes.
 class FrontierTerrain {
  constructor(){this.cache=null;this.source=null;this.ground=null;}
  draw(ctx,art,build){
   const map=ns.maps&&ns.maps.definitions[ns.config.mapId],direct=map&&map.asset&&art.mapAssets&&art.mapAssets[map.id];
   if(direct){
    if(!direct.ready)return false;
    // Map pixels and world coordinates are 1:1. Camera handles every screen ratio.
    this.cache=direct;this.source=direct;this.ground=null;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.filter='contrast(1.035) saturate(1.045)';ctx.drawImage(direct,0,0);ctx.restore();
    this.drawAmbience(ctx);
    if(build&&build.pending)this.drawDeployment(ctx,build);
    return true;
   }
   if(!art.background.ready)return false;
   const ground=art.frontierGround&&art.frontierGround.ready?art.frontierGround:null;
   if(!this.cache||this.source!==art.background||this.ground!==ground){
    this.source=art.background;this.ground=ground;this.cache=document.createElement('canvas');
    this.cache.width=ns.config.width;this.cache.height=ns.config.height;this.paint(this.cache.getContext('2d'),art);
   }
   ctx.drawImage(this.cache,0,0);
   // The existing keep marks the path destination; it is presentation only.
   // Draw separately so late image loading does not rebuild the terrain cache.
   if(ns.config.mapId==='frontier'&&art.keep&&art.keep.ready&&art.drawKeep)art.drawKeep(ctx,1204,750,168);
   if(build&&build.pending)this.drawDeployment(ctx,build);
   return true;
  }
  drawAmbience(ctx){
   if(ns.config.mapId!=='beginner'||typeof ctx.createRadialGradient!=='function')return;
   const now=((globalThis.performance&&typeof globalThis.performance.now==='function'?globalThis.performance.now():Date.now())/1000),pulse=.82+Math.sin(now*4.1)*.12;
   ctx.save();ctx.globalCompositeOperation='screen';
   // Subtle live light makes the production painting read as a battlefield,
   // while the immutable map asset remains the single source of geometry.
   [[96,282,34],[410,132,30],[1390,314,34],[1412,602,30]].forEach((light,index)=>{const flicker=pulse+Math.sin(now*6.7+index*1.9)*.08,gradient=ctx.createRadialGradient(light[0],light[1],1,light[0],light[1],light[2]);gradient.addColorStop(0,'rgba(255,219,118,'+(.18*flicker)+')');gradient.addColorStop(.35,'rgba(255,140,49,'+(.09*flicker)+')');gradient.addColorStop(1,'rgba(255,95,20,0)');ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(light[0],light[1],light[2],0,Math.PI*2);ctx.fill();});
   ctx.globalAlpha=.14;ctx.strokeStyle='#9de9ff';ctx.lineWidth=1.5;ctx.lineCap='round';
   [[1044,166,46],[1060,250,34],[1085,360,40],[1084,712,45],[1112,848,38]].forEach((glint,index)=>{const drift=Math.sin(now*1.7+index)*5;ctx.beginPath();ctx.moveTo(glint[0]-glint[2]/2+drift,glint[1]);ctx.quadraticCurveTo(glint[0],glint[1]+4,glint[0]+glint[2]/2+drift,glint[1]);ctx.stroke();});
   ctx.restore();
  }
  drawDeployment(ctx,build){
   // Same road and clearance as BuildSystem; drawing never changes legality.
   const path=ns.config.path,w=ns.config.width,h=ns.config.height,map=ns.maps.definitions[ns.config.mapId];
   ctx.save();
   if(ns.config.buildAreas){
    ctx.fillStyle='#5ad88910';ctx.strokeStyle='#7aea9a66';ctx.lineWidth=1.5;ctx.setLineDash([8,8]);
    ns.config.buildAreas.forEach(area=>{ctx.beginPath();area.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();});ctx.setLineDash([]);
   }
   ctx.strokeStyle='#db624f32';ctx.lineWidth=(ns.config.roadClearance||55)*2;
   ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
   path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
   ctx.strokeStyle='#f3cf8666';ctx.lineWidth=1;ctx.setLineDash([7,7]);
   ctx.strokeRect(42,62,w-84,h-108);ctx.setLineDash([]);
   for(const zone of map.zones||[]){
    if(!build.canPlaceAt(zone.x,zone.y,build.pending.kind))continue;
    ctx.textAlign='center';ctx.font='11px Microsoft JhengHei';
    ctx.shadowColor='#08100b';ctx.shadowBlur=5;ctx.fillStyle='#e1d8af';
    ctx.fillText(zone.hint,zone.x,zone.y+60);
   }
   ctx.restore();
  }
  paint(ctx,art){
   const w=ns.config.width,h=ns.config.height,image=art.background;
   if(this.ground)ctx.drawImage(this.ground,0,0,w,h);
   else{
    const c=document.createElement('canvas');c.width=130;c.height=80;
    c.getContext('2d').drawImage(image,.36*image.naturalWidth,.31*image.naturalHeight,.13*image.naturalWidth,.08*image.naturalHeight,0,0,130,80);
    ctx.fillStyle=ctx.createPattern(c,'repeat');ctx.fillRect(0,0,w,h);
    ctx.drawImage(image,0,0,image.naturalWidth,.045*image.naturalHeight,0,0,w,40);
    ctx.drawImage(image,0,.96*image.naturalHeight,image.naturalWidth,.04*image.naturalHeight,0,h-36,w,36);
   }
   const path=ns.config.path;
   ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
   path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
   // Soft shoulders stay inside the existing 55-unit road exclusion.
   ctx.save();ctx.shadowColor='#23301988';ctx.shadowBlur=9;ctx.shadowOffsetY=3;
   ctx.strokeStyle='#77714d33';ctx.lineWidth=86;ctx.stroke();ctx.restore();
   ctx.strokeStyle='#8c7d5755';ctx.lineWidth=78;ctx.stroke();
   ctx.strokeStyle='#ad966bc9';ctx.lineWidth=70;ctx.stroke();
   if(this.ground){
    // Reuse the worn meadow texture for the road, instead of a flat tan ribbon.
    const tile=document.createElement('canvas');tile.width=160;tile.height=108;
    tile.getContext('2d').drawImage(this.ground,this.ground.naturalWidth*.08,this.ground.naturalHeight*.11,this.ground.naturalWidth*.16,this.ground.naturalHeight*.12,0,0,160,108);
    ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle=ctx.createPattern(tile,'repeat');ctx.lineWidth=68;ctx.stroke();ctx.restore();
   }
   ctx.strokeStyle='#c2a87825';ctx.lineWidth=57;ctx.stroke();
   let seed=6193;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   // Deterministic gravel follows the same route, with no per-frame generation.
   path.slice(1).forEach((p,i)=>{
    const a=path[i],dx=p.x-a.x,dy=p.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
    for(let j=0;j<len*7;j++){
     const t=random(),side=(random()-.5)*69,x=a.x+dx*t+nx*side,y=a.y+dy*t+ny*side;
     ctx.fillStyle=random()>.45?'#ead4a228':'#51493622';
     ctx.beginPath();ctx.ellipse(x,y,.4+random()*2.1,.3+random()*.9,random()*3,0,Math.PI*2);ctx.fill();
    }
    // Feather the road shoulders with soil rather than a ruler-straight border.
    for(let j=0;j<len*.9;j++){
     const t=random(),side=(random()>.5?1:-1)*(31+random()*12);
     ctx.fillStyle=random()>.5?'#ae97664a':'#77734740';ctx.beginPath();
     ctx.ellipse(a.x+dx*t+nx*side,a.y+dy*t+ny*side,1+random()*3,1+random()*2,random()*3,0,Math.PI*2);ctx.fill();
    }
    for(const side of [-14,14]){
     ctx.beginPath();ctx.moveTo(a.x+nx*side,a.y+ny*side);ctx.lineTo(p.x+nx*side,p.y+ny*side);
     ctx.strokeStyle='#66573713';ctx.lineWidth=2;ctx.stroke();
    }
   });
   // Ground inscriptions, not impassable structures.
   for(const zone of ns.maps.definitions.frontier.zones){
    ctx.save();ctx.translate(zone.x,zone.y);ctx.strokeStyle='#d6cd9250';ctx.lineWidth=1;
    ctx.setLineDash([4,10]);ctx.beginPath();ctx.ellipse(0,0,49,28,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.textAlign='center';ctx.shadowColor='#07130c';ctx.shadowBlur=4;ctx.fillStyle='#e5d9a3';
    ctx.font='600 11px Microsoft JhengHei';ctx.fillText(zone.name,0,43);ctx.restore();
   }
   ctx.save();ctx.textAlign='left';ctx.shadowColor='#000';ctx.shadowBlur=5;
   ctx.font='600 12px Microsoft JhengHei';ctx.fillStyle='#e4d09d';
   ctx.fillText('敵軍入口 →',42,118);ctx.fillText('城門防線 →',1120,815);
   ctx.font='11px Georgia';ctx.fillStyle='#c8cda7';ctx.fillText('SILVERLEAF PASS',40,72);ctx.restore();
   const shade=ctx.createRadialGradient(w*.5,h*.45,w*.15,w*.5,h*.5,w*.67);
   shade.addColorStop(0,'#17291500');shade.addColorStop(1,'#0a160d45');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  }
 }
 ns.systems.FrontierTerrain=FrontierTerrain;
})(globalThis.TowerFrontier);
