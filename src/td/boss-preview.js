(function(ns){
  'use strict';
  const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),art=new ns.systems.ArtSystem(),catalog=ns.systems.BossVisualCatalog;
  const identityCanvas=document.getElementById('boss-identity'),identityCtx=identityCanvas.getContext('2d'),heroImage=art.load('assets/td/naga/tidebreaker-hero-actions-v1.png');
  const pairs=catalog.entries.map((e,i)=>{const x=(i%5)*300,y=Math.floor(i/5)*310;
    const old=new ns.entities.Monster(e.type,e.wave),next=catalog.apply(new ns.entities.Monster(e.type,e.wave));
    Object.assign(old,{x:x+72,y:y+211});Object.assign(next,{x:x+213,y:y+211});art.bossImage(e);return {entry:e,old,next,x,y};});
  let paused=false,frame=0,clock=0,last=0,facing=0;
  const motion=document.getElementById('motion');
  document.getElementById('pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'播放':'暫停';};
  document.getElementById('step').onclick=()=>{paused=true;frame=(frame+1)%4;document.getElementById('pause').textContent='播放';};
  document.getElementById('flip').onclick=()=>facing=facing?0:Math.PI;
  document.getElementById('retry').onclick=()=>art.retryFailed();
  function draw(now){if(!paused){clock+=Math.min(.05,(now-last)/1000||0);frame=Math.floor(clock*5)%4;}last=now;
    ctx.clearRect(0,0,1500,620);
    for(const p of pairs){ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,300,310);ctx.clip();
      if(art.background.ready)ctx.drawImage(art.background,p.x,p.y,300,310);else{ctx.fillStyle='#243a2c';ctx.fillRect(p.x,p.y,300,310);}
      ctx.fillStyle='rgba(5,17,13,.5)';ctx.fillRect(p.x,p.y,300,310);
      for(const m of [p.old,p.next]){m.state=motion.value;m.frame=frame;m.facing=facing;art.drawMonster(ctx,m);m.drawHealthBar(ctx);}
      ctx.fillStyle='#fff0cb';ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText('第 '+p.entry.wave+' 波',p.x+150,p.y+29);ctx.fillText(p.entry.name,p.x+150,p.y+55);
      ctx.font='14px system-ui';ctx.fillText('原本',p.x+72,p.y+247);ctx.fillText(p.entry.original?'保留原貌':'新造型',p.x+213,p.y+247);
      ctx.strokeStyle='#61735e';ctx.strokeRect(p.x+.5,p.y+.5,299,309);ctx.restore();
    }
    const ready=pairs.every(p=>art.bossImage(p.entry).ready)&&art.background.ready&&heroImage.ready;
    identityCtx.fillStyle='#20392f';identityCtx.fillRect(0,0,900,270);
    const identityPair=pairs[9];
    art.drawNagaHero(identityCtx,{x:150,y:194,state:motion.value,frame,facing,animationTime:0},heroImage);
    for(const [m,x] of [[identityPair.old,450],[identityPair.next,750]]){
      art.drawMonster(identityCtx,Object.assign({},m,{x,y:194}));
    }
    identityCtx.fillStyle='#ffedbc';identityCtx.font='bold 18px system-ui';identityCtx.textAlign='center';
    ['娜迦英雄（未改動）','舊版魔王','新版魔王 · 魚人王'].forEach((label,i)=>identityCtx.fillText(label,150+i*300,241));
    const failed=pairs.filter(p=>art.bossImage(p.entry).failed).length;
    document.getElementById('status').textContent=failed?failed+' 份首領素材載入失敗，請確認連線後按「重試載入」；戰場暫用原本造型。':art.background.failed?'背景載入失敗，使用純色預覽；可按「重試載入」。':ready?'10 位首領已載入 · 第 '+(frame+1)+' 格 · '+(paused?'暫停':'播放中'):'素材載入中…';
    globalThis.bossPreviewReady=ready;requestAnimationFrame(draw);
  }
  globalThis.bossPreview={art,pairs,set(state,index,direction=0){paused=true;motion.value=state;frame=index;facing=direction;}};
  requestAnimationFrame(draw);
})(globalThis.TowerFrontier);
