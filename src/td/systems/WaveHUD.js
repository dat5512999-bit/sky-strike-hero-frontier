(function(ns){
  'use strict';
  // Presentation only: the actual queue and difficulty-adjusted catalog remain authoritative.
  class WaveHUD{
    static model(game){
      const w=game.waves,preparing=w.canStart(),number=Math.min(w.catalog.total(),Math.max(1,w.wave+(preparing?1:0))),definition=preparing?w.preview():w.definition(number);
      const groups=definition?definition.groups:[],types=groups.map(g=>g.type),tags=[];
      if(types.includes('boss'))tags.push('首領');
      if(types.includes('healer'))tags.push('治療');
      if(types.includes('commander'))tags.push('加速支援');
      if(types.some(t=>(ns.entities.Monster.TYPES[t]||{}).speed>=90))tags.push('高速');
      if(types.includes('warder'))tags.push('護盾');
      if(types.some(t=>(ns.entities.Monster.TYPES[t]||{}).armorType==='heavy'))tags.push('重甲');
      if(!tags.length)tags.push(types.includes('shaman')||types.includes('revenant')?'秘法':'輕甲');
      const remaining=w.queue.length+game.monsters.filter(m=>m.active).length;
      return {number,total:w.catalog.total(),definition,groups,tags,preparing,remaining,boss:types.includes('boss'),status:game.status!=='playing'?(game.status==='victory'?'遠征完成':'遠征結束'):game.paused?'已暫停':w.complete?'全數守成':preparing?(w.phase==='preparing'?Math.ceil(w.countdown)+' 秒':'待命'):'剩餘 '+remaining};
    }
    constructor(game,root){
      this.game=game;this.root=root;this.groupKey='';this.cards=[];this.toastUntil=0;this.lastUpdate=0;
      this.groups=root.querySelector('#td-wave-groups');this.tags=root.querySelector('#td-wave-tags');this.detail=root.querySelector('.wave-intel');this.preview=root.querySelector('#td-wave-preview');this.toast=document.getElementById('td-wave-toast');
      this.toggle=document.createElement('button');this.toggle.id='td-wave-toggle';this.toggle.type='button';this.toggle.textContent='預告';this.toggle.setAttribute('aria-controls','td-wave-groups');root.insertBefore(this.toggle,game.ui.wave);
      this.setExpanded(false);this.toggle.onclick=()=>this.setExpanded(root.dataset.expanded!=='true');
      document.addEventListener('pointerdown',event=>{if(!root.contains(event.target))this.setExpanded(false);});
      document.addEventListener('keydown',event=>{if(event.key==='Escape')this.setExpanded(false);});
    }
    setExpanded(expanded){this.root.dataset.expanded=String(expanded);this.toggle.setAttribute('aria-expanded',String(expanded));this.toggle.textContent=expanded?'收起':'預告';if(!expanded)this.detail.open=false;}
    announce(wave){
      const model=WaveHUD.model(this.game);this.toast.textContent=(model.boss?'⚔ 首領來襲':'第 '+wave+' 波開始')+' · '+model.tags.slice(0,2).join('／');
      this.toast.dataset.boss=String(model.boss);this.toastUntil=performance.now()+(model.boss?2500:1600);this.toast.hidden=false;this.detail.open=false;
    }
    update(now){
      now=now===undefined?performance.now():now;
      const game=this.game,m=WaveHUD.model(game),visible=Boolean(game.profession.selected)&&game.status==='playing';
      if(!visible){this.toast.hidden=true;this.toastUntil=0;}
      else this.toast.hidden=now>=this.toastUntil;
      this.root.dataset.phase=m.preparing?'preparing':'active';
      game.ui.waveNumber.textContent='第 '+m.number+'／'+m.total+' 波';game.ui.waveStatus.textContent=m.status;
      game.ui.wave.textContent=m.preparing?'立即迎戰':game.waves.complete?'已守成':'戰鬥中';
      game.ui.wave.disabled=!visible||!m.preparing||game.paused;
      this.root.title='難度：'+game.difficulty.current().name;
      const key=JSON.stringify([m.number,m.preparing,m.groups]);
      if(key!==this.groupKey){
        this.groupKey=key;this.setExpanded(false);this.detail.open=false;this.groups.replaceChildren();this.cards=[];
        this.preview.textContent=(m.definition?m.definition.name+' · '+m.definition.hint:'遠征完成')+'｜難度：'+game.difficulty.current().name;
        m.groups.forEach(group=>{
          const cfg=ns.entities.Monster.TYPES[group.type]||{},button=document.createElement('button'),canvas=document.createElement('canvas'),count=document.createElement('span');
          button.type='button';button.className='wave-enemy';button.setAttribute('aria-label',(cfg.name||group.type)+' × '+group.count+'，查看情報');button.title=(cfg.name||group.type)+' × '+group.count;
          canvas.width=64;canvas.height=64;canvas.setAttribute('aria-hidden','true');count.textContent='×'+group.count;button.append(canvas,count);
          button.onclick=()=>{this.detail.open=true;this.preview.textContent=(cfg.name||group.type)+' × '+group.count+'｜'+({light:'輕甲',heavy:'重甲',arcane:'秘法護甲'}[cfg.armorType]||'')+'｜'+(m.definition?m.definition.hint:'');};
          this.groups.append(button);this.cards.push({canvas,type:group.type,ready:false});
        });
        this.tags.replaceChildren();m.tags.slice(0,3).forEach(tag=>{const span=document.createElement('span');span.textContent=tag;this.tags.append(span);});
      }
      this.cards.forEach(card=>{if(card.ready)return;const image=game.art.enemyActions[card.type],ctx=card.canvas.getContext('2d');ctx.clearRect(0,0,64,64);if(image&&image.ready){const w=image.width/4,h=image.height/4;ctx.drawImage(image,0,0,w,h,0,0,64,64);card.ready=true;}else{ctx.fillStyle='#ebd995';ctx.font='bold 24px sans-serif';ctx.fillText('?',23,40);}});
    }
    drawEntrance(ctx){
      const game=this.game;if(!game.profession.selected||game.status!=='playing'||game.waves.phase!=='preparing')return;
      const path=ns.config.path,a=path[0],b=path[1];if(!a||!b)return;
      const length=Math.hypot(b.x-a.x,b.y-a.y)||1,t=Math.min(1,90/length),x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,seconds=Math.ceil(game.waves.countdown);
      ctx.save();ctx.translate(x,y);ctx.fillStyle='#14231fea';ctx.strokeStyle=seconds<=3?'#ffe69a':'#d4b568';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-38,22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff0bf';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(game.paused?'Ⅱ':String(seconds),0,-38);
      ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(5,-7);ctx.lineTo(5,7);ctx.closePath();ctx.fill();ctx.restore();
    }
  }
  ns.systems.WaveHUD=WaveHUD;
})(globalThis.TowerFrontier);
