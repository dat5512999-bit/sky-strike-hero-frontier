'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'assets/td/concepts/story-comic-v2/continuation');
function validate(value){
  if(!value||value.version!=='0.10.0'||value.runtimeIntegrated!==false||value.published!==false||value.userApproved!==false)throw Error('續篇必須標示為未發布、未核准的獨立審閱稿');
  if(value.startPage!==45||value.endPage!==52||!Array.isArray(value.pages)||value.pages.length!==8)throw Error('續篇必須完整包含45至52頁');
  const sources=new Set();
  value.pages.forEach((p,index)=>{
    if(p.page!==45+index||!new RegExp('^main-'+p.page+'-v[1-9]\\d*\\.png$').test(p.source)||p.image!=='review/main-'+p.page+'.webp'||sources.has(p.source))throw Error('續篇頁序或圖稿路徑不符');
    sources.add(p.source);
    for(const key of ['title','prompt','reviewStatus'])if(typeof p[key]!=='string'||!p[key].trim())throw Error('缺少'+key);
    if(!Array.isArray(p.text)||!p.text.length||p.text.some(t=>typeof t!=='string'||!t.trim()))throw Error('缺少可讀台詞');
    if(!Array.isArray(p.refs)||!p.refs.length||p.refs.length>5||p.refs.some(r=>!r.startsWith('assets/td/')||r.includes('..')||!r.endsWith('.png')))throw Error('角色參考不符');
  });
  return value;
}
async function prepare(){
  const sharp=require('sharp'),value=validate(JSON.parse(fs.readFileSync(path.join(folder,'production-v1.json'),'utf8'))),report=[];
  fs.mkdirSync(path.join(folder,'review'),{recursive:true});
  for(const p of value.pages){
    for(const reference of p.refs)if(!fs.existsSync(path.join(root,reference)))throw Error('Missing reference '+reference);
    const source=path.join(folder,p.source),target=path.join(folder,p.image),meta=await sharp(source).metadata();
    if(meta.width!==1536||meta.height!==1024)throw Error('Wrong dimensions: '+p.source);
    await sharp(source).webp({quality:94,effort:6}).toFile(target);
    report.push({page:p.page,source:p.source,bytes:fs.statSync(target).size});
  }
  console.log(JSON.stringify({version:value.version,pages:report,totalBytes:report.reduce((n,p)=>n+p.bytes,0)},null,2));
}
module.exports={validate,prepare};
if(require.main===module)prepare().catch(error=>{console.error(error);process.exitCode=1;});
