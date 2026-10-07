(function(ns){
  'use strict';
  // Short procedural combat cues: unlock on user input, never allocate unbounded voices.
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
      const tones={freeze:[940,380,.16],shatter:[210,60,.23],chain:[690,270,.12],hunt:[180,360,.32],winter:[110,440,.65],spear:[440,100,.12],
        'impact-pierce':[310,120,.055,'triangle'],'impact-magic':[660,260,.085,'sine'],'impact-heavy':[130,58,.12,'triangle'],'impact-shield':[480,180,.11,'square'],'impact-immune':[790,640,.07,'sine'],
        'attack-hunter':[420,140,.10,'triangle'],'attack-arcanist':[760,310,.15,'sine'],'attack-rogue':[250,560,.085,'triangle'],
        'attack-chief':[180,65,.16,'triangle'],'attack-goblin':[520,175,.10,'square'],'attack-naga':[570,180,.14,'sine'],
        'attack-frostland':[490,160,.13,'triangle'],'attack-dwarf':[165,75,.17,'triangle'],'attack-dragonkin':[850,230,.12,'sawtooth'],
        'attack-egypt':[630,230,.11,'triangle'],'attack-bull':[145,55,.20,'triangle']};
      const tone=tones[type];if(!tone)return false;
      const now=ctx.currentTime;this.last||={};if(now-(this.last[type]??-10)<(type.startsWith('impact-')?.18:.1)||(this.voices||0)>=6)return false;
      this.last[type]=now;this.voices=(this.voices||0)+1;
      let o,g,released=false,started=false;
      const release=()=>{if(released)return;released=true;try{o?.disconnect();g?.disconnect();}catch(_){}this.voices=Math.max(0,this.voices-1);};
      try{
        o=ctx.createOscillator();g=ctx.createGain();o.type=tone[3]||(type==='shatter'?'triangle':'sine');o.frequency.setValueAtTime(tone[0],now);o.frequency.exponentialRampToValueAtTime(tone[1],now+tone[2]);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(type.startsWith('impact-')?.016:type.startsWith('attack-')?.022:.045,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+tone[2]);o.connect(g);g.connect(ctx.destination);o.onended=release;o.start(now);started=true;o.stop(now+tone[2]);return true;
      }catch(_){if(started)try{o.stop();}catch(_){}release();return false;}
    }
    static playAttack(heroClass){return this.play('attack-'+heroClass);}
    static playImpact(source,monster,damage){const type=damage<=0?'impact-immune':monster?.barrier>0?'impact-shield':source?.attackType==='pierce'?'impact-pierce':source?.attackType==='chaos'?'impact-heavy':'impact-magic';return this.play(type);}
    static init(){
      if(typeof document==='undefined')return;
      try{this.enabled=globalThis.localStorage?.getItem('heroFrontierFrostAudio')!=='false';}catch(_){this.enabled=true;}
      const button=document.getElementById('td-frost-audio');
      const render=()=>{if(button){button.textContent='戰鬥音效：'+(this.enabled?'開':'關');button.setAttribute('aria-pressed',String(this.enabled));}};
      if(button)button.onclick=()=>{this.setEnabled(!this.enabled);render();};render();
      document.addEventListener('pointerdown',()=>this.unlock(),{passive:true});document.addEventListener('keydown',()=>this.unlock());
    }
  }
  ns.systems.FrostlandAudio=FrostlandAudio;FrostlandAudio.init();
})(globalThis.TowerFrontier);
