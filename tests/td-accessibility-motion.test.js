'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/td-runtime.cjs');
const root=path.resolve(__dirname,'..');
function canvas(){const calls=[];return {calls,ctx:new Proxy({},{get:(target,key)=>key in target?target[key]:(...args)=>{calls.push([key,...args]);}})};}
test('enemy windup and control remain legible without relying on hue',()=>{
  const {ns}=load(),m=new ns.entities.Monster('brute',1),target={x:m.x+40,y:m.y,active:true},view=canvas();
  m.combatTarget=target;m.attackWindup=.3;m.draw(view.ctx,null);
  assert.ok(view.calls.some(call=>call[0]==='fillText'&&call[1]==='攻'));
  m.applySlow(.5,2);m.rootTime=1;ns.systems.CombatFeedbackSystem.drawStatus(view.ctx,m,1);
  assert.ok(view.calls.some(call=>call[0]==='fillText'&&call[1]==='定'));
  assert.equal(m.x,ns.config.path[0].x);assert.equal(m.y,ns.config.path[0].y);
});
test('reduced effects preserve warnings and hits while dropping decorative particles',()=>{
  const {ns}=load(),feedback=new ns.systems.CombatFeedbackSystem();feedback.reducedFx=true;
  feedback.push({type:'mote',time:1});feedback.push({type:'dust',time:1});feedback.push({type:'warning',time:1});feedback.push({type:'impact',time:1});
  assert.equal(feedback.items.map(item=>item.type).join(','),'warning,impact');
  feedback.announcer={textContent:''};feedback.warning({x:0,y:0},'戰爭踐踏',126);
  assert.equal(feedback.announcer.textContent,'首領蓄力：戰爭踐踏');
  feedback.update(2);assert.equal(feedback.announcer.textContent,'');
});
test('crowded monster status badges avoid each other',()=>{
  const {ns}=load(),view=canvas(),occupied=[];
  for(let i=0;i<5;i++){const monster=new ns.entities.Monster('grunt',1);monster.x=200+i*18;monster.y=200;monster.rootTime=1;ns.systems.CombatFeedbackSystem.drawStatus(view.ctx,monster,1,occupied);}
  assert.ok(occupied.length>=2);
  for(let i=0;i<occupied.length;i++)for(let j=i+1;j<occupied.length;j++){
    const a=occupied[i],b=occupied[j];assert.ok(a.x+a.width+3<=b.x||b.x+b.width+3<=a.x||a.y+a.height+3<=b.y||b.y+b.height+3<=a.y);
  }
});
test('battle preferences expose labelled controls and stylesheet',()=>{
  const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
  for(const id of ['td-access-contrast','td-access-text','td-access-effects'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/td-accessibility\.css/);
});
