(function(ns){
  'use strict';
  // Short procedural cues: no remote media, autoplay, or unbounded voice allocation.
  class FrostlandAudio {
    static enabled=false;
    static setEnabled(enabled){
      this.enabled=Boolean(enabled);
      try{globalThis.localStorage?.setItem('heroFrontierFrostAudio',String(this.enabled));}catch(_){}
      if(this.enabled)this.unlock();
      return this.enabled;
    }
    static unlock(){
      if(!this.enabled)return;
      try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;this.context||=new Audio();this.context.resume()?.catch(()=>{});}catch(_){}
    }
    static play(type){
      const ctx=this.context;if(!this.enabled||!ctx||ctx.state!=='running')return false;
      const tones={freeze:[940,380,.16],shatter:[210,60,.23],chain:[690,270,.12],hunt:[180,360,.32],winter:[110,440,.65],spear:[440,100,.12]};
      const tone=tones[type];if(!tone)return false;
      const now=ctx.currentTime;this.last||={};if(now-(this.last[type]??-10)<.1||(this.voices||0)>=6)return false;
      this.last[type]=now;this.voices=(this.voices||0)+1;
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=type==='shatter'?'triangle':'sine';o.frequency.setValueAtTime(tone[0],now);o.frequency.exponentialRampToValueAtTime(tone[1],now+tone[2]);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.045,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+tone[2]);o.connect(g);g.connect(ctx.destination);o.onended=()=>{o.disconnect();g.disconnect();this.voices=Math.max(0,this.voices-1);};o.start(now);o.stop(now+tone[2]);return true;
    }
    static init(){
      if(typeof document==='undefined')return;
      try{this.enabled=globalThis.localStorage?.getItem('heroFrontierFrostAudio')==='true';}catch(_){}
      const button=document.getElementById('td-frost-audio');
      const render=()=>{if(button){button.textContent='冰原戰鬥音效：'+(this.enabled?'開':'關');button.setAttribute('aria-pressed',String(this.enabled));}};
      if(button)button.onclick=()=>{this.setEnabled(!this.enabled);render();};render();
      document.addEventListener('pointerdown',()=>this.unlock(),{passive:true});document.addEventListener('keydown',()=>this.unlock());
    }
  }
  ns.systems.FrostlandAudio=FrostlandAudio;FrostlandAudio.init();
})(globalThis.TowerFrontier);
