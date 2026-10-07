(function(ns){
  'use strict';
  const STATUS={broken:'待修復',ready:'可操作',repairing:'修復中',repaired:'已修復',rescuing:'救援中',completed:'已完成',declined:'已拒絕',expired:'已錯過'};
  class AdventureView{
    constructor(game){
      this.game=game;this.selected=null;this.previousFocus=null;
      this.toggle=document.createElement('button');this.toggle.type='button';this.toggle.className='adventure-toggle';this.toggle.textContent='地圖行動';this.toggle.setAttribute('aria-haspopup','dialog');this.toggle.hidden=true;
      this.dialog=document.createElement('dialog');this.dialog.className='adventure-dialog';this.dialog.setAttribute('aria-labelledby','adventure-heading');
      this.dialog.innerHTML='<header><h2 id="adventure-heading">地圖行動</h2><button type="button" data-close aria-label="關閉地圖行動">關閉</button></header><p class="adventure-intro">點地標查看範圍與行動。所有軍團皆可使用；閱讀時戰場暫停。</p><p class="adventure-transition"></p><canvas class="adventure-map-preview" width="384" height="256" aria-label="互動地標、敵軍與效果範圍預覽"></canvas><div class="adventure-node-list"></div><p class="adventure-message" role="status" aria-live="polite"></p><details><summary>本局行動與前關支援</summary><ol class="adventure-log"></ol></details>';
      this.host=document.querySelector('.td-shell')||document.body;this.host.append(this.toggle,this.dialog);
      this.artStatus=document.createElement('p');this.artStatus.setAttribute('role','status');this.artRetry=document.createElement('button');this.artRetry.type='button';this.artRetry.textContent='重試地標美術';this.artRetry.onclick=()=>ns.systems.AdventureArt.retry(game.art);this.dialog.querySelector('canvas').before(this.artStatus,this.artRetry);
      this.toggle.onclick=()=>this.open();this.dialog.querySelector('[data-close]').onclick=()=>this.close();this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
      this.dialog.addEventListener('close',()=>{if(!this.ownsPause)return;this.game.paused=this.wasPaused;this.ownsPause=false;this.selected=null;this.game.updateUi?.();this.previousFocus?.focus?.();});
      this.dialog.addEventListener('click',event=>{const button=event.target.closest('[data-adventure-action]');if(!button)return;const result=game.adventure.act(button.dataset.node,button.dataset.adventureAction);this.dialog.querySelector('.adventure-message').textContent=result.message;if(result.ok)this.close();else this.render();});
    }
    open(id){if(!this.game.adventure?.definition||!this.game.profession.selected||this.game.status!=='playing'||this.game.app&&!this.game.app.root.hidden)return;this.selected=id||null;this.previousFocus=document.activeElement;if(!this.dialog.open){this.wasPaused=this.game.paused;this.ownsPause=true;this.game.paused=true;this.dialog.showModal();}this.render();this.dialog.querySelector('[data-close]').focus();this.game.updateUi?.();}
    close(){if(this.dialog.open)this.dialog.close();}
    sync(){const game=this.game,visible=Boolean(game.adventure?.definition&&game.profession.selected&&game.status==='playing'&&(!game.app||game.app.root.hidden));this.toggle.hidden=!visible;if(!visible)this.close();const platform=game.adventure?.definition?.platform;this.toggle.textContent='地圖行動'+(platform&&!game.adventure.platformOpen?' · 第'+platform.atWave+'波轉折':'');const art=ns.systems.AdventureArt.status(game.art),revision=art.ready+':'+art.failed;if(this.dialog.open&&revision!==this.artRevision){this.artRevision=revision;this.render();}}
    render(){
      const system=this.game.adventure,definition=system.definition,list=this.dialog.querySelector('.adventure-node-list');list.replaceChildren();this.dialog.querySelector('h2').textContent=(ns.config.mapName||'戰場')+' · 地圖行動';
      const artwork=ns.systems.AdventureArt.status(this.game.art);this.artStatus.hidden=artwork.ready===artwork.total;this.artStatus.textContent=artwork.failed?'部分地標美術下載失敗；操作仍可使用，請重試。':'地標美術載入 '+artwork.ready+'／'+artwork.total;this.artRetry.hidden=!artwork.failed;
      const p=definition.platform;this.dialog.querySelector('.adventure-transition').textContent=p?(system.platformOpen?p.name+'已開放，可以部署。':'環境預告：第 '+(p.atWave-1)+' 波結束後，'+p.name+'開放；既有守軍保留。'):'本關機關作用於現有道路；先查看敵軍位置再決定使用時機。';
      for(const node of definition.nodes){if(this.selected&&this.selected!==node.id)continue;const state=system.states[node.id],section=document.createElement('section'),title=document.createElement('h3'),status=document.createElement('p');title.textContent=(definition.nodes.indexOf(node)+1)+'. '+node.name;status.textContent=(STATUS[state.status]||state.status)+(node.kind==='mechanism'?' · 剩 '+state.charges+' 次':state.progress>0?' · '+state.progress.toFixed(1)+' 秒':'');section.append(title,status);
        if(node.kind==='rescue')status.textContent+=' · 第2～5波 · 完成 +65G／2木';
        if(node.kind==='repair')status.textContent+=' · 修復需英雄靠近4秒';
        const locate=document.createElement('button');locate.type='button';locate.textContent='查看位置與效果範圍';locate.onclick=()=>{this.selected=node.id;const camera=this.game.camera;if(camera?.focus)camera.focus(node.x,node.y);this.render();};section.append(locate);
        for(const offer of system.offers(node.id)){const detail=document.createElement('p'),button=document.createElement('button');detail.textContent=offer.detail;button.type='button';button.textContent=offer.label;button.dataset.node=node.id;button.dataset.adventureAction=offer.id;button.disabled=Boolean(offer.disabled||offer.cost&&!this.game.economy.canAfford(offer.cost));if(button.disabled)button.textContent+='（'+(offer.disabled?offer.reason:'資源不足')+'）';section.append(detail,button);}list.append(section);
      }
      if(this.selected){const all=document.createElement('button');all.type='button';all.textContent='顯示所有地圖行動';all.onclick=()=>{this.selected=null;this.render();};list.append(all);}
      const log=this.dialog.querySelector('.adventure-log');log.replaceChildren();for(const text of system.log){const li=document.createElement('li');li.textContent=text;log.append(li);}if(!system.log.length){const li=document.createElement('li');li.textContent='尚未採取地圖行動。';log.append(li);}
      const preview=this.dialog.querySelector('canvas'),ctx=preview.getContext('2d');ctx.clearRect(0,0,384,256);ctx.save();ctx.scale(384/ns.config.width,256/ns.config.height);const map=ns.maps?.definitions?.[system.mapId],image=this.game.art?.mapAssets?.[system.mapId];if(image?.ready)ctx.drawImage(image,0,0,ns.config.width,ns.config.height);else{ctx.fillStyle='#263c38';ctx.fillRect(0,0,ns.config.width,ns.config.height);}ctx.strokeStyle='#eedf9e';ctx.lineWidth=10;for(const route of map?.routes||[map?.path||[]]){ctx.beginPath();route.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}for(const monster of this.game.monsters){if(!monster.active)continue;ctx.fillStyle='#ff755e';ctx.beginPath();ctx.arc(monster.x,monster.y,15,0,Math.PI*2);ctx.fill();}AdventureView.draw(ctx,system,null,this.selected);ctx.restore();
      definition.nodes.forEach((node,i)=>{const x=node.x*384/ns.config.width,y=node.y*256/ns.config.height;ctx.fillStyle=this.selected===node.id?'#ffe59b':'#d0eddb';ctx.strokeStyle='#0d2420';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#102522';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(String(i+1),x,y+4);});
    }
    static draw(ctx,system,art,selected){
      if(!system.definition||!system.game.profession.selected)return;
      const p=system.definition.platform;
      art=art||system.game.art;
      if(p){ctx.save();ctx.translate(p.x,p.y);ns.systems.AdventureArt.platform(ctx,system,art);ctx.fillStyle='#fff0c4';ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.fillText(system.platformOpen?'已開放平台':'第'+p.atWave+'波開放',0,43);ctx.restore();}
      ns.systems.AdventureArt.fields(ctx,system);
      for(const node of system.definition.nodes){const state=system.states[node.id],active=system.isAvailable(node),chosen=selected===node.id;ctx.save();if(chosen){ctx.strokeStyle='#ffe496';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.arc(node.target?.x||node.x,node.target?.y||node.y,node.radius||72,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}ctx.translate(node.x,node.y);ctx.globalAlpha=['completed','declined','expired'].includes(state.status)?.5:active?1:.6;
        if(!ns.systems.AdventureArt.node(ctx,system,node,art)){ctx.fillStyle='#c3d7cf';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText('美術載入中',0,-12);}
        if(state.progress>0&&['repairing','rescuing'].includes(state.status)){ctx.strokeStyle='#9be5b8';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-18,23,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,state.progress/(node.seconds||4)));ctx.stroke();}
        ctx.fillStyle='#ffedba';ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.fillText(node.name,0,29);ctx.restore();
      }
      // Paid ally uses the exact existing bull art, no second playable hero.
      if(system.mapId==='redmesa'&&system.game.hero.classType!=='bull'&&system.fields.some(f=>f.effect==='support')){const node=system.node('trade');if(node&&art){system.ally||=new ns.entities.Hero(node.x,node.y);if(system.ally.classType!=='bull')system.ally.chooseClass('bull');system.ally.state='attack';system.ally.frame=Math.floor(system.clock*3)%4;art.drawHero(ctx,system.ally);}}
    }
  }
  ns.systems.AdventureView=AdventureView;
})(globalThis.TowerFrontier);
