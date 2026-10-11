'use strict';
// Deterministic format conversion only: preserve full source pixels and original PNGs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sharp=require('sharp'),root=path.resolve(__dirname,'..');
const context={TowerFrontier:{systems:{}}};vm.runInNewContext(fs.readFileSync(path.join(root,'src/td/app/StoryMangaCatalog.js'),'utf8'),context);
(async()=>{const pages=context.TowerFrontier.systems.StoryMangaCatalog;
if(pages.length!==44||pages.some((p,i)=>p.storyPage!==i+1))throw Error('正式漫畫必須為依序完整的 44 頁');
for(const page of pages){
  if(!/^assets\/td\/concepts\/story-comic-v2\/(?:prologue|main)-\d{2}-v\d+\.png$/.test(page.sourcePath)||!/^assets\/td\/story\/manga-v2\/page-\d{2}\.webp$/.test(page.image))throw Error('漫畫來源或輸出路徑不合法');
  const source=path.join(root,page.sourcePath),target=path.join(root,page.image);
  const meta=await sharp(source).metadata();if(meta.width!==1536||meta.height!==1024)throw Error('漫畫比例錯誤：'+page.sourcePath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  // Always rebuild: selecting an older versioned PNG is a valid rollback and
  // its timestamp must not leave a newer, wrong image at the runtime URL.
  await sharp(source).webp({quality:94,effort:6}).toFile(target);console.log(page.image,fs.statSync(target).size);
}
})().catch(error=>{console.error(error);process.exitCode=1;});
