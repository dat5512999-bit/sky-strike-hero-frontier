(function(ns){
  'use strict';
  const A=ns.systems.GameAudio;
  // Audio failure never changes a gameplay return value, promise or exception.
  const safe=fn=>{try{fn();}catch(_){} };
  function after(target,key,callback){const original=target?.[key];if(typeof original!=='function')return;target[key]=function(...args){const result=original.apply(this,args);safe(()=>callback.call(this,result,args));return result;};}
  const legacy=ns.systems.FrostlandAudio;
  if(legacy){
    Object.defineProperty(legacy,'context',{configurable:true,get:()=>A.context,set:value=>{A.stop();A.context=value;A.graphContext=null;}});
    Object.defineProperty(legacy,'voices',{configurable:true,get:()=>A.active.size});
    legacy.unlock=()=>A.unlock();legacy.play=type=>A.legacy(type);
    after(legacy,'setEnabled',function(){if(!this.enabled)A.stop();});
  }
  const hero=ns.entities.Hero.prototype;
  for(const [method,slot] of [['castNova','q'],['castThunder','w'],['castSummon','e'],['castShockwave','e']])after(hero,method,function(ok){if(ok)A.skill(this,slot);});
  after(ns.systems.HeroUltimateSystem,'cast',function(ok,args){if(ok)A.skill(args[0],'f');});
  after(ns.systems.HeroEvolutionSystem,'cast',function(ok,args){if(ok)A.skill(args[0],args[1]);});
  after(hero,'takeDamage',function(damage){if(damage>0)A.event(this.active?'hurt':'down');});
  for(const [method,event] of [['placeQueued','build'],['upgrade','upgrade'],['sell','sell']])after(ns.systems.BuildSystem.prototype,method,ok=>A.event(ok?event:'error'));
  after(ns.entities.Building.prototype,'chooseBranch',ok=>A.event(ok?'upgrade':'error'));
  after(ns.systems.TowerSkillSystem,'fire',function(_,args){if(args[1]?.[0])A.projectile({owner:args[0],target:args[1][0]});});
  after(ns.systems.EnemyCombatSystem.prototype,'strike',function(ok,args){if(ok){const monster=args[0],family=monster.combatRole==='boss'?'stone':'blade';A.play({key:'enemy:'+monster.type,priority:1,gap:.3,layers:ns.systems.AudioCatalog.families[family]});}});
  after(ns.systems.EnemyCombatSystem.prototype,'phase',function(_,args){const monster=args[0];if(monster.bossPhase>1&&monster.bossPhase!==monster.audioPhase){monster.audioPhase=monster.bossPhase;A.event('boss');}});
  after(ns.systems.TowerVFX,'signal',function(_,args){if(args[0])A.play(ns.systems.AudioCatalog.support(args[0]));});
  for(const method of ['buy','exchange'])after(ns.systems.ShopSystem.prototype,method,result=>A.event(result?.ok?'purchase':'error'));
  for(const method of ['buy','equip','unequip'])after(globalThis.FrontierShop?.SkinStore?.prototype,method,result=>{if(result?.then)result.then(()=>safe(()=>A.event('purchase')),()=>safe(()=>A.event('error')));});
  after(ns.systems.EconomySystem.prototype,'completeWave',()=>A.event('clear'));
  const game=ns.TDGame.prototype;
  after(game,'onWaveStart',function(_,args){const groups=this.waves?.definition?.(args[0])?.groups||[],boss=groups.some(g=>g.type==='boss'||ns.entities.Monster.TYPES[g.type]?.combatRole==='boss');A.event(boss?'boss':'wave');});
  after(game,'end',function(_,args){A.stop();A.event(args[0]?'victory':'defeat');});
  after(game,'reset',()=>A.stop());
  after(game,'claimLoot',ok=>{if(ok)A.event('loot');});
  after(game,'equipArmory',ok=>A.event(ok?'upgrade':'error'));
  after(game,'onKill',()=>A.event('death'));
  // Check lifecycle at UI cadence, not per projectile or draw call.
  after(game,'updateUi',function(){const before=this.audioBaseHealth;if(Number.isFinite(before)&&this.baseHealth<before)A.event('leak');this.audioBaseHealth=this.baseHealth;A.sync(this);});
  after(ns.systems.FrontierApp?.prototype,'show',()=>A.stop());
  if(typeof document==='undefined')return;
  A.load();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)A.stop();else A.sync(globalThis.towerFrontierGame);});
  globalThis.addEventListener('pagehide',()=>A.stop());
  document.addEventListener('click',event=>{const button=event.target.closest?.('button');if(button&&!button.disabled&&!button.closest('[inert]')&&!button.id.startsWith('td-audio-'))A.event('click');});
  const panel=document.getElementById('td-menu-settings-panel');
  if(panel){
    const field=document.createElement('fieldset');field.className='td-access-controls';field.innerHTML='<legend>音效混音</legend><label>音效音量 <input id="td-audio-volume" type="range" min="0" max="100" step="5" aria-label="音效音量"></label><label><input id="td-audio-ambient" type="checkbox"> 戰場環境聲</label><label>環境音量 <input id="td-audio-ambient-volume" type="range" min="0" max="100" step="5" aria-label="環境音量"></label><button id="td-audio-test" type="button">試聽音效</button><small>靜音會立即停止音效；劇情配樂仍由劇情頁的音樂開關控制。</small>';
    panel.insertBefore(field,document.getElementById('td-performance-toggle'));
    const volume=field.querySelector('#td-audio-volume'),ambient=field.querySelector('#td-audio-ambient'),ambientVolume=field.querySelector('#td-audio-ambient-volume');
    volume.value=Math.round(A.volume*100);ambient.checked=A.ambientEnabled;ambientVolume.value=Math.round(A.ambientVolume*100);
    volume.oninput=()=>{A.setVolume(volume.value/100);A.sync(globalThis.towerFrontierGame);};
    ambient.onchange=()=>{A.ambientEnabled=ambient.checked;A.save();A.sync(globalThis.towerFrontierGame);};
    ambientVolume.oninput=()=>{A.ambientVolume=Number(ambientVolume.value)/100;A.save();A.sync(globalThis.towerFrontierGame);};
    field.querySelector('#td-audio-test').onclick=()=>{legacy.setEnabled(true);A.unlock();Promise.resolve(A.context?.resume()).then(()=>A.event('upgrade')).catch(()=>{});const toggle=document.getElementById('td-frost-audio');if(toggle){toggle.textContent='戰鬥音效：開';toggle.setAttribute('aria-pressed','true');}};
  }
})(globalThis.TowerFrontier);
