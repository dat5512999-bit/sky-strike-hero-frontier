(function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const KEY='shop:state',ADMIN_BALANCE=99999,ADMIN_GRANT='shop:admin-diamonds-99999-v1';
  const initial=profile=>({version:1,revision:0,balance:profile?.kind==='admin'?ADMIN_BALANCE:10000,ownedSkins:[],equippedSkins:{}});
  class ProfileSkinAdapter{
    constructor(profiles){this.profiles=profiles;const p=profiles.current();this.identity=p.id+':'+p.round;}
    active(){const p=this.profiles.current();if(p.id+':'+p.round!==this.identity)throw new Error('玩家檔案已切換，請重新開啟商城。');return p;}
    async load(){const profile=this.active(),raw=profile.data[KEY],state=raw===undefined?initial(profile):JSON.parse(raw);if(profile.kind!=='admin'||profile.data[ADMIN_GRANT]==='true'||!Number.isSafeInteger(state.balance)||state.balance<0)return state;this.profiles.change(next=>{const p=next.profiles[next.active],current=p.data[KEY]===undefined?initial(p):JSON.parse(p.data[KEY]);if(p.kind!=='admin'||p.data[ADMIN_GRANT]==='true'||!Number.isSafeInteger(current.balance)||current.balance<0)return;current.balance=Math.max(current.balance,ADMIN_BALANCE);current.revision++;p.data[KEY]=JSON.stringify(current);p.data[ADMIN_GRANT]='true';});return JSON.parse(this.active().data[KEY]);}
    async commit(next,expectedRevision){
      this.active();
      this.profiles.change(state=>{
        const p=state.profiles[state.active],current=p.data[KEY]===undefined?initial(p):JSON.parse(p.data[KEY]);
        if(current.revision!==expectedRevision)throw new Error('外觀資料已更新，請重新開啟商城後再試。');
        p.data[KEY]=JSON.stringify(clone(next));
      });
    }
  }
  root.FrontierShop=Object.assign(root.FrontierShop||{},{ProfileSkinAdapter});
  if(typeof module!=='undefined')module.exports={ProfileSkinAdapter,initial,ADMIN_BALANCE};
})(globalThis);
