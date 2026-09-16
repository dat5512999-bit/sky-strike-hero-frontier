'use strict';
// Deterministic VFX gallery + real update/draw stress pass. No test fixtures ship in runtime.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const output=path.resolve(__dirname,'../artifacts/qa-v064');
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});const errors=[],results=[];
try{
  const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/td.html?v=0.64.0');await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.buildAtlas.ready&&Object.values(towerFrontierGame.art.enemyActions).every(i=>i.ready));
  await page.locator('[data-profession="arcanist"]').click();await page.locator('[data-faction="rogue"]').click();await page.locator('#td-start-expedition').click();
  await page.evaluate(()=>{const g=towerFrontierGame;g.waves.countdown=999;g.economy.gold=10000;g.updateUi();g.openShop();});
  const offers=await page.locator('[data-mercenary]:visible').evaluateAll(buttons=>buttons.map(b=>({id:b.dataset.mercenary,ready:b.dataset.previewReady,hasImage:!!b.querySelector('canvas'),width:b.getBoundingClientRect().width})));
  assert.ok(offers.some(o=>o.id==='bombWorkshop'));assert.ok(offers.every(o=>o.ready==='true'&&o.hasImage&&o.width>70));assert.ok(!offers.some(o=>['treant','halberdier'].includes(o.id)));
  await page.screenshot({path:path.join(output,'mercenary-previews-desktop.png')});results.push({mercenaryPreviews:offers});
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{const select=document.getElementById('td-menu-layout-mode');select.value='mobile';select.dispatchEvent(new Event('change'));towerFrontierGame.updateUi();});
  const mobileShop=await page.locator('#td-shop-screen .shop-dialog').boundingBox();
  assert.ok(mobileShop&&mobileShop.x>=0&&mobileShop.y>=0&&mobileShop.x+mobileShop.width<=845&&mobileShop.y+mobileShop.height<=391);
  await page.locator('[data-mercenary="bombWorkshop"]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'mercenary-previews-mobile.png')});results.push({mobileShop});
  await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>{const select=document.getElementById('td-menu-layout-mode');select.value='desktop';select.dispatchEvent(new Event('change'));towerFrontierGame.updateUi();});
  await page.evaluate(()=>{const g=towerFrontierGame;g.closeShop();g.factions.choose('hunter');g.updateUi();g.showCommands('build');});
  await page.screenshot({path:path.join(output,'kingdom-build-roster.png')});
  assert.equal(await page.locator('[data-build-type]:visible').count(),14);
  await page.evaluate(()=>{const g=towerFrontierGame;g.showCommands('orders');g.paused=true;
    const canvas=document.createElement('canvas');canvas.id='qa-vfx-gallery';canvas.width=1360;canvas.height=1040;Object.assign(canvas.style,{position:'fixed',inset:'0',zIndex:99999,width:'1360px',height:'1040px'});document.body.append(canvas);const c=canvas.getContext('2d'),ns=TowerFrontier,art=g.art;
    c.fillStyle='#0b1519';c.fillRect(0,0,1360,1040);c.fillStyle='#e8d394';c.font='bold 26px sans-serif';c.fillText('HERO FRONTIER · Combat VFX V1 · Production renderer',24,36);
    const labels=['01 連鎖雷電','02 火砲爆炸','03 小型爆破機器人','04 重爆機型','05 暗影召喚','06 森林靈獸召喚','07 亡魂收集','08 瘟疫／感電／易傷','09 冰霜／根脈','10 Buff 光環','11 暴擊火花','12 群體死亡','13 混合效果'];
    labels.forEach((label,i)=>{const x=16+(i%4)*336,y=62+Math.floor(i/4)*242;c.save();c.translate(x,y);c.fillStyle='#192722';c.fillRect(0,0,322,226);c.strokeStyle='#806e44';c.strokeRect(0,0,322,226);c.fillStyle='#eadbaa';c.font='bold 15px sans-serif';c.fillText(label,12,25);const f=new ns.systems.CombatFeedbackSystem(),m=new ns.entities.Monster('brute',1);m.x=195;m.y=156;m.health=1000;m.maxHealth=1000;const owner=new ns.entities.Building('bombWorkshop',75,156);
      if([0,1,7,8,10,12].includes(i))art.drawMonster(c,m);
      if(i===0){const targets=[m,...[240,285].map(x=>{const a=new ns.entities.Monster('grunt',1);a.x=x;a.y=150;return a;})];targets.slice(1).forEach(a=>art.drawMonster(c,a));const p=new ns.entities.Projectile({x:65,y:135},m,{damage:1,color:'#a8dfff',chain:3,chainRange:90,style:'lightning'});p.hit(targets);p.trail=.21;p.draw(c);}
      if(i===1){art.drawBuilding(c,'cannon',65,158,1);f.explosion(m,62,'#ffb158','cannon');f.update(.15);f.draw(c);}
      if(i===2||i===3){art.drawBuilding(c,'bombWorkshop',64,165,1);const s=new ns.entities.Summon(owner,{form:i===2?'bomb':'heavyBomb',tags:['summon','mechanical'],offsetX:0});s.x=162;s.y=161;s.spawnTime=0;s.armedTime=i===2?.12:.5;s.draw(c,art);f.explosion({x:258,y:151},i===2?35:60,'#ffb158','explosion');f.update(.18);f.draw(c);}
      if(i===4||i===5){art.drawBuilding(c,i===4?'crypt':'grove',70,166,1);const s=new ns.entities.Summon(owner,{form:i===4?'crypt':'bear',tags:['summon',i===4?'undead':'nature'],level:3});s.x=217;s.y=174;s.spawnTime=.23;s.draw(c,art);}
      if(i===6){art.drawBuilding(c,'crypt',260,165,1);for(let j=0;j<6;j++)f.soul({x:30+j*12,y:156}, {x:250,y:150});f.update(.3);f.draw(c);}
      if(i===7){m.plagueDot={};m.vulnerability={};m.shockTime=2;ns.systems.CombatFeedbackSystem.drawStatus(c,m,.1);}
      if(i===8){m.slowTimer=2;m.rootTime=2;ns.systems.CombatFeedbackSystem.drawStatus(c,m,1);}
      if(i===9){art.drawBuilding(c,'barracks',85,156,1);const unit=new ns.entities.CombatUnit('hunter',230,157);art.drawCombatUnit(c,unit);f.aura(unit,'#f8d994');f.update(.15);f.draw(c);}
      if(i===10){f.hit(m,75,true,'#ffeac6');f.update(.08);f.items=f.items.filter(f=>f.type!=='damage');f.draw(c);}
      if(i===11){for(let j=0;j<8;j++){const a=new ns.entities.Monster(j%2?'boss':'revenant',1);a.x=42+j*32;a.y=140+j%2*30;f.death(a);}f.update(.22);f.draw(c);}
      if(i===12){m.slowTimer=1;m.shockTime=1;m.plagueDot={};ns.systems.CombatFeedbackSystem.drawStatus(c,m,.1);f.explosion(m,53,'#b783ef');f.aura({x:110,y:170},'#8effbc');f.hit(m,50,true);f.update(.15);f.draw(c);}c.restore();
    });
  });
  await page.setViewportSize({width:1360,height:1040});await page.screenshot({path:path.join(output,'vfx-gallery.png')});
  await page.evaluate(()=>document.getElementById('qa-vfx-gallery').remove());await page.setViewportSize({width:1440,height:900});
  for(const mobile of [false,true]){
    await page.setViewportSize(mobile?{width:844,height:390}:{width:1440,height:900});
    const metrics=await page.evaluate(mobile=>{const g=towerFrontierGame,ns=TowerFrontier;const select=document.getElementById('td-menu-layout-mode');select.value=mobile?'mobile':'desktop';select.dispatchEvent(new Event('change'));document.body.dataset.layout=mobile?'mobile':'desktop';document.body.dataset.combatOrientation='landscape';g.paused=true;g.build.items=[];g.summons=[];g.monsters=[];g.projectiles=[];g.feedback.reset();g.synergy.reset();g.waves.countdown=999;
      const specs=[['unit','kingdomMage'],['unit','alchemist'],['unit','knight'],['unit','beastmaster'],['unit','dragon'],['unit','dryad'],['unit','moonblade'],['building','crypt'],['building','graveyard'],['building','plague'],['building','cannon'],['building','bombWorkshop'],['building','grove'],['building','moonwell']];
      specs.forEach(([kind,type],i)=>{const x=340+(i%7)*76,y=280+Math.floor(i/7)*165;const o=kind==='unit'?new ns.entities.CombatUnit(type,x,y):new ns.entities.Building(type,x,y);o.level=3;if(type==='bombWorkshop')o.chooseBranch('heavy');g.build.items.push(o);});
      for(let i=0;i<180;i++){const m=new ns.entities.Monster(i%12===0?'boss':i%3===0?'shaman':'grunt',8);m.setRouteDistance(280+i*8);m.health=m.maxHealth=10000;g.monsters.push(m);}for(let i=0;i<40;i++)g.summons.push(new ns.entities.Summon(g.build.items[3],{form:i%2?'crypt':'bear',tags:['summon',i%2?'undead':'nature'],offsetX:(i%8)*8,duration:20,damage:10,range:70,level:2}));g.hero.equipment.spear=2;g.hero.x=540;g.hero.y=400;g.hero.setTarget(540,400);g.camera.focus(650,400);g.updateUi();const samples=[];
      for(let i=0;i<240;i++){const start=performance.now();g.paused=false;g.update(1/60);g.paused=true;g.draw();samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);
      const result={mobile,monsters:g.monsters.length,summons:g.summons.length,projectiles:g.projectiles.length,feedback:g.feedback.items.length,visuals:g.synergy.visuals.length,meanMs:samples.reduce((a,b)=>a+b,0)/samples.length,p95Ms:samples[Math.floor(samples.length*.95)]};g.updateUi();return result;
    },mobile);
    assert.ok(metrics.feedback<=(mobile?90:140));assert.ok(metrics.visuals<=100);assert.ok(Number.isFinite(metrics.p95Ms));results.push({stress:metrics});await page.screenshot({path:path.join(output,mobile?'battle-mixed-mobile.png':'battle-mixed-desktop.png')});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({ok:true,results,errors},null,2));console.log(JSON.stringify({ok:true,results,errors},null,2));await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
