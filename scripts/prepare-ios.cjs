'use strict';
// An isolated development bundle. This is not an App Store release approval.
const fs=require('node:fs'),path=require('node:path');
const {plan}=require('./build-static-site.cjs');
const {playerStore,playerApp}=require('./ios-player-mode.cjs');
const legal=require('./ios-legal.cjs');
const ROOT=path.resolve(__dirname,'..');
const OMIT=new Set(['index.html','sw.js','update.html','codex-dev.html']);
function nativeText(file,text){
  if(file==='src/td/app/ProfileStore.js')return playerStore(text);
  if(file==='src/td/app/FrontierApp.js')return playerApp(text);
  if(file==='src/td/main.js'){
    const lines=text.split(/\r?\n/),registration=lines.findIndex(line=>line.includes("navigator.serviceWorker.register('./sw.js'"));
    if(registration<0)throw Error('找不到預期的 Worker 註冊，請更新 iOS 打包轉換');
    lines[registration]='  // Bundled iOS app updates through App Store releases.';return lines.join('\n');
  }
  if(file==='src/td/mobile-pwa.js')return "// Native bundle: installation and web Worker updates are not used.\n";
  if(file==='src/td/update-client.js')return "// Native bundle: web updater disabled; update using App Store.\n";
  return text;
}
function prepare(root=ROOT,write=false){
  const result=plan(root),destination=path.join(result.root,'native/ios/www');
  const files=result.files.filter(f=>!OMIT.has(f.path));
  // Refuse overwriting prior outputs. Keep old builds for diagnosis/rollback.
  if(write&&fs.existsSync(destination))throw Error('native/ios/www 已存在；請先移至備份目錄，再建立新包。');
  const transformed={};for(const file of ['src/td/main.js','src/td/mobile-pwa.js','src/td/update-client.js','src/td/app/ProfileStore.js','src/td/app/FrontierApp.js'])transformed[file]=nativeText(file,fs.readFileSync(path.join(root,file),'utf8'));
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const config=JSON.parse(fs.readFileSync(path.join(ROOT,'native/ios/legal-config.json'),'utf8')),legalPages=legal.pages(config);
  const manifest={schema:1,version:pkg.version,iosPreparationVersion:pkg.iosPreparationVersion||'fixture',playerMode:true,target:'ios-development',entry:'td.html',sourceBytes:files.reduce((n,f)=>n+f.bytes,0),files:files.map(f=>f.path),releaseReady:false,blockers:[
    'Bundle ID、Apple Team、簽署與原生工程尚未完成',
    '隱私政策、客服網址、資料與 Required Reason API 盤點待完成',
    '圖片、音效與造型商用授權待逐項確認',
    'iPhone 真機、背景恢復、存檔匯出匯入與效能尚待驗收',
    '正式圖示、商城截圖、年齡分級與 App Store Connect 資料尚待完成'
  ]};
  manifest.generatedFiles=['index.html','ios-build-manifest.json',...Object.keys(legalPages)];
  manifest.legalBlockers=legal.blockers(config);
  if(write){
    fs.mkdirSync(destination,{recursive:true});
    for(const file of files){const target=path.join(destination,file.path);fs.mkdirSync(path.dirname(target),{recursive:true});if(Object.hasOwn(transformed,file.path))fs.writeFileSync(target,transformed[file.path]);else fs.copyFileSync(path.join(root,file.path),target,fs.constants.COPYFILE_EXCL);}
    fs.writeFileSync(path.join(destination,'index.html'),'<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>英雄邊境</title></head><body><script>location.replace("td.html");</script><a href="td.html">開始遊戲</a></body></html>');
    fs.writeFileSync(path.join(destination,'ios-build-manifest.json'),JSON.stringify(manifest,null,2));
    for(const [file,content] of Object.entries(legalPages))fs.writeFileSync(path.join(destination,file),content);
  }
  return{...manifest,legalBlockers:legal.blockers(config),destination:write?destination:null,fileCount:files.length+2+Object.keys(legalPages).length};
}
module.exports={prepare,nativeText};
if(require.main===module){try{const arg=process.argv[2];if(!['--check','--build'].includes(arg)||process.argv.length!==3)throw Error('用法：node scripts/prepare-ios.cjs --check 或 --build');const r=prepare(ROOT,arg==='--build');console.log(JSON.stringify({...r,files:undefined},null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
