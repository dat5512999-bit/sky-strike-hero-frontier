(function(ns){
  'use strict';
  const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
  // Avoid eagerly loading every other faction just to inspect these six atlases.
  const art=Object.create(ns.systems.ArtSystem.prototype),animation=ns.systems.FrostlandAnimation;
  const types=Object.keys(ns.systems.FrostlandMotionAtlas);
  const units=types.map((type,i)=>({type,x:190+(i%3)*380,y:245+Math.floor(i/3)*310,active:true,gear:{},
    facing:0,config:()=>ns.config.units[type],frostVisualTime:0,previewCooldown:0}));
  let paused=false,state='idle',last=0,zoom=1.6,speed=1,mirror=false,bounds=false;
  function mode(next){state=next;for(const id of ['idle','attack'])document.getElementById(id).setAttribute('aria-pressed',String(id===state));units.forEach(u=>{u.frostAction=null;u.previewCooldown=0;});}
  document.getElementById('idle').onclick=()=>mode('idle');document.getElementById('attack').onclick=()=>mode('attack');
  function pause(value){paused=value;document.getElementById('pause').textContent=paused?'繼續':'暫停';}
  document.getElementById('pause').onclick=()=>pause(!paused);
  document.getElementById('speed').onchange=e=>speed=Number(e.target.value);
  document.getElementById('zoom').onchange=e=>zoom=Number(e.target.value);
  document.getElementById('mirror').onclick=e=>{mirror=!mirror;e.currentTarget.setAttribute('aria-pressed',String(mirror));};
  document.getElementById('bounds').onclick=e=>{bounds=!bounds;e.currentTarget.setAttribute('aria-pressed',String(bounds));};
  document.getElementById('retry').onclick=()=>{for(const key of Object.keys(art.frostAtlases||{}))if(art.frostAtlases[key].failed)delete art.frostAtlases[key];};
  document.getElementById('step').onclick=()=>{
    pause(true);
    units.forEach(u=>{
      if(state==='idle')u.frostVisualTime+=1/(u.type==='frostBird'?8:3);
      else{if(!u.frostAction)animation.queue(u,[],{});const old=animation.motionPose(u).index,next=8+(old-8+1)%8;
        const phase=next<11?(next-8)*.15+.01:.45+(next-11)*.11+.01;
        u.frostAction.age=phase*u.frostAction.duration;u.frostAction.released=next>=11;}
    });
  };
  function update(dt){
    units.forEach(u=>{
      u.previewCooldown-=dt;
      if(state==='attack'&&!u.frostAction&&u.previewCooldown<=0){animation.queue(u,[],{});u.previewCooldown=u.config().interval;}
      animation.update(u,dt,[],[]);
    });
  }
  function draw(){
    ctx.fillStyle='#162a2e';ctx.fillRect(0,0,canvas.width,canvas.height);
    units.forEach(u=>{
      ctx.strokeStyle='#3a5555';ctx.beginPath();ctx.ellipse(u.x,u.y+17,120,29,0,0,Math.PI*2);ctx.stroke();
      ctx.save();ctx.translate(u.x,u.y);ctx.scale(zoom,zoom);ctx.translate(-u.x,-u.y);u.facing=mirror?Math.PI:0;
      art.drawCombatUnit(ctx,u);
      const pose=animation.motionPose(u),meta=ns.systems.FrostlandMotionAtlas[u.type],f=meta.frames[pose.index],s=ns.systems.FrostlandSprites.heights[u.type]/meta.maxHeight;
      if(bounds){ctx.save();ctx.translate(u.x,u.y+12-pose.lift);if(mirror)ctx.scale(-1,1);ctx.strokeStyle='#f0d385';ctx.strokeRect((f.rect[0]-f.anchorX)*s,(f.rect[1]-f.foot)*s,f.rect[2]*s,f.rect[3]*s);ctx.restore();}
      ctx.restore();ctx.textAlign='center';ctx.font='18px system-ui';ctx.fillStyle='#efe5c9';ctx.fillText(u.config().name,u.x,u.y+53);
      ctx.font='13px system-ui';ctx.fillStyle='#adc8ce';ctx.fillText(`${pose.index<8?'待機':'攻擊'} · 格 ${pose.index+1}/16${u.type==='frostBird'?' · 持續振翅':''}`,u.x,u.y+77);
    });
    const images=types.map(type=>art.frostAtlases?.['motion:'+type]);
    const loaded=images.filter(img=>img?.ready).length,failed=images.filter(img=>img?.failed).length;
    document.getElementById('status').textContent=`圖集 ${loaded}/6 · ${paused?'暫停':'播放中'} · ${failed?`${failed} 份載入失敗，暫用舊圖；可按重試載入`:'命中時序與戰鬥數值不變'}`;
  }
  function loop(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!paused&&!document.hidden)update(dt*speed);draw();requestAnimationFrame(loop);}
  requestAnimationFrame(loop);
})(globalThis.TowerFrontier);
