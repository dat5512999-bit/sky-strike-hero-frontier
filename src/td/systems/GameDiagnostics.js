(function(ns){
  'use strict';
  const KEY='heroFrontierDiagnosticsV1',MAX_CHARS=32768,MAX_SESSIONS=3,MAX_EVENTS=64;
  const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_.-]{1,80}$/.test(value)?value:'';
  const number=(value,max=1e9)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
  const errors=new Set(['Error','TypeError','RangeError','ReferenceError','SyntaxError','IndexSizeError','InvalidStateError','SecurityError','QuotaExceededError','AbortError','NetworkError']);
  const EVENTS=new Set(['boot','action','wave-start','runtime-fault','uncaught-error','unhandled-rejection','asset-failed','hidden','visible','pagehide','pageshow','resume','rotation','canvas-lost','canvas-restored']);
  function state(raw={}){
    const out={screen:id(raw.screen),hero:id(raw.hero),faction:id(raw.faction),map:id(raw.map),wave:number(raw.wave,10000),wavePhase:id(raw.wavePhase),status:id(raw.status),paused:Boolean(raw.paused),hidden:Boolean(raw.hidden),speed:number(raw.speed,3),fault:id(raw.fault)};
    out.counts={};for(const key of ['army','monsters','projectiles','effects'])out.counts[key]=number(raw.counts?.[key],100000);
    out.art={};for(const key of ['ready','active','queued','failed','rgbaBytes'])out.art[key]=number(raw.art?.[key],2**40);
    return out;
  }
  function fault(raw={}){
    const frames=[];for(const match of String(raw.stack||'').slice(0,4096).matchAll(/([a-zA-Z0-9_-]+\.js):(\d+):(\d+)/g)){frames.push({file:id(match[1]),line:number(Number(match[2]),1e7),column:number(Number(match[3]),1e7)});if(frames.length===4)break;}
    return {name:errors.has(raw.name)?raw.name:'Error',frames};
  }
  function cleanEvent(raw){
    if(!raw||!EVENTS.has(raw.type))return null;
    const out={at:number(raw.at,1e15),type:raw.type,action:id(raw.action),item:id(raw.item),state:state(raw.state)};
    if(raw.error){out.error={name:errors.has(raw.error.name)?raw.error.name:'Error',frames:(Array.isArray(raw.error.frames)?raw.error.frames:[]).slice(0,4).map(f=>({file:id(f.file),line:number(f.line,1e7),column:number(f.column,1e7)}))};}
    return out;
  }
  function environment(raw={}){
    return {platform:['ios','android','desktop','unknown'].includes(raw.platform)?raw.platform:'unknown',osVersion:id(raw.osVersion),browser:['safari','chrome','edge','firefox','unknown'].includes(raw.browser)?raw.browser:'unknown',standalone:Boolean(raw.standalone),width:number(raw.width,10000),height:number(raw.height,10000),dpr:Number.isFinite(raw.dpr)?Math.min(8,Math.max(1,raw.dpr)):1};
  }
  function session(raw){
    if(!raw||!id(raw.id))return null;
    const out={id:id(raw.id),version:id(raw.version),startedAt:number(raw.startedAt,1e15),lastAt:number(raw.lastAt,1e15),open:raw.open===true,environment:environment(raw.environment),last:state(raw.last),events:(Array.isArray(raw.events)?raw.events:[]).slice(-MAX_EVENTS).map(cleanEvent).filter(Boolean)};
    if(raw.lastBattle)out.lastBattle=state(raw.lastBattle);return out;
  }
  class GameDiagnostics{
    constructor({storage=null,version='unknown',snapshot=()=>({}),environment:env={},clock=()=>Date.now()}={}){
      this.storage=storage;this.clock=clock;this.snapshot=snapshot;this.env=environment(env);this.version=id(version);this.sessions=[];this.storageStatus=storage?'ready':'memory-only';this.retryAt=0;this.lastSavedAt=-Infinity;
      try{const raw=storage?.getItem(KEY);if(raw&&raw.length<=MAX_CHARS){const data=JSON.parse(raw);if(data?.schema===1&&Array.isArray(data.sessions))this.sessions=data.sessions.slice(-MAX_SESSIONS).map(session).filter(Boolean);}}catch(_){this.storageStatus='memory-only';}
      const previous=this.sessions.at(-1);this.interrupted=Boolean(previous?.open&&previous.last.screen==='battle'&&previous.last.status==='playing');
      this.current=this.newSession();this.sessions.push(this.current);this.sessions=this.sessions.slice(-MAX_SESSIONS);this.record('boot');
    }
    newSession(){const at=number(this.clock(),1e15);return {id:at.toString(36)+'-'+Math.random().toString(36).slice(2,8),version:this.version,startedAt:at,lastAt:at,open:true,environment:this.env,last:state(),events:[]};}
    updateState(){try{this.current.last=state(this.snapshot());if(this.current.last.screen==='battle')this.current.lastBattle=state(this.current.last);}catch(_){}this.current.lastAt=number(this.clock(),1e15);}
    record(type,details={},error=null){
      if(!EVENTS.has(type))return;this.updateState();
      const event={at:this.current.lastAt,type,action:id(details.action),item:id(details.item),state:state(this.current.last)};if(error)event.error=fault(error);
      this.current.events.push(event);if(this.current.events.length>MAX_EVENTS)this.current.events.shift();
      this.flush(false);
    }
    failure(phase,error){this.record('runtime-fault',{action:id(phase)},error);this.flush(true);}
    tick(){if(globalThis.document?.hidden)return;const now=this.clock();if(now-(this.lastTick||0)<5000)return;this.lastTick=now;this.updateState();this.flush(false);}
    serialize(){
      let data={schema:1,sessions:this.sessions.map(session).filter(Boolean)},raw=JSON.stringify(data);
      while(raw.length>MAX_CHARS){if(data.sessions.length>1)data.sessions.shift();else if(data.sessions[0]?.events.length)data.sessions[0].events.shift();else break;raw=JSON.stringify(data);}
      return raw;
    }
    flush(force=false){
      const now=this.clock();if(!this.storage||now<this.retryAt||!force&&now-this.lastSavedAt<1000)return false;
      try{this.storage.setItem(KEY,this.serialize());this.lastSavedAt=now;this.storageStatus='ready';return true;}
      catch(_){this.storageStatus='memory-only';this.retryAt=now+60000;return false;}
    }
    close(){this.updateState();this.current.open=false;this.flush(true);}
    reopen(){this.current.open=true;this.record('pageshow');this.flush(true);}
    export(){this.updateState();return this.serialize();}
    clear(){
      let removed=true;try{this.storage?.removeItem(KEY);}catch(_){removed=false;}
      this.sessions=[];this.current=this.newSession();this.sessions.push(this.current);this.interrupted=false;this.lastSavedAt=this.clock();this.retryAt=0;
      if(!removed)this.storageStatus='memory-only';return removed;
    }
    static snapshot(game){
      const screen=game.app?.root?.hidden===false?game.app.page:game.profession?.selected&&game.ui?.professionScreen?.hidden!==false?'battle':'opening';
      return {screen,hero:game.hero?.classType,faction:game.factions?.selected,map:ns.config?.mapId,wave:game.waves?.wave,wavePhase:game.waves?.phase,status:game.status,paused:game.paused,hidden:Boolean(globalThis.document?.hidden),speed:game.gameSpeed,fault:game.runtimeFault?.code,counts:{army:game.build?.items?.length,monsters:game.monsters?.length,projectiles:game.projectiles?.length,effects:game.feedback?.items?.length},art:game.art?.assetStore?.stats?.()};
    }
  }
  GameDiagnostics.KEY=KEY;GameDiagnostics.MAX_CHARS=MAX_CHARS;GameDiagnostics.MAX_SESSIONS=MAX_SESSIONS;GameDiagnostics.MAX_EVENTS=MAX_EVENTS;
  ns.systems.GameDiagnostics=GameDiagnostics;
})(globalThis.TowerFrontier);
