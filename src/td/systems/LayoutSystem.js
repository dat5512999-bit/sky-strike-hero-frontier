(function(ns){
  'use strict';
  class LayoutSystem{
    constructor(root,storage,viewport){this.root=root;this.storage=storage;this.viewport=viewport||function(){return 1024;};this.storageKey='towerFrontierLayout';this.choice='auto';this.restore();}
    modes(){return['auto','desktop','mobile'];}
    restore(){let saved='auto';try{saved=this.storage&&this.storage.getItem(this.storageKey)||'auto';}catch(error){saved='auto';}this.choice=this.modes().includes(saved)?saved:'auto';this.apply();return this.choice;}
    select(mode){if(!this.modes().includes(mode))return false;this.choice=mode;try{if(this.storage)this.storage.setItem(this.storageKey,mode);}catch(error){}this.apply();return true;}
    resolved(){return this.choice==='auto'?(this.viewport()<=700?'mobile':'desktop'):this.choice;}
    apply(){if(!this.root)return this.resolved();this.root.dataset.layout=this.resolved();this.root.dataset.layoutChoice=this.choice;return this.root.dataset.layout;}
    onResize(){if(this.choice==='auto')this.apply();}
  }
  ns.systems.LayoutSystem=LayoutSystem;
})(globalThis.TowerFrontier);
