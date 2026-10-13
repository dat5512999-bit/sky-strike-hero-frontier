(function(ns){
  'use strict';
  const ORDER=['hunter','arcanist','rogue','chief','goblin','frostland'];
  const SOURCE={1:'assets/td/evolution-crests-awakened-v1.png',2:'assets/td/evolution-crests-transcendent-v1.png'};
  const REGALIA={hunter:['mantle','#315665','#e9c978'],arcanist:['petals','#314775','#b2e5ff'],rogue:['blades','#482344','#e6a5d3'],chief:['tusks','#583528','#e6c39b'],goblin:['engine','#365349','#a2e9cd'],frostland:['ice','#355b70','#d5f6ff'],naga:['fins','#215e64','#8ae2d8'],dwarf:['forge','#584131','#ffcf87'],dragonkin:['wings','#293f63','#a9dfff'],egypt:['sun','#4e4433','#f3d58b'],bull:['horns','#513b38','#efc99d']};
  class HeroEvolutionPresentation{
    static drawRegalia(ctx,hero,front=false){
      // Dedicated forms are painted into their own animation atlases, not glued-on
      // polygon armour. Paid skins also remain unobscured.
      if(hero.classType==='bull'||ns.systems.HeroEvolutionSpriteAtlas?.[hero.classType])return false;
      const rank=ns.systems.HeroEvolutionSystem.rank(hero),style=REGALIA[hero.classType];
      if(!rank||!style||hero.evolutionVisualDisabledRank===rank||!Number.isFinite(hero.x)||!Number.isFinite(hero.y))return false;
      const [shape,base,accent]=style,trim=rank===2?'#fff0b9':accent,spread=rank===2?1.18:1;
      ctx.save();try{
        const lift={frostland:12,chief:5,bull:10,dragonkin:5,naga:7}[hero.classType]||0;
        ctx.translate(hero.x,hero.y+5-lift);if(Math.cos(hero.facing||0)<0)ctx.scale(-1,1);
        // Solid attached equipment changes the silhouette even with particles off.
        // Keep the underlying approved skin, face, animation and weapon visible.
        const bob=hero.state==='walk'?Math.sin((hero.animationTime||0)*9)*1.2:0;ctx.translate(0,bob);
        const shade=(hex,rate)=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*rate).toString(16).padStart(2,'0')).join('');
        const polygon=(points,fill=base)=>{
          const metal=front,gradient=ctx.createLinearGradient(0,-70,30,5);
          gradient.addColorStop(0,shade(fill,.55));gradient.addColorStop(.35,fill);gradient.addColorStop(.48,metal?shade(trim,.78):shade(fill,.8));gradient.addColorStop(.65,shade(fill,.65));gradient.addColorStop(1,shade(fill,.4));
          ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle='#131c22';ctx.lineWidth=1.5;ctx.stroke();
          ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);ctx.lineTo(points[1][0],points[1][1]);ctx.lineTo(points[2][0],points[2][1]);ctx.strokeStyle=shade(trim,metal?.86:.6);ctx.lineWidth=.8;ctx.stroke();
        };
        if(!front){
          for(const side of [-1,1]){
            ctx.save();try{ctx.scale(side*spread,1);
            if(['wings','fins','petals'].includes(shape)){
              polygon(shape==='wings'?[[10,-42],[42,-63],[35,-38],[43,-18],[20,-26],[12,-9]]:shape==='fins'?[[12,-44],[35,-54],[29,-36],[38,-24],[20,-17],[11,-5]]:[[10,-43],[26,-66],[31,-42],[41,-32],[26,-18],[12,-7]]);
              if(rank===2)polygon([[15,-30],[39,-12],[30,5],[12,-4]],accent);
            }else if(shape==='engine'){
              polygon([[12,-39],[18,-62],[27,-62],[27,-32],[20,-19]]);polygon([[18,-65],[29,-65],[29,-59],[18,-59]],accent);
              if(rank===2)polygon([[22,-30],[36,-29],[36,-9],[23,-12]],accent);
            }else{
              polygon([[9,-46],[23,-38],[26,1],[13,-7],[4,3],[2,-29]]);
              if(rank===2)polygon([[15,-36],[30,-29],[35,8],[25,3],[20,8]],accent);
            }
            }finally{ctx.restore();}
          }
        }else{
          // Shoulder plates sit outside the torso instead of covering face or held weapon.
          for(const side of [-1,1]){
            ctx.save();try{ctx.scale(side*spread,1);
            polygon([[12,-43],[22,-49],[30,-39],[24,-32],[15,-34]]);
            if(['horns','tusks'].includes(shape))polygon([[23,-45],[27,-59],[34,-68],[31,-50],[29,-40]],accent);
            else if(['ice','blades'].includes(shape))polygon([[21,-43],[30,-61],[32,-36]],accent);
            else if(shape==='sun')polygon([[20,-47],[29,-57],[32,-43],[42,-41],[28,-32]],accent);
            else if(shape==='forge')polygon([[19,-46],[31,-45],[32,-36],[22,-36]],accent);
            else polygon([[19,-43],[24,-46],[27,-40],[22,-37]],accent);
            if(rank===2)polygon([[20,-32],[29,-30],[31,-20],[23,-23]],trim);
            }finally{ctx.restore();}
          }
          if(rank===2&&['hunter','arcanist','egypt'].includes(hero.classType))polygon([[-8,-61],[-9,-68],[-4,-65],[0,-71],[4,-65],[9,-68],[8,-61]],accent);
        }
        return true;
      }catch(error){hero.evolutionFault=String(error?.message||error);hero.evolutionVisualDisabledRank=rank;return false;}finally{ctx.restore();}
    }
    static image(art,rank){
      if(!art||!rank)return null;
      art.evolutionCrests ||= {};
      if(!art.evolutionCrests[rank])art.evolutionCrests[rank]=art.load(SOURCE[rank]);
      return art.evolutionCrests[rank];
    }
    static draw(ctx,art,hero){
      const evolution=ns.systems.HeroEvolutionSystem,rank=evolution?.rank(hero)||0;
      if(!rank||hero.evolutionVisualDisabledRank===rank||!Number.isFinite(hero.x)||!Number.isFinite(hero.y))return false;
      ctx.save();try{return this.drawRank(ctx,art,hero,rank);}catch(error){hero.evolutionFault=String(error?.message||error);hero.evolutionVisualDisabledRank=rank;hero.evolutionCast=null;hero.evolutionReveal=null;return false;}finally{ctx.restore();}
    }
    static drawRank(ctx,art,hero,rank){
      this.drawCastVfx(ctx,hero,rank);
      this.drawEvolutionReveal(ctx,hero,rank);
      this.drawStatus(ctx,hero,rank);
      if(hero.classType==='bull'||ns.systems.HeroEvolutionSpriteAtlas?.[hero.classType])return true;
      if(hero.classType==='naga')return this.drawNagaCrest(ctx,hero,rank);
      if(['dwarf','dragonkin','egypt'].includes(hero.classType))return this.drawSouthernCrest(ctx,hero,rank);
      const image=this.image(art,rank),index=ORDER.indexOf(hero.classType);
      if(!image?.ready||index<0)return this.drawFallback(ctx,hero,rank);
      const columns=3,rows=2,sw=image.width/columns,sh=image.height/rows,column=index%columns,row=Math.floor(index/columns);
      const pulse=1+Math.sin((hero.animationTime||0)*4)*.035,size=rank===2?40:33;
      ctx.save();try{ctx.translate(hero.x,hero.y-(rank===2?76:66));ctx.globalAlpha=rank===2?.96:.88;
      ctx.shadowColor=ns.systems.HeroRoster.get(hero.classType).color;ctx.shadowBlur=rank===2?13:8;ctx.drawImage(image,column*sw,row*sh,sw,sh,-size*pulse/2,-size*pulse/2,size*pulse,size*pulse);
      if(rank===2){ctx.globalAlpha=.6;ctx.strokeStyle='#ffe8ae';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,size*.62,0,Math.PI*2);ctx.stroke();}
      }finally{ctx.restore();}return true;
    }
    static color(hero,rank){return rank===2?'#ffe2a0':ns.systems.HeroRoster.get(hero.classType).color;}
    static drawStatus(ctx,hero,rank){
      const states={dwarf:rank===2?'永鑄誓約':'鍛魂誓約',dragonkin:rank===2?'古脈共振':'龍脈共振',egypt:rank===2?'永晝守護':'曦陽守護'};
      const label=hero.classType==='goblin'&&rank===2?'核心 '+Math.round(hero.evolution.energy||0)+'/100':hero.evolutionAuraTime>0?'戰域 '+Math.ceil(hero.evolutionAuraTime)+'秒':hero.evolutionAvatarTime>0?(states[hero.classType]?states[hero.classType]+' '+Math.ceil(hero.evolutionAvatarTime)+'秒':'荒王姿態'):null;
      // Health occupies y+29..34 and the hero label ends at y+46.
      if(!label)return;ctx.save();try{ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe9a9';ctx.strokeStyle='#11252c';ctx.lineWidth=3;ctx.strokeText(label,hero.x,hero.y+60);ctx.fillText(label,hero.x,hero.y+60);}finally{ctx.restore();}
    }
    static drawEnemyMark(ctx,enemy){
      if(!enemy.active)return;const owner=enemy.evolutionMarkOwner,label=enemy.evolutionTrial?'進化試煉':enemy.evolutionTraining?'試招幻影 · 無獎勵':enemy.evolutionMark>0?'◆ '+Math.ceil(enemy.evolutionMark)+'秒':null;
      if(!label)return;const labelY=enemy.y-(enemy.evolutionTrial?143:65);ctx.save();try{ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillStyle=owner?ns.systems.HeroRoster.get(owner.classType).color:'#ffe2a0';ctx.strokeStyle='#11252c';ctx.lineWidth=3;ctx.strokeText(label,enemy.x,labelY);ctx.fillText(label,enemy.x,labelY);}finally{ctx.restore();}
    }
    static circle(ctx,x,y,r,color,alpha=1,lineWidth=2){if(![x,y,r,alpha,lineWidth].every(Number.isFinite))return;ctx.save();try{ctx.globalAlpha=ns.utils.clamp(alpha,0,1);ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.shadowColor=color;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(x,y,Math.max(1,r),0,Math.PI*2);ctx.stroke();}finally{ctx.restore();}}
    static line(ctx,x1,y1,x2,y2,color,alpha=1,lineWidth=2){if(![x1,y1,x2,y2,alpha,lineWidth].every(Number.isFinite))return;ctx.save();try{ctx.globalAlpha=ns.utils.clamp(alpha,0,1);ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.shadowColor=color;ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}finally{ctx.restore();}}
    static drawSouthernCrest(ctx,hero,rank){
      const x=hero.x,y=hero.y-(rank===2?78:68),color=ns.systems.HeroRoster.get(hero.classType).color;
      this.circle(ctx,x,y,rank===2?18:14,color,.8,1.5);
      if(hero.classType==='dwarf'){
        this.line(ctx,x-7,y+9,x+5,y-8,color,1,3);this.line(ctx,x-1,y-11,x+11,y-3,color,1,6);
        for(const side of [-1,1])this.line(ctx,x+side*15,y+11,x+side*7,y+15,color,.8,2);
      }else if(hero.classType==='dragonkin'){
        this.line(ctx,x+3,y-12,x-5,y+1,color,1,2.5);this.line(ctx,x-5,y+1,x+5,y-1,color,1,2.5);this.line(ctx,x+5,y-1,x-3,y+12,color,1,2.5);
        for(const side of [-1,1]){this.line(ctx,x+side*7,y-5,x+side*23,y-11,color,.85,2);this.line(ctx,x+side*23,y-11,x+side*15,y+5,color,.85,2);}
      }else{
        this.circle(ctx,x,y,6,color,1,2);for(let i=0;i<8;i++){const a=i*Math.PI/4;this.line(ctx,x+Math.cos(a)*11,y+Math.sin(a)*11,x+Math.cos(a)*20,y+Math.sin(a)*20,color,.85,2);}
      }
      if(rank===2)this.circle(ctx,x,y,24,'#ffe2a0',.6,1.5);
      return true;
    }
    static drawNagaCrest(ctx,hero,rank){
      const x=hero.x,y=hero.y-(rank===2?78:68),color=rank===2?'#ffe2a0':'#6ff6e5';
      this.circle(ctx,x,y,rank===2?18:14,color,.85,2);
      this.line(ctx,x,y+12,x,y-14,color,1,2.5);
      for(const side of [-1,1]){this.line(ctx,x,y-2,x+side*9,y-7,color);this.line(ctx,x+side*9,y-7,x+side*9,y-13,color);}
      if(rank===2){this.circle(ctx,x,y,23,'#6ff6e5',.55,1);for(const side of [-1,1])this.line(ctx,x+side*16,y+9,x+side*8,y+18,color,.8,2);}
      return true;
    }
    static drawEvolutionReveal(ctx,hero,rank){
      const reveal=hero.evolutionReveal;if(!Number.isFinite(reveal?.max)||reveal.max<=0||!Number.isFinite(reveal.time)||reveal.time<=0)return;
      const progress=ns.utils.clamp(1-reveal.time/reveal.max,0,1),color=this.color(hero,reveal.rank||rank),radius=22+progress*92;
      this.circle(ctx,hero.x,hero.y-12,radius,color,(1-progress)*.92,reveal.rank===2?4:3);
      this.circle(ctx,hero.x,hero.y-12,Math.max(8,radius*.48),'#fff5ce',(1-progress)*.72,2);
      for(let i=0;i<8;i++){const a=progress*5+i*Math.PI/4,inner=12+progress*34,outer=inner+18+progress*24;this.line(ctx,hero.x+Math.cos(a)*inner,hero.y-12+Math.sin(a)*inner,hero.x+Math.cos(a)*outer,hero.y-12+Math.sin(a)*outer,color,(1-progress)*.78,2);}
    }
    static drawCastVfx(ctx,hero,rank){
      const cast=hero.evolutionCast;if(!Number.isFinite(cast?.max)||cast.max<=0||!Number.isFinite(cast.time)||cast.time<=0)return;
      const progress=ns.utils.clamp(1-cast.time/cast.max,0,1),fade=Math.min(1,cast.time/.22),color=this.color(hero,cast.rank||rank),x=hero.x,y=hero.y-14,tx=Number.isFinite(cast.targetX)?cast.targetX:hero.x,ty=(Number.isFinite(cast.targetY)?cast.targetY:hero.y)-10;
      const dx=tx-x,dy=ty-y,distance=Math.max(1,Math.hypot(dx,dy)),nx=dx/distance,ny=dy/distance,px=-ny,py=nx;
      if(hero.classType==='hunter'){
        for(let i=-1;i<=1;i++){const spread=i*10;this.line(ctx,x+px*spread,y+py*spread,tx+px*spread*.35,ty+py*spread*.35,color,fade*(.9-Math.abs(i)*.15),2.4);}
        this.circle(ctx,tx,ty,14+progress*19,'#fff1bb',fade*.72,2);
      }else if(hero.classType==='arcanist'){
        this.circle(ctx,x,y,20+progress*24,color,fade*.82,2);
        for(let i=0;i<3;i++){const a=progress*6+i*Math.PI*2/3;this.line(ctx,x+Math.cos(a)*8,y+Math.sin(a)*8,x+Math.cos(a)*(30+progress*17),y+Math.sin(a)*(30+progress*17),'#d9f6ff',fade*.74,2);}
        this.circle(ctx,tx,ty,18+progress*25,color,fade*.68,2);
      }else if(hero.classType==='rogue'){
        for(let i=0;i<3;i++){const offset=(i-1)*12,startX=tx-nx*(46-i*5)+px*offset,startY=ty-ny*(46-i*5)+py*offset,endX=tx+nx*18+px*offset,endY=ty+ny*18+py*offset;this.line(ctx,startX,startY,endX,endY,color,fade*(.92-i*.14),3.1);}
        this.circle(ctx,tx,ty,20+progress*12,'#ffd3e8',fade*.42,1.5);
      }else if(hero.classType==='chief'){
        this.circle(ctx,x,y+17,22+progress*52,color,fade*.76,3);
        for(let i=0;i<5;i++){const a=i*Math.PI*2/5+progress*.7;this.line(ctx,x+Math.cos(a)*18,y+18+Math.sin(a)*8,x+Math.cos(a)*(37+progress*25),y+18+Math.sin(a)*(21+progress*14),color,fade*.7,3);}
      }else if(hero.classType==='goblin'){
        this.circle(ctx,x,y,19+progress*22,'#b5f8e9',fade*.76,3);
        for(let i=0;i<8;i++){const a=i*Math.PI/4-progress*7,inside=19+progress*22,outside=inside+8;this.line(ctx,x+Math.cos(a)*inside,y+Math.sin(a)*inside,x+Math.cos(a)*outside,y+Math.sin(a)*outside,'#ffcb77',fade*.85,3);}
        this.line(ctx,x,y,tx,ty,'#d8ffff',fade*.66,2);
      }else if(hero.classType==='dwarf'){
        const cx=['w','e','f'].includes(cast.slot)?x:tx,cy=['w','e','f'].includes(cast.slot)?y+14:ty;
        this.circle(ctx,cx,cy,18+progress*48,'#67e7df',fade*.8,3);
        for(let i=0;i<6;i++){const a=i*Math.PI/3,inner=13+progress*12,outer=29+progress*34;this.line(ctx,cx+Math.cos(a)*inner,cy+Math.sin(a)*inner*.5,cx+Math.cos(a)*outer,cy+Math.sin(a)*outer*.5,'#ffcc78',fade*.85,2.5);}
        if(cast.slot==='q'||cast.slot==='f')this.line(ctx,cx,cy-72*(1-progress),cx,cy,'#ccfff3',fade,5);
      }else if(hero.classType==='dragonkin'){
        this.circle(ctx,tx,ty,15+progress*32,'#8ed9ff',fade*.65,2);
        for(const side of [-1,1]){this.line(ctx,x,y,tx+px*side*(13+progress*20),ty+py*side*(13+progress*20),'#72bcff',fade*.85,2.5);this.line(ctx,tx+px*side*12,ty-80*(1-progress),tx-px*side*10,ty-28*(1-progress),'#d9faff',fade,3);this.line(ctx,tx-px*side*10,ty-28*(1-progress),tx,ty,'#d9faff',fade,3);}
      }else if(hero.classType==='egypt'){
        const cx=cast.slot==='q'||cast.slot==='f'?tx:x,cy=cast.slot==='q'||cast.slot==='f'?ty:y;
        this.circle(ctx,cx,cy,14+progress*27,'#ffe19a',fade*.9,3);
        for(let i=0;i<8;i++){const a=i*Math.PI/4+progress*.5,inner=21+progress*25,outer=inner+11;this.line(ctx,cx+Math.cos(a)*inner,cy+Math.sin(a)*inner,cx+Math.cos(a)*outer,cy+Math.sin(a)*outer,'#efba59',fade*.75,2);}
        if(cast.slot==='q')this.line(ctx,x,y,tx,ty,'#fff0c1',fade,3);
      }else if(hero.classType==='naga'){
        for(let i=0;i<3;i++){const r=20+progress*40+i*11;this.circle(ctx,tx,ty,r,i%2?'#6ff6e5':color,fade*(.65-i*.14),2);}
        this.line(ctx,x,y,tx,ty,'#bdfcf3',fade,3);
        for(const side of [-1,1])this.line(ctx,tx-nx*18+px*side*12,ty-ny*18+py*side*12,tx+nx*10,ty+ny*10,color,fade,2);
      }else{
        this.circle(ctx,x,y,20+progress*26,'#c9f6ff',fade*.78,2.4);
        for(let i=0;i<6;i++){const a=i*Math.PI/3+progress*2,inner=10,outer=28+progress*23;this.line(ctx,x+Math.cos(a)*inner,y+Math.sin(a)*inner,x+Math.cos(a)*outer,y+Math.sin(a)*outer,'#e9fbff',fade*.84,2);}
        this.circle(ctx,tx,ty,17+progress*26,color,fade*.58,2);
      }
      if(cast.slot==='f'){this.circle(ctx,tx,ty,38+progress*62,'#fff0b3',fade*.7,rank===2?4:3);this.circle(ctx,x,y,28+progress*34,color,fade*.55,2);}
      if(cast.slot==='w')this.circle(ctx,x,y+16,42+progress*35,color,fade*.5,2);
      if(cast.slot==='e')for(const side of [-1,1])this.circle(ctx,x+side*(30+progress*18),y,9+progress*12,color,fade*.65,2);
    }
    static drawFallback(ctx,hero,rank){
      const color=rank===2?'#ffe2a0':ns.systems.HeroRoster.get(hero.classType).color;
      ctx.save();try{ctx.translate(hero.x,hero.y-(rank===2?72:62));ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=rank===2?12:7;ctx.font=rank===2?'700 19px Georgia':'700 16px Georgia';ctx.textAlign='center';ctx.fillText(rank===2?'✦':'✧',0,0);}finally{ctx.restore();}return false;
    }
  }
  HeroEvolutionPresentation.SOURCE=SOURCE;
  ns.systems.HeroEvolutionPresentation=HeroEvolutionPresentation;
})(globalThis.TowerFrontier);
