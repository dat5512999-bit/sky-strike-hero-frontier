(function(ns){
  'use strict';
  const VFX=ns.systems.UnitVFX,art={},cards=[],melee=new Set(['slash','thrust','shield','slam','charge','tideSlash','breath']);
  const paths={soldierAtlas:VFX.PATH,towerPaintedAtlas:ns.systems.PaintedTowerVFX.PATH,towerMagicAtlas:ns.systems.PaintedTowerVFX.MAGIC_PATH};
  let loaded=0,failed=false;
  for(const [slot,path]of Object.entries(paths)){const image=art[slot]=new Image();image.onload=()=>{image.ready=true;loaded++;if(!failed)document.querySelector('#status').textContent=loaded===3?'素材就緒。左：攻擊來源；右：命中與連鎖靶標。':'載入素材中…';};image.onerror=()=>{failed=true;document.querySelector('#status').textContent='素材載入失敗，請確認透過本機伺服器開啟並重新載入。';};image.src=path;}
  for(const [type,cfg]of Object.entries(ns.config.units)){
    const card=document.createElement('article'),title=document.createElement('h2'),canvas=document.createElement('canvas');title.textContent=cfg.name+(cfg.enemyOnly?'（敵軍限定配置）':'');canvas.width=420;canvas.height=180;card.append(title,canvas);document.querySelector('#cards').append(card);
    cards.push({type,cfg,card,ctx:canvas.getContext('2d'),category:cfg.supportOnly?'support':melee.has(VFX.KEYS[type])?'melee':'ranged'});
  }
  let time=0,last=performance.now(),paused=false;
  document.querySelector('#pause').onclick=function(){paused=!paused;this.textContent=paused?'繼續':'暫停';};document.querySelector('#replay').onclick=()=>{time=0;};
  function render(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!paused&&!document.hidden)time+=dt;
    const phase=time%1.4,reduced=document.querySelector('#reduced').checked,filter=document.querySelector('#filter').value;
    for(const {type,cfg,card,ctx,category}of cards){card.hidden=filter!=='all'&&category!==filter;if(card.hidden)continue;
      ctx.fillStyle='#8d795e';ctx.fillRect(0,0,420,180);ctx.fillStyle='#a18c6a';for(let row=0;row<5;row++)ctx.fillRect(row%2*16,30+row*29,405,23);
      for(const x of [55,245,310]){ctx.fillStyle=x===55?'#344f59':'#614c3d';ctx.beginPath();ctx.ellipse(x,130,16,5,0,0,Math.PI*2);ctx.fill();ctx.fillRect(x-8,103,16,24);ctx.beginPath();ctx.arc(x,98,8,0,Math.PI*2);ctx.fill();}
      const owner={kind:'unit',type,x:55,y:125,active:true,config:()=>cfg},target={x:245,y:125,active:true,supportHasteSource:owner,supportDamageSource:owner};owner.synergy={clock:time,game:{art,feedback:{reducedFx:reduced},build:{items:[owner,target]}}};
      if(cfg.supportOnly){if(phase>.8){target.supportHasteSource=null;target.supportDamageSource=null;}VFX.support(ctx,owner);}
      else if(phase<.72){const hit=phase>=.4,travel=Math.min(1,phase/.4),p={owner,target,unitVfx:VFX.key(owner),active:true,startX:55,startY:125,x:55+190*travel,y:125,flightAge:phase,hitResolved:hit,trail:.32-(phase-.4),chain:cfg.chain||cfg.kingdomBounce?2:0,chainPoints:[{x:55,y:103},{x:245,y:103},...(cfg.chain||cfg.kingdomBounce?[{x:310,y:103}]:[])]};VFX.projectile(ctx,p);}
      ctx.fillStyle='#fff3d8';ctx.font='12px system-ui';ctx.fillText(cfg.supportOnly?(phase<.8?'支援生效':'支援停止'):phase<.4?'出手':phase<.72?'命中／消散':'等待下一次攻擊',12,165);
    }requestAnimationFrame(render);
  }requestAnimationFrame(render);
})(globalThis.TowerFrontier);
