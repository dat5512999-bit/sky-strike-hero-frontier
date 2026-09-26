(function(ns){
  'use strict';
  const tool=ns.mapTools.MapGrid;
  function storageKey(mapId){return 'heroFrontier:map-review:'+mapId;}
  function savedSelection(current){const applied=ns.systems.MapLayoutOverrides?.get(current.id);if(applied&&Array.isArray(applied.buildable))return new Set(applied.buildable.map(cell=>tool.key(cell.column,cell.row)));if(ns.mapTools.Publisher?.connected)return new Set(tool.baseline(current));try{const raw=JSON.parse(localStorage.getItem(storageKey(current.id)));if(Array.isArray(raw))return new Set(raw);}catch(error){}return new Set(tool.baseline(current));}
  function text(cell,selected){if(selected.has(cell.key))return cell.state==='restricted'?'綠色：待驗證候選（原本禁建）':'綠色：已標註可建';return cell.state==='restricted'?'紅色：道路、障礙或邊界（可標成待驗證候選）':'未標註：可供審核';}
  function hasAdminAccess(){if(ns.mapTools.Publisher?.connected)return true;try{const raw=JSON.parse(localStorage.getItem('heroFrontierProfilesV1'));return raw&&raw.active==='admin'&&raw.profiles&&raw.profiles.admin&&raw.profiles.admin.kind==='admin';}catch(error){return false;}}
  async function boot(){
    if(ns.mapTools.Publisher)await ns.mapTools.Publisher.ready;
    const root=document.querySelector('[data-grid-editor]');if(!root)return;
    let current,cells,selected,zoom=1,admin=hasAdminAccess();
    const board=root.querySelector('[data-grid-board]'),count=root.querySelector('[data-grid-count]'),output=root.querySelector('[data-grid-output]'),notice=root.querySelector('[data-grid-notice]');
    const selector=root.querySelector('[data-grid-map]'),title=root.querySelector('[data-grid-map-name]');
    const stage=root.querySelector('[data-grid-stage]'),wrap=root.querySelector('[data-grid-wrap]'),zoomLabel=root.querySelector('[data-grid-zoom-label]');
    const requested=new URLSearchParams(location.search).get('map');
    ns.maps.publicMaps().forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.name;selector.append(option);});
    function persist(){localStorage.setItem(storageKey(current.id),JSON.stringify([...selected].sort()));}
    function announce(message){notice.textContent=message;}
    function setZoom(next){zoom=Math.max(.5,Math.min(1.8,Math.round(next*100)/100));stage.style.width=(current.width*zoom)+'px';stage.style.height=(current.height*zoom)+'px';board.style.transform='scale('+zoom+')';zoomLabel.textContent=Math.round(zoom*100)+'%';}
    function setAccess(){admin=hasAdminAccess();root.querySelectorAll('button,select').forEach(control=>{if(control.matches('[data-grid-access-recheck]')||control.closest('.map-publisher'))return;control.disabled=!admin;});if(!admin)announce('此工具只允許管理者檔案使用。請先在遊戲大廳「設定與玩家資料」切換到管理者，再回來按「重新檢查管理者權限」。');return admin;}
    function update(){
      const restricted=cells.filter(cell=>selected.has(cell.key)&&cell.state==='restricted').length;
      count.textContent=selected.size+' 格已標註可建'+(restricted?' · '+restricted+' 格待驗證':'');
      output.value=JSON.stringify(tool.selectionPayload(current,selected),null,2);
      board.querySelectorAll('button[data-cell]').forEach(button=>{const cell=cells[Number(button.dataset.cell)];button.classList.toggle('selected',selected.has(cell.key));button.classList.toggle('review',selected.has(cell.key)&&cell.state==='restricted');button.setAttribute('aria-pressed',String(selected.has(cell.key)));button.setAttribute('aria-label','第 '+(cell.column+1)+' 欄，第 '+(cell.row+1)+' 列：'+text(cell,selected));button.title='第 '+(cell.column+1)+' 欄，第 '+(cell.row+1)+' 列 · '+text(cell,selected);});
    }
    function loadMap(id){
      current=ns.maps.definitions[id]||ns.maps.definitions[tool.DEFAULT_MAP_ID];cells=tool.cells(current);selected=savedSelection(current);selector.value=current.id;title.textContent=current.name+'：建造格標註';
      board.replaceChildren();board.style.setProperty('--columns',String(current.width/tool.CELL_SIZE));board.style.setProperty('--rows',String(current.height/tool.CELL_SIZE));board.style.width=current.width+'px';board.style.height=current.height+'px';board.style.backgroundImage='url("'+current.asset+'")';
      cells.forEach((cell,index)=>{const button=document.createElement('button');button.type='button';button.dataset.cell=String(index);button.className='grid-cell '+cell.state;button.setAttribute('aria-label','第 '+(cell.column+1)+' 欄，第 '+(cell.row+1)+' 列：'+text(cell,selected));button.addEventListener('click',()=>{if(selected.has(cell.key)){selected.delete(cell.key);announce('已取消第 '+(cell.column+1)+' 欄、第 '+(cell.row+1)+' 列。');}else{selected.add(cell.key);announce(cell.state==='restricted'?'已標為綠色待驗證候選；尚未開放給玩家。':'已標註第 '+(cell.column+1)+' 欄、第 '+(cell.row+1)+' 列為可建。');}persist();update();});board.append(button);});
      update();setZoom(zoom);announce('已載入 '+current.name+'。紅色格可標綠，但輸出會標示為待驗證。');
    }
    root.querySelector('[data-grid-reset]').addEventListener('click',()=>{selected=new Set(tool.baseline(current));persist();update();announce('已還原成目前遊戲的可建格。');});
    root.querySelector('[data-grid-clear]').addEventListener('click',()=>{selected=new Set();persist();update();announce('已清空標註；所有格都可重新標示。');});
    root.querySelector('[data-grid-copy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.value);announce('JSON 已複製，可直接貼回給我。');}catch(error){output.focus();output.select();announce('瀏覽器不允許自動複製，已選取 JSON，請按 Ctrl+C。');}});
    root.querySelector('[data-grid-download]').addEventListener('click',()=>{const blob=new Blob([output.value+'\n'],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=current.id+'-build-grid.json';link.click();URL.revokeObjectURL(link.href);announce('已下載 '+current.id+'-build-grid.json。');});
    root.querySelector('[data-grid-zoom-out]').addEventListener('click',()=>setZoom(zoom-.1));root.querySelector('[data-grid-zoom-in]').addEventListener('click',()=>setZoom(zoom+.1));root.querySelector('[data-grid-zoom-reset]').addEventListener('click',()=>setZoom(1));
    wrap.addEventListener('wheel',event=>{if(!admin)return;event.preventDefault();setZoom(zoom+(event.deltaY<0?.1:-.1));},{passive:false});
    root.querySelector('[data-grid-save]').addEventListener('click',async()=>{const button=root.querySelector('[data-grid-save]'),savedMap=current,payload=tool.selectionPayload(current,selected);button.disabled=true;selector.disabled=true;announce('正在儲存 '+savedMap.name+'…');try{if(!hasAdminAccess())throw new Error('管理者工作階段失效。');if(ns.mapTools.Publisher?.connected){const revision=await ns.mapTools.Publisher.save(savedMap.id,{layout:payload});announce('已儲存 '+savedMap.name+' 到遊戲 · r'+revision+'（舊版已備份）。重新整理 td.html 並開始新局即可使用。');}else if(ns.systems.MapLayoutOverrides.save(savedMap,payload)){announce('已存為離線草稿。請按上方「匯出已存設定」，到本機後台匯入發佈。');}else throw new Error('無法儲存草稿。');}catch(error){announce(error.message);}finally{button.disabled=false;selector.disabled=false;}});
    root.querySelector('[data-grid-remove]').addEventListener('click',()=>{if(ns.systems.MapLayoutOverrides.remove(current.id)){selected=new Set(tool.baseline(current));persist();update();announce('已移除 '+current.name+' 的已套用版本；遊戲會回到原始地圖規則。');}else announce('無法移除已套用版本。');});
    root.querySelector('[data-grid-access-recheck]').addEventListener('click',()=>{if(setAccess())announce('管理者權限已確認。');});
    selector.addEventListener('change',()=>loadMap(selector.value));
    loadMap(requested&&ns.maps.definitions[requested]?requested:tool.DEFAULT_MAP_ID);
    setAccess();
    if(ns.mapTools.Publisher?.connected){root.querySelector('[data-grid-save]').textContent='儲存到遊戲';root.querySelector('[data-grid-remove]').hidden=true;}
    else root.querySelector('[data-grid-save]').textContent='儲存離線草稿';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})(globalThis.TowerFrontier);
