(function(ns){
  'use strict';
  // Original procedural textures, not sampled recordings. Isolated from the approved bull bank.
  const profiles={rivet:.28,ratchet:.58,steam:.95,motor:1.2,splash:.48,current:1.25,conch:.9,breaker:1.35,
    bow:.32,wood:.44,blade:.34,veil:.8,leaves:.65,crystal:.85,frost:1.2,arcane:1.15,drum:.7,horn:1.05,steel:.8,flame:1.15,thunder:1.35,sand:.95};
  class CharacterAudioMaterials{
    static profiles=profiles;
    static contexts=new WeakMap();
    static buffer(ctx,name,variant=0){
      if(!Object.hasOwn(profiles,name))return null;
      variant=Number.isFinite(variant)?Math.abs(Math.floor(variant))%3:0;
      let cache=this.contexts.get(ctx);if(!cache){cache=new Map();this.contexts.set(ctx,cache);}
      const key=name+':'+variant;if(cache.has(key))return cache.get(key);
      const seconds=profiles[name],rate=ctx.sampleRate,buffer=ctx.createBuffer(1,Math.ceil(rate*seconds),rate),data=buffer.getChannelData(0);
      const pitch=1+(variant-1)*.025,cut=1-Math.exp(-2*Math.PI*1400/rate),deepCut=1-Math.exp(-2*Math.PI*160/rate);
      let seed=3319+variant*811,low=0,deep=0,peak=0;
      for(let i=0;i<data.length;i++){
        const t=i/rate,x=t/seconds,p=2*Math.PI*t*pitch;
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;
        const white=seed/2147483648-1;low+=cut*(white-low);deep+=deepCut*(white-deep);
        const hiss=white-low,attack=1-Math.exp(-t*240);let v=0;
        if(name==='rivet')v=(hiss*.7+low*.4)*Math.exp(-t*45)+Math.sin(p*105)*Math.exp(-t*32)*.7+(Math.sin(p*790)+Math.sin(p*1317)*.4)*Math.exp(-t*26)*.14;
        else if(name==='ratchet'){
          const pulse=(t*19)%1,gate=Math.exp(-pulse*16),tail=Math.exp(-x*3);
          v=(hiss*.65+Math.sin(p*463)*.18+Math.sin(p*1289)*.1)*gate*tail+deep*.2*tail;
        }else if(name==='steam')v=(hiss*.2+low*.9)*(1-Math.exp(-t*70))*Math.exp(-x*4.5)*(1+.18*Math.sin(p*27));
        else if(name==='motor'){
          const spin=2*Math.PI*(48*t+65*t*t)*pitch,gate=.3+.7*Math.pow(Math.max(0,Math.sin(spin)),4);
          v=(low*.8+hiss*.15)*gate*Math.pow(Math.sin(Math.PI*x),.6)+(Math.sin(spin)+.3*Math.sin(spin*3))*Math.exp(-x*2)*.16;
        }else if(name==='splash'){
          const drops=Math.pow(Math.max(0,Math.sin(p*31+Math.sin(p*9)*2)),8);
          v=low*Math.exp(-x*5)*1.3+hiss*drops*Math.exp(-x*4)*.22+deep*Math.exp(-x*4)*.5;
        }else if(name==='current')v=(low*.8+deep*1.5)*Math.pow(Math.sin(Math.PI*x),.8)*(.45+.55*Math.pow(Math.sin(p*2.6),2));
        else if(name==='conch')v=(Math.sin(p*172)+.32*Math.sin(p*347)+.15*Math.sin(p*519)+low*.25)*(1-Math.exp(-t*18))*Math.exp(-x*4)*.55;
        else if(name==='breaker'){
          const swell=Math.exp(-Math.pow((x-.19)*8,2)),foam=Math.exp(-x*3.5)*(.5+.5*Math.pow(Math.sin(p*19),2));
          v=deep*2.5*swell+low*foam*.9+hiss*foam*.12+Math.sin(p*57)*swell*.18;
        }else if(name==='bow')v=(Math.sin(p*186)+.45*Math.sin(p*397)+.15*Math.sin(p*731))*Math.exp(-t*29)*.45+hiss*Math.exp(-t*55)*.4;
        else if(name==='wood')v=(Math.sin(p*119)+.6*Math.sin(p*293)+.3*Math.sin(p*613))*Math.exp(-t*34)*.4+low*Math.exp(-t*26)*.55;
        else if(name==='blade')v=(hiss*.65+low*.32)*Math.pow(Math.sin(Math.PI*x),1.4)*Math.exp(-x*2)+(Math.sin(p*1163)+.4*Math.sin(p*1879))*Math.exp(-t*38)*.07;
        else if(name==='veil')v=(deep*1.7+low*.2)*Math.pow(Math.sin(Math.PI*x),2)*(.7+.3*Math.sin(p*11))+hiss*.025*Math.exp(-x*4);
        else if(name==='leaves')v=(hiss*.5+low*.3)*(.15+Math.pow(Math.max(0,Math.sin(p*23+Math.sin(p*7))),8))*Math.exp(-x*3);
        else if(name==='crystal')v=(Math.sin(p*1643)*Math.exp(-t*9)+.5*Math.sin(p*2371)*Math.exp(-t*14)+.3*Math.sin(p*3023)*Math.exp(-t*18))*.25+hiss*Math.exp(-t*60)*.5;
        else if(name==='frost')v=(hiss*.65+low*.2)*Math.pow(Math.sin(Math.PI*x),.7)*(.15+Math.pow(Math.max(0,Math.sin(p*47+Math.sin(p*13)*2)),10));
        else if(name==='arcane')v=((Math.sin(p*313)+.45*Math.sin(p*527)+.25*Math.sin(p*887))*.16+low*.2)*Math.pow(Math.sin(Math.PI*x),1.6)*(.8+.2*Math.sin(p*6));
        else if(name==='drum')v=(Math.sin(p*73)*Math.exp(-t*9)+.25*Math.sin(p*131)*Math.exp(-t*14))*.8+low*Math.exp(-t*35)*.45;
        else if(name==='horn')v=(Math.sin(p*103)+.4*Math.sin(p*207)+.2*Math.sin(p*311)+low*.16)*Math.pow(Math.sin(Math.PI*x),.8)*.4;
        else if(name==='steel')v=(Math.sin(p*287)*Math.exp(-t*8)+.5*Math.sin(p*739)*Math.exp(-t*12)+.2*Math.sin(p*1421)*Math.exp(-t*19))*.5+hiss*Math.exp(-t*70)*.45;
        else if(name==='flame')v=(low*1.1+deep*.8)*Math.pow(Math.sin(Math.PI*x),.5)*(.4+.6*Math.pow(Math.sin(p*8),2))+hiss*Math.pow(Math.max(0,Math.sin(p*67)),28)*Math.exp(-x*3)*.2;
        else if(name==='thunder')v=(hiss*.5+low*.8)*Math.exp(-t*65)+deep*2.2*Math.exp(-x*3)*(.3+.7*Math.pow(Math.sin(p*4),2));
        else if(name==='sand')v=(hiss*.55+low*.35)*Math.pow(Math.sin(Math.PI*x),.8)*(.2+.8*Math.pow(Math.max(0,Math.sin(p*83+Math.sin(p*17)*3)),14));
        data[i]=v*attack*Math.min(1,(data.length-1-i)/(rate*.018));peak=Math.max(peak,Math.abs(data[i]));
      }
      if(peak>0)for(let i=0;i<data.length;i++)data[i]=data[i]/peak*.8;
      cache.set(key,buffer);return buffer;
    }
  }
  ns.systems.CharacterAudioMaterials=CharacterAudioMaterials;
})(globalThis.TowerFrontier);
