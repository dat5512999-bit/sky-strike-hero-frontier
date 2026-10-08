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
        if(tick%10===0)A.skill({classType:'bull'},'f');
        cpuMs+=performance.now()-start;maxVoices=Math.max(maxVoices,A.active.size);await new Promise(resolve=>setTimeout(resolve,20));
      }
      L.setEnabled(false);return {during,after:A.active.size,settings:!!document.querySelector('#td-audio-volume'),attempts:3600,maxVoices,cpuMs};
    });
    assert(live.during>0);assert.equal(live.after,0);assert(live.settings);
    assert(live.maxVoices<=12);
    const report=await page.evaluate(async()=>{
      const {GameAudio:A,AudioCatalog:C,HeroRoster:R}=TowerFrontier.systems,all=[];
      for(const id of Object.keys(R.CLASSES))for(const slot of ['q','w','e','f'])all.push(C.skill(id,slot));
      for(const id of Object.keys(C.events))all.push(C.event(id));
      for(const [id,layers] of Object.entries(C.families))all.push({key:'family:'+id,layers});
      const results=[],samples=[];
      for(const cue of all){
        A.stop();const ctx=new OfflineAudioContext(1,44100*2,44100);A.context=ctx;const dest=A.graph();
        for(const layer of cue.layers)A.voice(layer,dest,cue.priority||0,1);
        const buffer=await ctx.startRendering(),data=buffer.getChannelData(0);let peak=0,sum=0,invalid=0;
        for(const sample of data){if(!Number.isFinite(sample))invalid++;peak=Math.max(peak,Math.abs(sample));sum+=sample*sample;}
        results.push({key:cue.key,peak,rms:Math.sqrt(sum/data.length),invalid,remaining:A.active.size});
        if(['skill:frostland:q','skill:naga:w','skill:goblin:f','skill:bull:f','event:victory'].includes(cue.key))samples.push({key:cue.key,data:Array.from(data)});
      }
      return {results,samples};
    });
    for(const row of report.results){assert(row.peak>.0001&&row.peak<.99,JSON.stringify(row));assert.equal(row.invalid,0);assert.equal(row.remaining,0);}
    // A WAV audition reel is generated from the exact production synthesizer.
    const values=report.samples.flatMap(s=>s.data),wav=Buffer.alloc(44+values.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(44100,24);wav.writeUInt32LE(88200,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(values.length*2,40);values.forEach((v,i)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*2));fs.writeFileSync(path.join(out,'audition.wav'),wav);
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'render-report.json'),JSON.stringify({live,results:report.results,order:report.samples.map(s=>s.key),errors},null,2));
    await page.goto('http://127.0.0.1:4177/audio-preview.html');await page.getByRole('button',{name:'Q 潮門突刺',exact:true}).click();await page.screenshot({path:path.join(out,'preview.png')});
    console.log(`PASS: ${report.results.length} production cues rendered with finite, non-silent, unclipped samples; live mute releases all voices; preview and audition.wav ready.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
