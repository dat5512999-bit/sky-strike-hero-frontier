(function(ns){
  'use strict';
  const C=()=>ns.systems.AudioCatalog,clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
  class GameAudio{
    static context=null;
    static active=new Set();
    static last=new Map();
    static sourceTimes=new WeakMap();
    static volume=.55;
    static ambientVolume=.18;
    static ambientEnabled=true;
    static history=[];
    static get enabled(){return !!ns.systems.FrostlandAudio?.enabled;}
    static unlock(){
      if(!this.enabled)return;
      try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;this.context ||= new Audio();this.context.resume()?.catch(()=>{});}catch(_){}
    }
    static setVolume(value){this.volume=clamp(value);if(!this.volume)this.stop();this.save();}
    static save(){try{localStorage.setItem('heroFrontierAudioMixV1',JSON.stringify({volume:this.volume,ambientVolume:this.ambientVolume,ambientEnabled:this.ambientEnabled}));}catch(_){} }
    static load(){try{const data=JSON.parse(localStorage.getItem('heroFrontierAudioMixV1')||'null');if(data){if(Number.isFinite(data.volume))this.volume=clamp(data.volume);if(Number.isFinite(data.ambientVolume))this.ambientVolume=clamp(data.ambientVolume);if(typeof data.ambientEnabled==='boolean')this.ambientEnabled=data.ambientEnabled;}}catch(_){} }
    static graph(){
      const ctx=this.context;if(this.graphContext===ctx)return this.master;
      this.graphContext=ctx;this.noiseBuffer=null;this.last.clear();this.lastLow=-10;
      this.master=ctx.createGain();this.master.gain.value=.65;
      if(ctx.createDynamicsCompressor){const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-20;compressor.knee.value=18;compressor.ratio.value=5;this.master.connect(compressor);compressor.connect(ctx.destination);}
      else this.master.connect(ctx.destination);
      return this.master;
    }
    static buffer(){
      if(this.noiseBuffer)return this.noiseBuffer;
      const ctx=this.context,b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.8),ctx.sampleRate),data=b.getChannelData(0);let seed=173;
      for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
      return this.noiseBuffer=b;
    }
    static play(cue,options={}){
      const ctx=this.context;
      if(!cue||!this.enabled||!this.volume||!ctx||ctx.state!=='running'||globalThis.document?.hidden)return false;
      try{
        const destination=this.graph(),now=ctx.currentTime,priority=cue.priority||0;
        if(now-(this.last.get(cue.key)??-10)<(cue.gap||.1)||priority===0&&now-this.lastLow<.045)return false;
        const layers=cue.layers.slice(0,4),limit=priority<2?8:12;
        if(this.active.size+layers.length>limit&&priority>=2){for(const voice of [...this.active]){if(voice.priority<priority)voice.cancel();if(this.active.size+layers.length<=limit)break;}}
        if(this.active.size+layers.length>limit)return false;
        this.last.set(cue.key,now);if(priority===0)this.lastLow=now;
        let played=0;
        for(const layer of layers)if(this.voice(layer,destination,priority,options.level||1))played++;
        if(played){this.history.push({key:cue.key,at:now,voices:played});if(this.history.length>64)this.history.shift();}
        return played>0;
      }catch(_){return false;}
    }
    static voice(layer,destination,priority,level){
      const ctx=this.context,now=ctx.currentTime,start=now+(layer.at||0),duration=Math.max(.025,Math.min(2,layer.d||.1));let source,gain,filter,started=false,done=false;
      const entry={priority,cancel:()=>{if(started)try{source.stop();}catch(_){}release();}};
      const release=()=>{if(done)return;done=true;for(const node of [source,gain,filter])try{node?.disconnect();}catch(_){}this.active.delete(entry);};
      try{
        gain=ctx.createGain();
        if(layer.noise){source=ctx.createBufferSource();source.buffer=this.buffer();filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=layer.cut||1500;filter.Q.value=.7;source.connect(filter);filter.connect(gain);}
        else{source=ctx.createOscillator();source.type=layer.w||'sine';source.frequency.setValueAtTime(Math.max(25,layer.a||220),start);source.frequency.exponentialRampToValueAtTime(Math.max(25,layer.b||layer.a||220),start+duration);source.connect(gain);}
        gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,(layer.level||.1)*this.volume*level),start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);gain.connect(destination);
        this.active.add(entry);source.onended=release;source.start(start);started=true;source.stop(start+duration+.015);return true;
      }catch(_){entry.cancel();return false;}
    }
    static event(name){return this.play(C().event(name));}
    static skill(hero,slot){return this.play(C().skill(hero.classType,slot));}
    static projectile(shot){
      if(!this.enabled||!this.volume||!this.context||this.context.state!=='running')return false;
      try{
        const source=shot.owner,actor=source?.kind?source:source?.form?{kind:'summon',type:source.form,active:source.active,config:()=>source}:null;
        if(!actor||!['unit','building','summon'].includes(actor.kind)||actor.active===false||source.retired||!shot.target?.active)return false;
        const now=this.context.currentTime;if(now-(this.sourceTimes.get(source)??-10)<.08)return false;
        this.sourceTimes.set(source,now);return this.play(C().attack(actor,shot));
      }catch(_){return false;}
    }
    static legacy(type){
      const hero=type.startsWith('attack-')?type.slice(7):null;
      if(hero){const id=C().identities[hero];return id?this.play({key:type,layers:[{a:id[0],b:id[0]*.35,d:.14,w:id[1],level:.11}],priority:0,gap:.1}):false;}
      const family={freeze:'ice',shatter:'ice',chain:'lightning',hunt:'support',winter:'ice',spear:'arrow','impact-pierce':'blade','impact-magic':'arcane','impact-heavy':'stone','impact-shield':'stone','impact-immune':'support'}[type];
      return family?this.play({key:type,layers:C().families[family],priority:0,gap:.2},{level:type.startsWith('impact-')?.3:.55}):false;
    }
    static stopAmbient(){if(!this.ambient)return;for(const n of this.ambient.nodes){try{n.stop?.();n.disconnect();}catch(_){}}this.ambient=null;}
    static stop(){for(const voice of [...this.active])voice.cancel();this.stopAmbient();}
    static sync(game){
      const running=this.enabled&&this.volume>0&&this.ambientEnabled&&this.ambientVolume>0&&this.context?.state==='running'&&!globalThis.document?.hidden&&game?.profession?.selected&&game.status==='playing'&&!game.paused&&(!game.app||game.app.root.hidden)&&game.ui?.professionScreen?.hidden;
      if(!running){this.stopAmbient();return;}
      const kind=C().ambience(ns.config.mapId);
      if(this.ambient?.kind===kind){this.ambient.gain.gain.value=this.ambientVolume*this.volume*.12;return;}
      this.stopAmbient();let source,filter,gain;
      try{const ctx=this.context,dest=this.graph();source=ctx.createBufferSource();source.buffer=this.buffer();source.loop=true;filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value={wind:750,surf:1200,embers:480,woodland:2200}[kind];gain=ctx.createGain();gain.gain.value=this.ambientVolume*this.volume*.12;source.connect(filter);filter.connect(gain);gain.connect(dest);source.start();this.ambient={kind,gain,nodes:[source,filter,gain]};}
      catch(_){for(const node of [source,filter,gain])try{node?.stop?.();node?.disconnect();}catch(_){} }
    }
  }
  ns.systems.GameAudio=GameAudio;
})(globalThis.TowerFrontier);
