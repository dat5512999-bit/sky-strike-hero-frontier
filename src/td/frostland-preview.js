(function(ns){
  'use strict';
  const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),art=new ns.systems.ArtSystem();
  const heroes=Array.from({length:4},(_,i)=>{const h=new ns.entities.Hero(120+i*258,272);h.chooseClass('frostland');h.equipment.spear=i;return h;});
  const units=ns.systems.FactionSystem.FACTIONS.frostland.units.map((type,i)=>new ns.entities.CombatUnit(type,90+i*184,550));
  const monsters=units.map(u=>{const m=new ns.entities.Monster('brute',1,[{x:u.x+65,y:u.y},{x:1500,y:u.y}]);m.x=u.x+65;m.y=u.y;m.health=m.maxHealth=1000000;return m;});
  const g={hero:heroes[0],build:{items:units},monsters,projectiles:[],feedback:new ns.systems.CombatFeedbackSystem(),waves:{active:true},onHit(){},onKill(){}};
  const synergy=g.synergy=new ns.systems.BattleSynergySystem(g);units.concat(heroes).forEach(u=>u.synergy=synergy);
  let paused=false,clock=0,last=0,state='attack';
  document.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>{state=b.dataset.state;document.querySelectorAll('[data-state]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  document.getElementById('pause').onclick=event=>{paused=!paused;event.currentTarget.textContent=paused?'繼續播放':'暫停檢查';};
  document.querySelectorAll('[data-effect]').forEach(b=>b.onclick=()=>{
    const type=b.dataset.effect,h=heroes[0];
    if(type==='winter'){h.skillCooldowns.ultimate=0;ns.systems.FrostlandHero.ultimate(h,monsters);}
    else if(type==='hunt'){h.skillCooldowns.summon=0;ns.systems.FrostlandHero.hunt(h);}
    else if(type==='shatter'){monsters.forEach(m=>{m.frostStatus=null;ns.systems.FrostStatusSystem.apply(m,100);});}
    else ns.systems.FrostlandVFX.emit(synergy,type,h,{target:{x:500,y:280}});
  });
  document.getElementById('sound').textContent='音效：'+(ns.systems.FrostlandAudio.enabled?'開':'關');
  document.getElementById('sound').onclick=event=>{const on=ns.systems.FrostlandAudio.setEnabled(!ns.systems.FrostlandAudio.enabled);event.currentTarget.textContent='音效：'+(on?'開':'關');ns.systems.FrostlandAudio.play('freeze');};
  function label(text,x,y,color='#ebddba',size=17){ctx.fillStyle=color;ctx.font=`${size}px Microsoft JhengHei, sans-serif`;ctx.textAlign='center';ctx.fillText(text,x,y);}
  function loop(now){
    const dt=Math.min(.05,(now-last)/1000||0);last=now;
    if(!paused){clock+=dt;synergy.clock=clock;ns.systems.FrostStatusSystem.updateBattle(synergy,dt);ns.systems.FrostlandVFX.update(synergy,dt);monsters.forEach(m=>ns.systems.FrostStatusSystem.update(m,dt));units.forEach(u=>u.update(dt,monsters,g.projectiles,[]));g.projectiles.forEach(p=>p.update(dt,monsters,()=>{},()=>{}));g.projectiles=g.projectiles.filter(p=>p.active);}
    ctx.fillStyle='#10202b';ctx.fillRect(0,0,1100,720);ctx.strokeStyle='#354650';ctx.lineWidth=1;
    for(let x=0;x<1100;x+=55){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,720);ctx.stroke();}for(let y=0;y<720;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1100,y);ctx.stroke();}
    heroes.forEach(h=>{h.state=state;h.frame=Math.floor(clock*(state==='walk'?8:state==='idle'?3:5))%4;h.animationTime=h.frame*.09;ctx.save();ctx.translate(h.x,h.y);ctx.scale(1.65,1.65);ctx.translate(-h.x,-h.y);art.drawHero(ctx,h);ctx.restore();label(ns.systems.EquipmentSystem.weapon(h).name,h.x,325);label(['初始武器','升級 I · 100G','升級 II · 160G','升級 III · 220G'][h.equipment.spear],h.x,350,'#9ac0c8',13);});
    units.forEach(u=>{ctx.save();ctx.translate(u.x,u.y);ctx.scale(1.3,1.3);ctx.translate(-u.x,-u.y);art.drawCombatUnit(ctx,u);ctx.restore();label(u.config().name,u.x,595);label(u.frostAction?'蓄力 → 出手 → 回復':'待命',u.x,620,'#9ac0c8',13);});
    g.projectiles.forEach(p=>p.draw(ctx));ns.systems.FrostlandVFX.draw(ctx,synergy);monsters.forEach(m=>ns.systems.FrostStatusSystem.draw(ctx,m));
    const loaded=['hero','soldiers','weapons'].filter(k=>art.frostAtlases?.[k]?.ready).length;
    document.getElementById('status').textContent=`動作圖集 ${loaded}/3 · ${paused?'已暫停':'播放中'} · 特效 ${synergy.frostVisuals.length} · 武器隨手部逐格定位`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})(globalThis.TowerFrontier);
