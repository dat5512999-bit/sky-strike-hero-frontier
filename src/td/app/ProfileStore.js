(function(ns){
  'use strict';
  const KEY='heroFrontierProfilesV1', VERSION='0.85.50';
  const clone=value=>JSON.parse(JSON.stringify(value));
  function profile(id,kind,round){return {id,kind,round,startedAt:new Date().toISOString(),startedVersion:VERSION,completed:[],encountered:[],discovered:[],cinematics:[],unlocks:{heroes:['hunter','naga'],factions:['hunter','naga'],maps:['beginner','westernsignal','emberroad'],difficulties:['story','standard']},wallet:{gold:0,diamonds:0},data:{},lastRun:null};}
  class ProfileStore{
    constructor(storage){this.storage=storage;const raw=storage.getItem(KEY);this.serialized=raw;if(raw){this.state=JSON.parse(raw);this.validate(this.state);const next=clone(this.state);let changed=false;for(const p of Object.values(next.profiles).concat(next.archives)){if(!p.wallet){p.wallet={gold:0,diamonds:0};changed=true;}for(const [kind,id] of [['heroes','naga'],['factions','naga'],['maps','westernsignal'],['maps','emberroad']])if(!p.unlocks[kind].includes(id)){p.unlocks[kind].push(id);changed=true;}}if(changed)this.persist(next);}else{const admin=profile('admin','admin',0),player=profile('test','test',1);for(const key of ['heroFrontierScoreRecordsV1','heroFrontierChapterCheckpointV1']){const value=storage.getItem(key);if(value!==null)admin.data['free:'+key]=value;}this.state={saveVersion:1,active:'test',nextRound:2,profiles:{admin,test:player},archives:[]};this.persist(this.state);}}
    validate(s){if(!s||s.saveVersion!==1||!s.profiles||!s.profiles.admin||!s.profiles[s.active]||!Array.isArray(s.archives)||!Number.isInteger(s.nextRound))throw new Error('玩家存檔格式無法讀取；原始資料已保留，請先匯出備份。');if(s.profiles.admin.kind!=='admin'||!['admin','test'].includes(s.active)||s.profiles.test&&s.profiles.test.kind!=='test'||s.nextRound<1)throw new Error('玩家身份或輪次格式錯誤');for(const p of Object.values(s.profiles).concat(s.archives)){if(p&&p.wallet&&(!Number.isSafeInteger(p.wallet.gold)||p.wallet.gold<0||!Number.isSafeInteger(p.wallet.diamonds)||p.wallet.diamonds<0))throw new Error('帳戶貨幣資料格式錯誤');if(!p||!p.data||!p.unlocks||!['admin','test'].includes(p.kind)||!['heroes','factions','maps','difficulties'].every(k=>Array.isArray(p.unlocks[k]))||!['completed','cinematics','discovered','encountered'].every(k=>Array.isArray(p[k])))throw new Error('玩家存檔不完整；原始資料已保留。');}}
    persist(next){try{if(this.storage.getItem(KEY)!==this.serialized)throw new Error('另一個分頁已更新玩家資料，請重新整理後繼續');const raw=JSON.stringify(next);this.storage.setItem(KEY,raw);this.serialized=raw;this.state=next;}catch(error){if(this.onError)this.onError(error);throw error;}}
    change(edit){const next=clone(this.state);edit(next);this.persist(next);return this.current();}
    current(){return clone(this.state.profiles[this.state.active]);}
    switchTo(id){if(!this.state.profiles[id])throw new Error('找不到玩家檔案');return this.change(s=>{s.active=id;});}
    newRound(){return this.change(s=>{if(s.profiles.test){s.archives=s.archives.filter(a=>a.round!==s.profiles.test.round);s.archives.push(clone(s.profiles.test));}const round=s.nextRound++;s.profiles.test=profile('test','test',round);s.active='test';});}
    restoreRound(round){const saved=this.state.archives.find(p=>p.round===round);if(!saved)throw new Error('找不到封存輪次');return this.change(s=>{if(s.profiles.test)s.archives.push(clone(s.profiles.test));s.archives=s.archives.filter(p=>p!==undefined&&p.round!==round);s.profiles.test=clone(saved);s.active='test';});}
    allows(kind,id){const p=this.current();return p.kind==='admin'||Boolean(p.unlocks[kind]&&p.unlocks[kind].includes(id));}
    adapter(mode){const id=this.state.active;return {getItem:key=>this.state.profiles[id].data[mode+':'+key]??null,setItem:(key,value)=>this.change(s=>{s.profiles[id].data[mode+':'+key]=String(value);}),removeItem:key=>this.change(s=>{delete s.profiles[id].data[mode+':'+key];})};}
    seenCinematic(id){this.change(s=>{const p=s.profiles[s.active];if(!p.cinematics.includes(id))p.cinematics.push(id);});}
    encounter(types){this.change(s=>{const p=s.profiles[s.active];p.encountered=Array.from(new Set(p.encountered.concat(types)));});}
    complete(mission){this.change(s=>{const p=s.profiles[s.active];if(p.completed.includes(mission.id))return;p.completed.push(mission.id);for(const [kind,ids] of Object.entries(mission.rewards||{}))p.unlocks[kind]=Array.from(new Set((p.unlocks[kind]||[]).concat(ids)));p.discovered=Array.from(new Set(p.discovered.concat(mission.discovered||[])));});}
    remember(run){this.change(s=>{s.profiles[s.active].lastRun=clone(run);if(run.mode==='free')s.profiles[s.active].lastFreeRun=clone(run);});}
    setProfileArt(id){if(!['kingdom','snow','goblin'].includes(id))throw new Error('找不到此個人頁籤圖塊');return this.change(s=>{s.profiles[s.active].profileArt=id;});}
    export(){return JSON.stringify(this.state,null,2);}
    import(raw){const state=JSON.parse(raw);this.validate(state);this.storage.setItem(KEY+'.beforeImport',JSON.stringify(this.state));for(const p of Object.values(state.profiles).concat(state.archives))if(!p.wallet)p.wallet={gold:0,diamonds:0};this.persist(state);}
  }
  ProfileStore.KEY=KEY;ProfileStore.VERSION=VERSION;ns.systems.ProfileStore=ProfileStore;
})(globalThis.TowerFrontier);
