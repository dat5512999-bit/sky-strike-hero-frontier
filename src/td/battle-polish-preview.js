(function(ns){
 'use strict';
 // Isolated visual QA: uses production renderers, never writes score/profile data.
 const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),art=new ns.systems.ArtSystem();
 const towers=Object.keys(ns.systems.ArtSystem.FROST_TOWER_CELLS).map((type,i)=>new ns.entities.Building(type,90+i*152,230));
 const hero=new ns.entities.Hero(340,515);hero.chooseClass('frostland');
 const target=new ns.entities.Monster('brute',1,[{x:690,y:515},{x:1000,y:515}]);target.x=690;target.y=515;
 const g={art,hero,monsters:[target],build:{items:towers},feedback:new ns.systems.CombatFeedbackSystem(),projectiles:[],waves:{active:true},onHit(){},onKill(){}};
 const synergy=g.synergy=new ns.systems.BattleSynergySystem(g);hero.synergy=synergy;art.game=g;
 let last=0,clock=0,paused=false,effect='spear';
 function cast(){synergy.frostVisuals=[];ns.systems.FrostlandVFX.emit(synergy,effect,hero,{target:{x:target.x,y:target.y}});}
 document.querySelectorAll('[data-effect]').forEach(b=>b.onclick=()=>{effect=b.dataset.effect;cast();});
 document.getElementById('pause').onclick=e=>{paused=!paused;e.currentTarget.textContent=paused?'繼續播放':'暫停檢查';};
 document.getElementById('step').onclick=()=>{paused=true;document.getElementById('pause').textContent='繼續播放';ns.systems.FrostlandVFX.update(synergy,.15);towers.forEach(b=>b.visualAge+=.15);};
 document.getElementById('rebuild').onclick=()=>towers.forEach(b=>b.visualAge=0);
 function label(text,x,y){ctx.fillStyle='#ecdfbb';ctx.font='16px Microsoft JhengHei,sans-serif';ctx.textAlign='center';ctx.fillText(text,x,y);}
 function loop(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!paused){const before=Math.floor(clock/2);clock+=dt;if(Math.floor(clock/2)!==before)cast();synergy.clock=clock;ns.systems.FrostlandVFX.update(synergy,dt);towers.forEach(b=>{b.visualAge+=dt;b.fireFlash=b.config().supportOnly?0:Math.max(0,1-(clock%1.6)*4);b.aim=0;});}
  ctx.fillStyle='#13232d';ctx.fillRect(0,0,1100,690);ctx.fillStyle='#1d343a';ctx.fillRect(0,304,1100,386);
  towers.forEach(b=>{b.draw(ctx,false,art);label(b.config().name,b.x,280);});
  hero.state='cast';hero.frame=Math.floor(clock*6)%4;hero.animationTime=hero.frame*.09;art.drawHero(ctx,hero);target.draw(ctx,art);
  ns.systems.FrostlandVFX.draw(ctx,synergy);label('正式遊戲渲染器 · 不影響存檔或排行榜',550,655);
  const ready=art.frostTowerAtlas?.ready,spells=synergy.frostVisuals.length;
  document.getElementById('status').textContent=(ready?'7 座塔樓美術已載入':'載入塔樓美術…')+' · '+effect+' · '+(paused?'暫停':'播放中')+' · 特效 '+spells;
  requestAnimationFrame(loop);
 }
 cast();requestAnimationFrame(loop);
})(globalThis.TowerFrontier);
