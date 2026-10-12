(function(){
  'use strict';
  const el=id=>document.getElementById(id),stage=el('stage'),status=el('status');
  let pages=[],index=0,token=0,zoom=false,drag=null,suppressClick=false,preload=null;
  function setZoom(value){zoom=value;drag=null;suppressClick=false;stage.classList.toggle('zoom',zoom);stage.scrollLeft=stage.scrollTop=0;el('zoom').textContent=zoom?'完整畫面':'放大拖看';el('zoom').setAttribute('aria-pressed',String(zoom));}
  function show(target,retry=false){
    if(!pages.length)return;
    index=Math.max(0,Math.min(pages.length-1,target));const p=pages[index],current=++token;
    el('pages').value=String(index);el('prev').disabled=index===0;el('next').disabled=index===pages.length-1;
    el('next').textContent=index===pages.length-1?'本批末頁':'下一頁 →';
    el('position').textContent=p.page+' / '+pages[pages.length-1].page+' · '+p.title;el('title').textContent=p.title;
    el('lines').replaceChildren(...p.text.map(line=>{const li=document.createElement('li');li.textContent=line;return li;}));
    setZoom(false);stage.dataset.state='loading';el('message').textContent='漫畫載入中…';el('retry').hidden=true;
    const img=new Image();img.alt='當代續篇第'+p.page+'頁：'+p.title;img.draggable=false;img.decoding='async';img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','點擊放大或恢復完整漫畫');
    const failure=()=>{if(current!==token)return;stage.dataset.state='error';el('message').textContent='本頁圖片未能載入，可重試、看故事文字或繼續翻頁。';el('retry').hidden=false;};
    img.onerror=failure;img.onload=async()=>{try{await img.decode();if(current!==token)return;stage.dataset.state='ready';preload?.removeAttribute('src');preload=null;if(pages[index+1]){preload=new Image();preload.src=pages[index+1].image;}}catch(_){failure();}};
    img.onclick=()=>{if(suppressClick){suppressClick=false;return;}setZoom(!zoom);};
    img.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setZoom(!zoom);}};
    stage.replaceChildren(img,status);img.src=p.image+(retry?'?retry='+Date.now():'');
    try{history.replaceState(null,'','#page='+p.page);}catch(_){}
  }
  async function load(){
    el('load-error').hidden=true;stage.hidden=false;
    try{
      const r=await fetch('production-v2.json',{cache:'no-store'});if(!r.ok)throw Error('catalog');const data=ContinuationReviewCatalog.validate(await r.json());
      pages=data.pages;el('pages').replaceChildren(...pages.map((p,i)=>{const option=document.createElement('option');option.value=i;option.textContent=p.page+' · '+p.title;return option;}));
      for(const id of ['pages','zoom','text'])el(id).disabled=false;
      const linked=Number(location.hash.match(/^#page=(\d+)$/)?.[1]);show(pages.findIndex(p=>p.page===linked));
    }catch(_){pages=[];stage.hidden=true;el('load-error').hidden=false;for(const id of ['pages','zoom','text','prev','next'])el(id).disabled=true;}
  }
  el('reload').onclick=load;el('retry').onclick=()=>show(index,true);el('pages').onchange=()=>show(Number(el('pages').value));el('prev').onclick=()=>show(index-1);el('next').onclick=()=>show(index+1);el('zoom').onclick=()=>setZoom(!zoom);
  window.addEventListener('hashchange',()=>{if(!pages.length)return;const linked=Number(location.hash.match(/^#page=(\d+)$/)?.[1]),target=pages.findIndex(p=>p.page===linked);if(target>=0)show(target);});
  el('text').onclick=()=>{const open=el('transcript').hidden;el('transcript').hidden=!open;el('viewport').classList.toggle('with-text',open);el('text').setAttribute('aria-expanded',String(open));el('text').textContent=open?'收起文字':'故事文字';};
  document.addEventListener('keydown',event=>{if(!pages.length||event.ctrlKey||event.metaKey||event.altKey||event.target.isContentEditable||/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;const target={ArrowLeft:index-1,ArrowRight:index+1,Home:0,End:pages.length-1}[event.key];if(target!==undefined){event.preventDefault();show(target);}else if(event.key==='Escape')setZoom(false);});
  stage.onpointerdown=e=>{if(!zoom||e.pointerType==='touch'||e.button!==0||e.target.closest('button'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};suppressClick=false;stage.setPointerCapture(e.pointerId);e.preventDefault();};
  stage.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)suppressClick=true;stage.scrollLeft=drag.left-dx;stage.scrollTop=drag.top-dy;};
  stage.onpointerup=stage.onpointercancel=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);};
  stage.onclick=e=>{if(e.target===stage&&zoom){if(suppressClick){suppressClick=false;return;}setZoom(false);}};
  load();
})();
