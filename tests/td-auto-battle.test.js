'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=[
  'src/td/namespace.js','src/td/config.js','src/td/systems/ArmorySystem.js',
  'src/td/systems/NavigationSystem.js','src/td/systems/CommandSystem.js',
  'src/td/systems/TargetSelector.js','src/td/entities/Monster.js',
  'src/td/entities/Projectile.js','src/td/entities/CombatUnit.js'
];
function load(){const context=vm.createContext({console});context.globalThis=context;for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});return context.TowerFrontier;}
function enemy(ns,x,y=100,type='grunt'){const monster=new ns.entities.Monster(type,1);monster.x=x;monster.y=y;return monster;}
function simulate(unit,monsters,seconds,speed,context){const shots=[];for(let elapsed=0;elapsed<seconds;elapsed+=.033*speed)unit.update(Math.min(.033*speed,seconds-elapsed),monsters,shots,context);return shots;}

test('未下指令的士兵在警戒區內會自行攻擊',()=>{const ns=load(),unit=new ns.entities.CombatUnit('hunter',100,100),target=enemy(ns,160),shots=[];unit.cooldown=0;unit.update(.016,[target],shots);assert.equal(shots.length,1);assert.equal(shots[0].target,target);assert.equal(unit.lockedTarget,target);});

test('五種共用索敵策略會選到不同敵人，且所有士兵可設定',()=>{const ns=load(),origin={x:100,y:100},targets=[{x:110,y:100,health:70,speed:40,p:1},{x:145,y:100,health:60,speed:60,p:9},{x:150,y:100,health:5,speed:50,p:2},{x:155,y:100,health:900,speed:55,p:3},{x:160,y:100,health:80,speed:200,p:4}].map(entry=>Object.assign({active:true,progress(){return this.p;}},entry));const expected={nearest:0,front:1,lowestHealth:2,highestHealth:3,fastest:4};for(const [strategy,index] of Object.entries(expected))assert.equal(ns.systems.TargetSelector.select(origin,targets,strategy),targets[index]);for(const type of Object.keys(ns.config.units)){const unit=new ns.entities.CombatUnit(type,100,100);assert.equal(unit.setTargetStrategy('fastest'),true,type);assert.equal(unit.targetStrategy,'fastest');assert.equal(unit.setTargetStrategy('missing'),false);}});

test('鎖定目標後小幅血量或排序變化不會每 frame 換目標，死亡後才重選',()=>{const ns=load(),unit=new ns.entities.CombatUnit('hunter',100,100),first=enemy(ns,145),second=enemy(ns,155),shots=[];unit.setTargetStrategy('lowestHealth');first.health=20;second.health=30;unit.update(.016,[first,second],shots);assert.equal(unit.lockedTarget,first);second.health=5;unit.update(.016,[first,second],shots);assert.equal(unit.lockedTarget,first);first.active=false;unit.update(.016,[first,second],shots);assert.equal(unit.lockedTarget,second);});

test('近戰士兵只追警戒區敵人，離開追擊界線就返回駐守點',()=>{const ns=load(),unit=new ns.entities.CombatUnit('shield',100,100),target=enemy(ns,220),context={navigation:new ns.systems.NavigationSystem(),buildings:[]};unit.update(.5,[target],[],context);assert.ok(unit.x>100);assert.equal(unit.order,'chase');const chasedX=unit.x;target.x=unit.guardX+unit.maxChaseDistance+30;unit.update(.25,[target],[],context);assert.ok(unit.x<chasedX);assert.ok(['return','idle'].includes(unit.order));simulate(unit,[target],2,1,context);assert.ok(Math.abs(unit.x-unit.guardX)<=3);assert.equal(unit.lockedTarget,null);});

test('追擊目標消失後返回，無可用路徑的敵人不會每 frame 重試',()=>{const ns=load(),unit=new ns.entities.CombatUnit('shield',100,100),target=enemy(ns,215),context={navigation:new ns.systems.NavigationSystem(),buildings:[]};unit.update(.4,[target],[],context);const chasedX=unit.x;target.active=false;unit.update(.2,[target],[],context);assert.ok(unit.x<chasedX);simulate(unit,[target],2,1,context);assert.equal(unit.x,unit.guardX);const blocked=new ns.entities.CombatUnit('shield',100,100),unreachable=enemy(ns,220);let attempts=0;const noPath={navigation:{findPath(){attempts++;return[];}},buildings:[]};for(let i=0;i<12;i++)blocked.update(.016,[unreachable],[],noPath);assert.equal(attempts,1);assert.equal(blocked.lockedTarget,null);});

test('手動移動完成後更新駐守點，固守不追擊，攻擊移動仍可沿路射擊',()=>{const ns=load(),navigation=new ns.systems.NavigationSystem(),commands=new ns.systems.CommandSystem(),unit=new ns.entities.CombatUnit('hunter',100,100);assert.equal(commands.issue(unit,210,100,navigation,[]),true);simulate(unit,[],1.2,1,{navigation,buildings:[]});assert.ok(Math.abs(unit.guardX-210)<=3);assert.equal(unit.order,'idle');const oldX=unit.x,far=enemy(ns,oldX+140);commands.hold(unit);unit.update(.5,[far],[],{navigation,buildings:[]});assert.equal(unit.x,oldX);assert.equal(unit.order,'hold');commands.arm('attackMove');commands.issue(unit,310,100,navigation,[]);const near=enemy(ns,unit.x+50),shots=[];unit.cooldown=0;unit.update(.016,[near],shots,{navigation,buildings:[]});assert.equal(shots.length,1);assert.equal(unit.x,oldX);});

test('×2／×3 時間步進下追擊不越界且能回防',()=>{const ns=load();for(const speed of [2,3]){const unit=new ns.entities.CombatUnit('shield',100,100),target=enemy(ns,220),context={navigation:new ns.systems.NavigationSystem(),buildings:[]};simulate(unit,[target],.6,speed,context);assert.ok(unit.x>100);assert.ok(Math.hypot(unit.x-unit.guardX,unit.y-unit.guardY)<=unit.maxChaseDistance);target.active=false;simulate(unit,[target],2,speed,context);assert.ok(Math.abs(unit.x-unit.guardX)<=3);}});
