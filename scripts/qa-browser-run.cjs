'use strict';
// Optional high-fidelity browser pipeline probe. Requires Playwright + Edge.
// An invulnerable gate ensures every wave's real TDGame update path is reached;
// the result is not a balance win or a real-time frame-rate measurement.
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const normal=process.argv.includes('--normal');
  const strategy=(process.argv.find(arg=>arg.startsWith('--strategy='))||'--strategy=baseline').split('=')[1];
  assert.ok(['baseline','upgrade','mercenary','mixed'].includes(strategy),'unknown strategy');
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../td.html')).href);await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready);
  const result=await page.evaluate(({normalGate,strategy})=>{
    const g=towerFrontierGame,ns=TowerFrontier;g.app=null;g.chooseProfession('hunter','hunter');g.paused=false;if(!normalGate)g.maxBaseHealth=g.baseHealth=10000;
    const points=[];for(let y=95;y<ns.config.height-50;y+=38)for(let x=80;x<ns.config.width-50;x+=38)if(g.build.canPlaceAt(x,y,'unit'))points.push({x,y,rank:Math.abs(x-340)+Math.abs(y-330)});points.sort((a,b)=>a.rank-b.rank);
    const actions=[],waves=[];
    function place(type,mercenary){for(const p of points){if(!g.build.canPlaceAt(p.x,p.y,'unit'))continue;if(mercenary)g.build.queueMercenary(type,'unit');else g.build.queue(type,'unit');if(g.build.placeQueued(p.x,p.y,g.economy)){actions.push({wave:g.waves.wave,type,mercenary,gold:g.economy.gold,lumber:g.economy.lumber});return true;}g.build.cancel();}return false;}
    function buy(wave,supplemental=false){if(g.build.items.length>=26)return false;const types=['hunter','musketeer','kingdomMage'];if(!supplemental)for(let j=0;j<types.length;j++){const type=types[(wave+j)%types.length],cfg=ns.config.units[type];if(g.economy.gold<cfg.cost||g.economy.lumber<cfg.wood)continue;if(place(type,false))return true;}
      if(strategy==='upgrade'||strategy==='mixed'){for(const unit of g.build.combatUnits()){const cost=g.build.upgradeCost(unit);if(!cost||!g.economy.canAfford(cost))continue;g.build.selected=unit;if(g.build.upgrade(g.economy)){actions.push({wave:g.waves.wave,upgrade:unit.type,level:unit.level,gold:g.economy.gold,lumber:g.economy.lumber});return true;}}}
      if(strategy==='mercenary'||strategy==='mixed'){for(const type of ['arcanist','rogue']){const price=Math.ceil(ns.config.units[type].cost*1.5);if(g.factions.canHire(type,'unit')&&g.economy.gold>=price&&place(type,true))return true;}}
      return false;}
    for(let n=0;n<3;n++)buy(n);g.waves.start();let steps=0,maxMonsters=0,lastWave=0;
    for(;steps<120000&&g.status==='playing';steps++){
      if(g.waves.canStart()&&!g.waves.active){buy(g.waves.wave+1);if(strategy!=='baseline')buy(g.waves.wave+1,true);g.waves.start();}
      g.update(.1,false);maxMonsters=Math.max(maxMonsters,g.monsters.length);if(g.waves.wave!==lastWave){g.updateUi();waves.push({wave:g.waves.wave,baseHealth:g.baseHealth,gold:g.economy.gold,lumber:g.economy.lumber,army:g.build.items.length,activeArmy:g.build.combatUnits().length,resourceHint:g.ui.help.textContent.includes('木材用完')});}lastWave=g.waves.wave;
    }
    return {steps,lastWave,status:g.status,paused:g.paused,profession:g.profession.selected,wavePhase:g.waves.phase,recordedWaves:g.report.waves.length,maxMonsters,baseHealth:g.baseHealth,army:g.build.items.length,gold:g.economy.gold,lumber:g.economy.lumber,actions,waves};
  },{normalGate:normal,strategy});
  result.normalGate=normal;result.strategy=strategy;result.errors=errors;const output=path.resolve(__dirname,'../artifacts/qa-long-session/'+(normal?'browser-run-normal-'+strategy+'.json':'browser-run.json'));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
  assert.deepEqual(errors,[]);assert.ok(result.lastWave>0&&result.maxMonsters>0);
  if(!normal){assert.equal(result.status,'victory');assert.equal(result.recordedWaves,30);}
  console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
