'use strict';
// Build-time replacements: the development website and its saves stay intact.
function replaceLine(source,prefix,replacement){
  const lines=source.split(/\r?\n/),matches=lines.map((s,i)=>s.startsWith(prefix)?i:-1).filter(i=>i>=0);
  if(matches.length!==1)throw Error('iOS 玩家模式來源格式已變更：'+prefix);
  lines[matches[0]]=replacement;return lines.join('\n');
}
function playerStore(source){
  let s=source.replace("KEY='heroFrontierProfilesV1'","KEY='heroFrontierPlayerV1'");
  if(s===source)throw Error('找不到玩家存檔鍵');
  s=replaceLine(s,'  const KEY=',s.split('\n').find(l=>l.startsWith('  const KEY=')).replace('ADMIN_DIAMONDS=99999','ADMIN_DIAMONDS=0'));
  s=replaceLine(s,'    constructor(storage)',`    constructor(storage){this.storage=storage;const raw=storage.getItem(KEY);this.serialized=raw;if(raw){this.state=JSON.parse(raw);this.validate(this.state);}else{this.state={saveVersion:1,edition:'ios-player',active:'test',nextRound:2,profiles:{test:profile('test','test',1)},archives:[]};this.persist(this.state);}}`);
  s=replaceLine(s,'    validate(s)',`    validate(s){const p=s?.profiles?.test;if(!s||s.saveVersion!==1||s.edition!=='ios-player'||s.active!=='test'||!s.profiles||Object.keys(s.profiles).length!==1||!Array.isArray(s.archives)||s.archives.length||s.nextRound!==2||!p||p.id!=='test'||p.kind!=='test'||p.round!==1)throw Error('此備份不是 iOS 玩家存檔；開發者與測試備份無法匯入，原進度未變更。');if(!p.wallet||!['gold','diamonds'].every(k=>Number.isSafeInteger(p.wallet[k])&&p.wallet[k]>=0))throw Error('玩家貨幣資料格式錯誤');if(!p.data||typeof p.data!=='object'||Array.isArray(p.data)||!p.unlocks||!['heroes','factions','maps','difficulties'].every(k=>Array.isArray(p.unlocks[k])&&p.unlocks[k].every(v=>typeof v==='string'))||!['completed','cinematics','discovered','encountered'].every(k=>Array.isArray(p[k])&&p[k].every(v=>typeof v==='string')))throw Error('玩家存檔不完整；原進度未變更。');}`);
  s=replaceLine(s,'    isAdmin()',`    isAdmin(){return false;}`);
  s=replaceLine(s,'    switchTo(id)',`    switchTo(id){if(id!=='test')throw Error('此版本僅提供玩家進度。');return this.current();}`);
  for(const method of ['newRound()','restoreRound(round)'])s=replaceLine(s,'    '+method,`    ${method}{throw Error('正式玩家版不提供測試輪次。');}`);
  s=replaceLine(s,'    allows(kind,id)',`    allows(kind,id){const p=this.state.profiles.test;return Boolean(p.unlocks[kind]?.includes(id));}`);
  // Every write, including wallet adapters, must preserve the player identity.
  s=s.replace('persist(next){try{','persist(next){try{this.validate(next);');
  return s;
}
function playerApp(source){
  let s=replaceLine(source,"      else if(this.page==='settings')",`      else if(this.page==='settings'){content='<div class="section-heading"><h1>設定與存檔</h1><p>進度與購買紀錄儲存在這台裝置。刪除 App 前請先備份；Safari 與 App 不會自動共用進度。</p></div><div class="settings-grid"><article class="journey-card"><h2>備份與還原</h2><p>請妥善保存備份檔。匯入會替換目前進度，並先保留匯入前資料。</p>'+b('export','匯出玩家備份')+'<label class="import-label">匯入玩家備份<input type="file" id="profile-import" accept="application/json"></label></article><article class="journey-card"><h2>遊戲更新</h2><p>請透過 App Store 取得新版遊戲。</p></article></div>';}`);
  s=replaceLine(s,"      else if(this.page==='confirm-round')",`      else if(this.page==='confirm-round'){content='<p>此版本僅提供玩家進度。</p>';}`);
  s=s.replace("act(action,value){if(this.storyStarting", "act(action,value){if(['admin','test','new-round','confirm-round','restore'].includes(action)){this.message='此版本僅提供玩家進度。';return this.render();}if(this.storyStarting");
  if(s===source||!s.includes("act(action,value){if(['admin'"))throw Error('找不到玩家操作入口');
  s=s.replace("act(action,value){", "act(action,value){if(['ios-privacy','ios-support'].includes(action))return this.show(action);");
  s=s.replace("      else if(this.page==='confirm-round')",`      else if(['ios-privacy','ios-support'].includes(this.page)){content='<div class="section-heading"><h1>'+(this.page==='ios-privacy'?'隱私說明':'遊戲支援')+'</h1>'+b('settings','返回設定')+'</div><iframe title="'+(this.page==='ios-privacy'?'隱私與本機資料說明':'遊戲支援與常見問題')+'" src="'+this.page+'.html" style="width:100%;height:60vh;border:0" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe>';}
      else if(this.page==='confirm-round')`);
  s=s.replace("<h2>遊戲更新</h2>","<h2>隱私與支援</h2>'+b('ios-privacy','隱私與本機資料說明')+b('ios-support','客服與常見問題')+'<h2>遊戲更新</h2>");
  return s.replace("'一般玩家 · 第 '+p.round+' 輪'","'玩家進度'").replace('新增獨立測試輪次與封存還原','完成遠征，逐步解鎖新挑戰');
}
module.exports={playerStore,playerApp};
