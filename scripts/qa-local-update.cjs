'use strict';
// Serve the real previous tagged shell first, then the working tree, entirely
// inside a disposable localhost server and isolated browser profile.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{execFileSync,spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tag=process.env.UPDATE_BASELINE_TAG||'v0.85.100',current=require('../package.json').version;
const oldFiles=execFileSync('git',['ls-tree','-r','--name-only',tag],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/),baseline=new Map();
for(const file of oldFiles)if(!file.startsWith('assets/')&&/\.(?:js|html|css|webmanifest)$/.test(file)&&!file.startsWith('tests/')&&!file.startsWith('scripts/'))baseline.set(file,execFileSync('git',['show',tag+':'+file],{cwd:root,maxBuffer:20*1024*1024}));
let upgraded=false;
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json','.webmanifest':'application/manifest+json','.wav':'audio/wav','.ogg':'audio/ogg','.mp3':'audio/mpeg'};
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://127.0.0.1');if(url.pathname==='/update.html'&&url.searchParams.get('release')===current)upgraded=true;
  const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html',file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  const send=data=>response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
  if(!upgraded&&baseline.has(relative)){send(baseline.get(relative));return;}
  fs.readFile(file,(error,data)=>error?response.writeHead(404).end():send(data));
});
server.listen(0,'127.0.0.1',()=>{
  const base='http://127.0.0.1:'+server.address().port;console.log('Update fixture: '+tag+' → '+current+' at '+base);
  const child=spawn(process.execPath,['scripts/qa-pages-update.cjs'],{cwd:root,env:{...process.env,PAGES_UPDATE_QA_URL:base},stdio:'inherit',windowsHide:true});
  child.on('error',error=>{console.error(error);server.close();process.exitCode=1;});child.on('exit',code=>{server.close();server.closeAllConnections();process.exitCode=code??1;});
});
