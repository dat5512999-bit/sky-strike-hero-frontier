'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../artifacts/game-audio');
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4177/td.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.towerFrontierGame?.app);
    await page.locator('body').click({position:{x:5,y:5}});
    const live=await page.evaluate(async()=>{
      const A=TowerFrontier.systems.GameAudio,L=TowerFrontier.systems.FrostlandAudio,C=TowerFrontier.systems.AudioCatalog;
      L.setEnabled(true);A.unlock();await A.context.resume();A.event('victory');const during=A.active.size;A.stop();
      let maxVoices=0,cpuMs=0;
      for(let tick=0;tick<60;tick++){
        const start=performance.now();
        for(let i=0;i<60;i++)A.play({key:'stress:'+i,layers:C.families.siege,priority:0,gap:.1});
        if(tick%5===0)A.skill({classType:Object.keys(TowerFrontier.systems.HeroRoster.CLASSES)[(tick/5)%11]},'f');
        cpuMs+=performance.now()-start;maxVoices=Math.max(maxVoices,A.active.size);await new Promise(resolve=>setTimeout(resolve,20));
      }
      const voiceSlider=document.querySelector('#td-audio-voice-volume'),effectVolume=A.volume;
      voiceSlider.value=0;voiceSlider.dispatchEvent(new Event('input'));
      const independent=TowerFrontier.systems.HeroVoice.volume===0&&A.volume===effectVolume;
      L.setEnabled(false);return {during,after:A.active.size,settings:!!document.querySelector('#td-audio-volume'),voiceSettings:!!voiceSlider,independent,attempts:3600,maxVoices,cpuMs};
    });
    assert(live.during>0);assert.equal(live.after,0);assert(live.settings);
    assert(live.maxVoices<=12);assert(live.voiceSettings);assert(live.independent);
    const report=await page.evaluate(async()=>{
      const {GameAudio:A,AudioCatalog:C,HeroRoster:R}=TowerFrontier.systems,all=[];
      for(const id of Object.keys(R.CLASSES))for(const slot of ['q','w','e','f'])all.push(C.skill(id,slot));
      for(const id of Object.keys(C.events))all.push(C.event(id));
      for(const [id,layers] of Object.entries(C.families))all.push({key:'family:'+id,layers});
      for(const slot of ['q','w','e','f'])all.push({...C.skill('bull',slot,true),key:'legacy:bull:'+slot});
      all.push(C.bull('attack'),C.bull('hit'));
      for(const hero of Object.keys(R.CLASSES).filter(id=>id!=='bull')){all.push(C.character(hero,'attack'),C.character(hero,'hit'));for(const slot of ['q','w','e','f'])all.push({...C.skill(hero,slot,true),key:'legacy:'+hero+':'+slot});}
      const results=[],samples=[];
      for(const cue of all){
        A.stop();const ctx=new OfflineAudioContext(1,44100*2,44100);A.context=ctx;const dest=A.graph();
        for(const layer of cue.layers)A.voice(layer,dest,cue.priority||0,1);
        const buffer=await ctx.startRendering(),data=buffer.getChannelData(0);let peak=0,sum=0,invalid=0;
        for(const sample of data){if(!Number.isFinite(sample))invalid++;peak=Math.max(peak,Math.abs(sample));sum+=sample*sample;}
        results.push({key:cue.key,peak,rms:Math.sqrt(sum/data.length),invalid,remaining:A.active.size});
        if(cue.key==='event:victory'||Object.keys(R.CLASSES).some(hero=>cue.key.includes(':'+hero+':')||cue.key.startsWith(hero+':')))samples.push({key:cue.key,data:Array.from(data)});
      }
      return {results,samples};
    });
    for(const row of report.results){assert(row.peak>.0001&&row.peak<.99,JSON.stringify(row));assert.equal(row.invalid,0);assert.equal(row.remaining,0);}
    // A WAV audition reel is generated from the exact production synthesizer.
    const values=report.samples.flatMap(s=>s.data),wav=Buffer.alloc(44+values.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(44100,24);wav.writeUInt32LE(88200,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(values.length*2,40);values.forEach((v,i)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*2));fs.writeFileSync(path.join(out,'audition.wav'),wav);
    const comparisonOrder=['bull:attack','bull:hit',...['q','w','e','f'].flatMap(slot=>['legacy:bull:'+slot,'skill:bull:'+slot])];
    const comparisonValues=comparisonOrder.flatMap(key=>report.samples.find(s=>s.key===key).data),comparison=Buffer.alloc(44+comparisonValues.length*2);
    wav.copy(comparison,0,0,44);comparison.writeUInt32LE(comparison.length-8,4);comparison.writeUInt32LE(comparisonValues.length*2,40);comparisonValues.forEach((v,i)=>comparison.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*2));fs.writeFileSync(path.join(out,'bull-comparison.wav'),comparison);
    const characterOrders={};
    for(const hero of ['goblin','naga','hunter','arcanist','rogue','chief','frostland','dwarf','dragonkin','egypt']){
      const order=[hero+':attack',hero+':hit',...['q','w','e','f'].map(slot=>'skill:'+hero+':'+slot)];characterOrders[hero]=order;
      const values=order.flatMap(key=>report.samples.find(s=>s.key===key).data),file=Buffer.alloc(44+values.length*2);wav.copy(file,0,0,44);file.writeUInt32LE(file.length-8,4);file.writeUInt32LE(values.length*2,40);values.forEach((v,i)=>file.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*2));fs.writeFileSync(path.join(out,hero+'-audition.wav'),file);
    }
    const remainingOrder=['hunter','arcanist','rogue','chief','frostland','dwarf','dragonkin','egypt'].map(hero=>'skill:'+hero+':f');
    const remainingValues=remainingOrder.flatMap(key=>report.samples.find(s=>s.key===key).data),remaining=Buffer.alloc(44+remainingValues.length*2);
    wav.copy(remaining,0,0,44);remaining.writeUInt32LE(remaining.length-8,4);remaining.writeUInt32LE(remainingValues.length*2,40);remainingValues.forEach((v,i)=>remaining.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*2));fs.writeFileSync(path.join(out,'remaining-heroes-audition.wav'),remaining);
    await page.goto('http://127.0.0.1:4177/audio-preview.html');await page.getByRole('button',{name:'Q 潮門突刺',exact:true}).click();await page.screenshot({path:path.join(out,'preview.png')});
    await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'新版 Q',exact:true}).click();assert.match(await page.locator('#status').innerText(),/試聽/);
    for(const [hero,label] of [['goblin','地精'],['naga','娜迦'],['hunter','王國獵手'],['arcanist','精靈'],['rogue','暗影'],['chief','大酋長'],['frostland','霜原'],['dwarf','矮人'],['dragonkin','龍脈'],['egypt','埃及島']]){
      await page.locator('#character-jump').selectOption(hero);assert(await page.locator('#'+hero+'-audition').isVisible());
      await page.getByRole('button',{name:label+' 新版 F',exact:true}).click();assert.match(await page.locator('#status').innerText(),new RegExp(label+' 新版 F'));
    }
    for(const hero of ['chief','frostland'])await page.locator('#'+hero+'-audition').screenshot({path:path.join(out,hero+'-mobile.png')});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#stop').click();
    const voices=[];
    for(const slot of ['選角','Q','W','E','F','選角']){
      await page.getByRole('button',{name:'試聽 '+slot+' 語音',exact:true}).click();
      // An idle effects bus may be culled by WebAudio; test ducking with actual input.
      await page.evaluate(()=>TowerFrontier.systems.GameAudio.play({key:'qa:voice-underlay',priority:2,layers:[{a:110,b:110,d:2,level:.015}]}));
      await page.waitForFunction(()=>!!TowerFrontier.systems.HeroVoice.active&&TowerFrontier.systems.GameAudio.effects.gain.value<.8);
      assert.match(await page.locator('#status').innerText(),/正在播放人物語音/);
      voices.push(await page.evaluate(()=>({active:!!TowerFrontier.systems.HeroVoice.active,ducked:TowerFrontier.systems.GameAudio.effects.gain.value<1})));
      await page.locator('#stop').click();assert.equal(await page.evaluate(()=>TowerFrontier.systems.HeroVoice.active),null);
    }
    assert(voices.every(v=>v.active&&v.ducked));assert.equal(await page.evaluate(()=>TowerFrontier.systems.HeroVoice.cache.size),5);
    assert.equal(await page.evaluate(()=>TowerFrontier.systems.GameAudio.active.size),0);await page.screenshot({path:path.join(out,'preview-mobile.png')});
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'render-report.json'),JSON.stringify({live,voices,results:report.results,order:report.samples.map(s=>s.key),comparisonOrder,characterOrders,remainingOrder,errors},null,2));
    console.log(`PASS: ${report.results.length} production cues rendered with finite, non-silent, unclipped samples; live mute releases all voices; preview and audition.wav ready.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
