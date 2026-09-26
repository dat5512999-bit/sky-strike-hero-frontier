(function(){
  'use strict';
  const VFX=TowerFrontier.systems.TowerVFX;
  const atlas=new Image();atlas.ready=false;atlas.onload=()=>{atlas.ready=true;};atlas.onerror=()=>{document.querySelector('h1').textContent='素材載入失敗，請重新載入預覽';};atlas.src=TowerFrontier.systems.PaintedTowerVFX.PATH;
  const magicAtlas=new Image();magicAtlas.ready=false;magicAtlas.onload=()=>{magicAtlas.ready=true;};magicAtlas.onerror=atlas.onerror;magicAtlas.src=TowerFrontier.systems.PaintedTowerVFX.MAGIC_PATH;
  document.querySelector('h1').textContent='塔樓材質特效預覽 · VFX 2.0.0';
  const groups=[['王國',[['arrow','林地弩塔'],['iceward','寒鋼哨塔'],['cannon','赤焰火砲塔'],['barracks','王國戰鼓堡'],['ballista','獅翼弩砲台'],['supply','補給站'],['battleflag','王國戰旗'],['armoryForge','軍械工坊']]],['月影',[['frost','寒霜水晶塔'],['storm','星葉雷霆塔'],['grove','翠靈古樹'],['moonwell','月泉稜鏡塔']]],['暗影',[['crypt','幽骨召喚殿'],['soul','靈魂收割塔'],['graveyard','冥燈墓園'],['plague','瘟疫尖碑']]],['荒野',[['warDrum','部族戰鼓塔'],['boulder','巨石投射塔'],['thunderTotem','雷霆圖騰'],['totem','赤牙祖靈柱']]],['地精',[['goblinGenerator','動力機座'],['goblinTurret','鉚釘武器台'],['goblinMortar','蒸汽迫擊砲'],['goblinSnare','絞索控制台'],['goblinRecycler','工料回收站'],['goblinCooler','冷凝支援站'],['goblinSiege','重載攻城架']]],['霜原',[['frostCrystal','冰晶尖塔'],['frostBlizzard','暴雪祭壇'],['frostBallista','碎冰重弩'],['frostTotem','霜骨圖騰'],['frostObelisk','霜墓尖碑'],['frostAurora','極光獵台'],['frostGlacier','冰河核心']]],['娜迦',[['nagaTidegate','潮門尖塔'],['nagaShellBastion','鹽甲棱堡'],['nagaAbyssShrine','深淵祭壇'],['nagaMantaAerie','翼潮獵台']]],['通用召喚',[['bombWorkshop','爆破工坊']]]];
  const branches={storm:'surge',crypt:'reaper',goblinTurret:'rail',goblinSnare:'tesla',goblinSiege:'rocket'},splash={cannon:54,grove:34,plague:38,boulder:78,totem:25,goblinMortar:60,goblinSiege:70,frostBlizzard:62,frostGlacier:92};
  const cards=[];for(const [faction,entries]of groups)for(const [type,name]of entries){
    const card=document.createElement('article'),title=document.createElement('h2'),canvas=document.createElement('canvas'),note=document.createElement('p');title.textContent=faction+' · '+name;canvas.width=480;canvas.height=180;note.className='note';note.textContent=(VFX.ATTACKS[type]||TowerFrontier.systems.PaintedTowerVFX.key({type}))?'左：出手 → 右：命中／連鎖；升級模式展示對應分支。':'來源符號、支援連線與成功工作脈衝；展示事件每回合重播。';card.append(title,canvas,note);document.querySelector('#cards').append(card);cards.push({type,ctx:canvas.getContext('2d')});
  }
  let time=0,last=performance.now(),paused=false;
  document.querySelector('#pause').onclick=function(){paused=!paused;this.textContent=paused?'繼續動畫':'暫停動畫';};document.querySelector('#restart').onclick=()=>{time=0;};
  function render(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!paused&&!document.hidden)time+=dt;
    const phase=time%1.8,advanced=document.querySelector('#branch').value==='advanced',reduced=document.querySelector('#reduced').checked;
    for(const {type,ctx}of cards){ctx.clearRect(0,0,480,180);ctx.strokeStyle='#4b6270';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(30,135);ctx.lineTo(445,135);ctx.stroke();ctx.fillStyle='#77909b';ctx.fillRect(62,85,36,48);ctx.fillStyle='#b49474';ctx.beginPath();ctx.arc(330,105,12,0,Math.PI*2);ctx.fill();
      const tower={type,kind:'building',x:80,y:126,branch:advanced?branches[type]:null,visualAge:time,fireFlash:phase<.25?1-phase/.25:0,aim:0,networkPowered:true,skillPulse:phase<.5?1-phase*2:0,config:()=>({color:'#c6dccc',range:300})};
      const target={x:330,y:126,active:true},recipient={x:220,y:125,active:true,supportDamageSource:tower,supportHasteSource:tower,flagSource:tower,flagRate:.12,tribalFrenzy:1};tower.synergy={game:{art:{towerPaintedAtlas:atlas,towerMagicAtlas:magicAtlas},feedback:{reducedFx:reduced},build:{items:[tower,recipient]},goblinNetwork:{cooling:1,links:[[tower,recipient]]},summons:[]}};
      if(phase>.8&&phase<1.55){tower.supportVfxUntil=time+(1.55-phase);tower.supportVfxValue=12;}
      VFX.building(ctx,tower);
      const key=VFX.key(tower);if(key&&phase<1.32){const hit=phase>=1,chain=['frostObelisk','nagaMantaAerie'].includes(type)||type==='storm'&&!advanced||type==='thunderTotem'||type==='crypt'&&advanced||type==='frost'&&advanced;const p={owner:tower,target,towerVfx:key,active:true,x:80+250*Math.min(1,phase),y:126,startX:80,startY:126,flightAge:phase,hitResolved:hit,trail:.32-(phase-1),towerContact:{x:330,y:106},splash:splash[type]||0,chain:chain?3:0,chainPoints:[{x:80,y:96},{x:270,y:106},{x:335,y:85},{x:405,y:115}],soulCharged:type==='soul'&&advanced};VFX.projectile(ctx,p);}
    }requestAnimationFrame(render);
  }requestAnimationFrame(render);
})();
