(function(ns){
  'use strict';
  // World-space vectors: independent of the actor's animation cell and combat rules.
  class HeroSkillVFX{
    static emit(hero,type,options){hero.skillVfx=hero.skillVfx||[];hero.skillVfx.push(Object.assign({type,x:hero.x,y:hero.y,age:0,duration:.65},options));if(hero.skillVfx.length>24)hero.skillVfx.shift();}
    static update(hero,dt){hero.skillVfx=(hero.skillVfx||[]).filter(v=>{v.age+=dt;return v.age<v.duration;});}
    static shard(ctx,x,y,size,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#8edeee';ctx.strokeStyle='#e8ffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.3,0);ctx.lineTo(0,size*.3);ctx.lineTo(-size*.3,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    static glow(ctx,x,y,radius,color){const g=ctx.createRadialGradient(x,y,0,x,y,radius);if(!g||!g.addColorStop)return;g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);}
    static slash(ctx,x,y,radius,angle,color){ctx.save();try{ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(Math.cos(-1.3)*radius,Math.sin(-1.3)*radius);ctx.arc(0,0,radius,-1.3,1);ctx.quadraticCurveTo(radius*.35,0,Math.cos(-1.3)*radius,Math.sin(-1.3)*radius);ctx.fill();ctx.strokeStyle='#ffe0f6';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,radius,-1.2,.85);ctx.stroke();}finally{ctx.restore();}}
    static draw(ctx,hero){
      for(const v of hero.skillVfx||[]){
        ctx.save();
        try{this.drawEffect(ctx,hero,v);}
        catch(error){
          // Only presentation is discarded. Damage, cooldowns and the six-second
          // field remain intact. Keep the original error for diagnosis.
          if(!v.type.startsWith('naga-')&&v.type!=='ultimate-naga')throw error;
          hero.skillVfx=hero.skillVfx.filter(effect=>effect!==v);
          hero.nagaVfxFault={type:v.type,message:String(error?.message||error),stack:String(error?.stack||'')};
          console.error('[HeroSkillVFX] '+v.type,error);
        }finally{ctx.restore();}
      }
    }
    static drawEffect(ctx,hero,v){if(ns.systems.GoblinPresentation?.draw(ctx,v,hero))return;const t=v.age/v.duration,fade=1-t;ctx.globalAlpha=fade;ctx.lineCap='round';
      if(v.type==='goblin-modify'){
        const tx=v.target.x,ty=v.target.y-42,r=19+17*t;ctx.strokeStyle='#b4f5d5';ctx.lineWidth=3*fade;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(v.x,v.y-38);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);this.glow(ctx,tx,ty,49,'#61d6b67a');ctx.strokeStyle='#edc17b';ctx.lineWidth=4*fade;ctx.beginPath();ctx.arc(tx,ty,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<10;i++){const a=i*Math.PI/5+t*4;ctx.beginPath();ctx.moveTo(tx+Math.cos(a)*(r-2),ty+Math.sin(a)*(r-2));ctx.lineTo(tx+Math.cos(a)*(r+8),ty+Math.sin(a)*(r+8));ctx.stroke();}ctx.fillStyle='#9ceee1';ctx.beginPath();ctx.arc(tx,ty,5+4*fade,0,Math.PI*2);ctx.fill();
      }else if(v.type==='goblin-cool'){
        const r=v.radius*(.18+.82*t);this.glow(ctx,v.x,v.y-28,r,'#8adce96b');for(let ring=0;ring<2;ring++){ctx.strokeStyle=ring?'#e8c290':'#bbf5e8';ctx.lineWidth=(4-ring)*fade;ctx.beginPath();ctx.ellipse(v.x,v.y+2,r-ring*14,(r-ring*14)*.45,0,0,Math.PI*2);ctx.stroke();}for(let i=0;i<12;i++){const a=i*Math.PI/6+t,px=v.x+Math.cos(a)*r*.84,py=v.y-24+Math.sin(a)*r*.35;ctx.fillStyle=i%2?'#f2e9cf':'#9eefe0';ctx.globalAlpha=fade*.65;ctx.beginPath();ctx.ellipse(px,py-18*t,7+5*t,4+3*t,a,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=fade;
      }else if(v.type==='goblin-deploy'){
        const r=v.radius*(.3+.7*t);this.glow(ctx,v.x+28,v.y-22,55,'#79eed47a');ctx.strokeStyle='#f1cb82';ctx.lineWidth=3*fade;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(v.x+28,v.y+5-i*18*t,r*(1-i*.16),r*.32,0,0,Math.PI*2);ctx.stroke();}for(let i=0;i<6;i++){const a=i*Math.PI/3+t*2;ctx.fillStyle='#95f6e3';ctx.beginPath();ctx.arc(v.x+28+Math.cos(a)*r,v.y-30+Math.sin(a)*r*.65,3+3*fade,0,Math.PI*2);ctx.fill();}
      }else if(v.type==='goblin-overload'){
        const r=v.radius*(.2+.8*t);this.glow(ctx,v.x,v.y-24,r,'#ff994f7a');ctx.strokeStyle='#ffca7d';ctx.lineWidth=5*fade;ctx.beginPath();ctx.ellipse(v.x,v.y+2,r,r*.47,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(v.x+Math.cos(a)*r*.65,v.y+Math.sin(a)*r*.32);ctx.lineTo(v.x+Math.cos(a)*r*1.12,v.y+Math.sin(a)*r*.56);ctx.stroke();}
      }else if(v.type==='naga-tidegate'){
        const start=v.from||{x:v.x,y:v.y},end=v.target||{x:v.x,y:v.y},r=18+20*t;this.glow(ctx,start.x,start.y-24,44,'#38d9df66');ctx.strokeStyle='#8afff6';ctx.lineWidth=3.5*fade;ctx.beginPath();ctx.ellipse(start.x,start.y-20,r,r*.42,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#38d4db';ctx.lineWidth=4*fade;ctx.beginPath();ctx.moveTo(start.x,start.y-22);ctx.quadraticCurveTo((start.x+end.x)/2,(start.y+end.y)/2-42,end.x,end.y-22);ctx.stroke();this.glow(ctx,end.x,end.y-22,39,'#51f0e766');this.slash(ctx,end.x,end.y-22,28+16*t,-.72,'#8efff6');
      }else if(v.type==='naga-maelstrom'){
        const r=v.radius*(.24+.76*t);this.glow(ctx,v.x,v.y-8,r,'#1aaecb55');for(let ring=0;ring<3;ring++){const rr=Math.max(1,r-ring*13);ctx.strokeStyle=ring===1?'#b6fffa':'#38d8df';ctx.lineWidth=(4-ring)*fade;ctx.beginPath();ctx.ellipse(v.x,v.y+5,rr,rr*.48,0,0,Math.PI*2);ctx.stroke();}for(let i=0;i<10;i++){const a=i*Math.PI/5+t*5;ctx.fillStyle=i%2?'#aafff5':'#42cfd9';ctx.beginPath();ctx.arc(v.x+Math.cos(a)*r*.72,v.y-10+Math.sin(a)*r*.34,2.2+3*fade,0,Math.PI*2);ctx.fill();}
      }else if(v.type==='naga-command'){
        const r=v.radius*(.15+.85*t);this.glow(ctx,v.x,v.y-18,64,'#3bd9d06a');ctx.strokeStyle='#77fff3';ctx.lineWidth=2.5*fade;ctx.beginPath();ctx.ellipse(v.x,v.y+6,r,r*.35,0,0,Math.PI*2);ctx.stroke();for(const target of v.targets||[]){ctx.globalAlpha=fade*.75;ctx.strokeStyle='#b8fff4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(v.x,v.y-28);ctx.lineTo(target.x,target.y-18);ctx.stroke();ctx.beginPath();ctx.arc(target.x,target.y-18,7+8*t,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=fade;
      }else if(v.type==='arrows'){
        for(const p of v.targets){const dx=p.x-v.x,dy=p.y-v.y-25,angle=Math.atan2(dy,dx);ctx.strokeStyle='#f4d484';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(v.x,v.y-25);ctx.lineTo(p.x,p.y-25);ctx.stroke();ctx.save();ctx.translate(p.x,p.y-25);ctx.rotate(angle);ctx.fillStyle='#fff0b7';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-8,-4);ctx.lineTo(-5,0);ctx.lineTo(-8,4);ctx.closePath();ctx.fill();ctx.restore();}
      }else if(v.type==='blink'){
        ctx.strokeStyle='#ad72d7';ctx.lineWidth=8*fade;ctx.beginPath();ctx.moveTo(v.x,v.y-20);ctx.lineTo(v.target.x,v.target.y-20);ctx.stroke();this.slash(ctx,v.target.x,v.target.y-20,32+15*t,-.8,'#bf73ed');
        for(let i=0;i<3;i++){ctx.globalAlpha=fade*(.25-i*.05);ctx.fillStyle='#765499';ctx.beginPath();ctx.ellipse(v.x+(v.target.x-v.x)*i/3,v.y+(v.target.y-v.y)*i/3-22,10,23,-.4,0,Math.PI*2);ctx.fill();}
      }else if(v.type==='frost'){
        const r=v.radius*(.65+.35*t);this.glow(ctx,v.x,v.y,r,'#326a8070');ctx.strokeStyle='#b0f4ff';ctx.lineWidth=3*fade;ctx.beginPath();ctx.arc(v.x,v.y,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<14;i++){const a=i*Math.PI/7;this.shard(ctx,v.x+Math.cos(a)*r,v.y+Math.sin(a)*r,10+10*fade,a);}
      }else if(v.type==='lightning'){
        ctx.strokeStyle='#c4f7ff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(v.x-18+i*16,v.y-60);ctx.lineTo(v.x-26+i*16,v.y-43);ctx.lineTo(v.x-12+i*16,v.y-46);ctx.lineTo(v.x-20+i*16,v.y-25);ctx.stroke();}
      }else if(v.type==='chief-warcry'){
        const r=v.radius*(.18+.82*t);this.glow(ctx,v.x,v.y-18,Math.min(r,120),'#ff622f70');
        for(let ring=0;ring<3;ring++){const rr=Math.max(8,r-ring*24);ctx.strokeStyle=ring===1?'#ffd47b':'#ff6a3f';ctx.lineWidth=(5-ring)*fade;ctx.beginPath();for(let i=0;i<=24;i++){const a=i*Math.PI/12,spike=i%2?4:10,x=v.x+Math.cos(a)*(rr+spike*fade),y=v.y+Math.sin(a)*(rr*.48+spike*fade);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}
        ctx.fillStyle='#ffe1a0';for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.7,rr=r*.72;ctx.beginPath();ctx.arc(v.x+Math.cos(a)*rr,v.y+Math.sin(a)*rr*.48,2+4*fade,0,Math.PI*2);ctx.fill();}
      }else if(v.type==='chief-shockwave-cast'){
        const r=v.radius*(.25+.75*t);this.glow(ctx,v.x,v.y-6,r*1.25,'#ff8c4266');
        ctx.fillStyle='#3e251a';ctx.globalAlpha=fade*.65;ctx.beginPath();ctx.ellipse(v.x,v.y+4,r,r*.46,0,0,Math.PI*2);ctx.fill();
        for(const [width,color] of [[8,'#6c331d'],[4,'#ff8737'],[1.5,'#ffe3a1']]){ctx.globalAlpha=fade;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(v.x,v.y+4,r,r*.46,0,0,Math.PI*2);ctx.stroke();}
        for(let i=0;i<10;i++){const a=i*Math.PI/5,near=12,far=r*(.8+(i%3)*.16),dx=Math.cos(a),dy=Math.sin(a)*.5;
          ctx.strokeStyle=i%2?'#ff9a43':'#5d2c1c';ctx.lineWidth=i%2?3:5;ctx.beginPath();ctx.moveTo(v.x+dx*near,v.y+dy*near);ctx.lineTo(v.x+dx*far*.53+Math.sin(i*3)*5,v.y+dy*far*.53);ctx.lineTo(v.x+dx*far,v.y+dy*far);ctx.stroke();
          if(i%2===0){ctx.fillStyle='#aa7650';ctx.beginPath();ctx.moveTo(v.x+dx*far,v.y+dy*far-12*fade);ctx.lineTo(v.x+dx*far+7,v.y+dy*far+2);ctx.lineTo(v.x+dx*far-7,v.y+dy*far+2);ctx.fill();}
        }
      }else if(v.type==='ultimate-hunter'){
        // Damage is immediate: arrows are already impacting at age zero, then dissipate.
        for(const [i,p] of v.targets.entries()){ctx.strokeStyle='#ffe3a1';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(p.x-22*(1-t),p.y-95*(1-t)-12);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x-5,p.y-10);ctx.lineTo(p.x,p.y);ctx.lineTo(p.x+3,p.y-11);ctx.stroke();ctx.globalAlpha=fade*.5;ctx.beginPath();ctx.ellipse(p.x,p.y,10+20*t,4+8*t,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=fade;}
      }else if(v.type==='ultimate-arcanist'){
        for(const [i,p] of v.targets.entries()){this.glow(ctx,p.x,p.y-15,40,'#71d6ff80');this.shard(ctx,p.x,p.y-15,32*fade+8,i*.7);ctx.strokeStyle='#9de9fa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y-110*(1-t));ctx.lineTo(p.x,p.y-20);ctx.stroke();for(let j=0;j<3;j++){const a=j*2.1+i;this.shard(ctx,p.x+Math.cos(a)*(15+22*t),p.y+Math.sin(a)*15,6+5*fade,a);}}ctx.strokeStyle='#dcfdff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(v.x,v.y,v.radius*(.6+.4*t),0,Math.PI*2);ctx.stroke();
      }else if(v.type==='ultimate-rogue'){
        for(const [i,p] of v.targets.entries())this.slash(ctx,p.x,p.y-20,25+16*t,i*.9-1,'#ed75b6');this.slash(ctx,v.x,v.y-32,48+25*t,-.6,'#bd4a91');
      }else if(v.type==='ultimate-chief'){
        const r=v.radius*(.35+.65*t);this.glow(ctx,v.x,v.y-18,r,'#ff482f80');ctx.strokeStyle='#ffd06b';ctx.lineWidth=5*fade;ctx.beginPath();ctx.arc(v.x,v.y,r,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ff6045';ctx.lineWidth=3*fade;for(let i=0;i<16;i++){const a=i*Math.PI/8;ctx.beginPath();ctx.moveTo(v.x+Math.cos(a)*r*.52,v.y+Math.sin(a)*r*.52);ctx.lineTo(v.x+Math.cos(a)*r*1.18,v.y+Math.sin(a)*r*1.18);ctx.stroke();}ctx.fillStyle='#ffe3a0';ctx.beginPath();ctx.moveTo(v.x,v.y-78*fade);ctx.lineTo(v.x-17,v.y-43);ctx.lineTo(v.x-5,v.y-50);ctx.lineTo(v.x,v.y-24);ctx.lineTo(v.x+5,v.y-50);ctx.lineTo(v.x+17,v.y-43);ctx.closePath();ctx.fill();
      }else if(v.type==='ultimate-naga'){
        const r=v.radius*(.28+.72*t);this.glow(ctx,v.x,v.y-18,r,'#28cbd776');for(let ring=0;ring<3;ring++){const rr=Math.max(1,r-ring*17);ctx.strokeStyle=ring===0?'#b6fffa':'#3fe5df';ctx.lineWidth=(6-ring*1.5)*fade;ctx.beginPath();ctx.ellipse(v.x,v.y+4,rr,rr*.42,0,0,Math.PI*2);ctx.stroke();}ctx.strokeStyle='#fff1b0';ctx.shadowColor='#61fff4';ctx.shadowBlur=14;ctx.lineWidth=6*fade;ctx.beginPath();ctx.moveTo(v.x,v.y-142*(1-t));ctx.lineTo(v.x,v.y-20);ctx.stroke();for(let i=0;i<14;i++){const a=i*Math.PI/7+t*2;ctx.strokeStyle=i%2?'#5cf0e8':'#c8fffa';ctx.lineWidth=2.5*fade;ctx.beginPath();ctx.moveTo(v.x+Math.cos(a)*r*.36,v.y+Math.sin(a)*r*.16);ctx.lineTo(v.x+Math.cos(a)*r*1.06,v.y+Math.sin(a)*r*.52);ctx.stroke();}
      }
    }
    static drawField(ctx,field){
      if(field.type.startsWith('evo-')){
        const colors={'evo-hunter':'#e6d18a','evo-naga':'#6ff6e5','evo-rogue':'#ed95d3','evo-frostland':'#b9edff'},color=colors[field.type]||'#ffe2a0';
        ctx.save();try{ctx.globalAlpha=Math.min(1,field.time/.6)*.42;ctx.strokeStyle=color;ctx.lineWidth=2;const radius=Math.max(1,field.radius||100);ctx.beginPath();ctx.ellipse(field.x,field.y,radius,radius*.4,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3+field.time*.6;ctx.beginPath();ctx.arc(field.x+Math.cos(a)*radius*.72,field.y+Math.sin(a)*radius*.28,3,0,Math.PI*2);ctx.stroke();}}finally{ctx.restore();}return;
      }
      const trap=field.type==='hunter',chief=field.type==='chief',naga=field.type==='naga',age=(trap?8:6)-field.time,fade=Math.min(1,field.time/.6),r=72;
      ctx.save();try{ctx.translate(field.x,field.y);ctx.globalAlpha=(naga?.32:.55)*fade;ctx.strokeStyle=trap?'#c5ad75':chief?'#ff9c4a':naga?'#65f5ed':'#b07cda';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      if(trap){ctx.strokeStyle='#66513a';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,28,15,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#dbcd9b';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.save();ctx.translate(Math.cos(a)*27,Math.sin(a)*14);ctx.rotate(a);ctx.fillStyle='#bfb9a2';ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(-8,0);ctx.lineTo(0,4);ctx.fill();ctx.restore();}ctx.strokeStyle='#a58c52';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-48,25);ctx.lineTo(40,-23);ctx.moveTo(-40,-23);ctx.lineTo(48,25);ctx.stroke();}
      else if(chief){ctx.strokeStyle='#ffc45f';for(let i=0;i<8;i++){const a=i*Math.PI/4+age*.4;ctx.lineWidth=i%2?1.5:3;ctx.beginPath();ctx.moveTo(Math.cos(a)*24,Math.sin(a)*24);ctx.lineTo(Math.cos(a)*66,Math.sin(a)*66);ctx.stroke();}ctx.fillStyle='#6eeeff';for(let i=0;i<6;i++){const a=i*Math.PI/3-age*.7;ctx.globalAlpha=fade*(.3+.3*Math.sin(age*5+i));ctx.beginPath();ctx.ellipse(Math.cos(a)*52,Math.sin(a)*30-10,5,16,a,0,Math.PI*2);ctx.fill();}}
      else if(naga){
        // Keep the magic on the ground plane.  The previous three bright rings
        // formed a cyan target around the hero and made the painted silhouette
        // read like a flat card.
        for(let ring=0;ring<2;ring++){const rr=r-ring*24;ctx.globalAlpha=fade*(.28-ring*.08);ctx.strokeStyle=ring?'#70d8d4':'#b5eee3';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,5,rr,rr*.30,age*(ring?-.52:.52),0,Math.PI*2);ctx.stroke();}
        for(let i=0;i<8;i++){const a=i*Math.PI/4-age*1.15,rr=26+(i%3)*11;ctx.globalAlpha=fade*(.18+.10*Math.sin(age*3+i));ctx.fillStyle=i%2?'#caeee5':'#4baeb2';ctx.beginPath();ctx.ellipse(Math.cos(a)*rr,Math.sin(a)*rr*.28+5,3.4,1.4,a,0,Math.PI*2);ctx.fill();}
      }
      else{for(let i=0;i<9;i++){const a=i*2.4+age*.25,x=Math.cos(a)*(18+i*4),y=Math.sin(a)*(15+i*3);ctx.globalAlpha=fade*(.10+.05*Math.sin(age*3+i));ctx.fillStyle=i%2?'#713784':'#b577cd';ctx.beginPath();ctx.ellipse(x,y-5-Math.sin(age+i)*6,25,15,.3,0,Math.PI*2);ctx.fill();}for(let i=0;i<7;i++){const t=(age*.35+i/7)%1;ctx.globalAlpha=fade*(1-t)*.55;ctx.fillStyle='#d1a6ea';ctx.beginPath();ctx.arc(Math.cos(i*2.4)*r*.75,Math.sin(i*2.4)*r*.55-t*20,1.8,0,Math.PI*2);ctx.fill();}}
      }finally{ctx.restore();}
    }
    static summonBirth(ctx,summon){const t=1-summon.spawnTime/.55,kind=summon.form;ctx.save();ctx.translate(summon.x,summon.y);ctx.globalAlpha=(1-t)*.85;ctx.lineWidth=2;
      if(kind==='arcanist'){ctx.strokeStyle='#a2f2ff';for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,-i*12*t,15+17*t,6+5*t,0,0,Math.PI*2);ctx.stroke();}for(let i=0;i<6;i++)this.shard(ctx,Math.cos(i)*25,Math.sin(i)*8-25*t,8,i);}
      else if(kind==='hunter'){ctx.strokeStyle='#d3c28b';ctx.beginPath();ctx.ellipse(0,3,18+16*t,7+7*t,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#b6c68c';for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(Math.cos(i*1.8)*23,Math.sin(i*1.8)*9-18*t,5,2,i+t,0,Math.PI*2);ctx.fill();}}
      else if(kind==='rogue'){ctx.fillStyle='#603978';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(Math.cos(i*1.5)*13,-i*7*t,16*(1-t)+5,10,.3,0,Math.PI*2);ctx.fill();}this.slash(ctx,0,-10,20+15*t,-.5,'#c881ed');}
      ctx.restore();
    }
  }
  ns.systems.HeroSkillVFX=HeroSkillVFX;
})(globalThis.TowerFrontier);
