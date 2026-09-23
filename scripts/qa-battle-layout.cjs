const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),results=[],out='artifacts/qa-battle-v0836';fs.mkdirSync(out,{recursive:true});
 try{
  for(const [name,width,height,touch] of [['wide',1911,900,false],['desktop',1440,900,false],['compact',960,450,false],['phone',844,390,true],['portrait',390,844,true]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
   await context.addInitScript(()=>localStorage.setItem('towerFrontierLayout','mobile'));
   page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4175/td.html');
   let view=page;if(touch){await page.waitForURL('**/td-mobile.html');view=await (await page.waitForSelector('iframe')).contentFrame();}
   await view.waitForFunction(()=>globalThis.frontierApp);
   // The compact case verifies deliberate desktop layout under browser zoom.
   if(name==='compact')await view.evaluate(()=>{const select=document.querySelector('#td-layout-mode');select.value='desktop';select.dispatchEvent(new Event('change'));});
   await view.evaluate(()=>{frontierApp.openFree();towerFrontierGame.chooseProfession('hunter','hunter');});
   await view.waitForFunction(()=>towerFrontierGame.profession.selected==='hunter'&&towerFrontierGame.camera.enabled);
   const measured=await view.evaluate(()=>{
    const selectors=['.td-header','.td-minimap','.td-quick-rail','.td-hero-dock','#td-wave-hud'];
    const panels=selectors.map(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {selector,x:r.x,y:r.y,right:r.right,bottom:r.bottom,zoom:getComputedStyle(el).zoom};});
    const joystick=document.querySelector('.hero-joystick');
    const cam=towerFrontierGame.camera,p={x:400,y:350},screen=cam.worldToScreen(p.x,p.y),world=cam.screenToWorld(screen.x,screen.y);
    return {layout:document.body.dataset.layout,joystick:!joystick.hidden&&getComputedStyle(joystick).display!=='none',width:innerWidth,height:innerHeight,panels,roundTrip:Math.hypot(world.x-p.x,world.y-p.y)};
   });
   assert.equal(measured.layout,touch?'mobile':'desktop',name);assert.equal(measured.joystick,touch,name);assert.ok(measured.roundTrip<.001);
   for(const r of measured.panels)assert.ok(r.x>=-1&&r.y>=-1&&r.right<=measured.width+1&&r.bottom<=measured.height+1,name+' '+r.selector+' stays visible '+JSON.stringify(r));
   if(name==='wide')assert.equal(Number(measured.panels[0].zoom),1.25);
   if(touch)assert.equal(Number(measured.panels[0].zoom),1);
   await page.screenshot({path:out+'/'+name+'-layout.png'});assert.deepEqual(errors,[]);results.push({name,errors,...measured});await context.close();
  }
  fs.writeFileSync(out+'/layout-results.json',JSON.stringify(results,null,2));console.log('Battle layout passed five viewport/input configurations, legacy preference recovery and camera coordinates.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
