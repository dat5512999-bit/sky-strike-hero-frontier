'use strict';
// Local authoring service. The only writable game target is published-maps.js.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const PREFIX='globalThis.HeroFrontierPublishedMaps = ';
function createStudio(root){
  root=fs.realpathSync(root);
  const target=path.join(root,'src/td/map-tools/published-maps.js'),history=path.join(root,'artifacts/map-history');
  const context=vm.createContext({});context.globalThis=context;
  for(const file of ['namespace.js','config.js','maps.js','map-tools/MapRouteModel.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/td',file),'utf8'),context);
  const ns=context.TowerFrontier,token=crypto.randomBytes(32).toString('hex');
  function read(){const source=fs.readFileSync(target,'utf8').trim();if(!source.startsWith(PREFIX)||!source.endsWith(';'))throw new Error('正式地圖資料格式異常，請先還原備份。');const state=JSON.parse(source.slice(PREFIX.length,-1));if(state.schemaVersion!==1||!Number.isSafeInteger(state.revision)||!state.maps)throw new Error('正式地圖版本不相容。');return state;}
  function fail(message,status=400){throw Object.assign(new Error(message),{status});}
  function validate(mapId,change){
    const map=Object.hasOwn(ns.maps.definitions,mapId)&&ns.maps.definitions[mapId];if(!map||!map.visible)fail('未知地圖。');
    const result={};
    if(Object.hasOwn(change,'layout')){
      const value=change.layout;
      if(!value||value.cellSize!==64||!Array.isArray(value.buildable)||value.buildable.length>Math.ceil(map.width/64)*Math.ceil(map.height/64))fail('建造格資料格式錯誤。');
      const seen=new Set();
      result.layout={cellSize:64,buildable:value.buildable.map(cell=>{if(!cell||!Number.isInteger(cell.column)||!Number.isInteger(cell.row)||cell.column<0||cell.row<0||cell.column>=Math.ceil(map.width/64)||cell.row>=Math.ceil(map.height/64))fail('建造格座標超出地圖。');const key=cell.column+':'+cell.row;if(seen.has(key))fail('建造格重複。');seen.add(key);return {column:cell.column,row:cell.row};})};
    }
    if(Object.hasOwn(change,'routes')){
      const routes=change.routes;
      if(!Array.isArray(routes)||routes.length>8||routes.some(route=>!Array.isArray(route)||route.length<2||route.length>512||route.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))))fail('路線格式錯誤。');
      const normalized=ns.mapTools.MapRoute.cloneRoutes(routes),review=ns.mapTools.MapRoute.validate(map,normalized);
      if(!review.valid)fail(review.problems.join(' '));result.routes=normalized;
    }
    if(!Object.keys(result).length)fail('沒有可發佈的變更。');return result;
  }
  function commit(current,maps){
    fs.mkdirSync(history,{recursive:true});
    const backup=path.join(history,String(current.revision)+'.json');
    if(!fs.existsSync(backup))fs.writeFileSync(backup,JSON.stringify(current,null,2),'utf8');
    const state={schemaVersion:1,revision:current.revision+1,publishedAt:new Date().toISOString(),maps};
    const temp=target+'.'+crypto.randomBytes(6).toString('hex')+'.tmp';
    fs.writeFileSync(temp,PREFIX+JSON.stringify(state)+';\n','utf8');
    fs.renameSync(temp,target);return state;
  }
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.mp4':'video/mp4','.vtt':'text/vtt','.ico':'image/x-icon'};
  const server=http.createServer(async(req,res)=>{
    function json(code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
    try{
      const host='127.0.0.1:'+server.address().port;
      if(req.headers.host!==host)return json(403,{error:'只允許本機管理網址。'});
      const url=new URL(req.url,'http://'+host);
      if(url.pathname.startsWith('/api/studio/')){
        if(req.headers.origin&&req.headers.origin!=='http://'+host)return json(403,{error:'拒絕跨站請求。'});
        if(req.method==='GET'&&url.pathname==='/api/studio/state')return json(200,{token,state:read(),history:fs.existsSync(history)?fs.readdirSync(history).filter(f=>/^\d+\.json$/.test(f)).map(f=>Number(f.slice(0,-5))).sort((a,b)=>b-a):[]});
        if(req.method!=='POST'||req.headers['x-studio-token']!==token||req.headers.origin!=='http://'+host)return json(403,{error:'管理工作階段失效，請重新整理。'});
        if(!String(req.headers['content-type']).startsWith('application/json'))return json(415,{error:'需要 JSON 資料。'});
        let body='',size=0;for await(const chunk of req){size+=chunk.length;if(size>1024*1024)fail('資料超過 1 MB。',413);body+=chunk;}
        let input;try{input=JSON.parse(body);}catch{fail('無法解析資料。');}
        if(!input||typeof input!=='object')fail('無效請求。');
        const current=read();if(input.baseRevision!==current.revision)fail('其他頁面已發佈新版本。請重新整理後再試，避免覆蓋。',409);
        if(url.pathname==='/api/studio/publish'){
          if(!input.changes||typeof input.changes!=='object'||Array.isArray(input.changes))fail('缺少地圖變更。');
          const entries=Object.entries(input.changes);if(!entries.length||entries.length>ns.maps.publicMaps().length)fail('地圖數量錯誤。');
          const maps={...current.maps};for(const [id,change] of entries){if(!change||typeof change!=='object')fail('無效地圖設定。');maps[id]={...maps[id],...validate(id,change)};}
          return json(200,{state:commit(current,maps)});
        }
        if(url.pathname==='/api/studio/restore'){
          if(!Number.isSafeInteger(input.revision)||input.revision<0)fail('無效備份版本。');
          const backup=path.join(history,input.revision+'.json');if(!fs.existsSync(backup))fail('找不到備份。',404);
          const restored=JSON.parse(fs.readFileSync(backup,'utf8'));for(const [id,change] of Object.entries(restored.maps))validate(id,change);
          return json(200,{state:commit(current,restored.maps)});
        }
        return json(404,{error:'未知操作。'});
      }
      if(req.method!=='GET'&&req.method!=='HEAD')return json(405,{error:'不支援此方法。'});
      const relative=decodeURIComponent(url.pathname).replace(/^\//,'')||'developer-studio.html';
      if(relative.split(/[\\/]/).some(p=>p==='..'||p.startsWith('.'))||/^(scripts|docs|tests|artifacts|node_modules)[\\/]/.test(relative))return json(403,{error:'禁止存取。'});
      const file=fs.realpathSync(path.resolve(root,relative));if(!file.startsWith(root+path.sep)||!mime[path.extname(file)]||!fs.statSync(file).isFile())return json(403,{error:'禁止存取。'});
      res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
    }catch(error){if(!res.headersSent)json(error.status||((error.code==='ENOENT')?404:500),{error:error.status?error.message:'讀寫失敗，既有設定已保留。請檢查終端機與檔案權限。'});else res.end();}
  });
  return server;
}
if(require.main===module){const port=Number(process.env.TD_STUDIO_PORT)||4174;const server=createStudio(path.resolve(__dirname,'..'));server.on('error',error=>{console.error('管理後台啟動失敗：'+error.message);process.exitCode=1;});server.listen(port,'127.0.0.1',()=>console.log('管理後台：http://127.0.0.1:'+port+'/developer-studio.html\n請保留此視窗；結束請按 Ctrl+C。'));}
module.exports={createStudio};
