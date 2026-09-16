'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
function load(){
  const context=vm.createContext({console,Math:Object.create(Math)});context.globalThis=context;
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(p=>p.startsWith('src/td/')&&!p.endsWith('/main.js')&&!p.endsWith('/maps.js'));
  scripts.forEach(file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));
  return {ns:context.TowerFrontier,context};
}
function game(ns){
  const g=Object.create(ns.TDGame.prototype);Object.assign(g,{build:new ns.systems.BuildSystem(),hero:new ns.entities.Hero(100,100),economy:new ns.systems.EconomySystem(),feedback:new ns.systems.CombatFeedbackSystem(),monsters:[],corpses:[],summons:[],projectiles:[],effects:[],flash(){},updateScoreUi(){}});
  g.synergy=new ns.systems.BattleSynergySystem(g);g.hero.chooseClass('hunter');return g;
}
function enemy(ns,x=140,y=100,type='brute',health=1000){const m=new ns.entities.Monster(type,1,[{x:0,y},{x:2000,y}]);m.x=x;m.y=y;m.health=m.maxHealth=health;return m;}
function tick(g,dt=.1){g.build.applyTowerSupport();g.synergy.update(dt);g.build.items.forEach(t=>t.update(dt,g.monsters,g.projectiles,g.summons));g.summons.forEach(s=>s.update(dt,g.monsters,g.projectiles));g.synergy.refract();g.projectiles.forEach(p=>p.update(dt,g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s)));g.projectiles=g.projectiles.filter(p=>p.active);g.summons=g.summons.filter(s=>s.active);g.feedback.update(dt);}
module.exports={load,game,enemy,tick};
