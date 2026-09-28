'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {rgba}=require('./png-pixels.cjs');
const {load,enemy}=require('./helpers/td-runtime.cjs');

test('中立戰牛可與任何軍團組隊，並擁有完整的五乘五透明戰鬥圖集',()=>{
  const {ns}=load(),hero=ns.systems.HeroRoster.get('bull'),file='assets/td/neutral/bull-wargod-actions-5x5-v1.png',selection='assets/td/neutral/bull-wargod-selection-v1.png',skillArt='assets/td/neutral/bull-wargod-skill-icons-v2.png';
  assert.equal(hero.faction,'中立英雄 · 可與所有軍團遠征');assert.equal(new ns.systems.ProfessionSystem().choose('bull'),true);
  for(const faction of Object.keys(ns.systems.FactionSystem.FACTIONS)){const system=new ns.systems.FactionSystem();assert.equal(system.choose(faction),true);assert.ok(system.current().units.length,faction);}
  for(const asset of [file,selection,skillArt])assert.ok(fs.statSync(asset).size>500000,asset);assert.equal(hero.skillArt,skillArt);assert.match(fs.readFileSync('sw.js','utf8'),/bull-wargod-skill-icons-v2\.png/);
  const {width,height,pixels}=rgba(file);assert.equal(pixels[3],0);assert.equal(width,height);assert.ok(width>=1200);
  const cellW=width/5,cellH=height/5;
  for(let row=0;row<5;row++)for(let column=0;column<5;column++){
    let filled=0;for(let y=Math.floor(row*cellH+cellH*.2);y<Math.floor(row*cellH+cellH*.8);y+=4)for(let x=Math.floor(column*cellW+cellW*.2);x<Math.floor(column*cellW+cellW*.8);x+=4)if(pixels[(y*width+x)*4+3]>80)filled++;
    assert.ok(filled>25,'5×5 cell '+column+','+row+' must contain a complete pose');
  }
  assert.match(fs.readFileSync('src/td/systems/BullWargodArt.js','utf8'),/atlas\.width\/5/);assert.match(fs.readFileSync('src/td/systems/BullWargodArt.js','utf8'),/No clip path/);
  const css=fs.readFileSync('td-combat.css','utf8')+fs.readFileSync('td-polish.css','utf8');assert.match(css,/data-hero-class="bull"/);assert.match(css,/bull-wargod-skill-icons-v2\.png/);
  const icons=rgba(skillArt);assert.equal(icons.width,icons.height);assert.ok(icons.width>=1024);const iconW=icons.width/2,iconH=icons.height/2;
  for(let row=0;row<2;row++)for(let column=0;column<2;column++){let light=0;for(let y=Math.floor(row*iconH+iconH*.25);y<Math.floor(row*iconH+iconH*.75);y+=6)for(let x=Math.floor(column*iconW+iconW*.25);x<Math.floor(column*iconW+iconW*.75);x+=6){const offset=(y*icons.width+x)*4;if(icons.pixels[offset]+icons.pixels[offset+1]+icons.pixels[offset+2]>220)light++;}assert.ok(light>80,'skill cell '+column+','+row+' needs a readable painted motif');}
});

test('戰牛重槌完成三階鍛造，商城元素核心只套用在戰牛且可免費切換',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),economy={gold:3000,spend({gold}){if(this.gold<gold)return false;this.gold-=gold;return true;}};hero.chooseClass('bull');
  const shop=new ns.systems.ShopSystem(hero),names=[];
  for(let level=1;level<=3;level++){const offer=shop.offer('spear');assert.equal(offer.price,[100,160,220][level-1]);assert.equal(offer.visual.visual,'warhammer');assert.equal(shop.buy('spear',economy).ok,true);names.push(hero.equipment.spear);}
  assert.deepEqual(names,[1,2,3]);assert.equal(ns.systems.EquipmentSystem.WEAPONS.bull.length,4);
  for(const [id,core] of Object.entries({"core-fire":'fire',"core-frost":'frost',"core-lightning":'lightning',"core-shadow":'shadow'})){assert.equal(shop.buy(id,economy).ok,true,id);assert.equal(hero.equipment.core,core);}
  const before=economy.gold;assert.equal(shop.buy('core-fire',economy).ok,true);assert.equal(economy.gold,before,'already owned core swaps without purchase');
  const target=enemy(ns,150,100),other=enemy(ns,188,100);hero.equipment.core='lightning';const shot=new ns.entities.Projectile(hero,target,{damage:20,attackType:'chaos'});assert.equal(shot.style,'bull-lightning');assert.equal(shot.chain,3);shot.hit([target,other],()=>{},()=>{});assert.ok(other.health<other.maxHealth);
  const ranger=new ns.entities.Hero(100,100);ranger.chooseClass('hunter');ranger.equipment.core='lightning';assert.equal(ns.systems.EquipmentSystem.core(ranger),null);assert.equal(new ns.systems.ShopSystem(ranger).usable('core-fire'),false);
});

test('戰牛的三個技能與戰神裁決只加強自己，不給特定軍團免費加成',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),targets=Array.from({length:4},(_,index)=>enemy(ns,155+index*18,100));hero.chooseClass('bull');
  assert.equal(hero.castNova(targets,()=>{},()=>{}),true);assert.ok(targets.some(target=>target.health<target.maxHealth));assert.equal(hero.skillVfx.at(-1).type,'bull-hammerfall');
  hero.skillCooldowns.thunder=0;assert.equal(hero.castThunder(targets,()=>{},[],()=>{}),true);assert.equal(hero.fields.at(-1).type,'bull');
  hero.skillCooldowns.summon=0;const before=hero.combatConfig();assert.equal(hero.castSummon([]),true);const during=hero.combatConfig();assert.ok(during.damage>before.damage);assert.ok(during.interval<before.interval);
  hero.skillCooldowns.ultimate=0;const result=ns.systems.HeroUltimateSystem.cast(hero,targets,()=>{},()=>{});assert.equal(result.name,'戰神裁決');assert.equal(hero.skillVfx.at(-1).type,'ultimate-bull');
});
