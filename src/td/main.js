(function(ns){
  'use strict';
  if(typeof navigator!=='undefined'&&'serviceWorker' in navigator&&typeof location!=='undefined'&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(function(){});
  let layoutStorage=null;try{layoutStorage=globalThis.localStorage;}catch(error){}const layout=new ns.systems.LayoutSystem(document.body,layoutStorage,function(){return{width:globalThis.innerWidth,height:globalThis.innerHeight,coarse:globalThis.matchMedia?globalThis.matchMedia('(pointer: coarse)').matches:false};});
  const layoutMode=document.getElementById('td-layout-mode'),mobilePanelToggle=document.getElementById('td-mobile-panel-toggle');layoutMode.value=layout.choice;let mobilePanel='compact';try{mobilePanel=layoutStorage&&layoutStorage.getItem('towerFrontierMobilePanel')||'compact';}catch(error){}if(!['compact','expanded'].includes(mobilePanel))mobilePanel='compact';const applyMobilePanel=function(){document.body.dataset.mobilePanel=mobilePanel;if(mobilePanelToggle){const expanded=mobilePanel==='expanded';mobilePanelToggle.setAttribute('aria-expanded',String(expanded));mobilePanelToggle.textContent=expanded?'收合面板':'展開建造';}};applyMobilePanel();if(mobilePanelToggle)mobilePanelToggle.addEventListener('click',function(){mobilePanel=mobilePanel==='expanded'?'compact':'expanded';try{if(layoutStorage)layoutStorage.setItem('towerFrontierMobilePanel',mobilePanel);}catch(error){}applyMobilePanel();});layoutMode.addEventListener('change',function(){layout.select(layoutMode.value);});globalThis.addEventListener('resize',function(){layout.onResize();});
  const ui={mercenaries:Array.from(document.querySelectorAll('[data-mercenary]')),shopScreen:document.getElementById('td-shop-screen'),shopOpen:document.getElementById('td-shop-open'),shopClose:document.getElementById('td-shop-close'),shopMessage:document.getElementById('td-shop-message'),shopGold:document.getElementById('td-shop-gold'),shopItems:Array.from(document.querySelectorAll('[data-shop-item]')),lootScreen:document.getElementById('td-loot-screen'),lootOptions:document.getElementById('td-loot-options'),lootHistory:document.getElementById('td-loot-history'),lootKicker:document.getElementById('td-loot-kicker'),lootIntro:document.getElementById('td-loot-intro'),armoryScreen:document.getElementById('td-armory-screen'),armoryOpen:document.getElementById('td-armory-open'),armoryClose:document.getElementById('td-armory-close'),armoryTarget:document.getElementById('td-armory-target'),armoryItems:document.getElementById('td-armory-items'),armoryMessage:document.getElementById('td-armory-message'),armoryCount:document.getElementById('td-armory-count'),towerBranches:document.getElementById('td-tower-branches'),towerBranchButtons:Array.from(document.querySelectorAll('[data-tower-branch]')),armySummary:document.getElementById('td-army-summary'),heroWeapon:document.getElementById('td-hero-weapon'),reportScreen:document.getElementById('td-report-screen'),reportOpen:document.getElementById('td-report-open'),reportClose:document.getElementById('td-report-close'),reportRun:document.getElementById('td-report-run'),reportRows:document.getElementById('td-report-rows'),reportTotal:document.getElementById('td-report-total'),finalReport:document.getElementById('td-final-report'),thunder:document.getElementById('td-thunder'),summon:document.getElementById('td-summon'),ultimate:document.getElementById('td-ultimate'),artLoading:document.getElementById('td-art-loading'),artStatus:document.getElementById('td-art-status'),artRetry:document.getElementById('td-art-retry'),towerSkill:document.getElementById('td-tower-skill'),pause:document.getElementById('td-pause'),speedButtons:Array.from(document.querySelectorAll('[data-game-speed]')),help:document.getElementById('td-help'),commandGrid:document.querySelector('.command-grid'),commandTabs:Array.from(document.querySelectorAll('[data-command-tab]')),heroSelect:document.getElementById('td-hero-select'),heroLevel:document.getElementById('td-hero-level'),heroHpText:document.getElementById('td-hero-hp-text'),heroHpFill:document.getElementById('td-hero-hp-fill'),heroMpText:document.getElementById('td-hero-mp-text'),heroMpFill:document.getElementById('td-hero-mp-fill'),heroXpText:document.getElementById('td-hero-xp-text'),heroXpFill:document.getElementById('td-hero-xp-fill'),statAttack:document.getElementById('td-stat-attack'),statRange:document.getElementById('td-stat-range'),statSpeed:document.getElementById('td-stat-speed'),statMove:document.getElementById('td-stat-move'),gold:document.getElementById('td-gold'),lumber:document.getElementById('td-lumber'),merit:document.getElementById('td-merit'),health:document.getElementById('td-health'),waveNumber:document.getElementById('td-wave-number'),waveStatus:document.getElementById('td-wave-status'),wavePreview:document.getElementById('td-wave-preview'),wave:document.getElementById('td-wave-button'),skill:document.getElementById('td-skill-button'),selection:document.getElementById('td-selection'),selectionType:document.getElementById('td-selection-type'),selectionPurpose:document.getElementById('td-selection-purpose'),selectionStats:document.getElementById('td-selection-stats'),portrait:document.getElementById('td-portrait'),targetControls:document.getElementById('td-target-controls'),targetStrategy:document.getElementById('td-target-strategy'),professionScreen:document.getElementById('td-profession-screen'),professionButtons:Array.from(document.querySelectorAll('[data-profession]')),buildButtons:Array.from(document.querySelectorAll('[data-build-type]')),upgrade:document.getElementById('td-upgrade'),sell:document.getElementById('td-sell'),cancelBuild:document.getElementById('td-cancel-build'),overlay:document.getElementById('td-overlay'),overlayTitle:document.getElementById('td-overlay-title'),overlayMessage:document.getElementById('td-overlay-message'),restart:document.getElementById('td-restart')};
  ui.reportAnalysis=document.getElementById('td-report-analysis');
  ui.reportHistory=document.getElementById('td-report-history');
  ui.reportReadiness=document.getElementById('td-report-readiness');
  ui.difficultyButtons=Array.from(document.querySelectorAll('[data-td-difficulty]'));
  ui.factionButtons=Array.from(document.querySelectorAll('[data-faction]'));
  ui.openingStart=document.getElementById('td-start-expedition');
  ui.openingContinue=document.getElementById('td-continue-expedition');
  ui.difficultyDetail=document.getElementById('td-difficulty-detail');
  ['openingTitle','openingSubtitle','stepBattleSummary','stepPartySummary','mapPreview','mapTitle','mapDetailName','mapQuote','mapTags','mapDescription','mapFeatures','routeLabel','mapRecord','selectBattlefield','changeBattlefield','partyBattlefield','heroDetailArt','heroDetailName','heroIdentity','heroDescription','heroSkills','heroPhase','factionDetailArt','factionDetailName','factionIdentity','factionDescription','factionPhases','factionRoster','summaryMap','summaryDifficulty','summaryHero','summaryHeroShort','summaryFaction','combinationHint'].forEach(function(key){const id='td-'+key.replace(/[A-Z]/g,function(letter){return'-'+letter.toLowerCase();});ui[key]=document.getElementById(id);});
  ui.openingPageButtons=Array.from(document.querySelectorAll('[data-opening-page]'));ui.expeditionPages=Array.from(document.querySelectorAll('[data-expedition-page]'));ui.mapButtons=Array.from(document.querySelectorAll('[data-map-id]'));ui.partyTabButtons=Array.from(document.querySelectorAll('[data-party-tab]'));
  ui.commandGrid=document.querySelector('.td-command .command-grid');
  ui.buildDrawer=document.getElementById('td-build-drawer');
  ui.buildDrawerGrid=document.querySelector('.build-drawer-grid');
  ui.buildDrawerClose=document.getElementById('td-build-drawer-close');
  ui.buildDrawerEmpty=document.getElementById('td-build-drawer-empty');
  ui.buildDetail=document.getElementById('td-build-detail');
  ui.buildDetailName=document.getElementById('td-build-detail-name');
  ui.buildDetailText=document.getElementById('td-build-detail-text');
  ui.buildDetailClose=document.getElementById('td-build-detail-close');
  ui.placementActions=document.getElementById('td-placement-actions');
  ui.placementTitle=document.getElementById('td-placement-title');
  ui.placementDetail=document.getElementById('td-placement-detail');
  ui.placementConfirm=document.getElementById('td-placement-confirm');
  ui.placementCancel=document.getElementById('td-placement-cancel');
  ui.selectionActions=document.getElementById('td-selection-actions');
  ui.buildFilters=Array.from(document.querySelectorAll('[data-build-filter]'));
  ui.menuScreen=document.getElementById('td-menu-screen');
  ui.menuOpens=[document.getElementById('td-menu-open'),document.getElementById('td-opening-menu-open')];
  ui.menuActions=document.getElementById('td-menu-actions');
  ui.menuConfirm=document.getElementById('td-menu-confirm');
  ui.menuSettingsPanel=document.getElementById('td-menu-settings-panel');
  ui.menuContinue=document.getElementById('td-menu-continue');
  ui.menuRestart=document.getElementById('td-menu-restart');
  ui.menuReturn=document.getElementById('td-menu-return');
  ui.menuCancelRestart=document.getElementById('td-menu-cancel-restart');
  ui.menuConfirmRestart=document.getElementById('td-menu-confirm-restart');
  ui.menuSettings=document.getElementById('td-menu-settings');
  ui.menuSettingsBack=document.getElementById('td-menu-settings-back');
  ui.menuLayout=document.getElementById('td-menu-layout-mode');
  ui.resultChange=document.getElementById('td-result-change');
  ui.resultNext=document.getElementById('td-result-next');
  ui.resultReport=document.getElementById('td-result-report');
  ui.resultChapter=document.getElementById('td-result-chapter');
  ui.resultSeal=document.getElementById('td-result-seal');
  ui.resultStatus=document.getElementById('td-result-status');
  ui.resultScore=document.getElementById('td-result-score');
  ui.resultGrade=document.getElementById('td-result-grade');
  ui.resultGradeLabel=document.getElementById('td-result-grade-label');
  ui.resultTime=document.getElementById('td-result-time');
  ui.resultTimeLabel=document.getElementById('td-result-time-label');
  ui.resultHighlight=document.getElementById('td-result-highlight');
  ui.resultUnlock=document.getElementById('td-result-unlock');
  ui.resultUnlockLabel=document.getElementById('td-result-unlock-label');
  ui.resultUnlockName=document.getElementById('td-result-unlock-name');
  ui.openingReset=document.getElementById('td-opening-reset');
  ui.selectionShortcut=document.getElementById('td-selection-shortcut');
  ui.selectionDetails=document.querySelector('.selection-details');
  ui.armoryShortcut=document.getElementById('td-armory-shortcut');
  ui.armoryShortcutCount=document.getElementById('td-armory-shortcut-count');
  ui.shopMerit=document.getElementById('td-shop-merit');
  ui.shopExchanges=Array.from(document.querySelectorAll('[data-shop-exchange]'));
  ui.orientationLock=document.getElementById('td-orientation-lock');
  ui.cameraClose=document.getElementById('td-camera-close');
  ui.scoreShortcut=document.getElementById('td-score-shortcut');
  ui.scorePanel=document.getElementById('td-score-panel');
  ui.scoreClose=document.getElementById('td-score-close');
  ui.scoreValue=document.getElementById('td-score-value');
  ui.scoreTotal=document.getElementById('td-score-total');
  ui.scoreGrade=document.getElementById('td-score-grade');
  ui.scoreDetail=document.getElementById('td-score-detail');
  ui.scoreBest=document.getElementById('td-score-best');
  globalThis.towerFrontierGame=new ns.TDGame(document.getElementById('td-game'),ui);
  if(ui.openingContinue)ui.openingContinue.addEventListener('click',()=>globalThis.towerFrontierGame.continueExpedition());
  if(globalThis.towerFrontierGame.updateCheckpointUi)globalThis.towerFrontierGame.updateCheckpointUi();
  if(ns.systems.WaveHUD)globalThis.towerFrontierGame.waveHUD=new ns.systems.WaveHUD(globalThis.towerFrontierGame,document.getElementById('td-wave-hud'));
  globalThis.towerFrontierGame.attachBuildDetails();
  const requestLandscape=()=>{const orientation=globalThis.screen&&globalThis.screen.orientation;if(!orientation||typeof orientation.lock!=='function')return false;try{const result=orientation.lock('landscape');if(result&&typeof result.catch==='function')result.catch(()=>false);return true;}catch(error){return false;}};
  if(ui.orientationLock)ui.orientationLock.onclick=requestLandscape;
  if(ui.openingStart)ui.openingStart.addEventListener('click',requestLandscape);
  if(ui.placementConfirm)ui.placementConfirm.onclick=()=>globalThis.towerFrontierGame.confirmPlacement();
  // Commit intentional touch releases once, including browsers that suppress
  // compatibility clicks after dragging a placement preview.
  [ui.placementConfirm,ui.upgrade].filter(Boolean).forEach(button=>{
    let press=null,handledPointer=null;
    button.addEventListener('pointerdown',event=>{
      handledPointer=null;
      if(event.pointerType==='touch'&&!button.disabled)press={id:event.pointerId,x:event.clientX,y:event.clientY};
    });
    button.addEventListener('pointerup',event=>{
      if(!press||press.id!==event.pointerId)return;
      const start=press;press=null;
      if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>12||button.disabled)return;
      event.preventDefault();handledPointer=event.pointerId;button.click();
    });
    button.addEventListener('pointercancel',()=>{press=null;});
    button.addEventListener('click',event=>{
      if(event.isTrusted&&event.pointerId===handledPointer){event.preventDefault();event.stopImmediatePropagation();}
    },true);
  });
  ui.placementCancel.onclick=()=>{globalThis.towerFrontierGame.build.cancel();globalThis.towerFrontierGame.updateUi();};
  const originalBuildAnchor=document.getElementById('td-cancel-build');
  const supportBuildings=new Set(['iceward','frost','crypt','grove','graveyard','moonwell','plague']);
  ui.buildButtons.forEach(button=>{button.dataset.buildCategory=((button.dataset.buildKind==='unit'?ns.config.units:ns.config.buildings)[button.dataset.buildType]||{}).supportOnly||supportBuildings.has(button.dataset.buildType)?'support':button.dataset.buildKind==='unit'?'unit':'tower';});
  function syncBuildSurface(){const drawer=layout.resolved()==='desktop'||document.body.dataset.combatOrientation==='landscape',target=drawer?ui.buildDrawerGrid:ui.commandGrid;if(ui.buildButtons[0].parentElement!==target){ui.buildButtons.forEach(button=>{if(drawer)target.appendChild(button);else target.insertBefore(button,originalBuildAnchor);});globalThis.towerFrontierGame.showCommands('orders');}if(!drawer)ui.buildDrawer.hidden=true;}
  syncBuildSurface();
  // Presentation only: reuse the same command buttons and gameplay handlers.
  const selectionDetails=ui.selectionDetails;
  const cameraDetails=document.getElementById('td-camera-controls');
  ui.selectionShortcut.addEventListener('click',()=>{selectionDetails.open=!selectionDetails.open;if(selectionDetails.open){cameraDetails.open=false;ui.scorePanel.hidden=true;ui.scoreShortcut.setAttribute('aria-expanded','false');}});
  ui.scoreShortcut.addEventListener('click',()=>{const opening=ui.scorePanel.hidden;ui.scorePanel.hidden=!opening;ui.scoreShortcut.setAttribute('aria-expanded',String(opening));if(opening){selectionDetails.open=false;cameraDetails.open=false;globalThis.towerFrontierGame.updateScoreUi();}});
  ui.scoreClose.addEventListener('click',()=>{ui.scorePanel.hidden=true;ui.scoreShortcut.setAttribute('aria-expanded','false');ui.scoreShortcut.focus();});
  ui.armoryShortcut.addEventListener('click',()=>{selectionDetails.open=false;ui.scorePanel.hidden=true;ui.scoreShortcut.setAttribute('aria-expanded','false');globalThis.towerFrontierGame.openArmory();});
  function syncEdgePresentation(){
    document.body.classList.toggle('edge-combat',layout.resolved()==='desktop'||document.body.dataset.combatOrientation==='landscape');
  }
  syncEdgePresentation();
  if(ns.systems.BattlefieldCamera){
    const game=globalThis.towerFrontierGame;
    game.camera=new ns.systems.BattlefieldCamera(ns.config.width,ns.config.height);
    game.camera.attach(game,{inspect:document.getElementById('td-camera-inspect'),home:document.getElementById('td-camera-home'),follow:document.getElementById('td-camera-follow'),all:document.getElementById('td-camera-all'),plus:document.getElementById('td-camera-in'),minus:document.getElementById('td-camera-out'),status:document.getElementById('td-camera-status')});
    if(ui.cameraClose)ui.cameraClose.onclick=()=>{cameraDetails.open=false;game.camera.inspect=false;game.camera.follow=false;game.dragHero=false;if(game.camera.sync)game.camera.sync();};
  }
  if(ns.systems.MiniMapView){const game=globalThis.towerFrontierGame;game.minimap=new ns.systems.MiniMapView(document.getElementById('td-minimap'));game.minimap.attach(game);}
  const game=globalThis.towerFrontierGame;
  game.joystick=new ns.systems.HeroJoystick(game,document.getElementById('td-hero-joystick'));
  globalThis.addEventListener('resize',syncEdgePresentation);
  layoutMode.addEventListener('change',syncEdgePresentation);
  ui.menuLayout.addEventListener('change',()=>queueMicrotask(syncEdgePresentation));
  ui.commandTabs.forEach(button=>button.addEventListener('click',()=>{
    document.body.dataset.edgeOrders='false';
    if(selectionDetails)selectionDetails.open=false;
  }));
  if(selectionDetails)selectionDetails.addEventListener('toggle',()=>{ui.selectionShortcut.setAttribute('aria-expanded',String(selectionDetails.open));if(selectionDetails.open)document.body.dataset.edgeOrders='false';});
  cameraDetails.addEventListener('toggle',()=>{if(cameraDetails.open){selectionDetails.open=false;ui.scorePanel.hidden=true;ui.scoreShortcut.setAttribute('aria-expanded','false');}});
  globalThis.addEventListener('keydown',event=>{if(event.key==='Escape'){document.body.dataset.edgeOrders='false';if(selectionDetails)selectionDetails.open=false;ui.scorePanel.hidden=true;ui.scoreShortcut.setAttribute('aria-expanded','false');document.querySelectorAll('.wave-intel, #td-camera-controls').forEach(details=>{details.open=false;});}});
  layoutMode.addEventListener('change',syncBuildSurface);
  globalThis.addEventListener('resize',syncBuildSurface);
  ui.menuLayout.value=layout.choice;
  ui.menuLayout.addEventListener('change',function(){layout.select(ui.menuLayout.value);layoutMode.value=layout.choice;syncBuildSurface();});
  layoutMode.addEventListener('change',function(){ui.menuLayout.value=layout.choice;});
  if(ns.maps){ui.mapChoice=document.getElementById('td-map-choice');ui.mapNote=document.getElementById('td-map-note');ui.mapChoice.addEventListener('change',()=>globalThis.towerFrontierGame.chooseMap(ui.mapChoice.value));ui.mapButtons.forEach(button=>button.addEventListener('click',()=>globalThis.towerFrontierGame.chooseMap(button.dataset.mapId)));globalThis.towerFrontierGame.chooseMap(ui.mapChoice.value);}
})(globalThis.TowerFrontier);
