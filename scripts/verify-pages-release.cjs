'use strict';
// Read-only deployment verification. Never reads browser/player storage.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
const defaultUrl='https://dat5512999-bit.github.io/sky-strike-hero-frontier/';
const entries=['td.html','td-mobile.html','mobile-simulator.html','update.html','audio-preview.html'];
function releaseFiles(){
  const files=new Set([...entries,'sw.js','td.webmanifest','src/td/mobile-entry.js']);
  for(const entry of entries){
    const html=fs.readFileSync(path.join(root,entry),'utf8');
    for(const [,file] of html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css|webmanifest))"/g)){
      if(!/^(?:https?:|\/)/.test(file))files.add(file.replace(/^\.\//,''));
    }
  }
  for(const file of ['assets/td/tower-effects-painted-v2.png','assets/td/tower-magic-effects-v2.png','assets/td/soldier-effects-v1.png','assets/td/bosses/demonlord-actions-v2.png'])files.add(file);
  // New story scenes must be verified as bytes, not inferred from a successful JS deploy.
  for(const name of ['chapter2-ember-road-rescue','chapter2-stone-circle-escort','chapter2-red-mesa-convoy',
    'chapter3-white-trace-sample','chapter3-echo-yard-receiver','chapter3-crossmark-records','chapter3-nightwatch-defense',
    'chapter4-tidegate-readings','chapter4-brineway-measurements','chapter4-reef-records','chapter4-observatory-archive'])files.add('assets/td/story/'+name+'-v1.png');
  files.add('assets/td/naga/tidebreaker-selection-v1.png');
  return [...files];
}
function digest(bytes,file){
  const normalized=/\.(?:html|js|css|webmanifest)$/.test(file)?Buffer.from(bytes).toString('utf8').replace(/\r\n/g,'\n'):bytes;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
async function verify(base=defaultUrl,fetcher=fetch,files=releaseFiles()){
  const url=new URL(base);if(!/^https?:$/.test(url.protocol))throw Error('Expected an HTTP(S) site URL');
  if(!url.pathname.endsWith('/'))url.pathname+='/';url.search='';url.hash='';
  const failures=[],queue=files.flatMap(file=>[{file,bust:true},...(entries.includes(file)||file==='sw.js'?[{file,bust:false}]:[])]);
  let cursor=0;
  async function worker(){
    while(cursor<queue.length){
      const {file,bust}=queue[cursor++],target=new URL(file,url);
      if(bust)target.searchParams.set('release',version);
      try{
        const response=await fetcher(target,{cache:'no-store',signal:AbortSignal.timeout(20000)});
        if(!response.ok)throw Error('HTTP '+response.status);
        const actual=Buffer.from(await response.arrayBuffer()),expected=fs.readFileSync(path.join(root,file));
        if(digest(actual,file)!==digest(expected,file))throw Error('content differs from local release');
      }catch(error){failures.push(file+(bust?'?release='+version:'')+': '+error.message);}
    }
  }
  await Promise.all(Array.from({length:6},worker));
  if(failures.length)throw Error(failures.join('\n'));
  return {version,site:url.href,files:files.length,requests:queue.length};
}
module.exports={releaseFiles,digest,verify};
if(require.main===module)verify(process.argv[2]||defaultUrl).then(result=>console.log('PASS online release '+JSON.stringify(result))).catch(error=>{console.error('FAIL online release v'+version+'\n'+error.message);process.exitCode=1;});
