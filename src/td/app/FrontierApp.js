(function(ns){
  'use strict';
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  class FrontierApp{
    constructor(game){
      this.game=game;this.mode='free';this.root=document.createElement('section');this.root.id='frontier-app';this.root.setAttribute('aria-label','HERO FRONTIER 主介面');document.body.append(this.root);this.shell=document.querySelector('.td-shell');
      try{this.store=new ns.systems.ProfileStore(localStorage);}catch(error){this.root.innerHTML='<div class="lobby-error"><h1>存檔暫時無法開啟</h1><p>'+escape(error.message)+'</p><p>為避免覆蓋既有進度，已停止載入。請保留瀏覽器資料並檢查儲存空間。</p><button id="profile-rescue">下載原始存檔</button></div>';this.root.querySelector('button').onclick=()=>this.download(localStorage.getItem(ns.systems.ProfileStore.KEY)||'{}','frontier-recovery.json');game.paused=true;this.shell.inert=true;document.body.dataset.appReady='true';return;}
      this.store.onError=error=>{this.message=error.message;if(this.root.hidden)this.game.flash('存檔失敗：'+error.message,'#ffb578');};game.app=this;this.home();
      this.back=document.createElement('button');this.back.id='frontier-back';this.back.textContent='← 主大廳';this.back.onclick=()=>this.home();document.body.append(this.back);
      game.ui.resultChange.textContent='返回大廳';game.ui.menuReturn.textContent='結算積分並撤退';
      if(game.ui.resultNext)game.ui.resultNext.onclick=()=>this.openNextStory();
      if(game.ui.resultChange)game.ui.resultChange.onclick=()=>this.mode==='story'?this.openStoryMap():this.home();
      if(game.ui.resultReport)game.ui.resultReport.onclick=()=>this.game.openReport();
      this.root.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target||target.disabled)return;const action=target.dataset.action;if(action.startsWith('ranking-')){this.rankingView ||= new ns.ranking.RankingView(this.store);this.rankingView.action(action,target.dataset.value);this.render();if(action==='ranking-row'&&matchMedia('(max-width:650px)').matches)this.root.querySelector('.rank-detail-panel')?.scrollIntoView({block:'start'});return;}this.act(action,target.dataset.value);});
      const route=new URLSearchParams(location.search);
      if(route.get('panel')==='shop')this.openShop();
      if(route.get('panel')==='free'){
        this.openFree();
        const hero=route.get('hero'),map=route.get('map');
        if(hero&&this.allows('heroes',hero)&&ns.systems.HeroRoster.CLASSES[hero])this.game.selectOpeningProfession(hero);
        if(map&&this.allows('maps',map)&&ns.maps.definitions[map])this.game.chooseMap(map);
      }
      document.body.dataset.appReady='true';
      // A returned page must read changes made in Codex, rather than resume a stale save envelope.
      addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
      addEventListener('pagehide',event=>{if(!event.persisted)this.settleRetreat();});
    }
    isAdmin(){return this.store.current().kind==='admin';}
    allows(kind,id){return this.store.allows(kind,id);}
    canLaunch(hero,faction){return this.allows('heroes',hero)&&this.allows('factions',faction)&&this.allows('maps',ns.config.mapId)&&this.allows('difficulties',this.game.difficulty.selected);}
    bindStorage(mode){this.game.report=new ns.systems.BattleReportSystem(this.store.adapter(mode));this.game.checkpoints=new ns.systems.ChapterCheckpointSystem(this.store.adapter(mode));this.bindCodex();}
    bindCodex(){
      if(!ns.codex.StoryCodexBridge||!this.game.build||!this.game.waves)return;
      this.game.codexBattleBridge?.dispose();
      this.progression=new ns.codex.StoryCodexBridge({profileStore:this.store,storage:null,seeds:[...ns.codex.chronicleSeed,ns.cinematic.prologueChronicle],getMission:id=>ns.systems.StoryCatalog.getMission(id)});
      this.progression.onError=error=>{this.message='圖鑑紀錄尚未儲存：'+error.message;};
      ns.codex.CodexBattleBridge.install(this.game,this.progression);
    }
    async openShop(){
      if(this.shopOpening||this.shopView)return;
      this.shopOpening=true;
      try{
        const shop=globalThis.FrontierShop;
        const store=await new shop.SkinStore(shop.catalog,new shop.ProfileSkinAdapter(this.store)).init();
        this.game.paused=true;this.root.hidden=true;this.shell.inert=true;document.body.dataset.appPage='shop';
        this.shopRoot=document.createElement('section');this.shopRoot.id='frontier-shop';document.body.append(this.shopRoot);
        this.shopView=new shop.ShopView(this.shopRoot,store,{onClose:()=>{this.shopView.destroy();this.shopRoot.remove();this.shopView=null;this.shopRoot=null;this.applyCosmetics();this.show('home');}});
      }catch(error){this.message='商城暫時無法開啟：'+error.message;this.shopRoot?.remove();this.show('home');}
      finally{this.shopOpening=false;}
    }
    show(page){this.page=page;this.game.ui.professionScreen.hidden=true;this.root.hidden=false;this.shell.inert=true;document.body.dataset.appPage=page;this.render();}
    applyCosmetics(){
      const raw=this.store.current().data['shop:state'];let state;
      try{state=raw?JSON.parse(raw):null;}catch{state=null;}
      const owned=new Set(state?.ownedSkins||[]),equipped=state?.equippedSkins||{},valid={};
      for(const [slot,id] of Object.entries(equipped))if(owned.has(id)&&globalThis.FrontierShop.catalog.some(item=>item.id===id&&item.availability.status==='available'&&item.category+':'+item.targetId===slot))valid[slot]=id;
      this.game.art.cosmeticEquipped=valid;this.game.art.cosmeticFaction=valid['faction:hunter']==='eclipse-court'?'eclipse-court':null;this.game.updateOpeningPresentation?.();
    }
    settleRetreat(){if(this.mode!=='free'||this.game.status!=='playing'||!this.game.profession.selected)return true;const result=this.game.report.finalResult||this.game.report.finalize('retreated',{baseHealth:this.game.baseHealth});if(!result.persisted){result.persisted=this.game.report.saveRecords();if(!result.persisted){this.game.flash('撤退積分尚未儲存，請檢查存檔空間後重試','#ffb578');return false;}}this.game.checkpoints?.clear();return true;}
    home(){if(!this.settleRetreat())return false;if(this.game.ui.menuScreen)this.game.ui.menuScreen.hidden=true;this.game.pendingProfession=null;this.game.pendingCheckpoint=null;this.game.reset();this.game.waves.catalog=new ns.systems.WaveCatalog();this.mode='free';this.bindStorage('free');this.applyCosmetics();this.game.paused=true;this.show('home');return true;}
    openStoryMap(){if(!this.home())return false;this.show('story');return true;}
    openNextStory(){const current=this.activeStoryMission||ns.systems.StoryCatalog.mission,next=ns.systems.StoryCatalog.missions.find(m=>m.requires===current.id);if(!next||!this.store.current().completed.includes(current.id))return false;this.selectedStoryMission=next.id;return this.openStoryMap();}
    notify(message){this.message=message;if(!this.root.hidden)this.render();}
    run(action){try{return action();}catch(error){this.notify('無法儲存：'+error.message+'。請先匯出備份並檢查瀏覽器空間，勿清除資料。');return false;}}
    openFree(run){this.mode='free';this.game.reset();this.applyCosmetics();this.game.waves.catalog=new ns.systems.WaveCatalog();this.bindStorage('free');this.game.chooseMap(run?.map&&this.allows('maps',run.map)?run.map:'beginner');this.game.chooseDifficulty(run?.difficulty&&this.allows('difficulties',run.difficulty)?run.difficulty:'standard');this.game.selectOpeningProfession(run?.profession&&this.allows('heroes',run.profession)?run.profession:'hunter');this.game.selectOpeningFaction(run?.faction&&this.allows('factions',run.faction)?run.faction:'hunter');this.root.hidden=true;this.shell.inert=false;document.body.dataset.appPage='free';this.game.ui.professionScreen.hidden=false;this.game.showOpeningPage('battlefield');this.refreshLocks();if(run)this.game.chooseProfession(this.game.selectedProfession,this.game.selectedFaction);}
    refreshLocks(){for(const [selector,kind,attribute] of [['[data-profession]','heroes','profession'],['[data-faction]','factions','faction'],['[data-map-id]','maps','mapId'],['[data-td-difficulty]','difficulties','tdDifficulty']]){document.querySelectorAll(selector).forEach(button=>{const locked=!this.allows(kind,button.dataset[attribute]);button.disabled=locked;button.dataset.progressLocked=String(locked);button.title=locked?this.lockReason(kind,button.dataset[attribute]):'';let note=button.querySelector('.progress-lock');if(locked&&!note){note=document.createElement('small');note.className='progress-lock';button.append(note);}if(note){note.hidden=!locked;note.textContent='🔒 '+button.title;}});}if(this.game.ui.mapChoice)Array.from(this.game.ui.mapChoice.options).forEach(option=>option.disabled=!this.allows('maps',option.value));}
    lockReason(kind,id){if(id==='frostland')return '冰原故事章節尚未指定';if(kind==='maps'){const source=ns.systems.StoryCatalog.missions.find(m=>m.rewards?.maps?.includes(id));return source?'完成「'+source.name+'」':'後續故事解鎖';}if(kind==='difficulties')return '後續挑戰解鎖';if(kind==='factions')return id==='goblin'?'地精軍團的故事章節尚未解鎖':id==='wild'?'完成第二章對應劇情':'完成第一章';return id==='goblin'?'地精英雄的故事章節尚未解鎖':id==='chief'?'完成第二章英雄任務':'完成第一章對應英雄任務';}
    async startCinematic(){
      if(this.storyStarting)return;
      const api=ns.cinematic,progress=new api.PrologueProgress(this.store);
      this.cinematicPlayer ||= new api.CinematicPlayer();
      if(this.replayOnly){
        this.storyStarting=true;
        try{return await progress.replay(api.prologue.cinematicId,this.cinematicPlayer);}finally{this.storyStarting=false;}
      }
      if(progress.prologueSeen)return this.launchStory();
      this.storyStarting=true;
      const identity=progress.identity();
      try{
        const result=await new api.CinematicStoryAdapter(this.cinematicPlayer).trigger(ns.systems.StoryCatalog.chapters[0],'cinematicOnChapterStart');
        if(!result.watched)return;
        this.pendingPrologue={result,identity};
        this.finishPrologue();
      }finally{this.storyStarting=false;}
    }
    finishPrologue(){
      if(!this.pendingPrologue)return;
      const {result,identity}=this.pendingPrologue,progress=new ns.cinematic.PrologueProgress(this.store);
      const saved=this.run(()=>progress.complete(result,identity));
      if(!saved)return this.show('prologue-save');
      this.pendingPrologue=null;this.message='';this.show('chapter-start');
    }
    renderCinematicCollection(){
      const api=ns.cinematic,seen=new api.PrologueProgress(this.store).prologueSeen,b=this.button.bind(this);
      return '<article class="cinematic-collection"><small>世界圖鑑 → 編年史</small><h1>Cinematic Collection</h1><h2>《曾經的和平》</h2><p>'+(seen?escape(api.prologueChronicle.fragments[0].text):'完成或跳過故事序章後收錄。')+'</p><small>'+(seen?'CONFIRMED / STORY EXPERIENCE · 已收錄':'尚未解鎖')+'</small><p>約 60 秒。影像尚未齊備時播放分鏡預覽。重播不影響故事進度。</p>'+(seen?b('replay','Replay Cinematic · 重播影片',null,'gold'):b('story','前往劇情模式',null,'gold'))+b('home','返回大廳')+'</article>';
    }
    launchStory(selected){const m=selected||ns.systems.StoryCatalog.mission;if(m.requires&&!this.store.current().completed.includes(m.requires))return false;this.activeStoryMission=m;this.mode='story';this.game.reset();this.applyCosmetics();this.bindStorage('story');this.game.waves.catalog=new ns.systems.StoryCatalog.StoryWaves(m);this.game.chooseMap(m.map);this.game.chooseDifficulty(m.difficulty);this.game.selectOpeningProfession(m.hero);this.game.selectOpeningFaction(m.faction);this.root.hidden=true;this.shell.inert=false;document.body.dataset.appPage='battle';this.game.chooseProfession(m.hero,m.faction);return true;}
    onBattleStart(run){document.body.dataset.appPage='battle';this.root.hidden=true;this.shell.inert=false;this.run(()=>this.store.remember({...run,mode:this.mode}));this.game.report.run.mode=this.mode;this.game.report.run.profileKind=this.store.current().kind;this.game.report.run.testRound=this.store.current().round;if(this.mode==='story')this.game.report.run.mission=(this.activeStoryMission||ns.systems.StoryCatalog.mission).id;}
    onWave(wave){/* CodexBattleBridge records actual spawned enemies, never the wave preview. */}
    onBattleEnd(victory){
      if(this.mode!=='story')return{mode:'free'};
      const mission=this.activeStoryMission||ns.systems.StoryCatalog.mission;
      if(!victory)return{mode:'story',mission};
      const reward=mission.rewards.maps[0],wasUnlocked=reward&&this.allows('maps',reward);
      const saved=this.run(()=>this.store.complete(mission));
      if(saved!==false&&this.progression)this.run(()=>{this.progression.save.load();this.progression.refresh();this.progression.handleStoryEvent({type:'mission-completed',id:mission.id});});
      const nextMission=ns.systems.StoryCatalog.missions.find(m=>m.requires===mission.id);
      return{mode:'story',mission,nextMission,saved:saved!==false,canContinue:Boolean(nextMission&&saved!==false&&this.store.current().completed.includes(mission.id)),newlyUnlocked:Boolean(reward&&!wasUnlocked)};
    }
    walletButton(kind,amount){const gold=kind==='gold',label=(gold?'帳戶金幣':'鑽石')+'：'+amount.toLocaleString();return '<button data-action="wallet" class="'+(gold?'wallet-gold':'wallet-diamonds')+'" aria-label="'+escape(label)+'" title="'+escape(label)+'"><i aria-hidden="true" class="'+(gold?'currency-coin':'currency-gem')+'">'+(gold?'✦':'◆')+'</i><span>'+amount.toLocaleString()+'</span></button>';}
    button(action,label,value,cls=''){return '<button aria-label="'+escape(label.replace(/<[^>]*>/g,''))+'" class="'+cls+'" data-action="'+action+'"'+(value?' data-value="'+escape(value)+'"':'')+'>'+label+'</button>';}
    icon(id){const paths={home:'M3 11 12 3 21 11 M6 10v11h12V10 M10 21v-7h4v7',story:'M12 5v16 M12 5C9 2 5 3 2 4v16c4-2 7-2 10 1 3-3 6-3 10-1V4c-3-1-7-2-10 1',free:'m4 3 13 13-2 2L2 5V2h3 M20 3 7 16l2 2L22 5V2h-3 M3 16l5 5 M16 21l5-5 M4 20l-2 2 M20 20l2 2',codex:'M12 2v20 M2 12h20 M5 5l14 14 M19 5 5 19 M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16',shop:'M2 3h3l3 13h11l3-10H6 M9 20h1 M17 20h1',ranking:'M7 3h10v6c0 8-10 8-10 0V3 M7 5H3v4c0 3 3 4 5 4 M17 5h4v4c0 3-3 4-5 4 M12 15v6 M7 22h10',friends:'M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M17 4a3 3 0 1 0 0 6 M2 21v-5c0-6 12-6 12 0v5Z M16 13c5 0 6 3 6 8h-6',settings:'M9 2h6l1 4 4 1 2 5-3 3 1 4-5 3-3-3-4 1-4-4 1-4-3-3 2-5 4-1Z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8'};return '<svg class="frontier-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[id]+'"/></svg>';}
    renderHome(p){
      const b=this.button.bind(this),last=p.lastFreeRun,missions=ns.systems.StoryCatalog.missions,done=missions.filter(m=>p.completed.includes(m.id)).length,count=this.isAdmin()?Object.keys(ns.systems.FactionSystem.FACTIONS).length:p.unlocks.factions.length;
      return '<div class="home-motto"><h1>不同的英雄 · 同一個世界</h1><em>Different Heroes, One World</em><p>邊境之外，還有更多值得守護的世界。</p></div><div class="mode-cards"><article class="mode-card story-mode"><header>'+this.icon('story')+'<div><h2>劇情模式</h2><small>STORY MODE</small></div></header><div class="mode-copy"><h3>第一章　破碎的和平</h3><p>邊境烽火燃起，調查從谷地延伸到溪谷、舊城與冰原。</p><div class="story-progress"><i style="width:'+(done/missions.length*100)+'%"></i><span>任務 '+done+' / '+missions.length+'</span></div>'+b('story',done===missions.length?'重溫故事 →':'繼續故事 →',null,'gold bevel')+'</div></article><article class="mode-card free-mode"><header>'+this.icon('free')+'<div><h2>自由遠征</h2><small>EXPEDITION</small></div></header><div class="mode-copy"><h3>自由搭配 · 挑戰極限</h3><p>選擇你的英雄、軍團與地圖，展開屬於你的遠征。</p><div class="expedition-foot"><div><small>已解鎖軍團　'+count+' / '+Object.keys(ns.systems.FactionSystem.FACTIONS).length+'</small><div class="mini-factions">'+['hunter','arcanist','rogue','wild','goblin','frostland'].map((id,i)=>'<span title="'+(this.allows('factions',id)?'已解鎖':'故事解鎖')+'" class="'+(this.allows('factions',id)?'':'locked')+'">'+(this.allows('factions',id)?['♜','✦','◆','♈','⚙','❄'][i]:'🔒')+'</span>').join('')+'</div></div>'+b('free','開始遠征 →',null,'blue bevel')+'</div>'+(last?'<div class="last-expedition">上次：'+escape(ns.maps.definitions[last.map]?.name||last.map)+' '+b('again','再次出征')+'</div>':'')+(this.game.checkpoints.read()?b('continue','繼續已保存遠征'):'')+'</div></article></div><div class="home-bottom" role="region" aria-label="造型預告與最新消息，可左右滑動查看更多" tabindex="0"><article class="feature-panel hero-feature"><small>新造型販售中</small><h3>森語者 · 霜華之誓</h3><p>冰雪不息，誓言長存。</p>'+b('shop','前往商城 →',null,'blue')+'</article><article class="feature-panel profile-feature"><small>英雄造型販售中</small><h3>冥骨帝王</h3><p>幽冥骨甲 · 綠焰巨斧</p>'+b('shop','前往商城 →',null,'blue')+'</article><article class="news-panel"><h3>最新消息</h3><p><time>09/21</time>故事新戰場開放</p><p><time>09/21</time>新增獨立測試輪次與封存還原</p><p><time>P0</time>世界圖鑑與外觀展示商城已開放</p></article></div>';
    }
    renderStory(p){
      const b=this.button.bind(this),missions=ns.systems.StoryCatalog.missions,done=missions.filter(m=>p.completed.includes(m.id)).length;
      const selected=ns.systems.StoryCatalog.getMission(this.selectedStoryMission)||missions.find(m=>!p.completed.includes(m.id)&&(!m.requires||p.completed.includes(m.requires)))||missions[0];
      const locked=Boolean(selected.requires&&!p.completed.includes(selected.requires)),index=missions.indexOf(selected),map=ns.maps.definitions[selected.map],reward=selected.rewards.maps[0],rewardMap=reward&&ns.maps.definitions[reward];
      const nodes=missions.map((m,i)=>{const available=!m.requires||p.completed.includes(m.requires),status=p.completed.includes(m.id)?'已通關':available?'可挑戰':'尚未解鎖',art=ns.maps.definitions[m.map].asset;return b('story-select','<small>1-'+(i+1)+'</small><img src="'+art+'" alt=""><b>'+m.name+'</b><span>'+status+'</span>',m.id,'mission-node'+(available?'':' mission-locked')+(m===selected?' mission-selected':''));}).join('');
      return '<div class="campaign"><aside class="chapter-list"><h2>劇情模式</h2><button class="chapter selected" data-action="story"><b>第一章</b><span>破碎的和平</span><em>›</em></button><div class="chapter unavailable"><b>第二章</b><span>荒野的回聲</span><small>後續版本開放</small></div><p>依序完成任務解鎖下一個戰場；故事尚未揭曉全部真相。</p></aside><section class="campaign-world"><div><small>CHAPTER I</small><h1>第一章　破碎的和平</h1><p>跟隨調查線索，守住沿途的防線。</p></div><div class="mission-route campaign-missions">'+nodes+'</div><footer>章節任務　'+done+' / '+missions.length+'<br><small>目前開放的任務不代表第一章故事完結。</small></footer></section><article class="mission-intel"><h2>1-'+(index+1)+'　'+selected.name+'</h2><img src="'+map.asset+'" alt="'+map.name+'地圖"><blockquote>「'+escape(selected.cinematic[0])+'」</blockquote><h3>關卡資訊</h3><p>'+escape(selected.objective)+'</p><p>'+escape(map.name)+'<br>遠征見習 · '+selected.waves.length+' 波</p><h3>通關解鎖</h3>'+(rewardMap?'<div class="mission-reward"><img src="'+rewardMap.asset+'" alt=""><span>自由遠征地圖<br><b>'+rewardMap.name+'</b>'+(selected===missions[0]?'、銀葉溪谷':'')+'</span></div>':'<p>此任務沒有額外地圖解鎖。</p>')+'<div class="mission-actions">'+(locked?'<button type="button" disabled>先完成前一個任務</button>':b(selected===missions[0]?'cinematic':'story-battle',p.completed.includes(selected.id)?'重玩任務 →':'開始挑戰 →',selected.id,'blue bevel'))+(new ns.cinematic.PrologueProgress(this.store).prologueSeen?b('replay','序章回顧'):'')+'</div></article></div>';
    }
    renderProfile(p){const art={kingdom:['邊境王庭','assets/td/lobby/kingdom-lobby-v1.png'],snow:['霜谷遠征','assets/td/lobby/expedition-card-v1.png'],goblin:['黃銅工坊','assets/td/goblin-chief-engineer-v1.png']},selected=art[p.profileArt]?'kingdom snow goblin'.split(' ').find(id=>id===p.profileArt):'kingdom',records=new ns.ranking.RankingDataSource(this.store).read().records,best=records.reduce((max,r)=>Math.max(max,r.finalScore),0),wins=records.filter(r=>r.outcome==='success').length;return '<section class="player-profile"><header class="profile-heading"><div><small>HERO FRONTIER · PLAYER</small><h1>個人頁籤</h1><p>此圖塊會顯示在你的玩家資料頁。</p></div>'+this.button('home','關閉 ×')+'</header><div class="profile-art-hero" style="background-image:linear-gradient(0deg,#061321d9,transparent 65%),url(\''+art[selected][1]+'\')"><div><img src="assets/td/opening/hero-hunter-selection-v1.png" alt="玩家頭像"><span><b>'+escape(p.kind==='admin'?'管理者遊玩':'新玩家測試')+'</b><small>'+escape(art[selected][0])+'</small></span></div></div><div class="profile-stats"><span>遠征紀錄 <b>'+records.length+'</b></span><span>成功通關 <b>'+wins+'</b></span><span>最高積分 <b>'+best.toLocaleString('zh-TW')+'</b></span></div><h2>邊境典藏 · 更換背景圖塊</h2><div class="profile-art-options">'+Object.entries(art).map(([id,[name,src]])=>'<button type="button" data-action="profile-art" data-value="'+id+'" aria-pressed="'+(selected===id)+'"><img src="'+src+'" alt=""><b>'+name+'</b><small>'+(selected===id?'使用中':'套用外觀')+'</small></button>').join('')+'</div><p class="profile-note">目前開放三款免費圖塊試用；商城購買與線上分享尚未開放。</p></section>';}
    render(){const p=this.store.current(),b=this.button.bind(this),m=ns.systems.StoryCatalog.mission;const label=p.kind==='admin'?'管理者遊玩 · 全內容可用':'新玩家測試 · ROUND '+p.round;const nav=[['home','首頁'],['story','劇情模式'],['free','自由遠征'],['codex','世界圖鑑'],['shop','商城'],['ranking','排行榜'],['friends','好友'],['settings','設定']];
      let content='';
      if(this.page==='home')content=this.renderHome(p);
      else if(this.page==='ranking'){this.rankingView ||= new ns.ranking.RankingView(this.store);content=this.rankingView.render();}
      else if(this.page==='story')content=this.renderStory(p);
      else if(this.page==='profile')content=this.renderProfile(p);
      else if(this.page==='codex')content=this.renderCinematicCollection();
      else if(this.page==='chapter-start')content='<article class="cinematic-collection"><small>HERO FRONTIER · CHAPTER I</small><h1>《破碎的和平》</h1><p>序章已收錄至世界圖鑑 → 編年史 → Cinematic Collection。</p><p>第一個故事任務：烽火初燃</p>'+b('chapter-battle','開始第一個故事任務',null,'gold')+b('story','返回章節選單')+'</article>';
      else if(this.page==='prologue-save')content='<article class="cinematic-collection"><h1>觀看紀錄尚未儲存</h1><p>請先匯出備份，確認瀏覽器儲存空間或其他分頁狀態，再重試。序章不需要重新觀看。</p>'+b('retry-prologue','重試儲存並進入第一章',null,'gold')+b('export','匯出完整備份')+b('story','返回章節選單')+'</article>';
      else if(this.page==='cinematic'){content='<article class="cinematic"><small>CHAPTER I · 烽火初燃</small><h1>'+['烽火','失誓','守住希望'][this.slide]+'</h1><p>'+m.cinematic[this.slide]+'</p><span>'+ (this.slide+1)+' / 3 · 劇情已收錄，跳過仍可重看</span><div>'+b('skip',this.replayOnly?'返回劇情選單':'跳過並出征')+b('next',this.slide===2?(this.replayOnly?'結束回顧':'開始戰鬥 →'):'繼續 →',null,'gold')+'</div></article>';}
      else if(this.page==='settings'){const test=this.store.state.profiles.test;content='<div class="section-heading"><small>PLAYER PROFILES</small><h1>遊玩與測試，各自保留</h1><p>目前：'+label+'。測試進度、裝備、戰績與中途存檔皆獨立。</p></div><div class="settings-grid"><article class="journey-card"><h2>管理者遊玩</h2><p>保留原有紀錄，可使用所有英雄、軍團、地圖與難度。故事仍記錄實際通關進度。</p>'+b('admin','切換管理者')+'</article><article class="journey-card"><h2>新玩家測試</h2><p>'+(test?'現有 ROUND '+test.round+' · '+escape(test.startedVersion):'從王國與雷恩開始，體驗正常解鎖流程。')+'</p>'+ (test?b('test','繼續此輪測試'):'')+b('new-round','開啟新一輪測試',null,'gold')+'</article><article class="journey-card"><h2>備份與還原</h2><p>備份包含管理者、測試與封存輪次。匯入會先保存目前資料。</p>'+b('export','匯出完整備份')+'<label class="import-label">匯入備份<input type="file" id="profile-import" accept="application/json"></label></article><article class="journey-card"><h2>封存測試</h2><p>每次開新一輪都保留上一輪，可回復繼續測試。</p>'+ (this.store.state.archives.map(a=>b('restore','回復 ROUND '+a.round+' · '+escape(a.startedVersion),String(a.round))).join('')||'<p>尚無封存紀錄</p>')+'</article><article class="journey-card"><h2>遊戲程式更新</h2><p>畫面仍是舊版時，重新取得新版程式；保留進度、購買紀錄與裝備。</p><a class="import-label" href="update.html" target="_top">更新並重新開啟</a></article></div>';}
      else if(this.page==='confirm-round'){content='<article class="confirm-card"><small>NEW TEST ROUND</small><h1>從全新玩家重新開始</h1><p>目前測試輪次會封存。新一輪將重設故事、解鎖、戰績與中途存檔；管理者紀錄完整保留。</p>'+b('settings','取消')+b('confirm-round','封存並開始新一輪',null,'gold')+'</article>';}
      else if(this.page==='wallet'){content='<article class="confirm-card"><small>ACCOUNT WALLET</small><h1>造型帳戶</h1><p>帳戶金幣：'+p.wallet.gold.toLocaleString()+'　鑽石：'+p.wallet.diamonds.toLocaleString()+'</p><p>此餘額跨場保存，供造型等外觀內容使用，與戰鬥中的建造金幣分開。</p><p>正式貨幣取得與消費尚未開放；商城使用獨立試用水晶，購買紀錄保存於目前玩家檔案。</p>'+b('home','返回大廳',null,'gold')+'</article>';}
      else if(this.page==='skin-preview'||this.page==='limited-preview'){const limited=this.page==='limited-preview';content='<article class="cosmetic-preview"><img src="assets/td/lobby/'+(limited?'../shop/bone-chief-portrait-v1.png':'skin-frost-v1.png')+'" alt="'+(limited?'冥骨帝王造型':'霜華之誓造型概念')+'"><section><small>'+(limited?'期間限定企劃':'新造型預告')+'</small><h1>'+(limited?'冥骨帝王':'森語者 · 霜華之誓')+'</h1><p>外觀現已在商城開放使用試用水晶購買及裝備。無真實付款。</p><p>造型不增加戰鬥能力。</p>'+b('home','返回大廳',null,'blue')+'</section></article>';}
      else {const names={codex:'世界圖鑑',shop:'商城',ranking:'排行榜',friends:'好友'};content='<article class="confirm-card"><small>COMING NEXT</small><h1>'+names[this.page]+'</h1><p>此功能尚未開放。當前版本已提供故事示範任務與自由遠征。</p>'+b('home','返回大廳',null,'gold')+'</article>';}
      this.root.dataset.page=this.page;
      this.root.innerHTML='<aside class="lobby-nav"><div class="lobby-logo"><span>HERO</span><strong>FRONTIER</strong><small>─ 英雄的邊境 ─</small></div><nav>'+nav.map(([id,name])=>b(id,this.icon(id)+'<span>'+name+'<small>'+({home:'HOME',story:'STORY MODE',free:'EXPEDITION',codex:'CODEX',shop:'SHOP',ranking:'RANKING',friends:'FRIENDS',settings:'SETTINGS'}[id])+'</small></span>',null,this.page===id?'active':'')).join('')+'</nav><small class="nav-motto">Different Heroes<br>One World</small></aside><div class="lobby-main"><header class="lobby-top"><button type="button" class="profile-badge" data-action="profile" aria-label="展開個人頁籤"><img src="assets/td/opening/hero-hunter-selection-v1.png" alt=""><span>'+label+'<small>HERO FRONTIER · v0.85.10</small></span></button><div class="wallet-bar">'+this.walletButton('gold',p.wallet.gold)+this.walletButton('diamonds',p.wallet.diamonds)+'</div><div class="header-actions">'+(this.page!=='home'?b('home',this.icon('home')+'<span>返回大廳</span>'):'')+b('settings',this.icon('settings')+'<span>設定與測試</span>')+'</div></header><main class="lobby-content">'+(this.message?'<p class="app-message" role="alert">'+escape(this.message)+'</p>':'')+content+'</main></div>';
      const input=this.root.querySelector('#profile-import');if(input)input.onchange=async()=>{const file=input.files[0];if(!file)return;this.pendingImport=await file.text();const warning=document.createElement('p');warning.textContent='匯入會替換全部玩家進度。目前資料會先另行備份。';input.after(warning);const button=document.createElement('button');button.textContent='確認匯入此備份';button.onclick=()=>this.run(()=>{this.store.import(this.pendingImport);this.message='備份已還原';this.home();});input.after(button);};
      this.root.querySelector('h1')?.setAttribute('tabindex','-1');
    }
    act(action,value){if(this.storyStarting||this.shopOpening)return;this.message='';if(action==='story-select'){this.selectedStoryMission=value;return this.render();}if(action==='story-battle'){const mission=ns.systems.StoryCatalog.getMission(value);return mission&&this.launchStory(mission);}if(action==='profile-art')return this.run(()=>{this.store.setProfileArt(value);this.render();});if(action==='retry-prologue')return this.finishPrologue();if(action==='chapter-battle')return this.launchStory();if(action==='shop')return this.openShop();if(action==='codex'){location.href='codex.html';return;}if(action==='free')return this.openFree();if(action==='home')return this.home();if(action==='story'){this.replayOnly=false;return this.show('story');}if(['profile','settings','codex','shop','ranking','friends','wallet','skin-preview','limited-preview'].includes(action))return this.show(action);if(action==='new-round')return this.show('confirm-round');if(action==='confirm-round')return this.run(()=>{this.store.newRound();this.home();});if(action==='admin'||action==='test')return this.run(()=>{this.store.switchTo(action);this.home();});if(action==='restore')return this.run(()=>{this.store.restoreRound(Number(value));this.home();});if(action==='export')return this.download(this.store.export(),'hero-frontier-profiles.json');if(action==='cinematic'||action==='replay'){this.replayOnly=action==='replay';return this.startCinematic();}if(action==='skip'||action==='next'&&this.slide===2)return this.replayOnly?this.show('story'):this.launchStory();if(action==='next'){this.slide++;return this.render();}if(action==='again'){const run=this.store.current().lastFreeRun;return run?.mode==='story'?this.startCinematic():this.openFree(run);}if(action==='continue'){this.openFree();this.game.continueExpedition();}}
    download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  }
  ns.systems.FrontierApp=FrontierApp;if(globalThis.document&&globalThis.towerFrontierGame)globalThis.frontierApp=new FrontierApp(globalThis.towerFrontierGame);
})(globalThis.TowerFrontier);
