(function(ns){
  'use strict';
  const tool=ns.mapTools.EmberroadGrid,storageKey='heroFrontier:map-review:'+tool.MAP_ID;
  function map(){return ns.maps.definitions[tool.MAP_ID];}
  function savedSelection(current){try{const raw=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(raw))return new Set(raw);}catch(error){}return new Set(tool.baseline(current));}
  function text(cell,selected){if(cell.state==='locked')return '鎖定：道路、障礙或邊界';return selected.has(cell.key)?'綠色：已標註可建':'未標註：可供審核';}
  function boot(){
    const current=map(),root=document.querySelector('[data-grid-editor]');if(!root||!current)return;
    let selected=savedSelection(current),cells=tool.cells(current);
    const board=root.querySelector('[data-grid-board]'),count=root.querySelector('[data-grid-count]'),output=root.querySelector('[data-grid-output]'),notice=root.querySelector('[data-grid-notice]');
    board.style.setProperty('--columns',String(current.width/tool.CELL_SIZE));board.style.setProperty('--rows',String(current.height/tool.CELL_SIZE));board.style.backgroundImage='url("'+current.asset+'")';
    function persist(){localStorage.setItem(storageKey,JSON.stringify([...selected].sort()));}
    function announce(message){notice.textContent=message;}
    function update(){
      count.textContent=selected.size+' 格已標註可建';
      output.value=JSON.stringify(tool.selectionPayload(current,selected),null,2);
      board.querySelectorAll('button[data-cell]').forEach(button=>{const cell=cells[Number(button.dataset.cell)];button.classList.toggle('selected',selected.has(cell.key));button.setAttribute('aria-pressed',String(selected.has(cell.key)));button.title='第 '+(cell.column+1)+' 欄，第 '+(cell.row+1)+' 列 · '+text(cell,selected);});
    }
    cells.forEach((cell,index)=>{const button=document.createElement('button');button.type='button';button.dataset.cell=String(index);button.className='grid-cell '+cell.state;button.disabled=cell.state==='locked';button.setAttribute('aria-label','第 '+(cell.column+1)+' 欄，第 '+(cell.row+1)+' 列：'+text(cell,selected));button.addEventListener('click',()=>{if(selected.has(cell.key)){selected.delete(cell.key);announce('已取消第 '+(cell.column+1)+' 欄、第 '+(cell.row+1)+' 列。');}else{selected.add(cell.key);announce('已標註第 '+(cell.column+1)+' 欄、第 '+(cell.row+1)+' 列為可建。');}persist();update();});board.append(button);});
    root.querySelector('[data-grid-reset]').addEventListener('click',()=>{selected=new Set(tool.baseline(current));persist();update();announce('已還原成目前遊戲的可建格。');});
    root.querySelector('[data-grid-clear]').addEventListener('click',()=>{selected=new Set();persist();update();announce('已清空標註；道路、障礙與邊界仍會鎖定。');});
    root.querySelector('[data-grid-copy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.value);announce('JSON 已複製，可直接貼回給我。');}catch(error){output.focus();output.select();announce('瀏覽器不允許自動複製，已選取 JSON，請按 Ctrl+C。');}});
    root.querySelector('[data-grid-download]').addEventListener('click',()=>{const blob=new Blob([output.value+'\n'],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='emberroad-build-grid.json';link.click();URL.revokeObjectURL(link.href);announce('已下載 emberroad-build-grid.json。');});
    update();announce('已載入目前的 2-2 建造規則。綠色格可調整，紅色斜線格不可選。');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})(globalThis.TowerFrontier);
