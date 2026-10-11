(function(ns){
  'use strict';
  // Local AI-voice assets use the user-approved rough-v2 sound; see asset manifest for provenance.
  const catalog={bull:{
    select:{text:'這條防線，交給我。',src:'assets/audio/voices/bull/select-v1.wav'},
    q:{text:'短促發力聲',src:'assets/audio/voices/bull/q-v1.wav'},
    w:{text:'休想越過！',src:'assets/audio/voices/bull/w-v1.wav'},
    e:{text:'還沒結束！',src:'assets/audio/voices/bull/e-v1.wav'},
    f:{text:'接下這一槌！',src:'assets/audio/voices/bull/f-v1.wav'}
  }};
  class HeroVoice{
    static catalog=catalog;
    static volume=.7;
    static enabled=true;
    static cache=new Map();
    static last=new Map();
    static sequence=0;
    static active=null;
    static pending=null;
    static cooldownUntil=0;
    static cue(hero,slot){return this.catalog[hero]?.[slot]||null;}
    static available(hero,slot){return /^assets\/audio\/voices\/[a-z0-9_/-]+\.(mp3|wav|m4a|ogg)$/.test(this.cue(hero,slot)?.src||'');}
    static setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));if(!this.volume)this.stop();else if(this.active)this.active.gain.gain.value=this.volume*.8;this.save();}
    static save(){try{globalThis.localStorage?.setItem('heroFrontierVoiceV1',JSON.stringify({volume:this.volume,enabled:this.enabled}));}catch(_){} }
    static load(){try{const p=JSON.parse(globalThis.localStorage?.getItem('heroFrontierVoiceV1')||'null');if(Number.isFinite(p?.volume))this.volume=Math.max(0,Math.min(1,p.volume));if(typeof p?.enabled==='boolean')this.enabled=p.enabled;}catch(_){} }
    static stop(){this.sequence++;this.pending=null;if(this.active)this.active.cancel();}
    static async play(hero,slot,{preview=false}={}){
      const A=ns.systems.GameAudio,ctx=A?.context,priority=slot==='f'?2:1,key=hero+':'+slot;
      if(!this.available(hero,slot)||!this.enabled||!this.volume||!A?.enabled||!ctx||ctx.state!=='running'||globalThis.document?.hidden)return false;
      const now=ctx.currentTime;
      if(!preview&&now-(this.last.get(key)??-100)<(slot==='f'?25:slot==='select'?8:12))return false;
      if(!preview&&((this.active||this.pending)&&priority<=Math.max(this.active?.priority||0,this.pending?.priority||0)||priority<2&&now<this.cooldownUntil))return false;
      this.stop();const ticket=this.sequence;this.pending={priority};
      try{
        const src=this.cue(hero,slot).src;
        if(!this.cache.has(src)){
          // Bound network time/size; cancel late arrivals on mute, pause, navigation or priority changes.
          const promise=(async()=>{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);try{const response=await fetch(src,{signal:controller.signal});if(!response.ok)throw Error('voice unavailable');const bytes=await response.arrayBuffer();if(bytes.byteLength>2*1024*1024)throw Error('voice too large');const decoded=await ctx.decodeAudioData(bytes);if(!(decoded.duration>0&&decoded.duration<=8))throw Error('voice duration');return decoded;}finally{clearTimeout(timeout);}})();
          this.cache.set(src,promise);promise.catch(()=>{if(this.cache.get(src)===promise)this.cache.delete(src);});
        }
        const buffer=await this.cache.get(src);
        if(ticket!==this.sequence||A.context!==ctx||ctx.state!=='running'||!A.enabled||!this.enabled||!this.volume||globalThis.document?.hidden)return false;
        const source=ctx.createBufferSource();let gain;
        try{gain=ctx.createGain();}catch(error){try{source.disconnect();}catch(_){}throw error;}
        let done=false;
        const entry={priority,gain,cancel:()=>{if(done)return;done=true;try{source.stop();}catch(_){}try{source.disconnect();gain.disconnect();}catch(_){}if(this.active===entry){this.active=null;A.duckEffects(false);}}};
        this.active=entry;
        try{source.buffer=buffer;gain.gain.value=this.volume*.8;source.connect(gain);gain.connect(A.graph());source.onended=entry.cancel;A.duckEffects(true);source.start();}
        catch(error){entry.cancel();throw error;}
        if(!preview){this.last.set(key,ctx.currentTime);this.cooldownUntil=ctx.currentTime+Math.max(12,buffer.duration+3);}return true;
      }catch(_){return false;}
      finally{if(ticket===this.sequence)this.pending=null;}
    }
  }
  ns.systems.HeroVoice=HeroVoice;
})(globalThis.TowerFrontier);
