(function(ns){
  'use strict';
  // Original, deterministic material synthesis. No recordings or human voice are implied.
  // Render short buffers once per context; combat only schedules cached samples.
  const profiles={
    swing:{seconds:.32,cut:950,body:0,metal:0,noise:.8},
    iron:{seconds:.62,cut:2700,body:.12,metal:.7,noise:.18},
    impact:{seconds:.72,cut:470,body:.75,metal:.12,noise:.5},
    rubble:{seconds:1.15,cut:1800,body:.12,metal:.05,noise:.7},
    pressure:{seconds:1.3,cut:340,body:.35,metal:.14,noise:.65},
    resolve:{seconds:1.0,cut:680,body:.4,metal:.3,noise:.45}
  };
  class BullAudioMaterials{
    static profiles=profiles;
    static contexts=new WeakMap();
    static buffer(ctx,name,variant=0){
      const p=profiles[name];if(!p)return null;
      let cache=this.contexts.get(ctx);if(!cache){cache=new Map();this.contexts.set(ctx,cache);}
      variant=Math.abs(Math.floor(variant))%3;
      const key=name+':'+variant;if(cache.has(key))return cache.get(key);
      const rate=ctx.sampleRate,buffer=ctx.createBuffer(1,Math.ceil(p.seconds*rate),rate),data=buffer.getChannelData(0);
      let seed=1879+variant*193,low=0,previous=0,peak=0;
      const smoothing=1-Math.exp(-2*Math.PI*p.cut/rate),pitch=1+(variant-1)*.035;
      for(let i=0;i<data.length;i++){
        const t=i/rate,x=t/p.seconds;
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;
        const white=seed/2147483648-1;low+=smoothing*(white-low);
        const grit=white-previous;previous=white;
        const attack=1-Math.exp(-t*350),tail=Math.exp(-x*6.5);
        const phase=t*2*Math.PI*pitch,modulation=Math.sin(t*23)*.025;
        const body=p.body?(Math.sin(phase*63)+.38*Math.sin(phase*101))*Math.exp(-t*10):0;
        const metal=p.metal?(Math.sin(phase*211+modulation)*Math.exp(-t*5)+Math.sin(phase*337+modulation)*Math.exp(-t*8)/2+Math.sin(phase*593+modulation)*Math.exp(-t*11)/3+Math.sin(phase*977+modulation)*Math.exp(-t*14)/4):0;
        let texture=low;
        if(name==='swing')texture*=Math.pow(Math.sin(Math.PI*x),2)*3;
        if(name==='rubble')texture=low*(.3+Math.pow(Math.max(0,Math.sin(t*91+Math.sin(t*37)*3)),12)*2)+grit*.08;
        if(name==='pressure')texture*=.3+.7*Math.pow(Math.sin(t*13),2);
        const envelope=name==='swing'?1:attack*tail;
        data[i]=(p.noise*texture*envelope+p.body*body*attack+p.metal*metal*attack)*Math.min(1,(1-x)*60);
        peak=Math.max(peak,Math.abs(data[i]));
      }
      if(peak>0)for(let i=0;i<data.length;i++)data[i]=data[i]/peak*.85;
      cache.set(key,buffer);return buffer;
    }
    static warm(ctx){for(const name of Object.keys(profiles))for(let variant=0;variant<3;variant++)this.buffer(ctx,name,variant);}
  }
  ns.systems.BullAudioMaterials=BullAudioMaterials;
})(globalThis.TowerFrontier);
