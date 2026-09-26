(function(ns){
  'use strict';
  const PATH='assets/td/soldier-effects-v1.png',clamp=t=>Math.max(0,Math.min(1,t));
  // Presentation keys never replace damage styles, targeting, or equipment procs.
  const groups={
    slash:['rogue','skeleton','boneRider','orc','frostWolf'],
    thrust:['halberdier','nagaTideguard'], shield:['shield','nagaShellbreaker'],
    slam:['golem','soulsteel','minotaur','frostBear','frostMammoth','royalCommander'],
    tideSlash:['nagaDeepWargod'], charge:['knight','boarRider'], breath:['dragon'],
    arrow:['hunter','centaur','frostHunter'], bullet:['musketeer','bountyHunter','goblinEngineer','goblinGunner','goblinRiveter','goblinRecycler'],
    cannon:['pirate','goblinMech'], lightning:['kingdomMage','shaman'], poison:['alchemist','nagaVenomStalker'],
    nature:['dryad','treant','beastmaster'], moon:['moonblade'], spirit:['banshee'],
    ice:['frostBird','frostShaman'], arcane:['arcanist'], tide:['nagaMantaRaider']
  };
  const keys=Object.fromEntries(Object.entries(groups).flatMap(([key,types])=>types.map(type=>[type,key])));
  // atlas, flight cell, impact atlas, impact cell, width, impact size, colour
  const profiles={
    slash:['unit',0,'unit',1,65,52,'#e9e4d6'],thrust:['main',0,'unit',1,58,48,'#ffe5b6'],
    shield:['unit',1,'unit',1,54,65,'#ffe3a0'],slam:['unit',3,'unit',3,64,88,'#d4b083'],
    tideSlash:['main',15,'main',15,82,105,'#80ffeb'],charge:['unit',3,'unit',3,62,72,'#e9c08a'],
    breath:['unit',2,'unit',2,100,103,'#7bffbf'],arrow:['main',0,'unit',1,38,38,'#f8dca0'],
    bullet:['main',6,'unit',1,30,40,'#ffc67b'],cannon:['main',7,'main',11,47,87,'#ffb06a'],
    lightning:['magic',0,'magic',1,46,60,'#a5efff'],poison:['magic',2,'magic',3,37,58,'#c4eb76'],
    nature:['main',2,'main',12,38,58,'#a4e393'],moon:['unit',0,'unit',1,43,49,'#c9d9ff'],
    spirit:['main',3,'main',13,44,62,'#d7b1ff'],ice:['main',1,'main',9,43,59,'#b4f3ff'],
    arcane:['main',3,'main',13,40,64,'#d3b5ff'],tide:['main',15,'main',15,44,58,'#a5fff0']
  };
  const melee=new Set(['slash','thrust','shield','slam','tideSlash','charge']);
  function scope(ctx,fn){ctx.save();try{fn();}finally{ctx.restore();}}
  class UnitVFX{
    static trackCharge(p){
      if(p.unitVfx!=='charge'||p.owner?.strikes!==p.unitVfxStrike)return;
      const e=p.owner.excursion;if(!e||e.vfxReturning||e.time<=0)return;
      // Follow the real projectile's arrival/cancellation, not the old fixed
      // 0.85s lunge. These fields affect only the drawn body, never its anchor.
      if(p.target){e.x=p.target.x;e.y=p.target.y;}
      const distance=Math.hypot(e.x-p.startX,e.y-p.startY),travel=Math.hypot(p.x-p.startX,p.y-p.startY);
      e.vfxProgress=clamp(travel/Math.max(1,distance-(p.target?.radius||0)));
      if(p.hitResolved||!p.active){e.vfxPeak=p.hitResolved?1:e.vfxProgress;e.vfxProgress=e.vfxPeak;e.vfxReturning=true;e.time=e.max=.18;}
    }
    static key(owner){return owner?.kind==='unit'&&!ns.config.units[owner.type]?.supportOnly?(keys[owner.type]||null):null;}
    static texture(art,which='unit'){
      if(which!=='unit')return ns.systems.PaintedTowerVFX?.texture(art,which==='magic');
      if(!art)return null;
      if(!art.soldierAtlas&&typeof Image!=='undefined'&&typeof art.load==='function')art.soldierAtlas=art.load(PATH);
      if(art.soldierAtlas)art.soldierAtlas.vfxColumns=2;
      return art.soldierAtlas;
    }
    static ready(owner,key=this.key(owner)){
      const p=profiles[key],art=owner?.synergy?.game?.art;
      return !!(p&&this.texture(art,p[0])?.ready&&this.texture(art,p[2])?.ready);
    }
    static sprite(ctx,art,atlas,cell,x,y,w,h,alpha=1,angle=0){
      ns.systems.PaintedTowerVFX.sprite(ctx,this.texture(art,atlas),cell,x,y,w,h,alpha,angle);
    }
    static impact(ctx,p,profile,point,t,reduced){
      const art=p.owner.synergy.game.art,fade=Math.pow(1-t,1.6),expand=1-Math.pow(1-t,3),ultimate=!!ns.config.units[p.owner.type]?.ultimate;
      const size=Math.min(ultimate?118:90,profile[5]+(p.soulCharged||p.drumBurst?12:0)),angle=Math.atan2(point.y-(p.startY-22),point.x-p.startX);
      const wide=['slam','charge','shield'].includes(p.unitVfx);
      this.sprite(ctx,art,profile[2],profile[3],point.x,point.y,size*(.7+expand*.55),size*(wide?.72:1)*(.7+expand*.5),fade,p.unitVfx==='breath'?angle:0);
      if(reduced)return;
      ns.systems.PaintedTowerVFX.glow(ctx,point.x,point.y,18+size*.12,profile[6],Math.exp(-t*18)*.4);
      const accent={frostBear:9,frostMammoth:9,golem:13,soulsteel:13,royalCommander:8,nagaShellbreaker:15}[p.owner.type];
      if(accent!==undefined)this.sprite(ctx,art,'main',accent,point.x,point.y-6,size*.85,size*.85,fade*.7);
      if(['slash','thrust','tideSlash','moon'].includes(p.unitVfx))this.sprite(ctx,art,profile[0],profile[1],point.x,point.y-4,size*1.25,size,fade,angle-.5+t*.8);
      this.sprite(ctx,art,profile[2],profile[3],point.x,point.y+12,size*(1+t*.5),size*.28,Math.sin(t*Math.PI)*.19);
    }
    static projectile(ctx,p){
      const profile=profiles[p.unitVfx];if(!profile||!this.ready(p.owner,p.unitVfx))return false;
      if(!p.active)return true;
      const game=p.owner.synergy.game,art=game.art,reduced=!!game.feedback?.reducedFx||!!(game.feedback?.mobile&&game.projectiles?.length>48);
      const dx=(p.target?.x??p.x)-p.startX,dy=(p.target?.y??p.y)-p.startY,len=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx);
      scope(ctx,()=>{
        if(p.hitResolved){
          const t=clamp(1-p.trail/.32);if(t>=1)return;
          // chainPoints are frozen at damage resolution, not attached to moving corpses.
          const points=p.chainPoints?.slice(1)||[p.unitContact||{x:p.x,y:p.y-22}];
          for(let i=0;i<points.length;i++){
            if(!(ns.entities.Projectile.claimImpact||ns.entities.Projectile.claimEffect)())break;
            const point=points[i];
            this.impact(ctx,p,profile,point,t,reduced);
            if(p.chain&&!reduced&&i>0){
              const a=points[i-1],b=point;
              if(p.unitVfx==='arrow'){
                // Piercing arrows remain a straight streak, never a zig-zag lightning chain.
                ctx.globalAlpha=(1-t)*.65;ctx.strokeStyle=profile[6];ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1;
              }else this.sprite(ctx,art,profile[0],profile[1],a.x+(b.x-a.x)*clamp(t*5),a.y+(b.y-a.y)*clamp(t*5),profile[4],profile[4]*.65,1-t,Math.atan2(b.y-a.y,b.x-a.x));
            }
          }return;
        }
        const age=p.flightAge||0;
        if(melee.has(p.unitVfx)){
          // Keep travel/damage timings intact but don't turn a melee strike into a missile.
          if(age<.17&&!reduced&&ns.entities.Projectile.claimEffect()){
            const reach=Math.min(len*.5,32),x=p.startX+Math.cos(angle)*reach,y=p.startY-22+Math.sin(angle)*reach;
            this.sprite(ctx,art,profile[0],profile[1],x,y,profile[4],profile[4]*.8,1-age/.17,angle-.4+age*3);
          }return;
        }
        if(p.unitVfx==='breath'){
          const distance=Math.min(len,Math.max(30,Math.hypot(p.x-p.startX,p.y-p.startY)+22));
          // Atlas padding leaves a 56% visible cone; anchor its emitting tip at the mouth.
          this.sprite(ctx,art,'unit',2,p.startX+Math.cos(angle)*distance*.5,p.startY-27+Math.sin(angle)*distance*.5,distance/ .56,Math.min(108,45+distance*.3),1,angle);return;
        }
        const progress=clamp(Math.hypot(p.x-p.startX,p.y-p.startY)/len),lift=p.unitVfx==='cannon'?Math.sin(progress*Math.PI)*Math.min(45,len*.2):0;
        const flightCell=p.unitVfx==='cannon'&&p.owner.type==='pirate'?6:profile[1];
        this.sprite(ctx,art,profile[0],flightCell,p.x,p.y-22-lift,profile[4],profile[4]*.68,1,angle);
        if(!reduced&&ns.entities.Projectile.claimEffect()){
          this.sprite(ctx,art,profile[0],flightCell,p.x-Math.cos(angle)*10,p.y-22-lift-Math.sin(angle)*10,profile[4]*1.1,profile[4]*.45,.18,angle);
          if(age<.1&&['bullet','cannon'].includes(p.unitVfx))this.sprite(ctx,art,'unit',1,p.startX+Math.cos(angle)*17,p.startY-22+Math.sin(angle)*17,35,25,1-age/.1,angle);
        }
      });return true;
    }
    static support(ctx,unit){
      const game=unit.synergy?.game;if(!game||!unit.active||unit.retired)return;
      const cfg=unit.config();if(!(cfg.forgeAura||cfg.timeAura||cfg.commandHaste||cfg.ancestralAura||cfg.nagaHaste||cfg.frostAura||unit.type==='goblinRecycler'))return;
      const image=this.texture(game.art);if(!image?.ready)return;
      const recipients=(game.build?.items||[]).concat(game.hero?[game.hero]:[]).filter(t=>t!==unit&&t.active!==false&&!t.retired&&(t.supportDamageSource===unit||t.supportHasteSource===unit||unit.networkPowered&&!unit.networkCooling&&unit.engineerSupportTarget===t||cfg.frostAura&&t.frostEfficiency>0&&(t.config?.().frost||0)>0&&ns.utils.distance(t,unit)<=cfg.range));
      if(!recipients.length||!ns.entities.Projectile.claimEffect())return;
      const time=unit.synergy.clock||0,pulse=.5+.5*Math.sin(time*3),color=cfg.color||'#c9efec';
      scope(ctx,()=>{
        ns.systems.PaintedTowerVFX.glow(ctx,unit.x,unit.y-20,17,color,.1+pulse*.07);
        if(game.feedback?.reducedFx)return;
        for(const target of recipients.slice(0,game.feedback?.mobile?1:2)){
          const t=time*.7%1;this.sprite(ctx,game.art,'unit',1,unit.x+(target.x-unit.x)*t,unit.y-24+(target.y-unit.y)*t-12*Math.sin(t*Math.PI),13,13,Math.sin(t*Math.PI)*.5);
        }
      });
    }
  }
  UnitVFX.PATH=PATH;UnitVFX.VERSION='1.1.0';UnitVFX.KEYS=Object.freeze(keys);UnitVFX.PROFILES=profiles;ns.systems.UnitVFX=UnitVFX;
  const proto=ns.systems.ArtSystem?.prototype;
  if(proto){
    const preload=proto.preloadFaction,core=proto.coreStatus,failed=proto.failedAssets,retry=proto.retryFailed;
    proto.preloadFaction=function(){UnitVFX.texture(this);return preload.apply(this,arguments);};
    proto.coreStatus=function(){const s=core.apply(this,arguments),i=UnitVFX.texture(this);if(i){s.total++;if(i.ready)s.loaded++;s.ready=s.ready&&i.ready;s.failed=s.failed||i.failed;}return s;};
    proto.failedAssets=function(){const list=failed.apply(this,arguments);if(this.soldierAtlas?.failed)list.push(this.soldierAtlas);return list;};
    proto.retryFailed=function(){retry.apply(this,arguments);const i=this.soldierAtlas;if(i?.failed){i.failed=false;i.attempts=0;this.request(i);}};
  }
})(globalThis.TowerFrontier);
