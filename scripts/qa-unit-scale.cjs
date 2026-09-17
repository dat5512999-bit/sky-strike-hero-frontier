'use strict';
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage({viewport:{width:1200,height:1000},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173/td.html');
await page.waitForFunction(()=>globalThis.towerFrontierGame?.art);
await page.waitForFunction(()=>{const a=towerFrontierGame.art;return [...Object.values(a.combatUnits),...Object.values(a.enemyActions),a.buildAtlas,a.hero,a.heroHunter,a.heroRogue].every(i=>i.ready);});
await page.evaluate(()=>{const ns=TowerFrontier,a=towerFrontierGame.art;towerFrontierGame.paused=true;const c=document.createElement('canvas');c.width=1200;c.height=1000;Object.assign(c.style,{position:'fixed',inset:0,zIndex:99999});document.body.append(c);const x=c.getContext('2d');x.fillStyle='#27372e';x.fillRect(0,0,c.width,c.height);let n=0;
function slot(label,draw){const px=65+(n%10)*118,py=135+Math.floor(n/10)*150;n++;x.strokeStyle='#779984';x.beginPath();x.moveTo(px-45,py+12);x.lineTo(px+45,py+12);x.stroke();draw(px,py);x.fillStyle='#fff';x.font='12px sans-serif';x.textAlign='center';x.fillText(label,px,py+40);}
for(const type of Object.keys(ns.config.units))slot(type,(px,py)=>a.drawCombatUnit(x,new ns.entities.CombatUnit(type,px,py)));
for(const type of ['hunter','arcanist','rogue'])slot('HERO '+type,(px,py)=>{const h=new ns.entities.Hero(px,py);h.chooseClass(type);a.drawHero(x,h);});
for(const type of Object.keys(ns.systems.ArtSystem.MONSTER_HEIGHTS))slot(type,(px,py)=>{const m=new ns.entities.Monster(type,1);m.x=px;m.y=py+12;a.drawMonster(x,m);});
for(const form of ['hunter','arcanist','crypt','graveyard','rogue','bear','bomb','heavyBomb'])slot('summon '+form,(px,py)=>a.drawSummon(x,{form,x:px,y:py,level:1,state:'idle',frame:0,facing:0}));
});fs.mkdirSync('artifacts/qa-unit-scale',{recursive:true});await page.screenshot({path:'artifacts/qa-unit-scale/roster.png'});if(errors.length)throw Error(errors.join('\n'));console.log('Roster rendered without browser errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
