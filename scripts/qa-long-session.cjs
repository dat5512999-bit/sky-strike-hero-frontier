'use strict';
// Deterministic, headless release probe. It exercises the shipped wave,
// economy, placement, movement, combat and frame-timing rules. It deliberately
// does not claim to measure Canvas/GPU, hero input, loot choices or player skill.
const {performance}=require('node:perf_hooks'),fs=require('node:fs'),path=require('node:path');
const {load,game,tick}=require('../tests/helpers/td-runtime.cjs');
const {ns}=load();
const positions=[];
for(let y=100;y<=610;y+=38)for(let x=85;x<=640;x+=38){
  const d=Math.min(...ns.config.path.slice(1).map((b,i)=>{
    const a=ns.config.path[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(x-a.x-dx*t,y-a.y-dy*t);
  }));
  if(d>=65&&d<=120)positions.push({x,y,d,rank:Math.abs(x-340)+Math.abs(y-340)});
}
positions.sort((a,b)=>a.rank-b.rank);
function timing(fps,speed,guarded=false){
  const clock=new ns.systems.FrameTimingSystem(0),guard=new ns.systems.SpeedLoadGuard(),interval=1000/fps;let steps=0,backlog=0,protectedFrames=0;
  for(let i=1;i<=fps*60*30;i++){
    const actual=guarded?guard.speed(speed):speed,plan=clock.next(i*interval,actual);steps+=plan.steps;backlog=Math.max(backlog,plan.backlogMs);if(actual!==speed)protectedFrames++;if(guarded)guard.observe(plan,speed,true);
  }
  return {fps,speed,guarded,frames:fps*60*30,steps,protectedFrames,maxBacklogMs:+backlog.toFixed(2),discardedMs:+(clock.discarded*1000).toFixed(2)};
}
function simulate(faction,difficulty,policy){
  const g=game(ns),waves=new ns.systems.WaveSystem(),mode=ns.systems.TDDifficultySystem.MODES[difficulty];
  g.waves=waves;waves.setModifiers({...mode});g.economy.setRewardRate(mode.reward);g.baseHealth=mode.baseHealth;g.hero.x=340;g.hero.y=300;g.loot=null;
  const roster=ns.systems.FactionSystem.FACTIONS[faction].units.filter(id=>!ns.config.units[id].enemyOnly&&!ns.config.units[id].ultimate);
  const picks=policy==='cheap'?roster.slice(0,2):policy==='area'?roster.filter(id=>ns.config.units[id].splash||ns.config.units[id].chain).concat(roster.slice(0,2)):roster;
  const usable=picks.length?picks:roster;let maxMonsters=0,steps=0,totalLeaks=0,lastWave=0,timeout=false;
  function buy(wave){
    const choices=usable.map(id=>({id,cfg:ns.config.units[id]})).filter(o=>o.cfg.cost<=g.economy.gold&&o.cfg.wood<=g.economy.lumber);
    if(!choices.length||g.build.items.length>=26)return false;
    const desired=choices[(wave-1)%choices.length];
    for(const p of positions){if(!g.build.canPlaceAt(p.x,p.y,'unit'))continue;g.build.queue(desired.id,'unit');if(g.build.placeQueued(p.x,p.y,g.economy))return true;g.build.cancel();}
    return false;
  }
  for(let n=0;n<3;n++)if(!buy(n+1))break;
  const began=performance.now();
  for(let wave=1;wave<=30&&g.baseHealth>0;wave++){
    if(wave>1)for(let n=0;n<2;n++)if(!buy(wave+n))break;
    waves.start();lastWave=wave;let cleared=false;
    for(let i=0;i<4000;i++){
      const event=waves.update(.1,g.monsters);
      if(event){g.economy.completeWave(event.reward);waves.acknowledgeReward();cleared=true;break;}
      const active=g.monsters.filter(m=>m.active).sort((a,b)=>b.routeDistance-a.routeDistance);let ahead=null;
      for(const m of active){const cap=ahead?Math.max(0,ahead.routeDistance-m.routeDistance-ns.entities.Monster.minimumHeadway(ahead,m)):Infinity;m.update(.1,null,null,cap);if(m.leaked){g.baseHealth=Math.max(0,g.baseHealth-m.baseDamage);totalLeaks++;}if(m.active)ahead=m;}
      g.hero.update(.1,g.monsters,g.projectiles);tick(g,.1);g.monsters=g.monsters.filter(m=>m.active);maxMonsters=Math.max(maxMonsters,g.monsters.length);steps++;
      if(g.baseHealth<=0)break;
    }
    if(!cleared&&g.baseHealth>0){timeout=true;break;}
  }
  return {faction,difficulty,policy,lastWave,completed:lastWave===30&&g.baseHealth>0&&!timeout,baseHealth:g.baseHealth,leaks:totalLeaks,gold:g.economy.gold,lumber:g.economy.lumber,army:g.build.items.length,maxMonsters,simulatedSeconds:+(steps*.1).toFixed(1),cpuMs:+(performance.now()-began).toFixed(1),timeout};
}
const frameTiming=[60,30,20,15,10].flatMap(fps=>[timing(fps,1),timing(fps,3),timing(fps,3,true)]);
const runs=[];
for(const faction of ['hunter','arcanist','rogue','wild','frostland','goblin'])for(const policy of ['cheap','mixed','area'])runs.push(simulate(faction,'standard',policy));
const result={scope:'Headless stress probe: 30-wave roster, economy, placement, movement and autonomous allied fire. Omits enemy trait/combat abilities, hero damage/skills, loot choices, shop, graphics and real device.',frameTiming,runs};
const output=path.resolve(__dirname,'../artifacts/qa-long-session/results.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
