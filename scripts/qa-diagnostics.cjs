'use strict';
// Isolated mobile-shell probe. Visibility and missing-close events are simulated;
// this is not an iPhone screen-lock or OS process-termination certification.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('artifacts/diagnostics-v'+require('../package.json').version.replaceAll('.',''));
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),report={version:require('../package.json').version,errors:[],scope:'Real mobile entry, native UI and localStorage in isolated Edge. Lifecycle/missing pagehide are controlled injections, not real iPhone/OS tests.'};
try{
 const context=await browser.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'block',acceptDownloads:true}),host=await context.newPage();host.on('pageerror',e=>report.errors.push(e.message));
 await host.goto(process.env.DIAGNOSTICS_QA_URL||'http://127.0.0.1:4173/td-mobile.html',{waitUntil:'load'});const frame=host.frames().find(f=>/td\.html/.test(f.url()));
 await frame.waitForFunction(()=>globalThis.towerFrontierGame?.diagnostics&&towerFrontierGame.art.coreStatus('naga').ready);
 await frame.evaluate(()=>{const g=towerFrontierGame;g.app.store.switchTo('admin');g.app.store.adapter('free').setItem('qa-private','DO_NOT_EXPORT_PLAYER_DATA');g.app.openFree({profession:'naga',faction:'naga',map:'beginner',difficulty:'standard'});});
 await frame.waitForFunction(()=>towerFrontierGame.profession.selected==='naga');
 await frame.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier;g.waves.wave=24;g.waves.countdown=999;g.baseHealth=g.maxBaseHealth=1e6;g.hero.invulnerable=999;const m=new ns.entities.Monster('brute',1);m.x=g.hero.x+30;m.y=g.hero.y;m.health=m.maxHealth=1e8;g.monsters=[m];g.updateUi();});
 await frame.locator('#td-thunder').click();
 await frame.locator('#td-menu-open').click();await frame.locator('#td-menu-settings').click();
 const downloadPromise=host.waitForEvent('download');await frame.locator('#td-menu-settings-panel [data-diagnostic-action="export"]').click();const download=await downloadPromise;await download.saveAs(path.join(out,'diagnostics-export.json'));
 const exported=fs.readFileSync(path.join(out,'diagnostics-export.json'),'utf8'),parsed=JSON.parse(exported);assert(exported.length<=32768);assert(!exported.includes('DO_NOT_EXPORT_PLAYER_DATA'));assert(parsed.sessions.at(-1).events.some(e=>e.type==='action'&&e.action==='w'));assert.equal(parsed.sessions.at(-1).version,report.version);assert.equal(parsed.sessions.at(-1).lastBattle.wave,24);report.export={characters:exported.length,sessions:parsed.sessions.length,hero:parsed.sessions.at(-1).lastBattle.hero,wave:24,privateDataExcluded:true};
 await host.screenshot({path:path.join(out,'diagnostics-settings.png')});
 await frame.locator('#td-menu-settings-back').click();await frame.locator('#td-menu-continue').click();
 async function visibility(hidden){await frame.evaluate(hidden=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));},hidden);}
 const before=await frame.evaluate(()=>towerFrontierGame.monsters[0].routeDistance);await visibility(true);await host.waitForTimeout(700);report.background=await frame.evaluate(()=>({paused:towerFrontierGame.paused,distance:towerFrontierGame.monsters[0].routeDistance,joystick:towerFrontierGame.joystick.active}));assert(report.background.paused);assert.equal(report.background.distance,before);assert.equal(report.background.joystick,false);
 await visibility(false);assert(await frame.locator('#td-background-resume').isVisible());await host.screenshot({path:path.join(out,'background-resume.png')});
 await frame.evaluate(()=>{towerFrontierGame.paused=false;});await host.waitForTimeout(150);assert(await frame.evaluate(()=>towerFrontierGame.paused));
 await frame.locator('[data-diagnostic-action="resume"]').click();await host.waitForTimeout(150);assert(await frame.evaluate(()=>!towerFrontierGame.paused&&!towerFrontierGame.sessionLifecycle.suspension));
 await frame.evaluate(()=>{const g=towerFrontierGame;g.paused=true;});await visibility(true);await visibility(false);assert(await frame.locator('#td-background-resume').isHidden());assert(await frame.evaluate(()=>towerFrontierGame.paused));
 await frame.evaluate(()=>{const e=new Error('DO_NOT_EXPORT_ERROR_MESSAGE');e.stack='Error: PRIVATE\n at https://example.invalid/private/TDGame.js:401:7?token=PRIVATE_TOKEN';towerFrontierGame.handleRuntimeFault('render',e);});
 assert(await frame.locator('#td-runtime-recovery [data-diagnostic-action="export"]').isVisible());
 const errorRaw=await frame.evaluate(()=>towerFrontierGame.diagnostics.export());assert(!errorRaw.includes('DO_NOT_EXPORT_ERROR_MESSAGE'));assert(!errorRaw.includes('PRIVATE_TOKEN'));assert(JSON.parse(errorRaw).sessions.at(-1).events.some(e=>e.type==='runtime-fault'&&e.error.frames[0].file==='TDGame.js'));
 await host.screenshot({path:path.join(out,'error-export.png')});
 // Preserve an unfinished marker while intentionally removing this test page's
 // close listeners. This models missing lifecycle callbacks without killing OS.
 await frame.evaluate(()=>{const g=towerFrontierGame;g.diagnostics.flush(true);g.sessionLifecycle.dispose();});await frame.goto('http://127.0.0.1:4173/td.html?mobileShell=1',{waitUntil:'load'});
 await frame.waitForFunction(()=>globalThis.towerFrontierGame?.diagnostics?.interrupted);
 assert(await frame.locator('#td-diagnostic-restart-notice').isVisible());report.restart=await frame.evaluate(()=>({interrupted:towerFrontierGame.diagnostics.interrupted,sessions:JSON.parse(towerFrontierGame.diagnostics.export()).sessions.length,priorFault:JSON.parse(towerFrontierGame.diagnostics.export()).sessions.at(-2).events.some(e=>e.type==='runtime-fault')}));assert(report.restart.priorFault);
 await frame.locator('[data-diagnostic-action="dismiss"]').click();await frame.evaluate(()=>towerFrontierGame.app.show('settings'));
 const saved=await frame.evaluate(()=>towerFrontierGame.app.store.serialized);await frame.locator('#frontier-app [data-diagnostic-action="clear"]').click();
 assert(await frame.evaluate(saved=>towerFrontierGame.app.store.serialized===saved&&localStorage.getItem(TowerFrontier.systems.GameDiagnostics.KEY)===null,saved));report.clearPreservedPlayerData=true;
 await context.close();
 const blocked=await browser.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true,serviceWorkers:'block'});await blocked.addInitScript(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='heroFrontierDiagnosticsV1')throw new DOMException('quota','QuotaExceededError');return set.call(this,k,v);};});
 const page=await blocked.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto('http://127.0.0.1:4173/td-mobile.html');const blockedFrame=page.frames().find(f=>/td\.html/.test(f.url()));await blockedFrame.waitForFunction(()=>globalThis.towerFrontierGame?.diagnostics);assert.equal(await blockedFrame.evaluate(()=>towerFrontierGame.diagnostics.storageStatus),'memory-only');report.storageFailureIsolated=true;await blocked.close();
 assert.deepEqual(report.errors,[]);report.passed=true;console.log('PASS diagnostics: real export/redaction, bounded storage, background pause/manual resume, missing-close recovery and independent clear');
}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
