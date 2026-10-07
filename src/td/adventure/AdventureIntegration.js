(function(ns){
  'use strict';
  const P=ns.TDGame.prototype,wrap=(prototype,name,handler)=>{const previous=prototype[name];prototype[name]=function(...args){return handler.call(this,previous,args);};};
  function configure(game){
    game.adventure||=new ns.systems.AdventureSystem(game);const app=game.app,profile=app?.store?.state?.profiles?.[app.store.state.active];
    const context=profile?{store:app.store,mode:app.mode,profileId:profile.id,round:profile.round,mission:app.activeStoryMission?.id}:null;
    game.adventure.configure(ns.maps?.definitions?.[ns.config.mapId],context);game.build.adventure=game.adventure;ns.systems.AdventureArt.preload(game.art);
    const waves=game.waves;if(!waves.adventureHooked){const acknowledge=waves.acknowledgeReward;waves.acknowledgeReward=function(){const result=acknowledge.call(this);if(result)game.adventure?.afterWave();return result;};waves.adventureHooked=true;}
  }
  wrap(P,'chooseProfession',function(previous,args){const result=previous.apply(this,args);if(result){configure(this);this.adventureView?.sync();}return result;});
  wrap(P,'reset',function(previous,args){this.adventureView?.close();this.adventure?.reset();return previous.apply(this,args);});
  wrap(P,'onWaveStart',function(previous,args){const result=previous.apply(this,args);this.adventure?.startWave(args[0]);return result;});
  wrap(P,'update',function(previous,args){this.adventure?.update(args[0]);return previous.apply(this,args);});
  wrap(P,'drawTerrain',function(previous,args){const result=previous.apply(this,args);if(this.adventure)ns.systems.AdventureView.draw(this.ctx,this.adventure,this.art,this.adventureView?.selected);return result;});
  wrap(P,'updateUi',function(previous,args){const result=previous.apply(this,args);this.adventureView?.sync();return result;});
  wrap(ns.systems.MapPressureSystem.prototype,'update',function(previous,args){const result=previous.apply(this,args);args[0].adventure?.suppressSmoke();return result;});
  wrap(ns.systems.BuildSystem.prototype,'terrainIssue',function(previous,args){const issue=previous.apply(this,args);if(issue)return issue;return this.adventure?.platformIssue(args[0],args[1])||null;});
  wrap(ns.systems.BuildSystem.prototype,'placementMessage',function(previous,args){const issue=this.placementIssue(...args);return issue==='adventure-platform'?'此平台尚未開放；查看「地圖行動」的退潮／融雪預告':issue==='adventure-object'?'這裡有可操作地標，請在旁邊部署':previous.apply(this,args);});
  // Chapter checkpoints extend schema 1 with an optional value. Old saves load.
  wrap(ns.systems.ChapterCheckpointSystem.prototype,'capture',function(previous,args){const game=args[0];if(!game?.adventure?.definition)return previous.apply(this,args);const storage=this.storage;this.storage=null;let data;try{data=previous.apply(this,args);}finally{this.storage=storage;}if(!data)return null;data.adventure=game.adventure.snapshot();if(!storage)return data;try{storage.setItem(ns.systems.ChapterCheckpointSystem.STORAGE_KEY,JSON.stringify(data));return data;}catch(error){return null;}});
  wrap(ns.systems.ChapterCheckpointSystem.prototype,'restore',function(previous,args){const result=previous.apply(this,args);if(result&&args[0].adventure&&args[1].adventure)args[0].adventure.restore(args[1].adventure);return result;});
  // Wrap the existing atomic save so mission completion and map consequences
  // succeed or fail together; no second storage write or account currency grant.
  wrap(ns.systems.ProfileStore.prototype,'complete',function(previous,args){const adventure=this.adventureCompletion;if(!adventure)return previous.apply(this,args);const change=this.change;this.change=function(edit){return change.call(this,state=>{edit(state);adventure.writeVictory(state);});};try{return previous.apply(this,args);}finally{this.change=change;}});
  wrap(ns.systems.FrontierApp.prototype,'onBattleEnd',function(previous,args){const adventure=this.game?.adventure;if(!args[0]||!adventure?.definition||this.mode!=='story')return previous.apply(this,args);this.store.adventureCompletion=adventure;try{const result=previous.apply(this,args);if(result.saved){adventure.record('本關地圖行動已保存；後續支援會在相鄰關卡生效');}return result;}finally{delete this.store.adventureCompletion;}});
  wrap(P,'end',function(previous,args){this.adventureView?.close();const result=previous.apply(this,args);if(typeof document!=='undefined'&&this.adventure?.definition){const card=document.querySelector('.result-card');if(card){card.querySelector('.adventure-result')?.remove();const summary=document.createElement('p');summary.className='adventure-result';const result=this.adventure.outcome();summary.textContent='地圖行動：'+[result.repaired?'據點已修復':null,result.used?'已使用環境機關':null,result.rescued?'救援成功':this.adventure.states.rescue?'救援未完成':null,result.trade?'交易：'+({support:'支援',supplies:'補給',decline:'拒絕'}[result.trade]):null].filter(Boolean).join('、');card.append(summary);}}return result;});
  if(typeof document!=='undefined'&&globalThis.towerFrontierGame){const game=globalThis.towerFrontierGame;game.adventure=new ns.systems.AdventureSystem(game);game.adventureView=new ns.systems.AdventureView(game);game.adventureView.sync();
    game.canvas.addEventListener('pointerdown',event=>{if(event.button!==0||game.paused||game.status!=='playing'||!game.profession.selected||game.build.pending||game.joystick?.active||game.app&&!game.app.root.hidden)return;const p=game.canvasPoint(event);if(game.camera?.enabled&&!game.camera.contains(p))return;const node=game.adventure.hit(p.x,p.y);if(node){event.preventDefault();event.stopImmediatePropagation();game.dragHero=false;game.adventureView.open(node.id);}},true);
  }
})(globalThis.TowerFrontier);
