(function(ns){
  'use strict';
  // World-space vectors: independent of the actor's animation cell and combat rules.
  class HeroSkillVFX{
    static emit(hero,type,options){hero.skillVfx=hero.skillVfx||[];hero.skillVfx.push(Object.assign({type,x:hero.x,y:hero.y,age:0,duration:.65},options));if(hero.skillVfx.length>24)hero.skillVfx.shift();}
    static update(hero,dt){hero.skillVfx=(hero.skillVfx||[]).filter(v=>{v.age+=dt;return v.age<v.duration;});}
    static shard(ctx,x,y,size,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#8edeee';ctx.strokeStyle='#e8ffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.3,0);ctx.lineTo(0,size*.3);ctx.lineTo(-size*.3,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    static glow(ctx,x,y,radius,color){const g=ctx.createRadialGradient(x,y,0,x,y,radius);if(!g||!g.addColorStop)return;g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);}
    static slash(ctx,x,y,radius,angle,color){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(Math.cos(-1.3)*radius,Math.sin(-1.3)*radius);ctx.arc(0,0,radius,-1.3,1);ctx.quadraticCurveTo(radius*.35,0,Math.cos(-1.3)*radius,Math.sin(-1.3)*radius);ctx.fill();ctx.strokeStyle='#ffe0f6';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,radius,-1.2,.85);ctx.stroke();ctx.restore();}
    static draw(ctx,hero){for(const v of hero.skillVfx||[]){const t=v.age/v.duration,fade=1-t;ctx.save();ctx.globalAlpha=fade;ctx.lineCap='round';
      if(v.type==='arrows'){
        for(const p of v.targets){const dx=p.x-v.x,dy=p.y-v.y-25,angle=Math.atan2(dy,dx);ctx.strokeStyle='#f4d484';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(v.x,v.y-25);ctx.lineTo(p.x,p.y-25);ctx.stroke();ctx.save();ctx.translate(p.x,p.y-25);ctx.rotate(angle);ctx.fillStyle='#fff0b7';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-8,-4);ctx.lineTo(-5,0);ctx.lineTo(-8,4);ctx.closePath();ctx.fill();ctx.restore();}
      }else if(v.type==='blink'){
        ctx.strokeStyle='#ad72d7';ctx.lineWidth=8*fade;ctx.beginPath();ctx.moveTo(v.x,v.y-20);ctx.lineTo(v.target.x,v.target.y-20);ctx.stroke();this.slash(ctx,v.target.x,v.target.y-20,32+15*t,-.8,'#bf73ed');
        for(let i=0;i<3;i++){ctx.globalAlpha=fade*(.25-i*.05);ctx.fillStyle='#765499';ctx.beginPath();ctx.ellipse(v.x+(v.target.x-v.x)*i/3,v.y+(v.target.y-v.y)*i/3-22,10,23,-.4,0,Math.PI*2);ctx.fill();}
      }else if(v.type==='frost'){
        const r=v.radius*(.65+.35*t);this.glow(ctx,v.x,v.y,r,'#326a8070');ctx.strokeStyle='#b0f4ff';ctx.lineWidth=3*fade;ctx.beginPath();ctx.arc(v.x,v.y,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<14;i++){const a=i*Math.PI/7;this.shard(ctx,v.x+Math.cos(a)*r,v.y+Math.sin(a)*r,10+10*fade,a);}
      }else if(v.type==='lightning'){
        ctx.strokeStyle='#c4f7ff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(v.x-18+i*16,v.y-60);ctx.lineTo(v.x-26+i*16,v.y-43);ctx.lineTo(v.x-12+i*16,v.y-46);ctx.lineTo(v.x-20+i*16,v.y-25);ctx.stroke();}
      }else if(v.type==='ultimate-hunter'){
        // Damage is immediate: arrows are already impacting at age zero, then dissipate.
        for(const [i,p] of v.targets.entries()){ctx.strokeStyle='#ffe3a1';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(p.x-22*(1-t),p.y-95*(1-t)-12);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x-5,p.y-10);ctx.lineTo(p.x,p.y);ctx.lineTo(p.x+3,p.y-11);ctx.stroke();ctx.globalAlpha=fade*.5;ctx.beginPath();ctx.ellipse(p.x,p.y,10+20*t,4+8*t,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=fade;}
      }else if(v.type==='ultimate-arcanist'){
        for(const [i,p] of v.targets.entries()){this.glow(ctx,p.x,p.y-15,40,'#71d6ff80');this.shard(ctx,p.x,p.y-15,32*fade+8,i*.7);ctx.strokeStyle='#9de9fa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y-110*(1-t));ctx.lineTo(p.x,p.y-20);ctx.stroke();for(let j=0;j<3;j++){const a=j*2.1+i;this.shard(ctx,p.x+Math.cos(a)*(15+22*t),p.y+Math.sin(a)*15,6+5*fade,a);}}ctx.strokeStyle='#dcfdff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(v.x,v.y,v.radius*(.6+.4*t),0,Math.PI*2);ctx.stroke();
      }else if(v.type==='ultimate-rogue'){
        for(const [i,p] of v.targets.entries())this.slash(ctx,p.x,p.y-20,25+16*t,i*.9-1,'#ed75b6');this.slash(ctx,v.x,v.y-32,48+25*t,-.6,'#bd4a91');
      }
      ctx.restore();
    }}
    static drawField(ctx,field){
      const trap=field.type==='hunter',age=(trap?8:6)-field.time,fade=Math.min(1,field.time/.6),r=72;
      ctx.save();ctx.translate(field.x,field.y);ctx.globalAlpha=.55*fade;ctx.strokeStyle=trap?'#c5ad75':'#b07cda';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      if(trap){ctx.strokeStyle='#66513a';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,28,15,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#dbcd9b';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.save();ctx.translate(Math.cos(a)*27,Math.sin(a)*14);ctx.rotate(a);ctx.fillStyle='#bfb9a2';ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(-8,0);ctx.lineTo(0,4);ctx.fill();ctx.restore();}ctx.strokeStyle='#a58c52';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-48,25);ctx.lineTo(40,-23);ctx.moveTo(-40,-23);ctx.lineTo(48,25);ctx.stroke();}
      else{for(let i=0;i<9;i++){const a=i*2.4+age*.25,x=Math.cos(a)*(18+i*4),y=Math.sin(a)*(15+i*3);ctx.globalAlpha=fade*(.10+.05*Math.sin(age*3+i));ctx.fillStyle=i%2?'#713784':'#b577cd';ctx.beginPath();ctx.ellipse(x,y-5-Math.sin(age+i)*6,25,15,.3,0,Math.PI*2);ctx.fill();}for(let i=0;i<7;i++){const t=(age*.35+i/7)%1;ctx.globalAlpha=fade*(1-t)*.55;ctx.fillStyle='#d1a6ea';ctx.beginPath();ctx.arc(Math.cos(i*2.4)*r*.75,Math.sin(i*2.4)*r*.55-t*20,1.8,0,Math.PI*2);ctx.fill();}}
      ctx.restore();
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
