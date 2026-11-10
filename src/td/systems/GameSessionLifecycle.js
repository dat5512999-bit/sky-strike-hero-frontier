(function(ns){
  'use strict';
  class GameSessionLifecycle{
    constructor(game){
      this.game=game;this.listeners=[];this.suspension=null;let storage=null;try{storage=globalThis.localStorage;}catch(_){}
      const ua=globalThis.navigator?.userAgent||'',ios=/iPhone|iPad|iPod/.test(ua),version=/OS ([\d_]+)/.exec(ua)?.[1]?.replace(/_/g,'.')||'';
      this.diagnostics=game.diagnostics=new ns.systems.GameDiagnostics({storage,version:ns.systems.ProfileStore?.VERSION,snapshot:()=>ns.systems.GameDiagnostics.snapshot(game),environment:{platform:ios?'ios':/Android/.test(ua)?'android':'desktop',osVersion:version,browser:/Edg/.test(ua)?'edge':/Firefox/.test(ua)?'firefox':/Chrome|CriOS/.test(ua)?'chrome':/Safari/.test(ua)?'safari':'unknown',standalone:Boolean(globalThis.navigator?.standalone||globalThis.matchMedia?.('(display-mode: standalone)').matches),width:globalThis.innerWidth,height:globalThis.innerHeight,dpr:globalThis.devicePixelRatio}});
      if(game.art)game.art.game=game;
      this.listen(document,'visibilitychange',()=>document.hidden?this.hide():this.show());
      this.listen(globalThis,'pagehide',()=>{this.hide();this.diagnostics.record('pagehide');this.diagnostics.close();});
      this.listen(globalThis,'pageshow',event=>{if(event.persisted){this.diagnostics.reopen();this.show();}});
      this.listen(globalThis,'error',event=>{if(event.error){this.diagnostics.record('uncaught-error',{},event.error);this.diagnostics.flush(true);}});
      this.listen(globalThis,'unhandledrejection',event=>{this.diagnostics.record('unhandled-rejection',{},event.reason instanceof Error?event.reason:{name:'Error'});this.diagnostics.flush(true);});
      this.listen(globalThis,'orientationchange',()=>{this.releaseInput();this.diagnostics.record('rotation');});
      this.listen(document,'click',event=>this.action(event),true);
      this.listen(document,'keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey||event.target?.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName||''))return;const key=event.key?.toLowerCase();if(['q','w','e','f'].includes(key)&&game.profession?.selected)this.diagnostics.record('action',{action:'skill-attempt',item:key});},true);
      this.listen(game.canvas,'contextlost',()=>{this.diagnostics.record('canvas-lost');game.handleRuntimeFault('render',new Error('Canvas context lost'));});
      this.listen(game.canvas,'contextrestored',()=>this.diagnostics.record('canvas-restored'));
      this.mount();if(this.diagnostics.interrupted)this.notice();
    }
    listen(target,type,handler,capture=false){if(!target?.addEventListener)return;const safe=event=>{try{handler(event);}catch(_){}};target.addEventListener(type,safe,capture);this.listeners.push(()=>target.removeEventListener(type,safe,capture));}
    action(event){
      const button=event.target?.closest?.('button');if(!button||button.disabled||button.dataset.diagnosticAction)return;
      const d=button.dataset,ids={'td-skill-button':'q','td-thunder':'w','td-summon':'e','td-ultimate':'f','td-pause':'pause','td-wave-button':'wave','td-start-expedition':'start','td-shop-open':'battle-shop','td-armory-open':'armory','td-upgrade':'upgrade','td-sell':'sell','td-menu-open':'menu','td-menu-continue':'continue'};
      let action=ids[button.id],item='';
      if(d.buildType){action='deploy-attempt';item=d.buildType;}else if(d.profession){action='select-hero';item=d.profession;}else if(d.faction){action='select-faction';item=d.faction;}else if(d.mapId){action='select-map';item=d.mapId;}else if(d.shopItem){action='purchase-attempt';item=d.shopItem;}else if(d.shopAction){action='cosmetic-'+d.shopAction;item=d.value;}else if(['home','free','story','shop','settings','codex'].includes(d.action))action='open-'+d.action;
      if(action)this.diagnostics.record('action',{action,item});
    }
    releaseInput(){
      const g=this.game;g.joystick?.reset();g.dragHero=false;g.heroDragPointer=null;
      if(g.camera){g.camera.space=false;g.camera.touches?.clear();g.camera.gesture=null;g.camera.pinchDistance=0;}
    }
    syncPause(){const g=this.game;if(g.ui?.pause){g.ui.pause.textContent=g.paused?'▶':'Ⅱ';g.ui.pause.setAttribute('aria-label',g.paused?'繼續遊戲':'暫停遊戲');}}
    hide(){
      const g=this.game;if(!this.suspension&&g.status==='playing'&&g.profession?.selected&&!g.paused&&!g.runtimeFault){this.suspension={hero:g.hero};g.paused=true;}
      this.releaseInput();g.frameTiming?.clear(globalThis.performance?.now?.()||0);this.syncPause();ns.systems.GameAudio?.stop();
      this.diagnostics.record('hidden');this.diagnostics.flush(true);
    }
    show(){
      const g=this.game;g.frameTiming?.clear(globalThis.performance?.now?.()||0);this.diagnostics.record('visible');this.diagnostics.flush(true);
      if(this.suspension&&g.hero===this.suspension.hero&&g.status==='playing'&&!g.runtimeFault){g.paused=true;this.resumePanel();}else this.suspension=null;
    }
    resumePanel(){
      if(this.resumeRoot){this.resumeRoot.hidden=false;this.resumeRoot.querySelector('button').focus();return;}
      const panel=document.createElement('section');panel.id='td-background-resume';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','td-background-title');
      panel.style.cssText='position:fixed;inset:0;z-index:199999;padding:20px;background:#07100ef2;color:#f5e7c3;overflow:auto;font:16px/1.6 system-ui';
      panel.innerHTML='<div style="max-width:500px;margin:8vh auto;padding:24px;border:1px solid #a89664;border-radius:12px;background:#13211d"><h2 id="td-background-title">遊戲已暫停</h2><p>剛才已切到背景，確認準備好後再繼續戰鬥。</p><button type="button" data-diagnostic-action="resume" style="min-height:44px">繼續戰鬥</button></div>';
      panel.querySelector('button').onclick=()=>{if(document.hidden)return;const g=this.game;panel.hidden=true;if(this.suspension&&g.hero===this.suspension.hero&&!g.runtimeFault)g.paused=false;this.suspension=null;g.frameTiming?.clear(globalThis.performance?.now?.()||0);this.syncPause();this.diagnostics.record('resume');this.diagnostics.flush(true);};
      panel.onkeydown=event=>{if(event.key==='Tab'){event.preventDefault();panel.querySelector('button').focus();}};document.body.append(panel);this.resumeRoot=panel;panel.querySelector('button').focus();
    }
    export(){try{this.game.app.download(this.diagnostics.export(),'hero-frontier-diagnostics.json');this.message='已匯出診斷資訊；不包含完整玩家存檔。';}catch(_){this.message='匯出未完成，請保留此頁面後重試。';}this.refresh();}
    controls(){
      const card=document.createElement('fieldset');card.dataset.gameDiagnostics='true';card.innerHTML='<legend>遊戲診斷</legend><p>僅記錄版本、戰場摘要與最近操作，不包含完整存檔，也不會自動上傳。最多保留最近三次開啟。</p><button type="button" data-diagnostic-action="export" style="min-height:44px">匯出診斷資訊</button> <button type="button" data-diagnostic-action="clear" style="min-height:44px">清除診斷紀錄</button><p data-diagnostic-status role="status"></p>';
      card.querySelector('[data-diagnostic-action="export"]').onclick=()=>this.export();card.querySelector('[data-diagnostic-action="clear"]').onclick=()=>{const ok=this.diagnostics.clear();this.message=ok?'已清除舊診斷；之後會重新記錄。':'目前無法清除儲存內容；本次記憶體紀錄已清空。';this.noticeRoot?.remove();this.refresh();};return card;
    }
    mount(){
      const settings=this.game.ui?.menuSettingsPanel;if(settings&&!settings.querySelector('[data-game-diagnostics]'))settings.append(this.controls());
      if(this.game.app?.page==='settings'){const target=this.game.app.root.querySelector('.settings-grid');if(target&&!target.querySelector('[data-game-diagnostics]'))target.append(this.controls());}
      const recovery=this.game.runtimePanel;if(recovery&&!recovery.querySelector('[data-diagnostic-action]')){const button=document.createElement('button');button.type='button';button.dataset.diagnosticAction='export';button.textContent='匯出診斷資訊';button.style.minHeight='44px';button.onclick=()=>this.export();recovery.querySelector('[data-runtime-backup]').parentElement.append(button);}
      this.refresh();
    }
    refresh(){document.querySelectorAll('[data-diagnostic-status]').forEach(output=>{output.textContent=this.message|| (this.diagnostics.storageStatus==='ready'?'診斷資訊保存在本機。':'診斷目前只能暫存在此頁面，請在關閉前匯出。');});}
    notice(){
      const panel=document.createElement('aside');panel.id='td-diagnostic-restart-notice';panel.setAttribute('role','status');panel.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:199998;padding:12px;background:#13211df5;border:1px solid #a89664;color:#f5e7c3;font:14px/1.5 system-ui';panel.innerHTML='<p>上次遊戲未留下正常離開紀錄，這不一定是當機。可先匯出診斷資訊，協助確認原因。</p><button type="button" data-diagnostic-action="export" style="min-height:44px">匯出診斷資訊</button> <button type="button" data-diagnostic-action="dismiss" style="min-height:44px">關閉提示</button>';panel.querySelector('[data-diagnostic-action="export"]').onclick=()=>this.export();panel.querySelector('[data-diagnostic-action="dismiss"]').onclick=()=>panel.remove();document.body.append(panel);this.noticeRoot=panel;
    }
    dispose(){for(const remove of this.listeners)remove();this.listeners=[];this.resumeRoot?.remove();this.noticeRoot?.remove();}
    reset(){this.suspension=null;if(this.resumeRoot)this.resumeRoot.hidden=true;}
    static attach(game){if(game.sessionLifecycle)return game.sessionLifecycle;return game.sessionLifecycle=new GameSessionLifecycle(game);}
  }
  ns.systems.GameSessionLifecycle=GameSessionLifecycle;
  if(typeof document!=='undefined'&&globalThis.towerFrontierGame){
    const lifecycle=GameSessionLifecycle.attach(globalThis.towerFrontierGame),app=ns.systems.FrontierApp?.prototype;
    if(app){const render=app.render;app.render=function(...args){const result=render.apply(this,args);lifecycle.mount();return result;};}
  }
})(globalThis.TowerFrontier);
