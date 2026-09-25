'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../td.html')).href);
  await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready);
  const result=await page.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier;g.chooseProfession('hunter','hunter');g.paused=true;g.hero.x=450;g.hero.y=360;const m=new ns.entities.Monster('brute',1,[{x:350,y:340},{x:700,y:340}]);m.x=350;m.y=340;m.combatTarget=g.hero;m.attackWindup=.3;m.applySlow(.5,2);m.rootTime=1;g.monsters=[m];g.draw();return {state:m.state,x:m.x,y:m.y,windup:m.attackWindup};});
  assert.equal(result.windup,.3);const out=path.resolve(__dirname,'../artifacts/qa-accessibility');fs.mkdirSync(out,{recursive:true});await page.locator('#td-game').screenshot({path:path.join(out,'combat-tell.png')});assert.deepEqual(errors,[]);console.log('Combat tell render: passed');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
