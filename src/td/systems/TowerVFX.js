(function(ns){
  'use strict';
  // Presentation keys intentionally remain separate from combat style: reflected
  // spells, ice status and damage hooks continue to consume their original data.
  const TAU=Math.PI*2, clamp=n=>Math.max(0,Math.min(1,n));
  const attacks={arrow:'royal-bolt',iceward:'steel-ice',cannon:'ember-shell',barracks:'volley-bolt',ballista:'lion-lance',frost:'moon-crystal',storm:'leaf-lightning',grove:'root-seed',crypt:'wraith',soul:'soul-scythe',plague:'plague-spore',boulder:'boulder',thunderTotem:'tribal-lightning',totem:'earth-shock',goblinTurret:'rivet',goblinMortar:'steam-shell',goblinSnare:'snare',goblinSiege:'siege-shell'};
  const supports={supply:'supply',battleflag:'banner',armoryForge:'forge',graveyard:'grave',moonwell:'prism',warDrum:'drum',goblinGenerator:'power',goblinRecycler:'recycle',goblinCooler:'cool',bombWorkshop:'factory',barracks:'haste',grove:'nature',crypt:'summoner'};
  const colors={'royal-bolt':'#f7dc85','volley-bolt':'#ffcf65','lion-lance':'#fff0b6','steel-ice':'#a5dfff','moon-crystal':'#b6a8ff','leaf-lightning':'#a6fff0','thunder-lance':'#dfffff','root-seed':'#99df75',wraith:'#c6adff','wraith-chain':'#d6b6ff','soul-scythe':'#ee9fff','plague-spore':'#b8e977',boulder:'#dcb48a','earth-shock':'#f0ae66','tribal-lightning':'#74d6ff',rivet:'#ffe1a0','rail-rivet':'#b3f7ff','steam-shell':'#ffa96d','siege-shell':'#ffcc7d',rocket:'#ff9358',snare:'#9be8d6','electric-snare':'#b6ffff','ember-shell':'#ff9659'};
  function path(ctx,points,fill=false){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(fill){ctx.closePath();ctx.fill();}else ctx.stroke();}
  function ring(ctx,x,y,r,aspect=.4){ctx.beginPath();ctx.ellipse(x,y,Math.max(0,r),Math.max(0,r*aspect),0,0,TAU);ctx.stroke();}
  function gem(ctx,x,y,r){path(ctx,[[x+r,y],[x,y-r*.6],[x-r,y],[x,y+r*.6]],true);}
  function rays(ctx,x,y,r,count,phase=0){for(let i=0;i<count;i++){const a=i*TAU/count+phase;path(ctx,[[x+Math.cos(a)*r*.45,y+Math.sin(a)*r*.45],[x+Math.cos(a)*r,y+Math.sin(a)*r]]);}}
  function bolt(ctx,length,width){path(ctx,[[-length,0],[10,0]]);path(ctx,[[14,0],[3,-width],[6,0],[3,width]],true);path(ctx,[[-length,0],[-length+7,-4],[-length+4,0],[-length+7,4]]);}
  function scoped(ctx,draw){ctx.save();try{draw();}finally{ctx.restore();}}
  class TowerVFX{
    static key(tower){
      if(!tower||tower.kind!=='building')return null;
      const special={storm:{surge:'thunder-lance'},crypt:{reaper:'wraith-chain'},goblinTurret:{rail:'rail-rivet'},goblinSnare:{tesla:'electric-snare'},goblinSiege:{rocket:'rocket'}};
      return special[tower.type]?.[tower.branch]||attacks[tower.type]||ns.systems.PaintedTowerVFX?.key(tower)||null;
    }
    static projectile(ctx,p){
      if(ns.systems.PaintedTowerVFX?.projectile(ctx,p))return true;
      const key=p.towerVfx;if(!colors[key])return false;
      if(!p.active)return true;
      if(p.hitResolved&&!(ns.entities.Projectile.claimImpact||ns.entities.Projectile.claimEffect)())return true;
      const reduced=!!p.owner?.synergy?.game?.feedback?.reducedFx;
      ctx.save();
      try{
        ctx.strokeStyle=colors[key];ctx.fillStyle=colors[key];ctx.lineWidth=2;ctx.lineCap='round';ctx.shadowColor=colors[key];ctx.shadowBlur=reduced?0:5;
        if(p.hitResolved){
          const age=clamp(1-p.trail/.32);ctx.globalAlpha=1-age;
          if(p.chain){
            const points=p.chainPoints||[],visible=Math.min(points.length-1,Math.floor(age*points.length*2)+1);
            for(let i=1;i<=visible;i++){
              const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y;
              if(key==='wraith-chain'){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x-dy*.2,a.y+dx*.2,b.x+dy*.2,b.y-dx*.2,b.x,b.y);ctx.stroke();}
              else if(key==='moon-crystal'){path(ctx,[[a.x,a.y],[(a.x+b.x)/2-dy*.12,(a.y+b.y)/2+dx*.12],[b.x,b.y]]);}
              else{const points2=[[a.x,a.y]],len=Math.hypot(dx,dy)||1;for(let j=1;j<6;j++){const zig=(j%2?1:-1)*(key==='tribal-lightning'?11:5);points2.push([a.x+dx*j/6-dy/len*zig,a.y+dy*j/6+dx/len*zig]);}points2.push([b.x,b.y]);path(ctx,points2);}
              if(!reduced){gem(ctx,b.x,b.y,5);if(key==='tribal-lightning')rays(ctx,b.x,b.y,13,3,age);else ring(ctx,b.x,b.y,8+age*9);}
            }
          }else{
            const v=p.towerContact||p.chainPoints?.[1]||{x:p.x,y:p.y};ctx.translate(v.x,v.y);this.impact(ctx,p,key,age,reduced);
          }
        }else{
          const dx=(p.target?.x??p.x)-p.startX,dy=(p.target?.y??p.y)-p.startY,len=Math.hypot(dx,dy)||1,progress=clamp(Math.hypot(p.x-p.startX,p.y-p.startY)/len);
          const lob=['boulder','ember-shell','steam-shell','siege-shell'].includes(key),lift=lob?Math.sin(progress*Math.PI)*Math.min(62,len*.25):0;
          ctx.translate(p.x,p.y-20-lift);ctx.rotate(Math.atan2(dy,dx));
          this.flight(ctx,key,p.flightAge,reduced);
          if(p.soulCharged&&!reduced){ctx.strokeStyle='#fff0ff';ring(ctx,-3,0,19,.7);}
          if(p.reflected&&!reduced){ctx.strokeStyle='#e0edff';gem(ctx,-19,0,4);}
        }
      }finally{ctx.restore();}
      return true;
    }
    static flight(ctx,key,time,reduced){
      if(['royal-bolt','volley-bolt','lion-lance'].includes(key)){
        bolt(ctx,key==='lion-lance'?30:18,key==='lion-lance'?7:4);
        if(key==='volley-bolt')for(const y of [-5,5])scoped(ctx,()=>{ctx.translate(-6,y);bolt(ctx,10,2);});
        if(key==='lion-lance'){path(ctx,[[-7,0],[-15,-8],[-2,-3]],true);path(ctx,[[-7,0],[-15,8],[-2,3]],true);}
      }else if(key==='steel-ice'||key==='moon-crystal'){
        if(key==='steel-ice'){bolt(ctx,14,6);path(ctx,[[-7,-7],[4,-7],[9,0],[4,7],[-7,7]]);}
        else{scoped(ctx,()=>{ctx.rotate(time*6);gem(ctx,0,0,12);});ring(ctx,0,0,16,.7);}
        if(!reduced)for(let i=0;i<3;i++)gem(ctx,-16-i*5,Math.sin(time*12+i)*4,2);
      }else if(['leaf-lightning','tribal-lightning','thunder-lance'].includes(key)){
        if(key==='thunder-lance'){ctx.lineWidth=4;path(ctx,[[-32,0],[16,0]]);gem(ctx,12,0,7);}
        else{path(ctx,[[-22,-3],[-10,4],[-3,-6],[7,4],[16,0]]);if(key==='tribal-lightning')ring(ctx,0,0,12,.8);else{ctx.beginPath();ctx.ellipse(-4,0,12,5,-.4,0,TAU);ctx.stroke();}}
      }else if(key==='root-seed'){
        ctx.beginPath();ctx.ellipse(0,0,9,6,0,0,TAU);ctx.fill();for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(7,0);ctx.quadraticCurveTo(-8,s*15,-22,s*4);ctx.stroke();}gem(ctx,2,-4,4);
      }else if(key==='wraith'||key==='wraith-chain'){
        ctx.beginPath();ctx.moveTo(12,0);ctx.bezierCurveTo(5,-13,-9,-9,-24,3);ctx.quadraticCurveTo(-4,-2,-5,7);ctx.quadraticCurveTo(9,10,12,0);ctx.fill();ctx.fillStyle='#27213e';ctx.fillRect(4,-3,2,3);ctx.fillRect(8,-2,2,3);
      }else if(key==='soul-scythe'){
        ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,12,-1.7,1.6);ctx.stroke();path(ctx,[[-16,6],[6,-6]]);if(!reduced)ring(ctx,-13,0,7,.8);
      }else if(key==='plague-spore'){
        for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(Math.cos(i*2)*5,Math.sin(i*2)*5,4,0,TAU);ctx.fill();}if(!reduced){ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(-16,0,14,8,0,0,TAU);ctx.fill();}
      }else if(key==='boulder'){
        scoped(ctx,()=>{ctx.rotate(time*5);path(ctx,[[12,-2],[7,-10],[-7,-12],[-14,-1],[-8,10],[6,9]],true);ctx.strokeStyle='#6a5140';path(ctx,[[-8,-5],[0,0],[8,-3],[3,6]]);});
      }else if(key==='earth-shock'){
        ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-i*9,0,6+i*2,-1.2,1.2);ctx.stroke();}gem(ctx,7,0,5);
      }else if(key==='snare'||key==='electric-snare'){
        ring(ctx,1,0,10,.8);for(let i=0;i<3;i++)path(ctx,[[-7,-6+i*6],[9,-6+i*6]]);ctx.beginPath();ctx.moveTo(-9,0);ctx.quadraticCurveTo(-23,Math.sin(time*20)*8,-31,0);ctx.stroke();if(key==='electric-snare')rays(ctx,0,0,15,4,time*4);
      }else if(key==='rivet'||key==='rail-rivet'){
        ctx.fillRect(-7,-3,18,6);ctx.fillRect(-10,-5,4,10);ctx.lineWidth=key==='rail-rivet'?3:1;path(ctx,[[-28,0],[-12,0]]);if(key==='rail-rivet'){ring(ctx,-15,0,7,.6);gem(ctx,11,0,5);}
      }else{
        const rocket=key==='rocket';ctx.fillStyle=key==='ember-shell'?'#79402d':'#857467';ctx.fillRect(-10,-6,18,12);ctx.fillStyle=colors[key];gem(ctx,9,0,7);
        if(rocket){path(ctx,[[-9,-5],[-17,-10],[-13,0],[-17,10],[-9,5]],true);ctx.fillStyle='#fff1a6';path(ctx,[[-13,-4],[-28-Math.sin(time*30)*5,0],[-13,4]],true);}
        else if(!reduced){ctx.globalAlpha=.38;ctx.beginPath();ctx.ellipse(-18,0,key==='siege-shell'?17:11,7,0,0,TAU);ctx.fill();}
      }
    }
    static impact(ctx,p,key,t,reduced){
      const radius=p.splash||24,r=Math.max(5,radius*Math.min(1,t*3)),count=reduced?3:7;
      if(['snare','electric-snare'].includes(key)){
        ring(ctx,0,4,15+t*12,.6);for(let i=-1;i<=1;i++)path(ctx,[[-13, i*7],[0,i*7-11],[13,i*7]]);if(key==='electric-snare')rays(ctx,0,0,25,4,t);
      }else if(key==='root-seed'){
        for(let i=0;i<count;i++){const a=i*TAU/count;ctx.beginPath();ctx.moveTo(0,8);ctx.quadraticCurveTo(Math.cos(a)*r*.5,-15,Math.cos(a)*r,8+Math.sin(a)*r*.4);ctx.stroke();gem(ctx,Math.cos(a)*r,8+Math.sin(a)*r*.4,4);}
      }else if(key==='boulder'||key==='earth-shock'){
        ring(ctx,0,12,r);for(let i=0;i<count;i++){const a=i*TAU/count,x=Math.cos(a)*r,y=Math.sin(a)*r*.4+12;path(ctx,[[0,12],[x*.5-4,y*.5+4],[x,y]]);if(key==='boulder')gem(ctx,x,y-12*Math.sin(t*Math.PI),4*(1-t)+1);}
      }else if(key==='plague-spore'){
        ring(ctx,0,8,r);for(let i=0;i<count;i++){const a=i*TAU/count;ctx.globalAlpha=(1-t)*.45;ctx.beginPath();ctx.arc(Math.cos(a)*r*.6,Math.sin(a)*r*.3-16*t,5+8*t,0,TAU);ctx.fill();}
      }else if(key==='wraith'||key==='wraith-chain'||key==='soul-scythe'){
        for(let i=0;i<(reduced?1:3);i++){ctx.beginPath();ctx.arc(0,-5,10+t*22+i*5,t*3+i*2,t*3+i*2+1.9);ctx.stroke();}if(p.soulCharged){ring(ctx,0,8,r);rays(ctx,0,-5,r*.7,6,t);}
      }else if(['steel-ice','moon-crystal'].includes(key)){
        ring(ctx,0,8,r);for(let i=0;i<count;i++){const a=i*TAU/count;gem(ctx,Math.cos(a)*r*.7,Math.sin(a)*r*.4,3+4*(1-t));}
      }else if(['ember-shell','steam-shell','siege-shell','rocket'].includes(key)){
        ring(ctx,0,8,r);ctx.globalAlpha=(1-t)*.65;ctx.beginPath();ctx.arc(0,0,5+r*.23,0,TAU);ctx.fill();ctx.globalAlpha=1-t;rays(ctx,0,0,r*.8,count,t*.5);if(!reduced){ctx.globalAlpha=(1-t)*.2;ctx.fillStyle=key==='steam-shell'?'#e1e5de':'#8b8279';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc((i-1)*r*.35,-t*25,6+t*12,0,TAU);ctx.fill();}}
      }else{rays(ctx,0,0,10+t*23,count,t*.3);if(key==='lion-lance'||key==='thunder-lance'){ctx.lineWidth=3;path(ctx,[[-22*(1-t),-12],[22*t,12]]);}if(p.splash)ring(ctx,0,8,r);}
    }
    static signal(tower,value){if(tower&&!tower.retired){tower.supportVfxUntil=(tower.visualAge||0)+.75;tower.supportVfxValue=value||0;}}
    static building(ctx,tower){
      if(ns.systems.PaintedTowerVFX?.building(ctx,tower))return;
      const type=tower.type,kind=supports[type],key=this.key(tower);if(!kind&&!key||tower.retired)return;
      const game=tower.synergy?.game;if(game?.feedback?.reducedFx)return;
      if(!ns.entities.Projectile.claimEffect())return;
      const age=tower.visualAge||0,fire=tower.fireFlash||0,pulse=.5+.5*Math.sin(age*2),cfg=tower.config();
      ctx.save();try{
        ctx.translate(tower.x,tower.y);ctx.strokeStyle=colors[key]||cfg.color;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1.5;
        if(key&&fire>0&&!tower.networkCooling)scoped(ctx,()=>{ctx.translate(0,-48);ctx.rotate(tower.aim||0);ctx.globalAlpha=fire;ring(ctx,7,0,6+(1-fire)*13,.65);rays(ctx,10,0,8+fire*8,3,tower.aim||0);});
        if(!kind)return;
        // Quiet source identity; bright work feedback is gated by real recipients/events.
        ctx.globalAlpha=.22+pulse*.12;
        const event=clamp(((tower.supportVfxUntil||0)-age)/.75);
        const candidates=(game?.build?.items||[]).concat(game?.summons||[],game?.hero?[game.hero]:[]);
        let recipients=[];
        if(kind==='forge'||kind==='grave'||kind==='nature')recipients=candidates.filter(t=>t!==tower&&t.supportDamageSource===tower&&t.active!==false&&!t.retired);
        if(kind==='haste')recipients=candidates.filter(t=>t.supportHasteSource===tower&&t.active!==false&&!t.retired);
        if(kind==='banner')recipients=candidates.filter(t=>t.flagSource===tower&&t.flagRate>0&&t.active!==false&&!t.retired);
        if(kind==='drum')recipients=candidates.filter(t=>t.tribalFrenzy>0&&ns.utils.distance(t,tower)<=cfg.range);
        if(kind==='supply'){path(ctx,[[-10,-40],[0,-47],[10,-40],[10,-28],[0,-22],[-10,-28],[-10,-40],[0,-33],[10,-40]]);}
        if(kind==='banner'){path(ctx,[[0,-25],[0,-53],[16,-48],[0,-41]]);ring(ctx,0,7,26);}
        if(kind==='forge'){path(ctx,[[-15,-33],[15,-33],[8,-27],[5,-20],[-5,-20],[-8,-27],[-15,-33]],true);}
        if(kind==='grave'){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc((i-1)*13,-36-Math.sin(age*2+i)*5,3,0,TAU);ctx.fill();}}
        if(kind==='summoner'){ring(ctx,0,7,20,.45);if(event){ctx.globalAlpha=event;for(let i=0;i<3;i++)gem(ctx,(i-1)*12,-20-(1-event)*30,4);}}
        if(kind==='haste'){path(ctx,[[-12,-33],[0,-40],[12,-33],[0,-26],[-12,-33]]);}
        if(kind==='nature'){ctx.beginPath();ctx.moveTo(-16,5);ctx.quadraticCurveTo(0,-18,16,5);ctx.stroke();gem(ctx,0,-6,5);}
        if(kind==='prism')scoped(ctx,()=>{ctx.translate(0,-45);ctx.rotate(age*.4);gem(ctx,0,0,10);});
        if(kind==='drum'){ring(ctx,0,-27,16);if(tower.skillPulse>0){ctx.globalAlpha=tower.skillPulse;ring(ctx,0,6,20+(1-tower.skillPulse)*42);rays(ctx,0,-27,15,6);}}
        if(kind==='power'&&game?.goblinNetwork){ctx.globalAlpha=.4;ring(ctx,0,-42,14,.7);gem(ctx,0,-42,5);}
        if(kind==='recycle'){path(ctx,[[-10,-35],[0,-45],[10,-35],[0,-25],[-10,-35]]);}
        if(kind==='cool'&&tower.networkPowered&&game?.goblinNetwork?.cooling>0){ctx.globalAlpha=.35;for(let i=0;i<3;i++){const t=(age*.7+i/3)%1;ctx.beginPath();ctx.ellipse((i-1)*12,-40-t*24,7+t*9,4+t*5,0,0,TAU);ctx.fill();}}
        if(kind==='factory')scoped(ctx,()=>{ctx.translate(0,-30);ctx.rotate(age);rays(ctx,0,0,13,8);ring(ctx,0,0,8,.9);});
        if(event){ctx.globalAlpha=event;ring(ctx,0,5,20+(1-event)*25);if(kind==='recycle'||kind==='supply'){ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText((kind==='supply'?'省 ':'+')+tower.supportVfxValue+'G',0,-64-(1-event)*16);}else{gem(ctx,0,-45,10+event*5);rays(ctx,0,-45,20,5);}}
        ctx.globalAlpha=.18+pulse*.18;
        for(const target of recipients.slice(0,game?.feedback?.mobile?2:4)){const dx=target.x-tower.x,dy=target.y-tower.y;ctx.beginPath();ctx.moveTo(0,-32);ctx.quadraticCurveTo(dx*.5,dy*.5-40,dx,dy-12);ctx.stroke();gem(ctx,dx,dy-12,3);}
      }finally{ctx.restore();}
    }
  }
  TowerVFX.VERSION='2.0.0';TowerVFX.ATTACKS=Object.freeze(attacks);TowerVFX.SUPPORTS=Object.freeze(supports);
  ns.systems.TowerVFX=TowerVFX;
})(globalThis.TowerFrontier);
