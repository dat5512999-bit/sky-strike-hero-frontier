(function(ns){
  'use strict';
  class CombatFeedbackSystem{
    constructor(){this.items=[];this.mobile=false;this.corrosion=new Map();this.roots=new Map();}
    reset(){this.items=[];this.corrosion.clear();this.roots.clear();}
    updateRoots(dt,monsters){
      const present=new Set(monsters);
      for(const m of monsters){
        let state=this.roots.get(m);
        if(!m.active){this.roots.delete(m);continue;}
        if(m.rootTime>0&&!(m.frostStatus?.window>0&&!m.frostStatus.deep)){
          if(!state||state.ending){state={age:0,fade:0,ending:false};this.roots.set(m,state);}
          state.age+=dt;
        }else if(state){state.ending=true;state.fade+=dt;if(state.fade>=.38)this.roots.delete(m);}
      }
      for(const m of this.roots.keys())if(!present.has(m))this.roots.delete(m);
    }
    static vineLeaf(ctx,x,y,angle,size){
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#8bbb48';ctx.strokeStyle='#284c27';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.15,-size*.7,size,0);ctx.quadraticCurveTo(size*.2,size*.5,0,0);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#d4e17a';ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(size*.8,0);ctx.stroke();ctx.restore();
    }
    drawRoots(ctx,layer){
      let count=0;
      for(const [m,state] of this.roots){
        if(!m.active)continue;
        const p=this.visualPosition(m),rich=count++<(this.mobile?24:48),fade=state.ending?Math.max(0,1-state.fade/.38):1,grow=Math.min(1,state.age/.24)*fade,r=Math.min(33,(m.radius||16)+8),height=r*1.65;
        ctx.save();ctx.translate(p.x,p.y+4);ctx.globalAlpha=fade;ctx.lineCap='round';ctx.lineJoin='round';
        if(layer==='ground'){
          ctx.fillStyle='#30291b';ctx.globalAlpha=fade*.55;
          for(let i=0;i<3;i++){const a=i*2.1;ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.78,Math.sin(a)*r*.27,7*grow,3*grow,a*.12,0,Math.PI*2);ctx.fill();}
          if(rich&&state.age<.35){const age=state.age/.35;ctx.fillStyle='#927548';ctx.globalAlpha=(1-age)*fade*.8;for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.arc(Math.cos(a)*r*(.5+age*.6),Math.sin(a)*r*.28-12*Math.sin(age*Math.PI),2.5-age,0,Math.PI*2);ctx.fill();}}
        }else{
          // Solid tapered shoots, layered bark and highlights read as vines at game scale.
          const shoots=rich?3:2;
          for(let i=0;i<shoots;i++){
            const side=i%2?-1:1,base=(i-1)*r*.72,h=height*(i===1?1:.78)*grow,sway=Math.sin(state.age*4+i)*1.5;
            const stem=()=>{ctx.beginPath();ctx.moveTo(base,3);ctx.bezierCurveTo(base+side*r*.85,-h*.23,-side*r*.8+sway,-h*.65,side*r*.45,-h);};
            ctx.strokeStyle='#302a19';ctx.lineWidth=7*grow;stem();ctx.stroke();ctx.strokeStyle='#50702c';ctx.lineWidth=4.6*grow;stem();ctx.stroke();ctx.strokeStyle='#a3bc57';ctx.lineWidth=1.3*grow;stem();ctx.stroke();
            ctx.fillStyle='#718f37';ctx.beginPath();ctx.moveTo(side*r*.45-2,-h+5);ctx.lineTo(side*r*.45+side*4,-h-6*grow);ctx.lineTo(side*r*.45+3,-h+4);ctx.fill();
            if(rich&&grow>.35){CombatFeedbackSystem.vineLeaf(ctx,side*r*.45,-h*.96,side>0?-.7:3.7,11*grow);CombatFeedbackSystem.vineLeaf(ctx,base*.6,-h*.36,side>0?2.9:-.5,9*grow);}
          }
          // A front-facing wrap binds both legs; the open silhouette keeps the enemy readable.
          ctx.strokeStyle='#344326';ctx.lineWidth=5*grow;ctx.beginPath();ctx.moveTo(-r*.8,-height*.3*grow);ctx.quadraticCurveTo(0,9*grow,r*.8,-height*.38*grow);ctx.stroke();ctx.strokeStyle='#91b84e';ctx.lineWidth=2*grow;ctx.stroke();
          if(rich){ctx.fillStyle='#c9e78c';for(let i=0;i<3;i++){const t=(state.age*.65+i/3)%1;ctx.globalAlpha=fade*(1-t)*.7;ctx.beginPath();ctx.arc(Math.sin(i*2+state.age)*r,-t*height,1.4,0,Math.PI*2);ctx.fill();}}
        }
        ctx.restore();
      }
    }
    static corrosionKinds(monster){return monster.active?{curse:!!(monster.vulnerability&&monster.vulnerability.time>0),plague:!!(monster.plagueDot&&monster.plagueDot.time>0)}:{curse:false,plague:false};}
    // Presentation state only: never change combat timers, health or damage here.
    updateCorrosion(dt,monsters){
      const present=new Set(monsters);
      for(const monster of monsters){
        const kinds=CombatFeedbackSystem.corrosionKinds(monster),affected=kinds.curse||kinds.plague;
        let state=this.corrosion.get(monster);
        if(affected&&!state){state={age:0,fade:0,ending:false,kinds};this.corrosion.set(monster,state);}
        if(!state)continue;
        if(!monster.active){this.corrosion.delete(monster);continue;}
        if(affected){if(state.ending)state.age=0;state.ending=false;state.fade=0;state.kinds=kinds;state.age+=dt;}
        else{state.ending=true;state.fade+=dt;if(state.fade>=.5)this.corrosion.delete(monster);}
      }
      for(const monster of this.corrosion.keys())if(!present.has(monster)||!monster.active)this.corrosion.delete(monster);
    }
    drawCorrosion(ctx,layer){
      let detailed=0;const cap=this.mobile?24:48;
      for(const [monster,state] of this.corrosion){
        if(!monster.active)continue;
        const p=this.visualPosition(monster),radius=Math.min(38,monster.radius+9),fade=state.ending?Math.max(0,1-state.fade/.5):1,entry=state.ending?0:Math.max(0,1-state.age/.45),rich=detailed++<cap,clock=state.age+state.fade;
        ctx.save();ctx.translate(p.x,p.y+3);ctx.strokeStyle='#cf94ff';ctx.fillStyle='#7835a6';ctx.lineWidth=1.4;
        if(layer==='ground'){
          ctx.globalAlpha=fade*(.4+entry*.25);ctx.beginPath();ctx.ellipse(0,0,radius,radius*.38,0,0,Math.PI*2);ctx.stroke();
          if(rich){ctx.globalAlpha=fade*.28;ctx.beginPath();ctx.ellipse(0,0,radius*.76,radius*.29,0,0,Math.PI*2);ctx.stroke();
            for(let i=0;i<6;i++){const a=i*Math.PI/3+clock*.18,x=Math.cos(a)*radius*.9,y=Math.sin(a)*radius*.34;ctx.beginPath();ctx.moveTo(x-2,y-2);ctx.lineTo(x+2,y);ctx.lineTo(x-2,y+2);ctx.stroke();}
          }
        }else if(rich){
          // Compact entry mist and wisps remain below the health bar.
          if(entry>0){ctx.fillStyle='#492361';ctx.globalAlpha=entry*.24;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(Math.cos(i*1.9)*radius*.55,-5-i*3,radius*.48,7+entry*5,-.3,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#e4b1ff';ctx.globalAlpha=entry*.55;ctx.beginPath();ctx.moveTo(-radius*.5,-8);ctx.quadraticCurveTo(0,-32,radius*.3,-20);ctx.stroke();}
          ctx.fillStyle='#dbaaff';const count=this.mobile?3:5;
          for(let i=0;i<count;i++){const phase=(clock*.7+i/count)%1;ctx.globalAlpha=fade*(1-phase)*.65;const x=Math.sin(i*2.4+clock)*radius*.7,y=-phase*36;ctx.beginPath();ctx.arc(x,y,1.2+(1-phase)*.8,0,Math.PI*2);ctx.fill();}
        }
        ctx.restore();
      }
    }
    static drawCorrosionBadge(ctx,monster,x,y){
      const kinds=CombatFeedbackSystem.corrosionKinds(monster);let offset=0;
      for(const kind of ['curse','plague']){if(!kinds[kind])continue;ctx.save();ctx.translate(x+offset,y);ctx.fillStyle='#261331';ctx.strokeStyle='#d8a3ff';ctx.lineWidth=1.2;ctx.fillRect(-1,-3,13,14);ctx.strokeRect(-1,-3,13,14);ctx.beginPath();
        if(kind==='curse'){ctx.moveTo(1,0);ctx.lineTo(9,0);ctx.lineTo(8,5);ctx.lineTo(5,8);ctx.lineTo(2,5);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(4,3);ctx.lineTo(6,4);ctx.lineTo(4,7);ctx.stroke();}
        else{ctx.fillStyle='#b982ed';ctx.moveTo(5,-1);ctx.quadraticCurveTo(-1,5,5,8);ctx.quadraticCurveTo(11,5,5,-1);ctx.fill();}
        ctx.restore();offset+=15;
      }
    }
    push(item){if(this.reducedFx&&['mote','dust','soul','aura'].includes(item.type))return;const cap=this.mobile?90:140;if(['damage','gold','mote','dust'].includes(item.type)&&this.items.filter(i=>i.type===item.type).length>=(this.mobile?18:30))return;this.items.push(item);if(this.items.length>cap)this.items.splice(0,this.items.length-cap);}
    visualPosition(monster){return typeof monster.visualPosition==='function'?monster.visualPosition():{x:monster.x,y:monster.y};}
    static impactKind(source){const style=source&&source.style;if(style==='ice')return'ice';if(style==='lightning')return'lightning';if(style==='nature')return'nature';if(style==='arrow'||style==='bullet'||(source&&source.attackType==='pierce'))return'pierce';if(style==='claw'||style==='moon'||(source&&source.attackType==='chaos'))return'slash';return'arcane';}
    static impactColor(source,kind){if(typeof source==='string')return source;if(source&&source.color)return source.color;return({ice:'#aeeeff',lightning:'#d8e8ff',nature:'#c4f49d',pierce:'#ffe2a1',slash:'#ff9b74',arcane:'#d9b7ff'})[kind]||'#fff1b2';}
    hit(monster,damage,critical,source){
      const position=this.visualPosition(monster),hasDirection=Boolean(source&&typeof source==='object'&&(Number.isFinite(source.x)||Number.isFinite(source.startX))&&(Number.isFinite(source.y)||Number.isFinite(source.startY))),origin={x:Number.isFinite(source&&source.x)?source.x:Number.isFinite(source&&source.startX)?source.startX:position.x,y:Number.isFinite(source&&source.y)?source.y:Number.isFinite(source&&source.startY)?source.startY:position.y},dx=position.x-origin.x,dy=position.y-origin.y,length=Math.hypot(dx,dy)||1,normal={x:dx/length,y:dy/length},radius=Math.max(8,monster.radius||16),kind=CombatFeedbackSystem.impactKind(source),color=CombatFeedbackSystem.impactColor(source,kind),contact=hasDirection?{x:position.x+normal.x*radius*.58,y:position.y+normal.y*radius*.34-radius*.24}:position;
      const kick=critical?6:3.5,duration=critical?.16:.12;if(typeof monster.setHitKick==='function')monster.setHitKick(normal.x*kick,normal.y*kick*.38,duration);else{monster.hitKickX=normal.x*kick;monster.hitKickY=normal.y*kick*.38;monster.hitKickDuration=duration;monster.hitKickTime=duration;}
      monster.criticalFlash=critical?.16:0;this.push({type:'impact',x:contact.x,y:contact.y,time:critical?.3:.22,max:critical?.3:.22,heavy:critical,color,kind,incomingX:normal.x,incomingY:normal.y});
      this.push({type:'dust',x:position.x-normal.x*radius*.18,y:position.y+4,time:critical?.28:.2,max:critical?.28:.2,directionX:normal.x,directionY:normal.y,color:kind==='ice'?'#c5edff':'#c4a678'});
      this.push({type:'damage',x:position.x+(Math.random()-.5)*12,y:position.y-monster.radius-12,time:.78,max:.78,value:Math.max(1,Math.round(damage)),critical:Boolean(critical)});
    }
    drawGround(ctx){this.items.forEach(function(item){if(item.type!=='dust')return;const ratio=Math.max(0,item.time/item.max),age=1-ratio;ctx.save();ctx.globalAlpha=ratio*.48;ctx.fillStyle=item.color;for(let i=0;i<3;i++){const spread=(i-1)*6+item.directionX*age*11,rise=Math.abs(i-1)*2-item.directionY*age*5;ctx.beginPath();ctx.ellipse(item.x+spread,item.y+rise,4+age*3,1.5+age,0,0,Math.PI*2);ctx.fill();}ctx.restore();});}
    gold(monster,value){const position=this.visualPosition(monster);this.push({type:'gold',x:position.x,y:position.y-8,time:1.05,max:1.05,value:Math.round(value)});}
    death(monster){
      const position=this.visualPosition(monster);
      this.push({type:'death',x:position.x,y:position.y,time:monster.type==='boss'?.9:.48,max:monster.type==='boss'?.9:.48,color:monster.color,variant:monster.type==='boss'?'boss':['revenant','treant','shaman'].includes(monster.type)?'magic':'body'});
      for(let i=0;i<(monster.type==='boss'?8:3);i++){const angle=Math.PI*2*i/5;this.push({type:'mote',x:position.x,y:position.y,vx:Math.cos(angle)*(28+i*3),vy:Math.sin(angle)*(22+i*2)-18,time:.55,max:.55,color:monster.color});}
    }
    explosion(position,radius,color,style){this.push({type:'explosion',x:position.x,y:position.y,radius:radius||40,color:color||'#ffbc6b',style:style||'fire',time:.6,max:.6});}
    soul(from,to){if(this.items.filter(i=>i.type==='soul').length>=(this.mobile?10:18))return;this.push({type:'soul',x:from.x,y:from.y,toX:to.x,toY:to.y-30,time:.65,max:.65,color:'#bea1ff'});}
    aura(unit,color){this.push({type:'aura',x:unit.x,y:unit.y,color,time:.6,max:.6});}
    allyHit(target,value){this.push({type:'allyDamage',x:target.x+(Math.random()-.5)*10,y:target.y-34,time:.72,max:.72,value:Math.round(value)});this.push({type:'impact',x:target.x,y:target.y-8,time:.2,max:.2,color:'#ff765c'});}
    warning(source,label,radius){this.push({type:'warning',x:source.x,y:source.y,time:1.05,max:1.05,label:label,radius:radius||24});if(radius>=60&&this.announcer){this.announcer.textContent='首領蓄力：'+label;}}
    revive(hero){this.push({type:'revive',x:hero.x,y:hero.y,time:.8,max:.8,color:'#95ffe0'});}
    heal(target,value){this.push({type:'heal',x:target.x,y:target.y-target.radius-10,time:.75,max:.75,value:Math.round(value)});}
    update(dt){this.items.forEach(function(item){item.time-=dt;if(item.type==='mote'){item.x+=item.vx*dt;item.y+=item.vy*dt;item.vy+=55*dt;}});this.items=this.items.filter(function(item){return item.time>0;});if(this.announcer&&!this.items.some(item=>item.type==='warning'&&item.radius>=60))this.announcer.textContent='';}
    static drawStatus(ctx,m,clock,occupied){
      if(!m.active)return;ctx.save();ctx.translate(m.x,m.y);const pulse=.5+Math.sin((clock||0)*8)*.15;ctx.lineWidth=1.5;
      if(m.slowTimer>0){ctx.strokeStyle='#99e5ff';ctx.globalAlpha=.65;for(let i=0;i<3;i++){const x=(i-1)*13;ctx.beginPath();ctx.moveTo(x-3,5);ctx.lineTo(x, -8-i%2*5);ctx.lineTo(x+4,5);ctx.stroke();}}
      if(m.shockTime>0&&Math.sin(clock*23)>.1){ctx.strokeStyle='#b3dfff';ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(-15,-8);ctx.lineTo(-8,-27);ctx.lineTo(3,-19);ctx.lineTo(13,-40);ctx.stroke();}
      if(m.natureMark){ctx.fillStyle='#91eaa1';ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(16,-21,5,2,clock,0,Math.PI*2);ctx.fill();}
      if(m.arcaneMark>0){ctx.strokeStyle='#b9a0f5';ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(0,3,18,clock,clock+Math.PI*1.4);ctx.stroke();}
      // Short labels preserve status meaning when hue and particle motion are hard to see.
      const labels=[];if(m.mapPressure)labels.push(m.mapPressure.status||'壓');if(m.frostStatus?.window>0)labels.push('凍');else if(m.rootTime>0)labels.push('定');else if(m.slowTimer>0)labels.push('緩');
      if(m.plagueDot?.time>0)labels.push('腐');else if(m.shockTime>0)labels.push('電');
      const shown=labels.slice(0,2),width=shown.length*19-2,radius=m.radius||16;
      const candidates=[{x:m.x+radius+5,y:m.y-27},{x:m.x-radius-5-width,y:m.y-27},{x:m.x-width/2,y:m.y-radius-38}];
      const clear=rect=>rect.x>=0&&rect.y>=0&&rect.x+width<=ns.config.width&&rect.y+17<=ns.config.height&&!(occupied||[]).some(other=>rect.x<other.x+other.width+3&&rect.x+width+3>other.x&&rect.y<other.y+other.height+3&&rect.y+20>other.y);
      const badge=shown.length?(occupied?candidates.find(clear):candidates[0]):null;
      if(badge){if(occupied)occupied.push({x:badge.x,y:badge.y,width,height:17});ctx.globalAlpha=1;shown.forEach((label,i)=>{const x=badge.x-m.x+i*19,y=badge.y-m.y;ctx.fillStyle='#071319';ctx.fillRect(x,y,17,17);ctx.strokeStyle='#fff3ce';ctx.strokeRect(x+.5,y+.5,16,16);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x+8.5,y+8.5);});}
      ctx.restore();
    }
    draw(ctx){
      this.items.forEach(function(item){const ratio=Math.max(0,item.time/item.max),age=1-ratio;ctx.save();ctx.globalAlpha=Math.min(1,ratio*2);
        if(item.type==='damage'||item.type==='gold'||item.type==='allyDamage'||item.type==='heal'){
          ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(3,5,5,.9)';ctx.fillStyle=item.type==='gold'?'#f5c85b':item.type==='heal'?'#7df09b':item.type==='allyDamage'?'#ff7b69':item.critical?'#ff823d':'#fff1d2';ctx.font=(item.critical?'900 19px ':'800 14px ')+'Segoe UI';const label=item.type==='gold'?('+'+item.value+' Gold'):item.type==='heal'?('治療 +'+item.value):(item.critical?'暴擊 '+item.value:'-'+item.value);const y=item.y-age*(item.type==='gold'?30:22);ctx.strokeText(label,item.x,y);ctx.fillText(label,item.x,y);
        }else if(item.type==='impact'){
          const angle=Math.atan2(item.incomingY||0,item.incomingX||1),rays=item.heavy?7:5,reach=age*(item.heavy?27:17);ctx.translate(item.x,item.y);ctx.strokeStyle=item.color;ctx.fillStyle='#fff7d6';ctx.shadowColor=item.color;ctx.shadowBlur=8;ctx.lineCap='round';ctx.lineWidth=item.heavy?3:2;
          // This short streak keeps the visual contact point readable after a projectile retires.
          ctx.globalAlpha=ratio*.7;ctx.beginPath();ctx.moveTo(-(item.incomingX||0)*Math.max(7,reach),-(item.incomingY||0)*Math.max(7,reach));ctx.lineTo(0,0);ctx.stroke();ctx.globalAlpha=ratio;ctx.beginPath();ctx.arc(0,0,item.heavy?4:3,0,Math.PI*2);ctx.fill();
          for(let i=0;i<rays;i++){const fan=angle+Math.PI+(i-(rays-1)/2)*Math.PI/(rays-1||1),start=item.heavy?3:2,end=7+reach*(.62+(i%2)*.25);ctx.beginPath();ctx.moveTo(Math.cos(fan)*start,Math.sin(fan)*start);ctx.lineTo(Math.cos(fan)*end,Math.sin(fan)*end);ctx.stroke();}
          if(item.kind==='ice'){ctx.strokeStyle='#efffff';ctx.lineWidth=1.5;for(let i=0;i<4;i++){const shard=angle+i*Math.PI/2;ctx.beginPath();ctx.moveTo(Math.cos(shard)*5,Math.sin(shard)*5);ctx.lineTo(Math.cos(shard)*Math.max(9,reach),Math.sin(shard)*Math.max(9,reach));ctx.stroke();}}
        }else if(item.type==='death'){
          ctx.strokeStyle=item.color;ctx.lineWidth=3;if(item.variant==='magic'){ctx.globalAlpha=ratio*.55;ctx.beginPath();ctx.moveTo(item.x-15*ratio,item.y);ctx.quadraticCurveTo(item.x+20,item.y-25-age*25,item.x,item.y-55*age);ctx.stroke();}ctx.beginPath();ctx.ellipse(item.x,item.y+4,10+age*(item.variant==='boss'?75:28),4+age*(item.variant==='boss'?28:12),0,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='warning'){
          ctx.globalAlpha=.35+ratio*.45;ctx.strokeStyle='#ff4d5d';ctx.fillStyle='rgba(255,53,70,.1)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(item.x,item.y,item.radius*(.82+age*.18),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe0a8';ctx.font='900 12px Segoe UI';ctx.textAlign='center';ctx.fillText(item.label,item.x,item.y-item.radius-8);
        }else if(item.type==='revive'){
          ctx.strokeStyle=item.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(item.x,item.y,14+age*40,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='explosion'&&item.style==='nature'){
          ctx.translate(item.x,item.y);ctx.globalAlpha=ratio;ctx.lineCap='round';
          const reach=item.radius*Math.min(1,age*3),count=6;
          for(let i=0;i<count;i++){const a=i*Math.PI*2/count,dx=Math.cos(a)*reach,dy=Math.sin(a)*reach*.45;
            const branch=()=>{ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(dx*.35,dy-18*Math.sin(age*Math.PI),dx,dy);};
            ctx.strokeStyle='#314629';ctx.lineWidth=5*ratio;branch();ctx.stroke();ctx.strokeStyle='#9dcc63';ctx.lineWidth=2*ratio;branch();ctx.stroke();
            CombatFeedbackSystem.vineLeaf(ctx,dx,dy,a,12*ratio);ctx.fillStyle='#e1f4a7';ctx.beginPath();ctx.arc(dx,dy,2*ratio,0,Math.PI*2);ctx.fill();
          }
        }else if(item.type==='explosion'){

          const radius=item.radius,expansion=Math.min(1,age*2.4);ctx.translate(item.x,item.y);ctx.strokeStyle=item.color;ctx.lineWidth=3*ratio;
          if(age<.65){const glow=ctx.createRadialGradient(0,0,0,0,0,radius*.8);if(glow&&glow.addColorStop){glow.addColorStop(0,item.style==='ice'?'#d8f9ff':item.style==='nature'?'#ceffc7':'#fff4c2');glow.addColorStop(.25,item.color);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.globalAlpha=ratio*.6;ctx.fillRect(-radius,-radius,radius*2,radius*2);}}
          ctx.globalAlpha=ratio;
          ctx.beginPath();ctx.arc(0,0,radius*expansion,0,Math.PI*2);ctx.stroke();
          if(age<.5){ctx.globalAlpha=(1-age/.5)*.8;ctx.fillStyle=item.style==='ice'?'#c7f3ff':item.style==='nature'?'#adf6ba':'#ffda89';ctx.beginPath();ctx.arc(0,0,radius*(.18+age*.65),0,Math.PI*2);ctx.fill();if(item.style!=='ice'&&item.style!=='nature'){ctx.fillStyle='#fff3bb';ctx.globalAlpha=ratio*.7;for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ctx.beginPath();ctx.arc(Math.cos(a)*radius*age*.55,Math.sin(a)*radius*age*.45,radius*.09*ratio,0,Math.PI*2);ctx.fill();}}}
          for(let i=0;i<8;i++){const a=i*Math.PI/4+.2,r=radius*expansion*.8;ctx.globalAlpha=ratio*.8;ctx.strokeStyle=item.style==='ice'?'#a1e7ff':item.color;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}
          if(age>.2&&item.style!=='ice'&&item.style!=='nature'){ctx.globalAlpha=ratio*.14;ctx.fillStyle='#96918b';for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*radius*.4,Math.sin(a)*radius*.35-age*18,radius*.22,0,Math.PI*2);ctx.fill();}}
        }else if(item.type==='soul'){
          const x=item.x+(item.toX-item.x)*age,y=item.y+(item.toY-item.y)*age-Math.sin(age*Math.PI)*26;ctx.fillStyle=item.color;ctx.beginPath();ctx.ellipse(x,y,3.5,6,age,0,Math.PI*2);ctx.fill();ctx.globalAlpha=ratio*.3;ctx.beginPath();ctx.ellipse(x-5,y+9,2,7,.3,0,Math.PI*2);ctx.fill();
        }else if(item.type==='aura'){
          ctx.strokeStyle=item.color;ctx.globalAlpha=ratio*.35;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(item.x,item.y+5,18+age*8,6+age*3,0,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='mote'){
          ctx.fillStyle=item.color;ctx.beginPath();ctx.arc(item.x,item.y,2+ratio*2,0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
      });
    }
  }
  ns.systems.CombatFeedbackSystem=CombatFeedbackSystem;
})(globalThis.TowerFrontier);
