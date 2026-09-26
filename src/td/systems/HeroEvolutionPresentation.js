(function(ns){
  'use strict';
  const ORDER=['hunter','arcanist','rogue','chief','goblin','frostland'];
  const SOURCE={1:'assets/td/evolution-crests-awakened-v1.png',2:'assets/td/evolution-crests-transcendent-v1.png'};
  class HeroEvolutionPresentation{
    static image(art,rank){
      if(!art||!rank)return null;
      art.evolutionCrests ||= {};
      if(!art.evolutionCrests[rank])art.evolutionCrests[rank]=art.load(SOURCE[rank]);
      return art.evolutionCrests[rank];
    }
    static draw(ctx,art,hero){
      const evolution=ns.systems.HeroEvolutionSystem,rank=evolution?.rank(hero)||0;
      if(!rank||hero.evolutionVisualDisabledRank===rank)return false;
      ctx.save();try{return this.drawRank(ctx,art,hero,rank);}catch(error){hero.evolutionFault=String(error?.message||error);hero.evolutionVisualDisabledRank=rank;hero.evolutionCast=null;hero.evolutionReveal=null;return false;}finally{ctx.restore();}
    }
    static drawRank(ctx,art,hero,rank){
      this.drawCastVfx(ctx,hero,rank);
      this.drawEvolutionReveal(ctx,hero,rank);
      this.drawStatus(ctx,hero,rank);
      if(hero.classType==='naga')return this.drawNagaCrest(ctx,hero,rank);
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
      const label=hero.classType==='goblin'&&rank===2?'核心 '+Math.round(hero.evolution.energy||0)+'/100':hero.evolutionAuraTime>0?'戰域 '+Math.ceil(hero.evolutionAuraTime)+'秒':hero.evolutionAvatarTime>0?'荒王姿態':null;
      if(!label)return;ctx.save();try{ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe9a9';ctx.strokeStyle='#11252c';ctx.lineWidth=3;ctx.strokeText(label,hero.x,hero.y+36);ctx.fillText(label,hero.x,hero.y+36);}finally{ctx.restore();}
    }
    static drawEnemyMark(ctx,enemy){
      if(!enemy.active)return;const owner=enemy.evolutionMarkOwner,label=enemy.evolutionTrial?'進化試煉':enemy.evolutionTraining?'試招幻影 · 無獎勵':enemy.evolutionMark>0?'◆ '+Math.ceil(enemy.evolutionMark)+'秒':null;
      if(!label)return;ctx.save();try{ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillStyle=owner?ns.systems.HeroRoster.get(owner.classType).color:'#ffe2a0';ctx.strokeStyle='#11252c';ctx.lineWidth=3;ctx.strokeText(label,enemy.x,enemy.y-65);ctx.fillText(label,enemy.x,enemy.y-65);}finally{ctx.restore();}
    }
    static circle(ctx,x,y,r,color,alpha=1,lineWidth=2){ctx.save();try{ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.shadowColor=color;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(x,y,Math.max(1,r),0,Math.PI*2);ctx.stroke();}finally{ctx.restore();}}
    static line(ctx,x1,y1,x2,y2,color,alpha=1,lineWidth=2){ctx.save();try{ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.shadowColor=color;ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}finally{ctx.restore();}}
    static drawNagaCrest(ctx,hero,rank){
      const x=hero.x,y=hero.y-(rank===2?78:68),color=rank===2?'#ffe2a0':'#6ff6e5';
      this.circle(ctx,x,y,rank===2?18:14,color,.85,2);
      this.line(ctx,x,y+12,x,y-14,color,1,2.5);
      for(const side of [-1,1]){this.line(ctx,x,y-2,x+side*9,y-7,color);this.line(ctx,x+side*9,y-7,x+side*9,y-13,color);}
      if(rank===2){this.circle(ctx,x,y,23,'#6ff6e5',.55,1);for(const side of [-1,1])this.line(ctx,x+side*16,y+9,x+side*8,y+18,color,.8,2);}
      return true;
    }
    static drawEvolutionReveal(ctx,hero,rank){
      const reveal=hero.evolutionReveal;if(!reveal?.max||reveal.time<=0)return;
      const progress=1-reveal.time/reveal.max,color=this.color(hero,reveal.rank||rank),radius=22+progress*92;
      this.circle(ctx,hero.x,hero.y-12,radius,color,(1-progress)*.92,reveal.rank===2?4:3);
      this.circle(ctx,hero.x,hero.y-12,Math.max(8,radius*.48),'#fff5ce',(1-progress)*.72,2);
      for(let i=0;i<8;i++){const a=progress*5+i*Math.PI/4,inner=12+progress*34,outer=inner+18+progress*24;this.line(ctx,hero.x+Math.cos(a)*inner,hero.y-12+Math.sin(a)*inner,hero.x+Math.cos(a)*outer,hero.y-12+Math.sin(a)*outer,color,(1-progress)*.78,2);}
    }
    static drawCastVfx(ctx,hero,rank){
      const cast=hero.evolutionCast;if(!cast?.max||cast.time<=0)return;
      const progress=1-cast.time/cast.max,fade=Math.min(1,cast.time/.22),color=this.color(hero,cast.rank||rank),x=hero.x,y=hero.y-14,tx=cast.targetX??hero.x,ty=(cast.targetY??hero.y)-10;
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
