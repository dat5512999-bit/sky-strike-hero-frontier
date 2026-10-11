(function(ns){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(action,label,disabled=false,value='')=>'<button type="button" data-action="manga-'+action+'"'+(value?' data-value="'+esc(value)+'"':'')+(disabled?' disabled':'')+'>'+esc(label)+'</button>';
  const KEY='bookmark-v2';
  const profile=app=>app.store?.current?.()||{completed:[]};
  const admin=app=>Boolean(app.store?.isAdmin?.());
  const flow=()=>ns.systems.StoryMangaFlow;
  const reader={
    KEY,
    get pages(){return ns.systems.StoryMangaCatalog;},
    bookmark(store,key){try{const saved=JSON.parse(store.adapter('manga').getItem(KEY)||'{}');return typeof saved[key]==='string'?saved[key]:null;}catch(_){return null;}},
    lastSelection(store){
      const key=reader.bookmark(store,'$lastSelection');
      return key&&flow().timeline(store.current?.()||{completed:[]},Boolean(store.isAdmin?.())).some(node=>node.selectionKeys.includes(key))?key:null;
    },
    currentPages(app){return app.manga?flow().pagesFor(app.manga.selection):[];},
    returnToChapters(app,fromBrief=false){
      if(fromBrief&&app.mangaBriefReturnMode==='legacy')app.storyMode='legacy';
      else {
        app.storyMode='timeline';
        const node=flow().timeline(profile(app),admin(app)).find(n=>n.selectionKeys.includes(app.manga?.selection?.key));
        if(node)app.selectedStoryNode=node.id;
      }
      reader.cancelPreload(app);app.show('story');return true;
    },
    authorized(app){const state=app.manga;if(!state)return false;return Boolean(flow().resolve(state.request,profile(app),admin(app)));},
    cancelPreload(app){if(app.mangaPreload)app.mangaPreload.removeAttribute?.('src');app.mangaPreload=null;app.mangaPreloadPath=null;},
    open(app,request){
      if(!request||typeof request!=='object')return reader.returnToChapters(app);
      const normalized={...request,preview:Boolean(request.preview||admin(app))};
      const selection=flow().resolve(normalized,profile(app),admin(app));
      if(!selection){app.message='這段劇情尚未解鎖；戰後內容必須先完成對應任務。';app.show('story');return false;}
      const pages=flow().pagesFor(selection);
      if(!pages.length){app.message='這段漫畫尚未完整載入，請更新頁面後再試；不會跳到其他章節。';app.show('story');return false;}
      reader.cancelPreload(app);
      const saved=selection.preview?null:reader.bookmark(app.store,selection.key);
      app.manga={request:normalized,selection,index:Math.max(0,pages.findIndex(p=>p.id===saved)),zoom:false,text:false,error:''};
      if(selection.missionId)app.mangaMission=ns.systems.StoryCatalog.getMission(selection.missionId);
      app.storyMode='timeline';app.game.paused=true;app.show('story-manga');reader.save(app);return true;
    },
    openSelection(app,request){return reader.open(app,request);},
    save(app){
      if(!app.manga||app.manga.selection.preview||!reader.authorized(app))return false;
      const page=reader.currentPages(app)[app.manga.index];if(!page)return false;
      try{const adapter=app.store.adapter('manga');let saved;try{saved=JSON.parse(adapter.getItem(KEY)||'{}');}catch(_){saved={};}
        if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={};
        saved[app.manga.selection.key]=page.id;saved.$lastSelection=app.manga.selection.key;adapter.setItem(KEY,JSON.stringify(saved));app.manga.error='';
      }catch(_){app.manga.error='續讀位置未能儲存；仍可閱讀。請先匯出玩家備份，勿清除瀏覽器資料。';}
      const note=app.root.querySelector('.manga-save-note');if(note)note.textContent=app.manga.error;return !app.manga.error;
    },
    turn(app,index){
      if(!Number.isInteger(index)||!app.manga||!reader.authorized(app))return false;
      const pages=reader.currentPages(app);if(!pages.length)return false;
      reader.cancelPreload(app);app.manga.index=Math.max(0,Math.min(pages.length-1,index));app.manga.zoom=false;
      app.render();reader.save(app);app.root.querySelector('.manga-title')?.focus();return true;
    },
    render(app){
      if(!reader.authorized(app))return '<article class="manga-mission-brief"><h1>這段劇情尚未解鎖</h1>'+button('exit','返回章節')+'</article>';
      const state=app.manga,pages=reader.currentPages(app),p=pages[state.index];if(!p)return '';
      const last=state.index===pages.length-1,selection=state.selection;
      const eraNote=p.storyPage===11?'跨時篇：同一河灣歷經擴建與世代更替；不是古代人物一直活到當代。':p.storyPage<=10?'古代篇：各族分居、往返商鎮，逐漸協商共同生活。':'當代篇：各族已有成熟制度；古代商旅不是當代英雄。';
      const endLabel=selection.phase==='before'?'本關戰前讀畢 →':'本段讀畢・返回章節';
      return '<article class="manga-reader" aria-label="彩色故事漫畫"><header>'+button('exit','← 返回章節')+'<h1 class="manga-title" tabindex="-1">'+esc(p.era+' · '+p.title)+'</h1>'+button('music','♫ '+(app.storyMusic?.enabled?'音樂開':'音樂關'))+'</header><nav class="manga-tools" aria-label="漫畫閱讀工具"><label>本段頁目錄 <select data-manga-index aria-label="選擇本段漫畫頁">'+pages.map((item,i)=>'<option value="'+i+'"'+(i===state.index?' selected':'')+'>'+esc((i+1)+'・'+item.title)+'</option>').join('')+'</select></label>'+button('zoom',state.zoom?'完整畫面':'放大拖看')+button('text',state.text?'收起文字':'故事文字')+'<span>'+esc(selection.title+(selection.preview?' · 管理者預覽，不寫進度':''))+'</span></nav><div class="manga-stage'+(state.zoom?' manga-zoom':'')+'" data-state="loading"><img class="manga-image" src="'+esc(p.image)+'" alt="'+esc(p.title+'。'+(p.summary||''))+'" decoding="async"><div class="manga-status" role="status"><span>漫畫載入中…</span>'+button('retry','重新載入')+'</div></div><section class="manga-transcript"'+(state.text?'':' hidden')+' aria-label="本頁故事文字"><p>'+esc(eraNote)+'</p>'+(selection.note?'<p>'+esc(selection.note)+'</p>':'')+'<p>'+esc(p.summary||'')+'</p>'+p.text.map(line=>'<p>'+esc(line)+'</p>').join('')+'</section><footer>'+button('prev','← 上一頁',state.index===0)+'<span aria-live="polite">'+(state.index+1)+' / '+pages.length+' · '+esc(ns.systems.StoryMusic.label(p.mood))+'</span>'+button('next',last?endLabel:'下一頁 →')+'</footer><p class="manga-save-note" role="status">'+esc(state.error)+'</p></article>';
    },
    attach(app){
      const stage=app.root.querySelector('.manga-stage'),img=stage?.querySelector('img'),select=app.root.querySelector('[data-manga-index]');
      if(select)select.onchange=()=>reader.turn(app,Number(select.value));
      if(!stage||!img||!reader.authorized(app))return;
      const state=app.manga,index=state.index,pages=reader.currentPages(app),active=()=>app.page==='story-manga'&&app.manga===state&&state.index===index&&stage.isConnected;
      img.onload=async()=>{try{if(img.decode)await img.decode();}catch(_){if(active())img.onerror();return;}if(!active())return;stage.dataset.state='ready';const next=pages[index+1];if(next&&app.mangaPreloadPath!==next.image){reader.cancelPreload(app);app.mangaPreloadPath=next.image;app.mangaPreload=new Image();app.mangaPreload.src=next.image;}};
      img.onerror=()=>{if(!active())return;stage.dataset.state='error';stage.querySelector('.manga-status span').textContent='圖片暫時無法載入。可重試或開啟「故事文字」繼續閱讀。';};
      if(img.complete)(img.naturalWidth?img.onload():img.onerror());
      let drag=null;
      stage.onpointerdown=e=>{if(!state.zoom||e.pointerType==='touch'||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture?.(e.pointerId);e.preventDefault();};
      stage.onpointermove=e=>{if(drag){stage.scrollLeft=drag.left+drag.x-e.clientX;stage.scrollTop=drag.top+drag.y-e.clientY;}};
      stage.onpointerup=stage.onpointercancel=()=>{drag=null;};app.storyMusic?.play(pages[index].mood);
    },
    act(app,action,value){
      if(['manga-open','manga-missions'].includes(action))return reader.returnToChapters(app,app.page==='mission-brief');
      if(action==='manga-section')return reader.open(app,{sectionId:value});
      if(['manga-before','manga-after','manga-admin-before','manga-admin-after'].includes(action)){
        const phase=action.endsWith('after')?'after':'before',preview=action.includes('admin-');
        if(preview&&!admin(app))return false;
        const mission=ns.systems.StoryCatalog.getMission(value);if(!mission)return false;
        if(!flow().missionInfo(value))return reader.brief(app,mission);
        return reader.open(app,{missionId:value,phase,preview});
      }
      if(action==='manga-fight'){
        const mission=app.mangaMission;if(!mission||mission.previewOnly||mission.requires&&!profile(app).completed.includes(mission.requires))return false;
        reader.cancelPreload(app);return app.launchStory(mission);
      }
      if(app.page!=='story-manga'||!app.manga)return false;
      const state=app.manga;
      if(action==='manga-exit'){reader.save(app);reader.returnToChapters(app);}
      else if(action==='manga-prev')reader.turn(app,state.index-1);
      else if(action==='manga-next'){
        if(state.index===reader.currentPages(app).length-1){reader.save(app);reader.cancelPreload(app);if(state.selection.phase==='before')reader.brief(app,app.mangaMission);else reader.returnToChapters(app);}
        else reader.turn(app,state.index+1);
      }
      else if(action==='manga-zoom'){state.zoom=!state.zoom;app.render();}
      else if(action==='manga-text'){state.text=!state.text;app.render();}
      else if(action==='manga-music'){const music=app.storyMusic;if(music){music.setEnabled(!music.enabled);app.render();}}
      else if(action==='manga-retry'){const img=app.root.querySelector('.manga-image'),stage=app.root.querySelector('.manga-stage');if(img&&stage){stage.dataset.state='loading';stage.querySelector('.manga-status span').textContent='漫畫載入中…';img.src=reader.currentPages(app)[state.index].image+'?retry='+Date.now();}}
      else return false;return true;
    },
    brief(app,mission){if(!mission)return false;app.mangaBriefReturnMode=flow().missionInfo(mission.id)?'timeline':'legacy';app.mangaMission=mission;app.show('mission-brief');return true;},
    renderBrief(app){
      const m=app.mangaMission;if(!m)return '';
      const completed=profile(app).completed||[],locked=Boolean(m.requires&&!completed.includes(m.requires)),info=flow().missionInfo(m.id),display=flow().missionPresentation(m.id);
      return '<article class="manga-mission-brief"><small>'+esc(display.label)+'</small><h1>'+esc(display.title)+'</h1><p>'+esc(display.note)+'</p><p>'+esc(display.objective)+'</p>'+button('missions','返回章節')+(info?button('before','回顧本關戰前',locked&&!admin(app),m.id):'')+(info&&completed.includes(m.id)?button('after','閱讀本關戰後',false,m.id):'')+(m.previewOnly?'':button('fight',locked?'先完成前一個任務':'開始本關戰鬥 →',locked))+'</article>';
    },
    renderSections(app){
      const completed=profile(app).completed||[];
      return '<nav class="manga-sections" aria-label="世界前情與同期故事"><h3>世界前情與同期故事</h3><p>每次只閱讀所選段落；戰後段落須完成對應任務。古代 1–10 頁、跨時第 11 頁、當代自第 12 頁起。</p>'+flow().sections.map(section=>button('section',section.title,Boolean((section.pending||section.requires&&!completed.includes(section.requires))&&!admin(app)),section.id)).join('')+'</nav>';
    },
    install(App){
      const act=App.prototype.act,key=App.prototype.handleStoryKey,openStoryMap=App.prototype.openStoryMap,openNextStory=App.prototype.openNextStory;
      App.prototype.act=function(action,value){
        if(['story','replay'].includes(action)){this.storyMode='timeline';this.show('story');return true;}
        if(action==='cinematic')return reader.act(this,'manga-before',value||this.selectedStoryMission||ns.systems.StoryCatalog.mission.id);
        if(['story-battle','story-card-replay','chapter-battle'].includes(action))return reader.act(this,'manga-before',value||this.selectedStoryMission||ns.systems.StoryCatalog.mission.id);
        if(action.startsWith('manga-'))return reader.act(this,action,value);return act.call(this,action,value);
      };
      App.prototype.startCinematic=function(){this.storyMode='timeline';this.show('story');return true;};
      App.prototype.openStoryMap=function(){
        const mission=this.activeStoryMission||ns.systems.StoryCatalog.mission;
        this.storyMode=flow().missionInfo(mission.id)?'timeline':'legacy';
        if(this.storyMode==='timeline')this.selectedStoryNode='battle:'+mission.id;
        return openStoryMap.call(this);
      };
      App.prototype.openNextStory=function(){
        const mission=this.activeStoryMission||ns.systems.StoryCatalog.mission;
        if(!flow().missionInfo(mission.id))return openNextStory.call(this);
        if(!(profile(this).completed||[]).includes(mission.id))return false;
        if(this.openStoryMap()===false)return false;
        return reader.open(this,{missionId:mission.id,phase:'after'});
      };
      App.prototype.startStoryCards=function(mission){return reader.act(this,'manga-before',mission?.id||this.selectedStoryMission||ns.systems.StoryCatalog.mission.id);};
      App.prototype.renderCinematicCollection=function(){return '<article class="manga-mission-brief"><h1>故事漫畫章節</h1><p>世界前情、戰前與通關後分段閱讀，不會自動連播全本。</p>'+button('missions','選擇章節')+'</article>';};
      App.prototype.handleStoryKey=function(e){
        if(this.page!=='story-manga')return key.call(this,e);
        if(e.altKey||e.ctrlKey||e.metaKey||e.target?.isContentEditable||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target?.tagName||''))return;
        const index={ArrowLeft:this.manga.index-1,ArrowRight:this.manga.index+1,Home:0,End:reader.currentPages(this).length-1}[e.key];
        if(index!==undefined){e.preventDefault();reader.turn(this,index);}else if(e.key==='Escape'){e.preventDefault();reader.act(this,'manga-exit');}
      };
    }
  };
  ns.systems.StoryManga=reader;
})(globalThis.TowerFrontier);
