'use strict';
// Mechanical format conversion only; no resizing, drawing or art retouching.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
async function main(){
  const productions=['prologue-production-v1.json','main-production-13-18-v1.json','main-production-19-44-v1.json'];
  const pages=productions.flatMap((file,index)=>JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8')).pages.map(page=>({...page,part:index===0?'prologue':'main'})));
  fs.mkdirSync(path.join(__dirname,'review'),{recursive:true});
  let total=0;
  for(const page of pages){
    const source=path.join(__dirname,page.source);
    const target=path.join(__dirname,'review',page.part+'-'+String(page.page).padStart(2,'0')+'.webp');
    const result=await sharp(source).webp({quality:94,effort:6}).toFile(target);
    total+=result.size;
    console.log(JSON.stringify({page:page.page,width:result.width,height:result.height,bytes:result.size}));
  }
  console.log(JSON.stringify({pages:pages.length,totalBytes:total}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
