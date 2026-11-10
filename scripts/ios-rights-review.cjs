'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function evidenceFiles(root){
  const result=[];
  function walk(rel){if(!fs.existsSync(path.join(root,rel)))return;for(const entry of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){const f=rel+'/'+entry.name;if(entry.isSymbolicLink())continue;if(entry.isDirectory())walk(f);else if(/\.(json|md)$/i.test(f)&&!f.includes('IOS_MATERIAL_RIGHTS_REVIEW')){const text=fs.readFileSync(path.join(root,f),'utf8');result.push({file:f,hash:hash(text),paths:new Set([...text.matchAll(/assets\/[a-zA-Z0-9_./-]+\.(?:png|webp|jpg|jpeg|svg|wav|mp3|ogg|m4a|mp4|webm)/g)].map(m=>m[0])),type:/prompt|manifest/i.test(f)?'production-record':'documentation-reference'});}}}
  walk('docs');walk('assets');return result;
}
function classify(asset,records,review){
  const evidence=records.filter(r=>r.paths.has(asset.path)).map(({file,hash,type})=>({file,sha256:hash,type}));
  const visual=(review.visualInspections||[]).find(r=>r.path===asset.path);
  const currentVisual=visual&&visual.sha256===asset.sha256;
  const voice=/^assets\/audio\/voices\/bull\/.*\.wav$/.test(asset.path);
  const ownerDeclared=/\.(png|webp|jpg|jpeg|svg)$/i.test(asset.path)&&review.ownerDeclaration?.externalImagesUsed===false;
  const status=voice?'provider-permission-found':evidence.some(e=>e.type==='production-record')?'production-record-found':evidence.length?'documentation-found':'source-evidence-needed';
  return{...asset,evidenceRecords:evidence.map(e=>e.file),evidence,rightsStatus:status,ownerDeclaration:ownerDeclared?review.ownerDeclaration:null,releaseApproved:false,visualInspection:visual?{...visual,current:currentVisual}:null,nextAction:voice?'保存供應商商用聲明與生成紀錄；供應商聲明不是上游權利保證，不因模型名稱直接推定輸出須採同一授權。':ownerDeclared?'使用者已確認圖片及參考圖為本專案生成／自繪；保留原始生成或繪製紀錄與適用工具條款，不需因缺索引而直接重畫。':status==='source-evidence-needed'?'補原始生成／作者／購買紀錄及參考素材權利；無法補證時評估以來源明確素材替換。':'對照原始製作紀錄與參考圖、確認帳號及適用條款；完成人工權利審查。'};
}
function reviewAssets(root,assets){const records=evidenceFiles(root),file=path.join(root,'native/ios/rights-evidence.json'),review=JSON.parse(fs.readFileSync(file,'utf8'));const output=assets.map(a=>classify(a,records,review)),categories={};for(const a of output)categories[a.rightsStatus]=(categories[a.rightsStatus]||0)+1;return{assets:output,summary:{categories,releaseApproved:0,ownerDeclaredImages:output.filter(a=>a.ownerDeclaration).length,visuallyInspectedCurrent:output.filter(a=>a.visualInspection?.current).length},providerChecks:review.providerChecks,proceduralAudio:review.proceduralAudio,limits:['製作紀錄、使用者來源聲明、文件引用、供應商聲明與法律授權核准是不同證據層級。','只有列明且雜湊相符的封面做過本輪視覺檢視，未宣稱全面看過所有動作格或影片。']};}
module.exports={hash,classify,reviewAssets};
