'use strict';
const fs=require('node:fs'),path=require('node:path');
const {validate}=require('../assets/td/concepts/story-comic-v2/continuation/review-catalog.js');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'assets/td/concepts/story-comic-v2/continuation');
async function prepare(){
  const sharp=require('sharp'),value=validate(JSON.parse(fs.readFileSync(path.join(folder,'production-v3.json'),'utf8'))),report=[];
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
