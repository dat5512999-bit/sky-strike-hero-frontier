(function(ns){
  'use strict';
  class LayoutSystem{
    constructor(root,storage,viewport){this.root=root;this.storage=storage;this.viewport=viewport||function(){return 1024;};this.storageKey='towerFrontierLayout';this.choice='auto';this.restore();}
    modes(){return['auto','desktop','mobile'];}
    restore(){let saved='auto';try{saved=this.storage&&this.storage.getItem(this.storageKey)||'auto';}catch(error){saved='auto';}this.choice=this.modes().includes(saved)?saved:'auto';this.apply();return this.choice;}
    select(mode){if(!this.modes().includes(mode))return false;this.choice=mode;try{if(this.storage)this.storage.setItem(this.storageKey,mode);}catch(error){}this.apply();return true;}
    dimensions(){const value=this.viewport(),width=typeof value==='number'?value:value.width;return{width:width||1024,height:typeof value==='number'?Infinity:value.height||Infinity,coarse:typeof value==='number'?false:Boolean(value.coarse)};}
    resolved(){const view=this.dimensions();return this.choice==='auto'?(view.width<=700||view.coarse&&view.width>view.height&&view.height<=700?'mobile':'desktop'):this.choice;}
    apply(){const mode=this.resolved();if(!this.root)return mode;const view=this.dimensions();this.root.dataset.layout=mode;this.root.dataset.layoutChoice=this.choice;this.root.dataset.combatOrientation=mode==='mobile'&&view.width>view.height?'landscape':'portrait';return mode;}
    onResize(){this.apply();}
  }
  ns.systems.LayoutSystem=LayoutSystem;
})(globalThis.TowerFrontier);
