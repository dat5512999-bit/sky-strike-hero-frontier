(function(ns){
  'use strict';
  const game=globalThis.towerFrontierGame;
  if(!game||!ns.systems.TutorialSystem)return;
  game.tutorial=new ns.systems.TutorialSystem(game);
  const reset=game.reset.bind(game),confirmPlacement=game.confirmPlacement.bind(game),startWave=game.startWave.bind(game),onKill=game.onKill.bind(game),draw=game.draw.bind(game),updateUi=game.updateUi.bind(game),onWaveStart=game.waves.onStart,acknowledgeReward=game.waves.acknowledgeReward.bind(game.waves),claimLoot=game.claimLoot.bind(game),upgrade=game.build.upgrade.bind(game.build),sell=game.build.sell.bind(game.build),stagePlacement=game.build.stagePlacement.bind(game.build),queueDeploy=game.queueDeploy.bind(game),openShop=game.openShop.bind(game),closeShop=game.closeShop.bind(game),castHeroSkill=game.castHeroSkill.bind(game),openEquipmentPicker=game.openEquipmentPicker?.bind(game),closeEquipmentPicker=game.closeEquipmentPicker?.bind(game);
  const safely=(label,action)=>{try{return action();}catch(error){console.error('新手引導 '+label+' 已關閉',error);game.tutorial.deactivate();game.flash('新手提示已關閉，戰鬥可繼續進行','#ffb578');return false;}};
  const bindShopPurchase=()=>{const shop=game.shop;if(!shop||shop.tutorialPurchaseBound)return;const buy=shop.buy.bind(shop);shop.buy=function(id,economy){const result=buy(id,economy);if(result.ok)safely('商城提示',()=>game.tutorial.onShopPurchase(id));return result;};shop.tutorialPurchaseBound=true;};
  const bindArmoryEquip=()=>{const armory=game.armory;if(!armory||armory.tutorialEquipBound)return;const equip=armory.equip.bind(armory);armory.equip=function(id,target){const result=equip(id,target);if(result.ok)safely('裝備提示',()=>game.tutorial.onEquipmentEquipped(id,target));return result;};armory.tutorialEquipBound=true;};
  game.reset=function(){this.tutorial.deactivate();const result=reset();bindShopPurchase();bindArmoryEquip();return result;};
  bindShopPurchase();bindArmoryEquip();
  game.build.stagePlacement=function(x,y){const pending=this.pending,point=game.tutorial?.mission?.tutorial?.recommendedPositions?.[0],nearTutorialSite=game.tutorial?.active&&game.tutorial.step==='deploy'&&pending?.kind==='unit'&&pending.type==='hunter'&&point&&Math.hypot(x-point.x,y-point.y)<=64;if(nearTutorialSite)return stagePlacement(point.x,point.y);return stagePlacement(x,y);};
  game.confirmPlacement=function(){const result=confirmPlacement();if(result)safely('部署提示',()=>this.tutorial.onDeploy());return result;};
  game.queueDeploy=function(type,kind){const result=queueDeploy(type,kind);if(result)safely('選擇守軍提示',()=>this.tutorial.onDeployQueued(type,kind));return result;};
  game.openShop=function(){const wasClosed=this.ui.shopScreen.hidden,result=openShop();if(wasClosed&&!this.ui.shopScreen.hidden)safely('開啟商城提示',()=>this.tutorial.onShopOpened());return result;};
  game.closeShop=function(){const result=closeShop();if(this.tutorial.active&&this.tutorial.step==='shopBuy')this.tutorial.show('shop');return result;};
  game.startWave=function(){if(!this.tutorial.requestStart())return false;return startWave();};
  game.build.upgrade=function(economy){const result=upgrade(economy);if(result)safely('升級提示',()=>game.tutorial.onUpgrade());return result;};
  game.build.sell=function(economy){if(game.tutorial.active&&game.tutorial.lockRecycle){game.flash('新手引導中，先完成升級說明或按「暫不升級」再回收','#ffb578');return false;}return sell(economy);};
  game.castHeroSkill=function(id){const before=this.hero?.skillCooldowns?.summon||0,result=castHeroSkill(id),after=this.hero?.skillCooldowns?.summon||0;if(id==='summon'&&after>before)safely('英雄技能提示',()=>this.tutorial.onHeroSkill());return result;};
  game.onKill=function(monster,source){const wasHandled=monster&&monster.rewardHandled;const result=onKill(monster,source);if(!wasHandled&&monster&&monster.rewardHandled)safely('首擊提示',()=>this.tutorial.onFirstKill());return result;};
  game.waves.onStart=function(wave,definition){onWaveStart?.(wave,definition);safely('開波提示',()=>game.tutorial.onWaveStart(wave));};
  game.waves.acknowledgeReward=function(){const clearedWave=this.wave,result=acknowledgeReward();if(result)safely('波次提示',()=>game.tutorial.onWaveClear(clearedWave));return result;};
  game.claimLoot=function(id){const result=claimLoot(id);if(result)safely('掉落提示',()=>this.tutorial.onLootClaim(id));return result;};
  if(openEquipmentPicker)game.openEquipmentPicker=function(target){const result=openEquipmentPicker(target);if(result)safely('開啟裝備提示',()=>this.tutorial.onEquipmentPickerOpened());return result;};
  if(closeEquipmentPicker)game.closeEquipmentPicker=function(){const result=closeEquipmentPicker();if(this.tutorial.active&&this.tutorial.step==='equipPick')this.tutorial.show('equip');return result;};
  game.updateUi=function(){const result=updateUi();if(this.tutorial.active){safely('選取守軍提示',()=>this.tutorial.onUnitSelected(this.build.selected));if(this.tutorial.lockRecycle&&this.ui.sell){this.ui.sell.disabled=true;this.ui.sell.title='新手引導中暫時鎖住回收';}}return result;};
  game.draw=function(){const result=draw();safely('畫面提示',()=>this.tutorial.drawScreen(this.ctx));return result;};
  if(game.waveHUD){const waveUpdate=game.waveHUD.update.bind(game.waveHUD);game.waveHUD.update=function(now){waveUpdate(now);if(game.tutorial.active&&game.waves.preparationHeld)game.ui.waveStatus.textContent='等待你的指揮';};}

  const App=ns.systems.FrontierApp;
  if(!App)return;
  const launchStory=App.prototype.launchStory,render=App.prototype.render,act=App.prototype.act;
  App.prototype.launchStory=function(selected,options){const mission=selected||ns.systems.StoryCatalog.mission,result=launchStory.call(this,mission);if(result)this.game.tutorial.activate(mission,this.store.adapter('story'),{replay:Boolean(options&&options.replayTutorial)});return result;};
  App.prototype.render=function(){render.call(this);if(this.page!=='story'||this.selectedStoryMission&&this.selectedStoryMission!==ns.systems.TutorialSystem.MISSION_ID)return;const action=this.root.querySelector('.mission-actions');if(!action||action.querySelector('[data-action="story-tutorial"]'))return;const button=document.createElement('button');button.type='button';button.dataset.action='story-tutorial';button.className='blue bevel';button.textContent='重玩新手引導';action.append(button);};
  App.prototype.act=function(action,value){if(action==='story-tutorial')return this.launchStory(ns.systems.StoryCatalog.mission,{replayTutorial:true});return act.call(this,action,value);};
})(globalThis.TowerFrontier);
