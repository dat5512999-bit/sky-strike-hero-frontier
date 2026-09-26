(function(ns){
  'use strict';
  const FORMAT='hero-frontier-map-package-v1';
  const keys={layout:'heroFrontierMapLayoutOverridesV1',routes:'heroFrontierMapRouteOverridesV1'};
  ns.mapTools=ns.mapTools||{};ns.mapTools.isEditor=true;
  let session=null,pending=null;
  function stored(key){try{return JSON.parse(localStorage.getItem(key))?.maps||{};}catch{return {};}}
  function bundle(){const changes={};for(const [kind,key] of Object.entries(keys))for(const [id,value] of Object.entries(stored(key))){changes[id]=changes[id]||{};changes[id][kind]=kind==='routes'?value.routes:value;}return {format:FORMAT,changes};}
  function exportSaved(){const data=bundle();download(data,'hero-frontier-saved-maps.json');return Object.keys(data.changes).length;}
  function download(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function request(endpoint,input){const response=await fetch('/api/studio/'+endpoint,{method:input?'POST':'GET',cache:'no-store',headers:input?{'Content-Type':'application/json','X-Studio-Token':session.token}:{},body:input?JSON.stringify(input):undefined});const data=await response.json();if(!response.ok)throw new Error(data.error||'後台讀寫失敗。');return data;}
  async function connect(){if(location.protocol!=='http:'||location.hostname!=='127.0.0.1')return false;try{session=await request('state');globalThis.HeroFrontierPublishedMaps=session.state;return true;}catch{return false;}}
  const api={connected:false,ready:null,exportSaved,save:async function(id,change){
    if(!api.connected)throw new Error('目前是離線編輯頁。請先匯出已存設定，再由本機管理後台匯入發佈。');
    const result=await request('publish',{baseRevision:session.state.revision,changes:{[id]:change}});session.state=result.state;globalThis.HeroFrontierPublishedMaps=result.state;refreshSummary();globalThis.dispatchEvent(new Event('map-published'));return result.state.revision;
  }};
  let status,list,confirm,summary,selectHistory,approve;
  function tell(message){if(status)status.textContent=message;}
  function refreshSummary(){if(!summary)return;summary.textContent=api.connected?'已連接本機後台 · 正式地圖版本 r'+session.state.revision:'離線編輯頁：本機草稿尚未發佈';if(list){list.replaceChildren();for(const [id,value] of Object.entries(session?.state.maps||{})){const item=document.createElement('li');item.textContent=(ns.maps.definitions[id]?.name||id)+'：'+describe(value);list.append(item);}}}
  function describe(change){return [change.layout?(change.layout.buildable?.length||0)+' 個可建格':null,change.routes?change.routes.length+' 條路線／'+change.routes.reduce((sum,r)=>sum+r.length,0)+' 個路點':null].filter(Boolean).join('、');}
  function stage(data){
    if(data?.format==='hero-frontier-grid-v2')data={format:FORMAT,changes:{[data.map]:{layout:data}}};
    if(data?.format!==FORMAT||!data.changes||typeof data.changes!=='object'||Array.isArray(data.changes))throw new Error('不是地圖匯出檔，請從原編輯頁匯出已存設定。');
    const entries=Object.entries(data.changes);if(!entries.length)throw new Error('這份檔案沒有已存地圖。請回原編輯頁儲存並匯出。');
    const lines=entries.map(([id,value])=>{if(!ns.maps.definitions[id]||!value||(!value.layout&&!value.routes))throw new Error('含有未知地圖或缺少設定。');return ns.maps.definitions[id].name+'：'+describe(value);});
    pending={type:'publish',data};confirm.hidden=false;confirm.querySelector('pre').textContent=lines.join('\n')+'\n確認後寫入正式地圖，並備份目前 r'+session.state.revision+'。';approve.focus();
  }
  async function boot(){
    const host=document.querySelector('main');if(!host)return;
    const panel=document.createElement('section');panel.className='map-publisher';panel.innerHTML='<h2>正式地圖發佈</h2><p data-pub-summary></p><p>舊頁已編好的內容，請先「匯出已存設定」，再到本機後台匯入；格線頁與路線頁若各自有存檔，請分別匯出。</p><div class="pub-actions"><button data-pub-export>匯出已存設定（保留原資料）</button><label data-pub-import-label hidden>匯入舊頁設定 <input data-pub-import type="file" accept=".json,application/json"></label><button data-pub-saved hidden>發佈此瀏覽器已存設定</button><a href="http://127.0.0.1:4174/developer-studio.html">開啟本機後台</a><a href="td.html" target="_blank" rel="noopener">開啟遊戲驗證</a></div><p data-pub-help>先啟動專案根目錄 start-developer-studio.cmd，再開啟本機後台。</p><ul data-pub-list></ul><div data-pub-restore hidden><label>備份版本 <select data-pub-history></select></label> <button data-pub-rollback>還原選取的全部地圖版本</button></div><section data-pub-confirm hidden><h3>確認發佈內容</h3><pre></pre><button data-pub-approve>確認寫入正式地圖</button> <button data-pub-cancel>取消</button></section><p data-pub-status role="status" aria-live="polite"></p>';
    const style=document.createElement('style');style.textContent='.map-publisher{margin:20px 0;padding:20px;border:1px solid #947d4b;background:#0b1b16;color:#e9ebdc}.map-publisher p{max-width:none}.map-publisher [hidden]{display:none!important}.pub-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.map-publisher button,.map-publisher a,.map-publisher select{padding:9px 12px;color:#fff0c3;background:#223b30;border:1px solid #ab8a50;font:inherit}.map-publisher button{cursor:pointer}.map-publisher pre{white-space:pre-wrap}.map-publisher [data-pub-status]{color:#ffe19d}.map-publisher [data-pub-confirm]{padding:14px;margin-top:15px;border:1px solid #d0a850}';document.head.append(style);host.prepend(panel);
    status=panel.querySelector('[data-pub-status]');summary=panel.querySelector('[data-pub-summary]');list=panel.querySelector('[data-pub-list]');confirm=panel.querySelector('[data-pub-confirm]');selectHistory=panel.querySelector('[data-pub-history]');approve=panel.querySelector('[data-pub-approve]');
    panel.querySelector('[data-pub-export]').onclick=()=>tell('已匯出 '+exportSaved()+' 張地圖；原本的儲存資料仍保留。');
    await api.ready;refreshSummary();
    if(!api.connected)return;
    panel.querySelector('[data-pub-help]').textContent='編輯器按一次「儲存到遊戲」即直接寫入目前地圖、自動備份，無須再次確認。遊戲重新整理並開始新局後生效，背景圖本身不會改畫。';
    for(const key of ['import-label','saved','restore'])panel.querySelector('[data-pub-'+key+']').hidden=false;
    const tools=document.querySelector('[data-studio-tools]'),locked=document.querySelector('[data-studio-locked]');if(tools)tools.hidden=false;if(locked)locked.hidden=true;
    async function history(){const latest=await request('state');session=latest;refreshSummary();selectHistory.replaceChildren();for(const revision of latest.history){const option=document.createElement('option');option.value=revision;option.textContent='r'+revision;selectHistory.append(option);}panel.querySelector('[data-pub-rollback]').disabled=!latest.history.length;}
    panel.querySelector('[data-pub-saved]').onclick=()=>{try{stage(bundle());}catch(error){tell(error.message);}};
    panel.querySelector('[data-pub-import]').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>1024*1024)throw new Error('匯入檔案超過 1 MB。');stage(JSON.parse(await file.text()));}catch(error){tell(error.message);}finally{event.target.value='';}};
    panel.querySelector('[data-pub-rollback]').onclick=()=>{pending={type:'restore',revision:Number(selectHistory.value)};confirm.hidden=false;confirm.querySelector('pre').textContent='將全部地圖還原為 r'+pending.revision+'。目前 r'+session.state.revision+' 也會先備份。';approve.focus();};
    panel.querySelector('[data-pub-cancel]').onclick=()=>{confirm.hidden=true;pending=null;};
    approve.onclick=async()=>{if(!pending)return;approve.disabled=true;try{const operation=pending,input={baseRevision:session.state.revision};if(operation.type==='restore')input.revision=operation.revision;else input.changes=operation.data.changes;const result=await request(operation.type,input);session.state=result.state;globalThis.HeroFrontierPublishedMaps=result.state;confirm.hidden=true;pending=null;tell('已寫入正式地圖 r'+result.state.revision+'。請重新整理編輯器／遊戲並開始新局確認。');await history();}catch(error){tell(error.message);}finally{approve.disabled=false;}};
    globalThis.addEventListener('map-published',()=>history().catch(()=>tell('已發佈；備份清單載入失敗，請重新整理。')));
    try{await history();}catch(error){tell(error.message);}
  }
  api.ready=connect().then(connected=>(api.connected=connected));ns.mapTools.Publisher=api;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})(globalThis.TowerFrontier);
