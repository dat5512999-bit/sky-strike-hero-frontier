'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,enemy}=require('./helpers/td-runtime.cjs');

test('地精士兵的槍擊依動作格從預備、開火到收勢，彈丸在開火格才射出',()=>{
  const {ns}=load(),unit=new ns.entities.CombatUnit('goblinGunner',100,100),target=enemy(ns,135,100),shots=[];
  const options={damage:10,color:'#d9ad65',attackType:'pierce',speed:480};
  ns.systems.GoblinAnimation.queue(unit,[target],options);
  assert.equal(ns.systems.GoblinAnimation.frame(unit),1);
  ns.systems.GoblinAnimation.update(unit,.12,[target],shots);
  assert.equal(shots.length,0);
  ns.systems.GoblinAnimation.update(unit,.13,[target],shots);
  assert.equal(ns.systems.GoblinAnimation.frame(unit),2);
  assert.equal(shots.length,1);
  ns.systems.GoblinAnimation.update(unit,.12,[target],shots);
  assert.equal(ns.systems.GoblinAnimation.frame(unit),3);
});

test('奇克三招有獨立戰鬥效果，離開機械網路也能施展 Q 與 W',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),foe=enemy(ns,140,100),summons=[];
  hero.chooseClass('goblin');
  const normalInterval=hero.combatConfig().interval;
  assert.equal(hero.castNova([],()=>{},()=>{}),true);
  assert.ok(hero.combatConfig().interval<normalInterval);
  hero.castTimer=0;
  const before=foe.health;
  assert.equal(hero.castThunder([foe],()=>{},null,()=>{}),true);
  assert.ok(foe.health<before);
  assert.ok(foe.slowTimer>0);
  assert.equal(hero.castSummon(summons),true);
  assert.equal(summons.length,1);
  assert.equal(summons[0].form,'goblin');
  assert.equal(summons[0].range,145);
  assert.equal(hero.castSummon(summons),false);
});

test('軍團卡用實際群像圖，英雄與軍團選擇名稱不顯示測試字樣',()=>{
  const {ns}=load(),html=fs.readFileSync('td.html','utf8'),faction=ns.systems.FactionSystem.FACTIONS.goblin;
  assert.equal(faction.selectionArt,'assets/td/goblin/faction-selection-v1.png');
  assert.ok(fs.statSync(faction.selectionArt).size>100000);
  for(const id of ['goblin','frostland'])for(const kind of ['profession','faction'])
    assert.doesNotMatch(html.match(new RegExp('data-'+kind+'="'+id+'"[^>]*><b>[^<]*'))?.[0]||'',/測試/);
  assert.match(html,/data-profession="goblin"[^>]*><b>銅齒・奇克<\/b>/);
});
