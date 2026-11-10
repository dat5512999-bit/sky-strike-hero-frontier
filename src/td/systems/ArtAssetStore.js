(function(ns){
  'use strict';
  // Stable Image handles keep all existing atlas references valid after eviction.
  // Reading ready or explicitly requesting a handle starts its bounded load.
  class ArtAssetStore{
    constructor(options={}){
      this.records=new Map();this.queue=[];this.active=0;this.bytes=0;this.scene=0;
      this.limit=options.limit||4;this.budget=options.budget||128*1024*1024;
      this.now=options.now||(()=>globalThis.performance?.now?.()??Date.now());
      this.createImage=options.createImage||(()=>new Image());
      this.setTimer=options.setTimer||((fn,ms)=>setTimeout(fn,ms));
      this.clearTimer=options.clearTimer||(id=>clearTimeout(id));
      this.lastTrim=0;this.onChange=null;this.onError=null;
    }
    image(path){
      if(this.records.has(path))return this.records.get(path).image;
      const image=this.createImage(),record={image,path,ready:false,token:0,bytes:0,used:this.now(),timer:null,retry:null};
      image.assetSrc=path;image.failed=false;record.loading=false;image.queued=false;image.attempts=0;
      Object.defineProperty(image,'ready',{configurable:true,get:()=>{this.request(image);return record.ready;},set:value=>{record.ready=Boolean(value);}});
      this.records.set(path,record);return image;
    }
    request(image){
      const record=this.records.get(image?.assetSrc);if(!record||record.image!==image)return;
      record.used=this.now();record.scene=this.scene;
      if(record.ready||image.failed||record.loading||image.queued||record.retry!==null)return;
      image.queued=true;this.queue.push(record);this.pump();
    }
    pump(){
      while(this.active<this.limit&&this.queue.length){
        const record=this.queue.shift(),image=record.image;if(!image.queued)continue;
        image.queued=false;record.loading=true;image.attempts++;this.active++;
        const token=++record.token;
        const finish=ok=>{
          if(record.token!==token||!record.loading)return;
          this.clearTimer(record.timer);record.timer=null;image.onload=null;image.onerror=null;
          record.loading=false;this.active--;record.ready=ok;
          if(ok){image.failed=false;record.bytes=(image.naturalWidth||image.width||0)*(image.naturalHeight||image.height||0)*4;this.bytes+=record.bytes;}
          else if(image.attempts<3){record.retry=this.setTimer(()=>{record.retry=null;this.request(image);},image.attempts*300);}
          else image.failed=true;
          this.changed();this.pump();
        };
        image.onload=()=>finish(true);image.onerror=()=>finish(false);
        record.timer=this.setTimer(()=>finish(false),20000);
        try{image.src=record.path+(image.attempts>1?(record.path.includes('?')?'&':'?')+'asset-retry='+image.attempts:'');}catch(_){finish(false);}
      }
    }
    changed(){
      if(this.changePending)return;this.changePending=true;
      Promise.resolve().then(()=>{this.changePending=false;try{this.onChange?.();}catch(error){this.onError?.(error);}});
    }
    release(record){
      const image=record.image;record.token++;
      if(record.timer!==null)this.clearTimer(record.timer);
      if(record.retry!==null)this.clearTimer(record.retry);
      record.timer=null;record.retry=null;
      if(record.loading)this.active--;
      image.onload=null;image.onerror=null;record.loading=false;image.queued=false;image.failed=false;image.attempts=0;
      this.bytes=Math.max(0,this.bytes-record.bytes);record.bytes=0;record.ready=false;
      image.removeAttribute?.('src');
    }
    advanceScene(){
      this.scene++;
      for(const record of this.records.values())if(record.scene!==this.scene&&(record.loading||record.image.queued||record.retry!==null))this.release(record);
      this.queue=this.queue.filter(r=>r.image.queued);this.pump();
    }
    trim(force=false){
      const now=this.now();if(!force&&now-this.lastTrim<1000)return;this.lastTrim=now;
      // Recently drawn/preloaded assets are protected. The budget is deliberately
      // soft when a live army itself needs more; evicting it would cause thrashing.
      const idle=[...this.records.values()].filter(r=>r.scene!==this.scene||now-r.used>5000).sort((a,b)=>a.used-b.used);
      for(const record of idle){
        if(record.ready&&(this.bytes>this.budget||now-record.used>30000))this.release(record);
        else if((record.image.queued||record.loading||record.retry!==null)&&now-record.used>30000)this.release(record);
      }
      this.queue=this.queue.filter(r=>r.image.queued);this.pump();
    }
    retryFailed(){for(const r of this.records.values())if(r.image.failed){r.image.failed=false;r.image.attempts=0;this.request(r.image);}}
    stats(){return {handles:this.records.size,ready:[...this.records.values()].filter(r=>r.ready).length,active:this.active,queued:this.queue.filter(r=>r.image.queued).length,rgbaBytes:this.bytes,budget:this.budget};}
  }
  ns.systems.ArtAssetStore=ArtAssetStore;
})(globalThis.TowerFrontier);
