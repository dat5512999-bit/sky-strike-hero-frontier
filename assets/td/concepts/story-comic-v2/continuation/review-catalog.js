(function(root){
  'use strict';
  const editions=Object.freeze({'0.10.0':52,'0.11.0':60});
  function validate(value){
    const end=value&&Object.hasOwn(editions,value.version)&&editions[value.version];
    if(!end||value.runtimeIntegrated!==false||value.published!==false||value.userApproved!==false)throw Error('續篇必須標示為未發布、未核准的獨立審閱稿');
    if(value.startPage!==45||value.endPage!==end||!Array.isArray(value.pages)||value.pages.length!==end-44)throw Error('續篇頁碼或完整頁數不符');
    const sources=new Set();
    value.pages.forEach((p,index)=>{
      if(!p||p.page!==45+index||typeof p.source!=='string'||!new RegExp('^main-'+p.page+'-v[1-9]\\d*\\.png$').test(p.source)||p.image!=='review/main-'+p.page+'.webp'||sources.has(p.source))throw Error('續篇頁序或圖稿路徑不符');
      sources.add(p.source);
      for(const key of ['title','prompt','reviewStatus','generatedSource'])if(typeof p[key]!=='string'||!p[key].trim())throw Error('缺少'+key);
      if(!Array.isArray(p.text)||!p.text.length||p.text.some(t=>typeof t!=='string'||!t.trim()))throw Error('缺少可讀台詞');
      if(!Array.isArray(p.refs)||!p.refs.length||p.refs.length>5||p.refs.some(r=>typeof r!=='string'||!/^assets\/td\/[A-Za-z0-9_/-]+\.png$/.test(r)))throw Error('角色參考不符');
    });
    return value;
  }
  const api=Object.freeze({validate});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ContinuationReviewCatalog=api;
})(typeof globalThis!=='undefined'?globalThis:this);
