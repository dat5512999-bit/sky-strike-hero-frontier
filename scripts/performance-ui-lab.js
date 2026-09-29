'use strict';
let busy=false;
const testOrigin=()=>{if(location.hostname!=='127.0.0.1'||location.port!=='4174')throw Error('僅允許獨立測試 origin http://127.0.0.1:4174');};
document.getElementById('run').onclick=async()=>{
 if(busy)return;busy=true;
 const output=document.getElementById('result');output.textContent='執行中';
 try{
  testOrigin();
  const w=document.querySelector('iframe').contentWindow,g=w.towerFrontierGame,ns=w.TowerFrontier;
  if(!g?.app)throw Error('遊戲尚未載入');
  const data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)});
  store.switchTo('admin');g.app.store=store;g.app.bindStorage('free');g.app.openFree();
  g.chooseProfession('dwarf','dwarf');g.paused=true;
  const original=store.current.bind(store);let reads=0;store.current=()=>{reads++;return original();};
  const results=[];
  for(const bytes of [0,256*1024,1024*1024]){
   store.state.profiles.admin.data['synthetic-performance-payload']='x'.repeat(bytes);
   const samples=[];reads=0;
   for(let i=0;i<20;i++){
    const start=performance.now();g.updateUi();samples.push(performance.now()-start);
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   samples.sort((a,b)=>a-b);results.push({payloadBytes:bytes,hudCalls:20,profileClones:reads,medianMs:samples[10],p95Ms:samples[18],maxMs:samples[19]});
  }
  output.textContent=JSON.stringify({version:ns.systems.ProfileStore.VERSION,buildCards:g.ui.buildButtons.length,mercenaryCards:g.ui.mercenaries.length,results},null,2);
 }catch(error){output.textContent=error.stack;}finally{busy=false;}
};
document.getElementById('battle').onclick=async()=>{
 if(busy)return;busy=true;
 const output=document.getElementById('battle-result'),results=[];
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 let g;
 try{
  testOrigin();
  const w=document.querySelector('iframe').contentWindow,ns=w.TowerFrontier;g=w.towerFrontierGame;
  const data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)});
  store.switchTo('admin');g.app.store=store;g.app.bindStorage('free');g.app.openFree();
  const cases=[['dwarf','dwarf',1],['dwarf','dwarf',2],['dwarf','dwarf',3],['hunter','hunter',2],['arcanist','arcanist',2],['rogue','rogue',2],['chief','wild',2],['goblin','goblin',2],['frostland','frostland',2],['naga','naga',2],['dragonkin','dragonkin',2],['egypt','dwarf',2]];
  for(const [hero,faction,speed] of cases){
   output.textContent=JSON.stringify({running:{hero,faction,speed},results},null,2);
   g.reset();g.chooseMap('tidegateoutfall');g.chooseProfession(hero,faction);
   const deadline=performance.now()+20000;
   while(!g.profession.selected||!g.art.coreStatus(hero).ready){if(performance.now()>deadline)throw Error('美術載入逾時');await delay(100);}
   g.waves.holdPreparation(true);g.setGameSpeed(speed);
   store.state.profiles.admin.data['synthetic-performance-payload']='x'.repeat(1024*1024);
   g.monsters=Array.from({length:11},(_,i)=>{const m=new ns.entities.Monster('grunt',1,g.path.points);m.setRouteDistance(180+i*45);m.health=m.maxHealth=100000;return m;});
   const center=g.monsters[5];g.hero.x=center.x;g.hero.y=center.y;g.hero.health=g.hero.maxHealth=100000;
   g.build.items.push(new ns.entities.CombatUnit(ns.systems.FactionSystem.FACTIONS[faction].units[0],center.x+50,center.y+50));
   g.paused=false;g.castHeroSkill('thunder');g.frameTiming.clear(w.performance.now());
   if(!g.performanceMonitor.enabled)g.performanceMonitor.toggle();
   await delay(1000);g.performanceMonitor.samples=[];
   await delay(3000);g.paused=true;
   const samples=g.performanceMonitor.samples.slice(),p95=key=>{const v=samples.map(s=>s[key]||0).sort((a,b)=>a-b);return +(v[Math.floor((v.length-1)*.95)]||0).toFixed(2);};
   results.push({hero,faction,speed,frames:samples.length,monsters:g.monsters.length,fps:+(1000/(samples.reduce((sum,s)=>sum+s.realMs,0)/samples.length)).toFixed(1),frameP95:p95('realMs'),updateP95:p95('updateMs'),uiP95:p95('uiMs'),simulationP95:p95('simulationMs'),drawP95:p95('drawMs')});
  }
  output.textContent=JSON.stringify({version:ns.systems.ProfileStore.VERSION,payloadBytes:1048576,results},null,2);
 }catch(error){output.textContent=error.stack+'\n'+JSON.stringify(results,null,2);}finally{if(g)g.paused=true;busy=false;}
};
