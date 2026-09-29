'use strict';
const ids=['fireDemon','frostWyrm','powderThrower','bountyHunter'],result=document.getElementById('result'),frame=document.querySelector('iframe');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function runtime(){if(location.hostname!=='127.0.0.1'||location.port!=='4174')throw Error('請使用專用測試 port 4174');const w=frame.contentWindow;if(!w.towerFrontierGame?.app)throw Error('遊戲尚未載入');return {w,g:w.towerFrontierGame,ns:w.TowerFrontier};}
function action(id,fn){document.getElementById(id).onclick=async()=>{try{await fn();}catch(e){result.textContent=e.stack;}};}
action('prepare',async()=>{
 const {g,ns}=runtime(),data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)});
 store.switchTo('admin');g.app.store=store;g.app.bindStorage('free');g.app.openFree();g.chooseMap('beginner');g.chooseDifficulty('veteran');g.chooseProfession('hunter','hunter');
 const end=performance.now()+30000;while(!g.profession.selected||ids.some(id=>!g.art.actionImage(id).ready)){if(performance.now()>end)throw Error('素材載入逾時');await delay(100);}
 g.paused=true;g.waves.holdPreparation(true);g.economy.gold=20000;g.economy.merit=100;g.updateUi();g.openShop();
 frame.contentDocument.querySelector('.neutral-mercenaries').scrollIntoView({block:'center'});
 result.textContent=JSON.stringify({version:ns.systems.ProfileStore.VERSION,cards:ids.map(id=>{const b=frame.contentDocument.querySelector('[data-mercenary="'+id+'"]');return{id,hidden:b.hidden,disabled:b.disabled,preview:b.dataset.previewReady,text:b.innerText};})},null,2);
});
action('deploy',async()=>{
 const {g}=runtime(),out=[];g.closeShop();
 for(const id of ids){g.openShop();const b=frame.contentDocument.querySelector('[data-mercenary="'+id+'"]');b.click();if(g.build.pending?.type!==id)throw Error(id+' shop queue failed');
  let point;for(let y=280;y<700&&!point;y+=90)for(let x=220;x<1100;x+=160)if(g.build.canPlaceAt(x,y,'unit')){point={x,y};break;}
  if(!point)throw Error('找不到有效部署點');const before=g.economy.gold;g.build.stagePlacement(point.x,point.y);if(!g.build.confirmPlacement(g.economy))throw Error(id+' deploy failed');out.push({id,...point,paid:before-g.economy.gold});
 }g.updateUi();result.textContent=JSON.stringify({deployed:out},null,2);
});
action('motion',async()=>{
 const {g,ns}=runtime(),container=document.getElementById('frames');container.replaceChildren();
 for(const id of ids){const c=document.createElement('canvas');c.width=640;c.height=720;const ctx=c.getContext('2d'),u=new ns.entities.CombatUnit(id,0,0);container.append(c);
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){ctx.strokeStyle='#506056';ctx.strokeRect(col*160,row*180,160,180);ctx.fillStyle='#eee';ctx.font='14px sans-serif';ctx.fillText(id+' '+row+'/'+col,col*160+5,row*180+20);Object.assign(u,{x:col*160+80,y:row*180+148,state:['idle','walk','attack','hit'][row],frame:col,facing:col%2?Math.PI:0,level:col%2?5:1});g.art.drawCombatUnitSprite(ctx,u);}
 }result.textContent='64 格；交錯左右面向與 Lv.1/Lv.5，請檢查頭、腳、武器、尾巴與翅膀。';
});
action('battle',async()=>{
 document.getElementById('frames').replaceChildren();
 const {g,ns,w}=runtime();g.closeShop();if(!ids.every(id=>g.build.items.some(u=>u.type===id)))throw Error('請先招募四名傭兵');
 g.monsters=Array.from({length:20},(_,i)=>{const m=new ns.entities.Monster('grunt',1,g.path.points);m.setRouteDistance(200+i*28);m.health=m.maxHealth=1000000;return m;});
 g.setGameSpeed(2);g.paused=false;g.frameTiming.clear(w.performance.now());if(!g.performanceMonitor.enabled)g.performanceMonitor.toggle();await delay(1000);g.performanceMonitor.samples=[];await delay(8000);g.paused=true;
 const samples=g.performanceMonitor.samples.slice(),p95=key=>{const v=samples.map(s=>s[key]||0).sort((a,b)=>a-b);return +(v[Math.floor((v.length-1)*.95)]||0).toFixed(2);};
 result.textContent=JSON.stringify({frames:samples.length,frameP95:p95('realMs'),uiP95:p95('uiMs'),updateP95:p95('updateMs'),drawP95:p95('drawMs'),projectiles:g.projectiles.length,units:g.build.items.map(u=>({id:u.type,strikes:u.strikes}))},null,2);
});
