(function(ns){
 'use strict';
 // Read-only visual fixture. State switches below simulate presentation, not combat.
 const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),art=new ns.systems.ArtSystem();
 const towers=Object.keys(ns.systems.ArtSystem.GOBLIN_BUILDING_FRAMES).map((type,i)=>new ns.entities.Building(type,90+i*152,210));
 const hero=new ns.entities.Hero(450,490);hero.chooseClass('goblin');
 const target=new ns.entities.Building('goblinTurret',720,490);target.visualAge=2;target.networkPowered=true;
 const g={art,hero,build:{items:[...towers,target]},feedback:new ns.systems.CombatFeedbackSystem()};
 hero.synergy={game:g};art.game=g;art.preloadFaction('goblin',towers.map(b=>b.type));
 let last=0,clock=0,paused=false,effect='goblin-modify',network=0,summon=null;
 const states=['供電','超載','冷卻'];
 function cast(){
  hero.skillVfx=[];ns.systems.HeroSkillVFX.emit(hero,effect,{target:{x:target.x,y:target.y},radius:effect==='goblin-cool'?112:125,duration:effect==='goblin-overload'?.85:.8});
  if(effect==='goblin-deploy')summon=new ns.entities.Summon(hero,{form:'goblin',offsetX:28,offsetY:0,tags:['summon','mechanical']});
 }
 function advance(dt){
  clock+=dt;ns.systems.HeroSkillVFX.update(hero,dt);
  for(const b of [...towers,target]){b.visualAge+=dt;b.fireFlash=b.config().supportOnly?0:Math.max(0,1-(clock%1.6)*4);b.aim=0;b.networkPowered=true;b.networkOverloaded=network===1;b.networkCooling=network===2;}
  if(summon){summon.spawnTime=Math.max(0,summon.spawnTime-dt);summon.frameClock+=dt;summon.state='idle';}
 }
 document.querySelectorAll('[data-effect]').forEach(b=>b.onclick=()=>{effect=b.dataset.effect;cast();});
 document.getElementById('pause').onclick=e=>{paused=!paused;e.currentTarget.textContent=paused?'繼續播放':'暫停檢查';};
 document.getElementById('step').onclick=()=>{paused=true;document.getElementById('pause').textContent='繼續播放';advance(.15);};
 document.getElementById('rebuild').onclick=()=>towers.forEach(b=>b.visualAge=0);
 document.getElementById('network').onclick=e=>{network=(network+1)%3;e.currentTarget.textContent='狀態：'+states[network];advance(0);};
 const cards=document.querySelector('.cards');
 for(const b of towers){const card=document.createElement('article');card.dataset.buildKind='building';card.dataset.buildType=b.type;card.innerHTML='<b>'+b.config().name+'</b><small>正式建造卡取景</small>';cards.append(card);}
 g.refreshRosterPreviews=()=>cards.querySelectorAll('article').forEach(card=>art.preview(card,'building',card.dataset.buildType));
 function label(text,x,y){ctx.fillStyle='#ecdfbb';ctx.font='16px Microsoft JhengHei,sans-serif';ctx.textAlign='center';ctx.fillText(text,x,y);}
 function loop(now){
  const dt=Math.min(.05,(now-last)/1000||0);last=now;
  if(!paused){const before=Math.floor(clock/2);advance(dt);if(Math.floor(clock/2)!==before)cast();}
  ctx.fillStyle='#142725';ctx.fillRect(0,0,1100,620);ctx.fillStyle='#1e3531';ctx.fillRect(0,280,1100,340);
  towers.forEach(b=>{b.draw(ctx,false,art);label(b.config().name,b.x,260);});
  hero.state='cast';hero.frame=Math.floor(clock*6)%4;art.drawHero(ctx,hero);
  target.draw(ctx,false,art);if(summon)summon.draw(ctx,art);
  ns.systems.HeroSkillVFX.draw(ctx,hero);
  label('正式渲染器 · 展示狀態：'+states[network]+' · 不影響存檔與排行榜',550,590);
  const status=art.coreStatus('goblin');
  document.getElementById('status').textContent=(status.ready?'美術已載入':status.failed?'有素材載入失敗，請重新整理':'載入美術…')+' · '+effect+' · '+(paused?'暫停':'播放中');
  if(status.ready)g.refreshRosterPreviews();
  requestAnimationFrame(loop);
 }
 advance(0);cast();requestAnimationFrame(loop);
})(globalThis.TowerFrontier);
