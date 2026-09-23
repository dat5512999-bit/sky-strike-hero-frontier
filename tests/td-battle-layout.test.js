'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');
test('old phone preference does not force a wide pointer desktop into touch battle controls',()=>{
 const {ns}=load(),values={towerFrontierLayout:'mobile'},storage={getItem:k=>values[k]||null,setItem:(k,v)=>values[k]=v},root={dataset:{}},view={width:1911,height:900,coarse:false};
 const layout=new ns.systems.LayoutSystem(root,storage,()=>view);
 assert.equal(layout.choice,'auto');assert.equal(layout.resolved(),'desktop');
 layout.select('mobile');assert.equal(new ns.systems.LayoutSystem(root,storage,()=>view).resolved(),'mobile','an explicit new desktop preference remains available');
 const touch=new ns.systems.LayoutSystem({dataset:{}},storage,()=>({width:844,height:390,coarse:true}));
 assert.equal(touch.resolved(),'mobile');touch.select('auto');
 assert.equal(new ns.systems.LayoutSystem(root,storage,()=>view).resolved(),'mobile','touch changes do not overwrite pointer preferences');
});
test('small desktop windows, touch devices and inaccessible storage retain responsive fallbacks',()=>{
 const {ns}=load(),L=ns.systems.LayoutSystem;
 assert.equal(new L({dataset:{}},{getItem:()=> 'mobile'},()=>({width:844,height:390,coarse:true})).resolved(),'mobile');
 assert.equal(new L({dataset:{}},{getItem(){throw Error('denied');}},()=>({width:1911,height:900,coarse:false})).resolved(),'desktop');
 assert.equal(new L({dataset:{}},null,()=>390).resolved(),'mobile');
});
