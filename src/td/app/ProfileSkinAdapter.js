(function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const KEY='shop:state';
  const initial=()=>({version:1,revision:0,balance:10000,ownedSkins:[],equippedSkins:{}});
  class ProfileSkinAdapter{
    constructor(profiles){this.profiles=profiles;const p=profiles.current();this.identity=p.id+':'+p.round;}
    active(){const p=this.profiles.current();if(p.id+':'+p.round!==this.identity)throw new Error('玩家檔案已切換，請重新開啟商城。');return p;}
    async load(){const raw=this.active().data[KEY];return raw===undefined?initial():JSON.parse(raw);}
    async commit(next,expectedRevision){
      this.active();
      this.profiles.change(state=>{
        const p=state.profiles[state.active],current=p.data[KEY]===undefined?initial():JSON.parse(p.data[KEY]);
        if(current.revision!==expectedRevision)throw new Error('外觀資料已更新，請重新開啟商城後再試。');
        p.data[KEY]=JSON.stringify(clone(next));
      });
    }
  }
  root.FrontierShop=Object.assign(root.FrontierShop||{},{ProfileSkinAdapter});
  if(typeof module!=='undefined')module.exports={ProfileSkinAdapter,initial};
})(globalThis);
