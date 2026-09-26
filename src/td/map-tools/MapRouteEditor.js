(function(ns){
  'use strict';
  const model=ns.mapTools.MapRoute,svgNs='http://www.w3.org/2000/svg';
  function admin(){if(ns.mapTools.Publisher?.connected)return true;try{const state=JSON.parse(localStorage.getItem('heroFrontierProfilesV1'));return state?.active==='admin'&&state.profiles?.admin?.kind==='admin';}catch{return false;}}
  async function boot(){
    if(ns.mapTools.Publisher)await ns.mapTools.Publisher.ready;
    const root=document.querySelector('[data-route-editor]');if(!root)return;
    const get=name=>root.querySelector('[data-route-'+name+']');
    const selectMap=get('map'),selectBranch=get('branch'),svg=get('svg');
    let map,routes,branch=0,selected=null,adding=false,access=admin(),drag=null,nodeGesture=false;
    const say=message=>get('notice').textContent=message;
    function setAdding(value){adding=value;get('add').textContent='新增轉彎點：'+(adding?'開':'關');get('add').setAttribute('aria-pressed',String(adding));root.dataset.routeAdding=String(adding);}
    const localKey=()=> 'heroFrontier:route-draft:'+map.id;
    function persist(){try{localStorage.setItem(localKey(),JSON.stringify(routes));}catch{say('草稿無法儲存，請直接發佈或匯出。');}}
    function applyAccess(){access=admin();root.querySelectorAll('button,select').forEach(control=>{if(!control.matches('[data-route-access]')&&!control.closest('.map-publisher'))control.disabled=!access;});if(!access)say('請由本機後台開啟，或先切换管理者檔案。');}
    function point(event){const rect=svg.getBoundingClientRect();return {x:Math.round(Math.max(0,Math.min(map.width,(event.clientX-rect.left)*map.width/rect.width))),y:Math.round(Math.max(0,Math.min(map.height,(event.clientY-rect.top)*map.height/rect.height)))};}
    function review(){const result=model.validate(map,routes);get('validation').textContent=result.valid?'✓ 可儲存：起終點、改動節點與障礙檢查通過。':'✕ 尚不可儲存：\n'+result.problems.join('\n');get('status').textContent='路線 '+(branch+1)+' · '+routes[branch].length+' 個節點';return result;}
    function render(){
      svg.replaceChildren();svg.setAttribute('viewBox','0 0 '+map.width+' '+map.height);svg.setAttribute('width',map.width);svg.setAttribute('height',map.height);svg.style.touchAction='none';
      routes.forEach((route,index)=>{const line=document.createElementNS(svgNs,'polyline');line.setAttribute('points',route.map(node=>node.x+','+node.y).join(' '));line.classList.add('route-line');if(index!==branch)line.classList.add('ghost');svg.append(line);});
      routes[branch].forEach((node,index)=>{
        const locked=index===0||index===routes[branch].length-1,circle=document.createElementNS(svgNs,'circle');
        circle.setAttribute('cx',node.x);circle.setAttribute('cy',node.y);circle.setAttribute('r',locked?13:11);circle.setAttribute('tabindex','0');circle.setAttribute('role','button');circle.setAttribute('aria-label',locked?'固定起終點':'路點 '+(index+1)+'，方向鍵可移動');
        circle.classList.add('route-node');if(locked)circle.classList.add('locked');if(index===selected)circle.classList.add('selected');
        circle.addEventListener('pointerdown',event=>{if(!access)return;nodeGesture=true;event.preventDefault();event.stopPropagation();selected=index;if(!locked){drag={index,pointer:event.pointerId};svg.setPointerCapture(event.pointerId);}render();});
        circle.addEventListener('keydown',event=>{if(!access||locked)return;const delta={ArrowUp:[0,-5],ArrowDown:[0,5],ArrowLeft:[-5,0],ArrowRight:[5,0]}[event.key];if(!delta)return;event.preventDefault();selected=index;routes[branch][index]={x:node.x+delta[0],y:node.y+delta[1]};persist();render();svg.querySelectorAll('circle')[index].focus();});svg.append(circle);
      });review();
    }
    // Capture on the persistent SVG, not the circle replaced during rendering.
    // Re-rendering a circle can retarget its click to the SVG; never insert after a node gesture.
    svg.addEventListener('pointerdown',()=>{nodeGesture=false;},{capture:true});
    svg.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;routes[branch][drag.index]=point(event);render();});
    function endDrag(event){if(!drag||event.pointerId!==drag.pointer)return;if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);drag=null;persist();review();}
    svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
    svg.addEventListener('click',event=>{if(!adding||!access||nodeGesture||event.target.tagName.toLowerCase()==='circle')return;const position=point(event),segment=model.nearestSegment(routes[branch],position);routes[branch].splice(segment.index,0,position);selected=segment.index;persist();render();say('已新增轉彎點；新增模式仍開啟，可繼續點選地圖。');});
    function load(id){
      map=ns.maps.definitions[id]||ns.maps.publicMaps()[0];const saved=ns.systems.MapRouteOverrides.get(map.id);
      let draft=null;try{const value=JSON.parse(localStorage.getItem(localKey()));if(model.validate(map,value).valid)draft=value;}catch{}
      routes=model.cloneRoutes(saved?.routes||(ns.mapTools.Publisher?.connected?model.routesOf(map):draft||model.routesOf(map)));branch=0;selected=null;drag=null;nodeGesture=false;setAdding(adding);
      selectMap.value=map.id;get('title').textContent=map.name+'：怪物路點編輯';selectBranch.replaceChildren();
      routes.forEach((_,index)=>{const option=document.createElement('option');option.value=index;option.textContent='路線 '+(index+1);selectBranch.append(option);});
      for(const element of [get('map-image'),get('stage')]){element.style.width=map.width+'px';element.style.height=map.height+'px';}get('map-image').style.backgroundImage='url("'+map.asset+'")';render();say('已載入 '+map.name+'。');
    }
    for(const item of ns.maps.publicMaps()){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;selectMap.append(option);}
    selectMap.addEventListener('change',()=>load(selectMap.value));selectBranch.addEventListener('change',()=>{branch=Number(selectBranch.value);selected=null;render();});
    get('add').onclick=()=>{setAdding(!adding);say(adding?'連續新增已開啟：每次點選地圖都會插入路點，再按此按鈕才關閉。':'已關閉新增；仍可選取與拖曳既有路點。');};
    get('delete').onclick=()=>{if(selected===null||selected===0||selected===routes[branch].length-1)return say('請先選取中間路點；起終點不可刪除。');routes[branch].splice(selected,1);selected=null;persist();render();};
    get('reset').onclick=()=>{routes=model.routesOf(map);selected=null;persist();render();say('已還原原始路線草稿，尚未發佈。');};
    get('save').onclick=async()=>{
      if(!review().valid)return say('請先修正路線問題。');
      const savedMap=map,savedRoutes=model.cloneRoutes(routes);
      get('save').disabled=true;selectMap.disabled=true;selectBranch.disabled=true;
      say('正在儲存 '+savedMap.name+'…');
      try{if(!admin())throw new Error('管理者工作階段失效。');
        if(ns.mapTools.Publisher?.connected){const revision=await ns.mapTools.Publisher.save(savedMap.id,{routes:savedRoutes});say('已儲存 '+savedMap.name+' 到遊戲 · r'+revision+'（舊版已備份）。重新整理 td.html 並開始新局即可使用。');}
        else{const result=ns.systems.MapRouteOverrides.save(savedMap,savedRoutes);if(!result.valid)throw new Error(result.problems.join(' '));say('已儲存離線草稿。請按上方「匯出已存設定」，到本機後台匯入發佈。');}
      }catch(error){say(error.message);}finally{get('save').disabled=false;selectMap.disabled=false;selectBranch.disabled=false;}
    };
    get('remove').onclick=()=>{if(ns.systems.MapRouteOverrides.remove(map.id)){routes=model.routesOf(map);selected=null;persist();render();say('已移除本機路線草稿。');}};
    get('access').onclick=applyAccess;
    load(new URLSearchParams(location.search).get('map')||ns.maps.publicMaps()[0].id);applyAccess();
    get('save').textContent=ns.mapTools.Publisher?.connected?'儲存到遊戲':'儲存離線草稿';
    if(ns.mapTools.Publisher?.connected)get('remove').hidden=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})(globalThis.TowerFrontier);
