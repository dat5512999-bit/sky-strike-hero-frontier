'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {prepare,nativeText}=require('../scripts/prepare-ios.cjs');
test('iOS plan bundles game offline without worker or web updater and reports release blockers',()=>{
  const p=prepare();assert.equal(p.releaseReady,false);assert(p.blockers.length>=5);assert(p.files.includes('td.html'));assert(p.files.includes('src/td/app/ProfileStore.js'));assert(!p.files.includes('sw.js'));assert(!p.files.includes('update.html'));assert(p.sourceBytes>0);
  const main=nativeText('src/td/main.js',fs.readFileSync('src/td/main.js','utf8'));assert(!main.includes('serviceWorker.register'));assert(main.includes('towerFrontierGame'));assert.throws(()=>nativeText('src/td/main.js','unexpected format'),/Worker/);
});
test('isolated iOS copy transforms app shell, preserves inputs and refuses overwriting an old output',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hero-ios-'));
  // Tiny build fixture, not a copy of the entire production asset library.
  for(const f of ['index.html','td.html','td-mobile.html','update.html','sw.js','.nojekyll','package.json','src/td/main.js','src/td/mobile-pwa.js','src/td/update-client.js']){
    const p=path.join(dir,f);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,f==='package.json'?'{"version":"1.0.0"}':f.endsWith('main.js')?"navigator.serviceWorker.register('./sw.js');\nconst towerFrontierGame={};":'fixture');
  }
  for(const f of ['ProfileStore.js','FrontierApp.js']){fs.mkdirSync(path.join(dir,'src/td/app'),{recursive:true});fs.copyFileSync('src/td/app/'+f,path.join(dir,'src/td/app',f));}
  const r=prepare(dir,true);assert(fs.existsSync(path.join(r.destination,'td.html')));assert(!fs.existsSync(path.join(r.destination,'sw.js')));assert(!fs.existsSync(path.join(r.destination,'update.html')));assert(!fs.readFileSync(path.join(r.destination,'src/td/main.js'),'utf8').includes('serviceWorker.register'));assert.equal(fs.readFileSync(path.join(dir,'src/td/update-client.js'),'utf8'),'fixture');assert.throws(()=>prepare(dir,true),/已存在/);
  // Intentionally retain tiny fixture to avoid any recursive filesystem deletion.
});
