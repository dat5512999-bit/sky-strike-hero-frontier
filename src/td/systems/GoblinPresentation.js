(function(ns){
  'use strict';
  const Art=ns.systems.ArtSystem,proto=Art.prototype,TAU=Math.PI*2;
  const towers=['goblinGenerator','goblinTurret','goblinMortar','goblinSnare','goblinRecycler','goblinCooler','goblinSiege'];
  const fxPath='assets/td/goblin/spell-effects-v1.png',iconPath='assets/td/goblin/skill-icons-v2.png';
  class GoblinPresentation{
    static assets(art){
      if(!art)return [];
      art.goblinSpellAtlas||=art.load(fxPath);art.goblinSkillIcons||=art.load(iconPath);
      return [art.goblinSpellAtlas,art.goblinSkillIcons];
    }
    static sprite(ctx,image,cell,x,y,w,h,alpha=1,angle=0){
      if(!image?.ready||w<=0||h<=0||alpha<=0)return false;
      ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(angle);
      ctx.drawImage(image,cell%2*image.width/2,Math.floor(cell/2)*image.height/2,image.width/2,image.height/2,-w/2,-h/2,w,h);ctx.restore();return true;
    }
    static arc(ctx,a,b,age,alpha=1){
      ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle='#87fff1';ctx.lineWidth=2;ctx.shadowColor='#22d4c8';ctx.shadowBlur=7;ctx.beginPath();
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      for(let i=0;i<=8;i++){const t=i/8,j=(i===0||i===8)?0:Math.sin(i*4.2+age*23)*8,x=a.x+dx*t-dy/len*j,y=a.y+dy*t+dx/len*j;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();ctx.restore();
    }
    static sparks(ctx,x,y,t,count=12,r=65){
      ctx.save();ctx.strokeStyle='#ffd494';ctx.lineWidth=1.8;ctx.globalAlpha*=1-t;
      for(let i=0;i<count;i++){const a=i*2.39996,d=(.25+t)*r*(.5+(i%4)*.15),px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.5-25*Math.sin(t*Math.PI);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-Math.cos(a)*6,py-4);ctx.stroke();}ctx.restore();
    }
    static draw(ctx,v,hero){
      if(!['goblin-modify','goblin-cool','goblin-deploy','goblin-overload'].includes(v.type))return false;
      const game=hero.synergy?.game,image=this.assets(game?.art)[0];
      if(!image?.ready)return false; // Existing vector renderer remains the loading/error fallback.
      const t=Math.min(1,v.age/v.duration),fade=1-t,mobile=game?.feedback?.mobile;
      ctx.save();ctx.globalAlpha=fade;
      if(v.type==='goblin-modify'){
        const p=v.target||v;
        this.arc(ctx,{x:v.x,y:v.y-32},{x:p.x,y:p.y-40},v.age,.85);
        this.sprite(ctx,image,1,p.x,p.y-40,75,75,.65, t*.8);
        this.sparks(ctx,p.x,p.y-38,t,mobile?8:14,44);
        // Tool-like rotating teeth surround the actual modified machine, not an unrelated target.
        ctx.save();ctx.translate(p.x,p.y-38);ctx.rotate(t*1.5);ctx.strokeStyle='#dfab63';ctx.lineWidth=3;
        for(let i=0;i<8;i++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(23,-4);ctx.lineTo(31,-4);ctx.lineTo(31,4);ctx.stroke();}ctx.restore();
      }else if(v.type==='goblin-cool'){
        const r=(v.radius||112)*(.2+.8*t),count=mobile?5:8;
        for(let i=0;i<count;i++){const a=i*TAU/count;this.sprite(ctx,image,0,v.x+Math.cos(a)*r*.78,v.y-18+Math.sin(a)*r*.43-t*22,64+38*t,54+38*t,.52,a*.12);}
        this.sprite(ctx,image,0,v.x,v.y-25,105+70*t,75+45*t,.38);
      }else if(v.type==='goblin-deploy'){
        this.sprite(ctx,image,3,v.x+28,v.y+4,125+90*t,70+35*t,.8);
        this.sprite(ctx,image,1,v.x+28,v.y-25,75,85,Math.max(0,1-t*2)*.6);
        this.sparks(ctx,v.x+28,v.y-14,t,mobile?8:14,60);
      }else{
        this.sprite(ctx,image,1,v.x,v.y-25,150+90*t,130+70*t,.6);
        this.sprite(ctx,image,3,v.x,v.y+6,180+120*t,80+40*t,.45);
        const powered=(game?.build?.items||[]).filter(item=>item.networkPowered&&!item.retired).slice(0,mobile?5:10);
        for(const item of powered){this.arc(ctx,{x:v.x,y:v.y-30},{x:item.x,y:item.y-42},v.age,.6);this.sprite(ctx,image,1,item.x,item.y-40,65,75,.65);}
        this.sparks(ctx,v.x,v.y-30,t,mobile?10:18,100);
      }
      ctx.restore();return true;
    }
  }
  // Wrap after cosmetic/faction renderers so presentation state survives the full chain.
  const previous=proto.drawBuilding;
  proto.drawBuilding=function(ctx,type,x,y,level,branch,motion){
    if(!towers.includes(type))return previous.apply(this,arguments);
    const item=motion||this.game?.build?.items?.find(o=>o.kind==='building'&&o.type===type&&o.x===x&&o.y===y);
    if(!item)return previous.apply(this,arguments); // Stable card preview, no construction pose.
    const age=item.visualAge||0,built=Math.min(1,age/.65),recoil=(item.networkCooling?0:item.fireFlash)||0;
    const image=GoblinPresentation.assets(this)[0],cfg=ns.config.buildings[type],time=age;
    ctx.save();ctx.translate(x,y);ctx.scale(1,.6+.4*(1-Math.pow(1-built,3)));ctx.globalAlpha*=.4+.6*built;
    ctx.translate(-Math.cos(item.aim||0)*recoil*7,-Math.sin(item.aim||0)*recoil*4);ctx.translate(-x,-y);
    let drawn;try{drawn=previous.call(this,ctx,type,x,y,level,branch,item);}finally{ctx.restore();}
    if(!drawn)return false;
    ctx.save();
    if(built<1){GoblinPresentation.sprite(ctx,image,3,x,y+5,95+40*built,55,1-built);GoblinPresentation.sparks(ctx,x,y-20,built,8,40);}
    if(recoil>0&&!cfg.supportOnly){
      const a=item.aim||0,px=x+Math.cos(a)*30,py=y-43+Math.sin(a)*12;
      GoblinPresentation.sprite(ctx,image,2,px,py,38+recoil*22,30+recoil*18,recoil,a);
    }
    if(item.networkCooling){GoblinPresentation.sprite(ctx,image,0,x+10,y-65-(time%1)*16,58,65,.28);}
    else if(item.networkOverloaded){GoblinPresentation.sprite(ctx,image,1,x,y-42,68,72,.25+.15*Math.sin(time*14));}
    else if(item.networkPowered){ctx.strokeStyle='#79d9c5';ctx.globalAlpha=.25+.12*Math.sin(time*3);ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y-43,12,6,0,0,TAU);ctx.stroke();}
    if(item.engineerBoost>0){ctx.globalAlpha=.48+.2*Math.sin(time*12);ctx.strokeStyle='#c4ffe8';ctx.lineWidth=2.5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.ellipse(x,y-42,29,12,0,0,TAU);ctx.stroke();ctx.setLineDash([]);}
    ctx.restore();return true;
  };
  // Full source footprint including the siege rack's tall rockets and wide legs.
  const crops={goblinGenerator:[152,194,80,98],goblinTurret:[151,199,82,93],goblinMortar:[151,191,82,101],goblinSnare:[153,196,78,96],goblinRecycler:[143,186,102,106],goblinCooler:[140,184,104,108],goblinSiege:[130,158,124,134]};
  for(const [type,[left,top,width,height]] of Object.entries(crops))Art.PREVIEW_BOUNDS['building:'+type]={left,top,width,height};
  const core=proto.coreStatus;
  proto.coreStatus=function(type){const s=core.apply(this,arguments);if(type==='goblin'){const list=[...GoblinPresentation.assets(this),this.goblinBuildingImage('a'),this.goblinBuildingImage('b')];s.total+=list.length;s.loaded+=list.filter(i=>i.ready).length;s.failed=s.failed||list.some(i=>i.failed);s.ready=s.ready&&list.every(i=>i.ready);}return s;};
  const preload=proto.preloadFaction;
  proto.preloadFaction=function(type){if(type==='goblin'){this.goblinBuildingImage('a');this.goblinBuildingImage('b');GoblinPresentation.assets(this);}return preload.apply(this,arguments);};
  const failures=proto.failedAssets,retry=proto.retryFailed;
  const extra=art=>[art.goblinSpellAtlas,art.goblinSkillIcons,...Object.values(art.goblinBuildingImages||{})].filter(Boolean);
  proto.failedAssets=function(){return [...new Set([...failures.apply(this,arguments),...extra(this).filter(i=>i.failed)])];};
  proto.retryFailed=function(){retry.apply(this,arguments);for(const image of extra(this))if(image.failed){image.failed=false;image.attempts=0;this.request(image);}};
  ns.systems.GoblinPresentation=GoblinPresentation;
})(globalThis.TowerFrontier);
