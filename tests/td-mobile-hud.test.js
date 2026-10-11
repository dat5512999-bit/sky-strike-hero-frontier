'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
test('mobile selected-unit actions stay still while a unit moves; resize clamps to safe stage',()=>{
  const {ns,context}=load();context.document={body:{dataset:{layout:'mobile'}}};
  const panel={hidden:false,offsetWidth:245,offsetHeight:50,style:{}},stage={clientWidth:724,clientHeight:390};
  const g=Object.create(ns.TDGame.prototype);g.ui={selectionActions:panel};g.build={selected:{x:100,y:200}};g.canvas={parentElement:stage};
  const positions=[];
  for(let i=0;i<20;i++){g.lastSelectionActionLayout=0;g.build.selected.x+=20;g.positionSelectionActions();positions.push(panel.style.left+','+panel.style.top);}
  assert.equal(new Set(positions).size,1);assert.equal(panel.style.left,'240px');
  stage.clientWidth=480;g.lastSelectionActionLayout=0;g.positionSelectionActions();assert.equal(panel.style.left,'118px');
});
test('desktop toolbar uses real width including equipment; only one positioning owner',()=>{
  const {ns,context}=load();context.document={body:{dataset:{layout:'desktop'}}};
  const panel={hidden:false,offsetWidth:285,offsetHeight:54,style:{}},stage={clientWidth:700,clientHeight:400,getBoundingClientRect:()=>({left:0,top:0})};
  const g=Object.create(ns.TDGame.prototype);g.ui={selectionActions:panel};g.build={selected:{x:600,y:200}};g.canvas={parentElement:stage,getBoundingClientRect:()=>({left:0,top:0,width:700,height:400})};g.camera={enabled:true,worldToScreen:(x,y)=>({x,y})};
  g.positionSelectionActions();assert.equal(panel.style.left,'281px');assert.equal(panel.style.top,'132px');
  assert.doesNotMatch(fs.readFileSync('src/td/systems/ArmoryUI.js','utf8'),/proto\.positionSelectionActions=/);
});
test('shared skill atlas is required before the original heroes enter battle, with failure and retry states',()=>{
  const context={TowerFrontier:{systems:{},config:{mapId:'test'}}};
  vm.runInNewContext(fs.readFileSync('src/td/systems/ArtSystem.js','utf8'),context);
  const A=context.TowerFrontier.systems.ArtSystem,art=Object.create(A.prototype),ready={ready:true};
  Object.assign(art,{hero:ready,heroHunter:ready,heroRogue:ready,mapAssets:{test:ready},enemyActions:{grunt:ready},skillIcons:{ready:false,failed:false}});
  for(const id of ['hunter','arcanist','rogue']){assert.equal(art.coreStatus(id).ready,false);assert.equal(art.coreStatus(id).total,4);}
  art.skillIcons.failed=true;assert.equal(art.coreStatus('hunter').failed,true);
  art.skillIcons.failed=false;art.skillIcons.ready=true;assert.equal(art.coreStatus('hunter').ready,true);
  assert.match(fs.readFileSync('td.html','utf8'),/rel="preload" as="image" href="assets\/td\/hero-skill-icons-v1.png" fetchpriority="high"/);
});
