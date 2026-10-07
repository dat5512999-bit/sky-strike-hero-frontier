(function(ns){
  'use strict';
  // Original, lightweight score motifs. MIDI pitches make their harmony explicit
  // and avoid downloading licensed tracks or running a music loop during battle.
  const THEMES=Object.freeze({
    wonder:{label:'探索',bpm:76,chords:[[48,52,55],[53,57,60],[45,48,52],[43,47,50]],melody:[67,null,69,72,71,null,69,67,64,null,67,69,72,null,69,67],wave:'sine',filter:3200},
    mystery:{label:'謎團',bpm:72,chords:[[48,51,55],[44,48,51],[53,56,60],[43,46,50]],melody:[67,null,null,66,63,null,62,null,60,null,63,65,62,null,60,null],wave:'triangle',filter:1800},
    unease:{label:'不安',bpm:78,chords:[[50,53,57],[46,50,53],[43,46,50],[45,49,52]],melody:[69,null,68,null,65,null,64,null,62,null,65,null,68,null,65,null],wave:'triangle',filter:1600},
    sorrow:{label:'低迴',bpm:64,chords:[[45,48,52],[41,45,48],[48,52,55],[43,47,50]],melody:[64,null,null,62,60,null,null,57,59,null,60,null,62,null,59,null],wave:'sine',filter:2200},
    tension:{label:'緊張',bpm:126,chords:[[50,53,57],[51,54,58],[46,50,53],[45,49,52]],melody:[62,65,62,68,62,65,62,69,63,66,63,70,61,64,61,68],wave:'triangle',filter:1400},
    resolve:{label:'決心',bpm:94,chords:[[50,53,57],[46,50,53],[53,57,60],[48,52,55]],melody:[69,null,72,74,72,null,69,67,65,null,69,72,74,null,72,69],wave:'triangle',filter:2600},
    heroic:{label:'振奮',bpm:112,chords:[[50,53,57],[46,50,53],[53,57,60],[48,52,55]],melody:[74,null,72,69,74,null,77,76,74,null,72,69,72,null,74,77],wave:'sawtooth',filter:2000},
    hope:{label:'希望',bpm:88,chords:[[53,57,60],[48,52,55],[50,53,57],[46,50,53]],melody:[69,null,72,76,74,null,72,69,67,null,69,72,74,null,72,69],wave:'sine',filter:3000},
    joy:{label:'欣喜',bpm:106,chords:[[48,52,55],[43,47,50],[45,48,52],[41,45,48]],melody:[72,76,79,null,76,74,72,null,69,72,76,null,74,72,67,null],wave:'triangle',filter:3500}
  });
  class StoryMusic{
    static STORAGE_KEY='heroFrontierStoryMusic';
    static THEMES=THEMES;
    static label(mood){return THEMES[mood]?.label||'劇情';}
    constructor(){
      try{this.enabled=globalThis.localStorage?.getItem(StoryMusic.STORAGE_KEY)!=='false';}catch(_){this.enabled=true;}
      this.context=null;this.master=null;this.current=null;this.timer=null;this.mood=null;this.generation=0;this.voices=0;
      if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)this._halt();else if(this.mood&&this.enabled)this.play(this.mood);});
    }
    setEnabled(value){
      this.enabled=Boolean(value);
      try{globalThis.localStorage?.setItem(StoryMusic.STORAGE_KEY,String(this.enabled));}catch(_){}
      if(!this.enabled)this.stop();
      return this.enabled;
    }
    play(mood){
      if(!THEMES[mood])return false;
      this.mood=mood;
      if(!this.enabled||typeof document!=='undefined'&&document.hidden)return false;
      if(this.current?.mood===mood&&this.timer)return true;
      const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(!Audio)return false;
      try{
        if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=.65;this.master.connect(this.context.destination);}
        const ticket=++this.generation,ctx=this.context;
        if(ctx.state==='running')this._start(mood,ticket);
        else ctx.resume().then(()=>{if(ticket===this.generation&&this.enabled&&this.mood===mood)this._start(mood,ticket);}).catch(()=>{});
        return true;
      }catch(_){return false;}
    }
    _start(mood,ticket){
      if(ticket!==this.generation||this.current?.mood===mood&&this.timer)return;
      this._halt();
      const ctx=this.context,theme=THEMES[mood],now=ctx.currentTime;
      const bus=ctx.createGain(),filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=theme.filter;
      filter.connect(bus);bus.connect(this.master);bus.gain.setValueAtTime(0,now);bus.gain.linearRampToValueAtTime(1,now+.55);
      this.current={mood,theme,bus,filter,startedAt:now,step:0,next:now+.03};
      this._schedule();this.timer=globalThis.setInterval(()=>{try{this._schedule();}catch(_){this.stop();}},80);
    }
    _note(pitch,at,duration,wave,level,filter){
      if(this.voices>=24)return;
      const ctx=this.context,end=at+duration;let osc,gain,started=false,released=false,counted=false;
      const release=()=>{if(released)return;released=true;try{osc?.disconnect();gain?.disconnect();}catch(_){}if(counted)this.voices=Math.max(0,this.voices-1);};
      try{
        osc=ctx.createOscillator();gain=ctx.createGain();osc.type=wave;osc.frequency.value=440*Math.pow(2,(pitch-69)/12);
        const attack=wave==='sine'?.08:.025;
        gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(level,at+Math.min(attack,duration*.3));gain.gain.exponentialRampToValueAtTime(.0001,end);
        osc.connect(gain);gain.connect(filter);
        this.voices++;counted=true;osc.onended=release;osc.start(at);started=true;osc.stop(end+.02);
      }catch(_){if(started)try{osc.stop();}catch(_){}release();return;}
    }
    _schedule(){
      const track=this.current,ctx=this.context;if(!track||!ctx||ctx.state!=='running')return;
      const stepTime=30/track.theme.bpm;
      if(track.next<ctx.currentTime-.4)track.next=ctx.currentTime+.03;
      while(track.next<ctx.currentTime+.22){
        const i=track.step%16,chord=track.theme.chords[Math.floor(i/4)];
        if(i%4===0){
          for(const pitch of chord)this._note(pitch,track.next,stepTime*4.25,'sine',.05,track.filter);
          this._note(chord[0]-12,track.next,stepTime*(track.mood==='tension'?1.3:3.1),'triangle',track.mood==='heroic'?.11:.085,track.filter);
        }else if((track.mood==='tension'||track.mood==='heroic')&&i%2===0)this._note(chord[0]-12,track.next,stepTime*.7,'triangle',.06,track.filter);
        const lead=track.theme.melody[i];if(lead!==null)this._note(lead,track.next,stepTime*(track.mood==='tension'?.72:1.45),track.theme.wave,track.mood==='heroic'?.07:.055,track.filter);
        track.step++;track.next+=stepTime;
      }
    }
    _halt(){
      if(this.timer){globalThis.clearInterval(this.timer);this.timer=null;}
      const old=this.current;this.current=null;if(!old)return;
      const now=this.context.currentTime,gain=old.bus.gain;
      if(typeof gain.cancelAndHoldAtTime==='function')gain.cancelAndHoldAtTime(now);
      else{gain.cancelScheduledValues(now);gain.setValueAtTime(Math.min(1,Math.max(0,(now-old.startedAt)/.55)),now);}
      gain.linearRampToValueAtTime(0,now+.38);
      globalThis.setTimeout(()=>{old.filter.disconnect();old.bus.disconnect();},550);
    }
    stop(){this.mood=null;this.generation++;this._halt();}
  }
  ns.systems.StoryMusic=StoryMusic;
})(globalThis.TowerFrontier);
