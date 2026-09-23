'use strict';
// Generate isolated browser fixtures from the real renderers/styles; never use player storage.
// Desktop browser tools cannot emulate pointer media here, so ONLY the fixture CSS forces
// the production touch media branches on (and hover/fine branches off).
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/mobile-ranking');
const {load}=require('../tests/helpers/td-runtime.cjs');
const {ns}=load();
const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
const sheets=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]);
fs.mkdirSync(out,{recursive:true});
for(const touch of [false,true]){
  const css=sheets.map(file=>{
    let value=fs.readFileSync(path.join(root,file),'utf8');
    if(touch)value=value.replace(/\(hover:\s*none\)/g,'(min-width:0px)').replace(/\(pointer:\s*coarse\)/g,'(min-width:0px)').replace(/\(hover:\s*hover\)/g,'(max-width:0px)').replace(/\(pointer:\s*fine\)/g,'(max-width:0px)');
    return value;
  }).join('\n');
  for(const populated of [false,true]){
    const data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)});
    if(populated)store.adapter('free').setItem('heroFrontierScoreRecordsV1',JSON.stringify({version:3,runs:Array.from({length:12},(_,i)=>({runId:'qa-'+i,score:1200+i*100,scoreVersion:'BATTLE_V1',mode:'free',outcome:'success',victory:true,map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter',time:130,waves:30,completedAt:'2026-09-23T00:00:00.000Z'}))}));
    const app=Object.create(ns.systems.FrontierApp.prototype);
    app.store=store;app.page='ranking';app.root={dataset:{},querySelector:()=>null};app.render();
    const name=(touch?'touch':'pointer')+'-'+(populated?'records':'empty');
    fs.writeFileSync(path.join(out,name+'.html'),`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"><title>Ranking QA ${name}</title><style>${css}</style></head><body><div id="frontier-app" data-page="ranking">${app.root.innerHTML}</div></body></html>`);
  }
}
const wrapper=fs.readFileSync(path.join(root,'td-mobile.html'),'utf8').replace("frame.src='td.html'+location.search+location.hash;","frame.src='touch-records.html';").replace('<script src="src/td/mobile-pwa.js"></script>','');
fs.writeFileSync(path.join(out,'rotated.html'),wrapper);
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><title>Mobile ranking layout QA</title></head><body style="margin:12px;background:#222;color:white;font:16px system-ui"><label>Viewport <select id="size"><option>844x390</option><option>667x375</option><option>932x430</option><option>390x844</option><option>960x450</option><option>1440x900</option></select></label> <label>Fixture <select id="fixture"><option>touch-records</option><option>touch-empty</option><option>pointer-records</option><option>rotated</option></select></label><p id="result"></p><iframe style="display:block;border:1px solid #888" title="Ranking fixture"></iframe><script>
const frame=document.querySelector('iframe'),size=document.querySelector('#size'),fixture=document.querySelector('#fixture');
function render(){const [w,h]=size.value.split('x');frame.style.width=w+'px';frame.style.height=h+'px';frame.src=fixture.value+'.html';}
function inspect(){const d=frame.contentDocument.querySelector('iframe')?.contentDocument||frame.contentDocument,main=d.querySelector('.lobby-main');if(!main)return;const nav=d.querySelector('.lobby-nav'),box=main.getBoundingClientRect(),touch=fixture.value!=='pointer-records',bad=[...d.querySelectorAll('.lobby-content,.rank-list-panel,.rank-detail-panel,.rank-row')].filter(e=>e.scrollWidth>e.clientWidth+1);const passed=(!touch||Math.abs(box.width-d.documentElement.clientWidth)<2)&&!bad.length&&(!touch||box.bottom<=nav.getBoundingClientRect().top+1);document.querySelector('#result').textContent=JSON.stringify({passed,viewport:[d.documentElement.clientWidth,d.documentElement.clientHeight],mainWidth:box.width,overflow:bad.map(e=>e.className)});}
size.onchange=fixture.onchange=render;frame.onload=()=>{inspect();const child=frame.contentDocument.querySelector('iframe');if(child)child.onload=inspect;};render();
</script></body></html>`);
console.log('Fixtures: http://127.0.0.1:4173/artifacts/mobile-ranking/{touch-records,touch-empty,pointer-records,rotated}.html');
