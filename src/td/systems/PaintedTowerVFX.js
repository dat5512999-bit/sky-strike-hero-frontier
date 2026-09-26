(function(ns){
  'use strict';
  const PATH='assets/td/tower-effects-painted-v2.png',MAGIC_PATH='assets/td/tower-magic-effects-v2.png',TAU=Math.PI*2;
  const clamp=t=>Math.max(0,Math.min(1,t));
  // Atlas cells are materials, not animation frames. Contact, debris and residual
  // layers animate independently, using the same technique as FrostlandSpellArt.
  const profiles={
    'royal-bolt':[0,8,48,68,'#ffe5a3'], 'volley-bolt':[0,8,43,64,'#ffd074'], 'lion-lance':[0,8,70,88,'#fff0bb'],
    'steel-ice':[1,9,53,78,'#a7e7ff'], 'moon-crystal':[1,9,56,84,'#adceff'],
    'leaf-lightning':[0,1,62,90,'#9ffff0',true], 'tribal-lightning':[0,1,72,100,'#8edfff',true], 'thunder-lance':[0,1,90,110,'#e4ffff',true],
    'root-seed':[2,12,55,90,'#b9ec74'], wraith:[3,13,62,82,'#cbb0ff'], 'wraith-chain':[3,13,63,84,'#debaff'],
    'soul-scythe':[4,13,52,98,'#efadff'], 'plague-spore':[2,3,62,118,'#aadd65',true],
    boulder:[5,10,69,120,'#d4ae7c'], 'earth-shock':[5,10,48,104,'#e6b080'],
    rivet:[6,8,43,66,'#ffc58c'], 'rail-rivet':[6,14,64,80,'#b2fff0'],
    'steam-shell':[6,11,58,116,'#ffc591'], 'siege-shell':[6,11,72,138,'#ffb86e'], rocket:[7,11,74,136,'#ffab70'],
    snare:[14,14,42,88,'#a2efdc'], 'electric-snare':[14,14,51,96,'#befff8'], 'ember-shell':[7,11,55,115,'#ffb775'],
    'paint-frostCrystal':[1,9,54,83,'#acffff'], 'paint-frostBlizzard':[9,9,58,122,'#c4f4ff'],
    'paint-frostBallista':[1,9,77,106,'#ddfbff'], 'paint-frostObelisk':[1,9,56,94,'#c6bbff'],
    'paint-frostAurora':[1,9,66,88,'#b4ffe3'], 'paint-frostGlacier':[9,9,75,155,'#b2efff'],
    'paint-nagaTidegate':[15,15,58,88,'#97fff2'], 'paint-nagaShellBastion':[15,15,78,106,'#b6fff5'], 'paint-nagaMantaAerie':[15,15,68,98,'#9affed']
  };
  const extra=['frostCrystal','frostBlizzard','frostBallista','frostObelisk','frostAurora','frostGlacier','nagaTidegate','nagaShellBastion','nagaMantaAerie'];
  const supports={supply:[8,'#ffe7ad'],battleflag:[8,'#ffdc95'],armoryForge:[8,'#ffc579'],barracks:[8,'#ffe4a6'],grove:[12,'#bce58b'],crypt:[13,'#ceb3ff'],graveyard:[13,'#cbb1ff'],moonwell:[9,'#bfdfff'],warDrum:[10,'#edb983'],goblinGenerator:[14,'#aeffed'],goblinRecycler:[8,'#ebd698'],goblinCooler:[1,'#b5fffb'],bombWorkshop:[11,'#ffc489'],frostTotem:[9,'#c0f5ff'],nagaAbyssShrine:[15,'#aafff0']};
  function scope(ctx,draw){ctx.save();try{draw();}finally{ctx.restore();}}
  class PaintedTowerVFX{
    static key(tower){return extra.includes(tower.type)?'paint-'+tower.type:null;}
    static texture(art,magic=false){
      const slot=magic?'towerMagicAtlas':'towerPaintedAtlas';
      if(!art)return null;if(art[slot]){art[slot].vfxColumns=magic?2:4;return art[slot];}
      if(typeof Image==='undefined'||typeof art.load!=='function')return null;
      const image=art[slot]=art.load(magic?MAGIC_PATH:PATH);image.vfxColumns=magic?2:4;return image;
    }
    static sprite(ctx,image,cell,x,y,w,h,alpha=1,rotation=0){
      if(!image?.ready||alpha<=0||w<=0||h<=0)return;
      // Round cell boundaries so fractional atlas dimensions never bleed a neighbour.
      const columns=image.vfxColumns||4,col=cell%columns,row=Math.floor(cell/columns),sx=Math.round(col*image.width/columns),sy=Math.round(row*image.height/columns),sw=Math.round((col+1)*image.width/columns)-sx,sh=Math.round((row+1)*image.height/columns)-sy;
      scope(ctx,()=>{ctx.globalAlpha*=clamp(alpha);ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(image,sx,sy,sw,sh,-w/2,-h/2,w,h);});
    }
    static glow(ctx,x,y,r,color,alpha){
      if(r<=0||alpha<=0)return;scope(ctx,()=>{ctx.globalAlpha*=clamp(alpha);ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff7e6');g.addColorStop(.18,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);});
    }
    static impact(ctx,image,profile,x,y,t,radius,reduced){
      const [,cell,,base,color]=profile,expand=1-Math.pow(1-t,3),size=Math.min(155,Math.max(base,(radius||0)*1.65)),fade=Math.pow(1-t,1.45);
      // The main painted core expands quickly; the low mist and debris lag behind.
      this.sprite(ctx,image,cell,x,y-8,size*(.38+expand*.7),size*(.38+expand*.7),fade*.94);
      if(reduced)return;
      this.glow(ctx,x,y-4,17+size*.23,color,Math.exp(-t*16)*.5);
      this.sprite(ctx,image,cell,x,y+12,size*(.7+t*.7),size*(.24+t*.12),Math.sin(t*Math.PI)*.2);
      const count=cell===11||cell===10?5:3;
      for(let i=0;i<count;i++){const a=i*2.39996,dist=size*(.2+(i%3)*.08)*expand,h=8+(i%3)*5;
        this.sprite(ctx,image,profile[0],x+Math.cos(a)*dist,y+Math.sin(a)*dist*.4-20*Math.sin(t*Math.PI),h*(1-t*.5),h*(1-t*.5),fade*.55,a+t*1.4);
      }
    }
    static projectile(ctx,p){
      const profile=profiles[p.towerVfx];if(!profile)return false;
      const game=p.owner?.synergy?.game,image=this.texture(game?.art,!!profile[5]);if(!image?.ready)return false;
      if(!p.active)return true;const reduced=!!game.feedback?.reducedFx||!!(game.feedback?.mobile&&game.projectiles?.length>48);
      if(p.hitResolved&&!(ns.entities.Projectile.claimImpact||ns.entities.Projectile.claimEffect)())return true;
      scope(ctx,()=>{
        if(p.hitResolved){
          const t=clamp(1-p.trail/.32);
          if(p.chain){
            const points=p.chainPoints||[],visible=Math.min(points.length-1,Math.floor(t*points.length*2)+1);
            for(let i=1;i<=visible;i++){
              if(i>1&&!(ns.entities.Projectile.claimImpact||ns.entities.Projectile.claimEffect)())break;
              const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),local=clamp((t-(i-1)*.055)*1.18);
              // A textured moving front rides a short luminous strand; it is not
              // a repeated row of opaque impact stickers along the whole chain.
              scope(ctx,()=>{ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-t)*.42;ctx.strokeStyle=profile[4];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2-dy*.08,(a.y+b.y)/2+dx*.08,b.x,b.y);ctx.stroke();});
              const travel=clamp(local*5),px=a.x+dx*travel,py=a.y+dy*travel;
              if(!reduced)this.sprite(ctx,image,profile[0],px,py,Math.min(58,len*.7),34,(1-t)*.8,angle);
              this.impact(ctx,image,profile,b.x,b.y,local,0,reduced);
            }
          }else{const point=p.towerContact||p.chainPoints?.[1]||{x:p.x,y:p.y-20};this.impact(ctx,image,profile,point.x,point.y,t,p.splash,reduced);}
          return;
        }
        const dx=(p.target?.x??p.x)-p.startX,dy=(p.target?.y??p.y)-p.startY,len=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx),progress=clamp(Math.hypot(p.x-p.startX,p.y-p.startY)/len);
        const lob=['boulder','steam-shell','siege-shell','ember-shell','paint-frostGlacier'].includes(p.towerVfx),lift=lob?Math.sin(progress*Math.PI)*Math.min(64,len*.25):0,x=p.x,y=p.y-20-lift;
        const size=profile[2],tall=[4,9,14,15].includes(profile[0]),h=tall?size*.8:size*.66;
        if(!reduced)this.sprite(ctx,image,profile[0],x-Math.cos(angle)*11,y-Math.sin(angle)*11,size*1.15,h*.8,.17,angle);
        this.sprite(ctx,image,profile[0],x,y,size,h,1,angle);
        if(p.soulCharged)this.glow(ctx,x+8,y,20,profile[4],.4);
      });return true;
    }
    static building(ctx,tower){
      const support=supports[tower.type],key=ns.systems.TowerVFX.key(tower),profile=profiles[key];if(!support&&!profile)return false;
      const game=tower.synergy?.game,image=this.texture(game?.art);if(!image?.ready)return false;
      if(tower.retired||game.feedback?.reducedFx)return true;
      const time=tower.visualAge||0,fire=clamp(tower.fireFlash||0),event=clamp(((tower.supportVfxUntil||0)-time)/.75);
      const cfg=tower.config(),candidates=(game.build?.items||[]).concat(game.summons||[],game.hero?[game.hero]:[]);
      const recipients=support?candidates.filter(t=>t!==tower&&t.active!==false&&!t.retired&&(t.supportDamageSource===tower||t.supportHasteSource===tower||t.flagSource===tower&&t.flagRate>0)):[];
      const working=event>0||recipients.length>0||tower.type==='warDrum'&&tower.skillPulse>0||tower.type==='goblinGenerator'&&(game.goblinNetwork?.links||[]).some(([core])=>core===tower)||tower.type==='goblinCooler'&&tower.networkPowered&&game.goblinNetwork?.cooling>0||tower.type==='frostTotem'&&candidates.some(t=>t!==tower&&t.config?.().frost>0&&ns.utils.distance(t,tower)<=cfg.range);
      if(!fire&&!working)return true;
      if(!ns.entities.Projectile.claimEffect())return true;
      scope(ctx,()=>{
        if(profile&&fire&&!tower.networkCooling){this.glow(ctx,tower.x,tower.y-48,13+fire*13,profile[4],fire*.38);this.sprite(ctx,image,profile[1],tower.x,tower.y-48,30,30,fire*.32);}
        if(!support||!working)return;
        const [cell,color]=support,pulse=.5+.5*Math.sin(time*2.4);
        this.sprite(ctx,image,cell,tower.x,tower.y-35,50,58,event?event*.55:.12+pulse*.1);
        this.glow(ctx,tower.x,tower.y-32,27,color,event*.25);
        for(const target of recipients.slice(0,game.feedback?.mobile?2:4)){
          const t=(time*.6)%1,x=tower.x+(target.x-tower.x)*t,y=tower.y-35+(target.y-tower.y)*t-Math.sin(t*Math.PI)*17;
          this.sprite(ctx,image,cell,x,y,17,22,Math.sin(t*Math.PI)*.45);this.glow(ctx,target.x,target.y-15,15,color,.09+pulse*.08);
        }
        if(event&&(tower.type==='supply'||tower.type==='goblinRecycler')){ctx.globalAlpha=event;ctx.fillStyle=color;ctx.strokeStyle='#183039';ctx.lineWidth=3;ctx.font='bold 12px sans-serif';ctx.textAlign='center';const label=(tower.type==='supply'?'省 ':'+')+tower.supportVfxValue+'G',y=tower.y-64-(1-event)*16;ctx.strokeText(label,tower.x,y);ctx.fillText(label,tower.x,y);}
      });return true;
    }
  }
  PaintedTowerVFX.PATH=PATH;PaintedTowerVFX.MAGIC_PATH=MAGIC_PATH;PaintedTowerVFX.PROFILES=profiles;PaintedTowerVFX.VERSION='2.0.0';ns.systems.PaintedTowerVFX=PaintedTowerVFX;
  // Register with the same load/failure/retry contract as the frost hero atlas.
  const proto=ns.systems.ArtSystem?.prototype;
  if(proto){
    const preload=proto.preloadFaction,core=proto.coreStatus,failed=proto.failedAssets,retry=proto.retryFailed;
    proto.preloadFaction=function(){PaintedTowerVFX.texture(this);PaintedTowerVFX.texture(this,true);return preload.apply(this,arguments);};
    proto.coreStatus=function(){const status=core.apply(this,arguments);for(const image of [PaintedTowerVFX.texture(this),PaintedTowerVFX.texture(this,true)])if(image){status.total++;if(image.ready)status.loaded++;status.ready=status.ready&&image.ready;status.failed=status.failed||image.failed;}return status;};
    proto.failedAssets=function(){const list=failed.apply(this,arguments);for(const image of [this.towerPaintedAtlas,this.towerMagicAtlas])if(image?.failed)list.push(image);return list;};
    proto.retryFailed=function(){retry.apply(this,arguments);for(const image of [this.towerPaintedAtlas,this.towerMagicAtlas])if(image?.failed){image.failed=false;image.attempts=0;this.request(image);}};
  }
})(globalThis.TowerFrontier);
