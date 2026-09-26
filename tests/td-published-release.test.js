'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

test('release loads every published grid and route in production script order without old browser drafts',()=>{
  const context=vm.createContext({console,localStorage:{getItem:()=>JSON.stringify({version:1,maps:{beginner:{cellSize:64,buildable:[],routes:[]}}})}});
  context.globalThis=context;
  const html=fs.readFileSync('td.html','utf8');
  for(const [,file] of html.matchAll(/<script src="([^"]+)"/g)){
    if(file.startsWith('src/td/')&&!file.endsWith('/main.js'))vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  }
  const ns=context.TowerFrontier,published=context.HeroFrontierPublishedMaps;
  assert.equal(published.schemaVersion,1);assert.ok(published.revision>0);
  assert.ok(Object.keys(published.maps).length>0);
  assert.equal(ns.maps.routeOverrideInstalled,true);
  for(const [id,entry] of Object.entries(published.maps)){
    const map=ns.maps.definitions[id];assert.ok(map,id+' must exist');ns.maps.apply(id);
    if(entry.routes){
      const review=ns.mapTools.MapRoute.validate(map,entry.routes);
      assert.equal(review.valid,true,id+': '+review.problems.join('; '));
      assert.equal(JSON.stringify(ns.config.routes),JSON.stringify(entry.routes),id+' active routes');
      const monster=new ns.entities.Monster('grunt',1);
      assert.equal(JSON.stringify(monster.path),JSON.stringify(entry.routes[0]),id+' monster path');
    }
    if(!entry.layout)continue;
    const {cellSize,buildable}=entry.layout;assert.equal(cellSize,64);
    const selected=new Set();
    for(const cell of buildable){
      assert.ok(Number.isInteger(cell.column)&&Number.isInteger(cell.row));
      assert.ok(cell.column>=0&&cell.row>=0&&cell.column<map.width/64&&cell.row<map.height/64,id+' grid bounds');
      const key=cell.column+':'+cell.row;assert.equal(selected.has(key),false,id+' duplicate grid');selected.add(key);
    }
    const build=new ns.systems.BuildSystem();
    for(let row=0;row<map.height/64;row++)for(let column=0;column<map.width/64;column++){
      assert.equal(build.canPlaceAt(column*64+32,row*64+32,'building'),selected.has(column+':'+row),id+' published grid '+column+':'+row);
    }
    assert.ok(buildable.length>0,id+' must have playable tower sites');
    const first=buildable[0],x=first.column*64+32,y=first.row*64+32;
    assert.equal(build.queue(Object.keys(ns.config.buildings)[0],'building'),true);
    assert.equal(build.placeQueued(x,y,{gold:9999,lumber:999,merit:999}),true,id+' real deployment');
    assert.equal(build.canPlaceAt(x,y,'building'),false,id+' occupied site');
  }
});
