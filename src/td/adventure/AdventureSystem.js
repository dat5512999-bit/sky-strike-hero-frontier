(function(ns){
  'use strict';
  const copy=x=>JSON.parse(JSON.stringify(x)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const KEY='adventure:world-v1';
  class AdventureSystem{
    constructor(game){this.game=game;this.reset();}
    reset(){this.mapId=null;this.definition=null;this.states={};this.fields=[];this.clock=0;this.scan=0;this.smokeUntil=-1;this.platformOpen=false;this.inherited=false;this.claimedIncoming=[];this.context=null;this.log=[];this.revision=0;}
    configure(map,context){
      this.reset();this.mapId=map?.id;this.definition=ns.systems.AdventureCatalog.describe(map);this.context=context||null;
      for(const node of this.definition?.nodes||[])this.states[node.id]={status:node.kind==='repair'?'broken':'ready',charges:node.charges||0,progress:0,lastWave:-1};
      const world=AdventureSystem.readWorld(context?.store),incoming=context?.mode==='story'?world.deliveries?.[this.mapId]||[]:[];
      for(const entry of incoming){if(entry.claimed||!ns.systems.AdventureCatalog.CARRY[entry.kind])continue;const benefit=ns.systems.AdventureCatalog.CARRY[entry.kind];this.reward(benefit);this.inherited||=Boolean(benefit.scout);this.claimedIncoming.push(entry.id);this.record('前關支援：'+benefit.name+' +'+benefit.gold+'G'+(benefit.lumber?' +'+benefit.lumber+'木':''));}
      return this.definition;
    }
    static readWorld(store){const world={version:1,deliveries:{},history:{}};try{const raw=store?.state?.profiles?.[store.state.active]?.data?.[KEY],data=raw?JSON.parse(raw):null;if(data?.version!==1)return world;for(const [map,list] of Object.entries(data.deliveries||{})){if(!Object.hasOwn(ns.systems.AdventureCatalog.MAPS,map)||!Array.isArray(list))continue;world.deliveries[map]=list.filter(d=>d&&typeof d.id==='string'&&Object.hasOwn(ns.systems.AdventureCatalog.CARRY,d.kind)).slice(0,16).map(d=>({id:d.id.slice(0,160),kind:d.kind,claimed:Boolean(d.claimed)}));}for(const [id,value] of Object.entries(data.history||{}).slice(0,128)){if(!value||typeof value!=='object'||['__proto__','constructor','prototype'].includes(id))continue;world.history[id]={repaired:Boolean(value.repaired),used:Boolean(value.used),rescued:Boolean(value.rescued),trade:['support','supplies','decline'].includes(value.trade)?value.trade:null,completed:Boolean(value.completed),delivered:Boolean(value.delivered)};}}catch(error){}return world;}
    reward(value){const economy=this.game.economy;if(economy.addGold)economy.addGold(value.gold||0);else economy.gold+=value.gold||0;economy.lumber+=value.lumber||0;}
    record(text){this.log.push(text);if(this.log.length>24)this.log.shift();this.revision++;this.game.flash?.(text,'#aee5c7');}
    node(id){return this.definition?.nodes.find(node=>node.id===id);}
    isAvailable(node){const wave=this.game.waves.wave;if(node.kind==='rescue')return wave>=node.startsAt&&wave<=node.expiresAfter;return true;}
    hit(x,y){return this.definition?.nodes.find(node=>distance(node,{x,y})<=(this.game.feedback?.mobile?46:34))||null;}
    outcome(){const main=this.states.main,rescue=this.states.rescue,trade=this.states.trade;return {repaired:main?.status==='repaired',used:(main?.charges??2)<2,rescued:rescue?.status==='completed',trade:trade?.choice||null};}
    offers(id){
      const node=this.node(id),state=this.states[id],wave=this.game.waves.wave;if(!node)return [];
      if(node.kind==='mechanism'||node.kind==='repair'){
        if(node.kind==='repair'&&state.status==='broken')return [{id:'repair',label:'修復 '+node.cost.gold+'G／'+node.cost.wood+'木',detail:'付費後英雄靠近 72 範圍，累積 4 秒修復；離開會保留進度。',cost:node.cost}];
        if(state.status==='repairing'||node.effect==='scout')return [];
        return [{id:'activate',label:ns.systems.AdventureCatalog.EFFECTS[node.effect].label+' · 剩 '+state.charges+' 次',detail:ns.systems.AdventureCatalog.EFFECTS[node.effect].detail,disabled:state.charges<=0||!this.game.waves.active||state.lastWave===wave,reason:!this.game.waves.active?'開戰後可使用':state.lastWave===wave?'本波已使用':'次數已用完'}];
      }
      if(node.kind==='rescue')return state.status==='ready'?[{id:'rescue',label:'派英雄救援',detail:'第 2～5 波：英雄靠近 72 範圍並停留 5 秒；60 範圍有敵人時暫停救援。成功 +65G／2木。',disabled:!this.isAvailable(node),reason:wave<2?'第 2 波開放':'救援時間已過'}]:[];
      if(node.kind==='trade'&&state.status==='ready'){
        const orum=this.mapId==='redmesa'&&this.game.hero.classType!=='bull';
        return [{id:'support',label:'購買橋頭支援 · 75G',detail:orum?'奧魯姆：「我離開獸人部落，是不想再替別人白白賣命。付我報酬，我守這條自己也要走的路。」支援 20 秒；此路段敵軍移速降至 65%。':'僱用 20 秒路段支援，使敵軍移速降至 65%。',cost:{gold:75},disabled:!this.game.waves.active,reason:'開戰後可交易'},
          {id:'supplies',label:'購買補給 · 60G',detail:'立即取得 2 木材；與橋頭支援二選一。',cost:{gold:60}},
          {id:'decline',label:'保留資源',detail:'拒絕此次交易；不扣資源。'}];
      }return [];
    }
    act(id,action){
      const node=this.node(id),state=this.states[id],offer=this.offers(id).find(item=>item.id===action);
      if(!node||!offer||offer.disabled||this.game.status!=='playing'||!this.game.profession.selected)return {ok:false,message:offer?.reason||'這個物件目前不能操作'};
      if(!this.game.hero.active&&['rescue','repair'].includes(action))return {ok:false,message:'英雄復活後才能執行'};
      if(offer.cost&&!this.game.economy.spend(offer.cost))return {ok:false,message:'金幣或木材不足，尚未扣款'};
      if(action==='repair'){state.status='repairing';this.sendHero(node);this.record(node.name+'開始修復');}
      else if(action==='rescue'){state.status='rescuing';this.sendHero(node);this.record('英雄前往'+node.name);}
      else if(action==='activate'){
        state.charges--;state.lastWave=this.game.waves.wave;
        if(node.effect==='smoke'){this.smokeUntil=this.game.waves.wave+2;this.fields.push({effect:'smoke',x:node.target.x,y:node.target.y,radius:node.radius,time:1.8,duration:1.8});}
        else {const effect=ns.systems.AdventureCatalog.EFFECTS[node.effect];this.fields.push({effect:node.effect,x:node.target.x,y:node.target.y,radius:node.radius,time:effect.duration,duration:effect.duration});if(node.effect==='rock')this.rock(node);}
        this.record(node.name+'已啟動');
      }else if(action==='support'){state.status='completed';state.choice='support';this.fields.push({effect:'support',x:node.target.x,y:node.target.y,radius:node.radius,time:20,duration:20});this.record(this.mapId==='redmesa'&&this.game.hero.classType!=='bull'?'奧魯姆接受報酬，短暫守住自己的通行路線':'已取得 20 秒橋頭支援');}
      else if(action==='supplies'){state.status='completed';state.choice='supplies';this.reward({lumber:2});this.record('交易完成 · +2 木材');}
      else if(action==='decline'){state.status='declined';state.choice='decline';this.record('已拒絕交易，資源保留');}
      this.revision++;return {ok:true,message:'指令已執行'};
    }
    sendHero(node){const hero=this.game.hero;hero.selected=true;this.game.build.selected=null;this.game.build.cancel?.();hero.setTarget(node.x,node.y);}
    rock(node){const source={attackType:'chaos',canHitAir:false,type:'map-rockfall',name:node.name};for(const monster of this.game.monsters){if(!monster.active||monster.flying||distance(monster,node.target)>node.radius)continue;const before=monster.health+(monster.barrier||0),dead=monster.takeDamage(45+this.game.waves.wave*5,source),damage=before-monster.health-(monster.barrier||0);this.game.onHit?.(monster,damage,false,source);if(dead)this.game.onKill?.(monster,source);else monster.applySlow(.6,2);}}
    startWave(wave){if(this.definition?.platform&&wave>=this.definition.platform.atWave&&!this.platformOpen){this.platformOpen=true;this.record(this.definition.platform.name+'已開放，可部署守軍');}const rescue=this.states.rescue;if(rescue&&wave>5&&['ready','rescuing'].includes(rescue.status)){rescue.status='expired';this.record('救援窗口結束；主線仍可繼續');}}
    afterWave(){const platform=this.definition?.platform;if(platform&&!this.platformOpen&&this.game.waves.wave+1>=platform.atWave){this.platformOpen=true;this.record('環境變化：'+platform.name+'開放');}}
    update(dt){
      if(!this.definition||this.game.paused||this.game.status!=='playing'||!this.game.profession.selected)return;
      dt=Math.max(0,Math.min(.25,Number(dt)||0));this.clock+=dt;
      this.fields.forEach(field=>field.time=Math.max(0,field.time-dt));this.fields=this.fields.filter(field=>field.time>0);
      for(const node of this.definition.nodes){const state=this.states[node.id];if(!['rescuing','repairing'].includes(state.status))continue;
        if(node.kind==='rescue'&&!this.isAvailable(node))continue;
        const close=this.game.hero.active&&distance(this.game.hero,node)<=72,blocked=node.kind==='rescue'&&this.game.monsters.some(m=>m.active&&distance(m,node)<60);
        if(close&&!blocked&&(node.kind!=='rescue'||this.game.waves.active)){state.progress+=dt;if(state.progress>=(node.kind==='rescue'?node.seconds:4)){state.status=node.kind==='rescue'?'completed':'repaired';if(node.reward)this.reward(node.reward);this.record(node.name+(node.reward?'救援完成 · +65G／2木':'修復完成'));}}
      }
      this.scan+=dt;if(this.scan<.2)return;this.scan=0;
      const main=this.node('main'),scout=this.states.main?.status==='repaired'&&main?.effect==='scout';
      for(const monster of this.game.monsters){if(!monster.active)continue;if((scout||this.inherited)&&main&&distance(monster,main.target)<=main.radius)monster.reveal?.();for(const field of this.fields){if(distance(monster,field)>field.radius)continue;if(['water','pulse'].includes(field.effect))monster.reveal?.();if(!monster.flying&&['water','frost','support','pulse'].includes(field.effect))monster.applySlow(field.effect==='water'?.55:field.effect==='frost'?.6:field.effect==='support'?.65:.75,.35);}}
    }
    suppressSmoke(){if(this.mapId!=='emberroad'||this.game.waves.wave>this.smokeUntil)return;for(const monster of this.game.monsters)if(monster.mapPressure?.id==='ember-road-smoke')monster.mapPressure.armorBonus=0;}
    platformIssue(x,y){const point={x,y},p=this.definition?.platform;if(p&&!this.platformOpen&&distance(p,point)<p.radius)return 'adventure-platform';return this.definition?.nodes.some(node=>distance(node,point)<42)?'adventure-object':null;}
    snapshot(){return {version:1,mapId:this.mapId,states:copy(this.states),fields:copy(this.fields),clock:this.clock,smokeUntil:this.smokeUntil,platformOpen:Boolean(this.platformOpen),inherited:this.inherited,claimedIncoming:[...this.claimedIncoming],log:[...this.log]};}
    restore(data){if(data?.version!==1||data.mapId!==this.mapId||!data.states)return false;for(const node of this.definition?.nodes||[]){const saved=data.states[node.id];if(saved&&['broken','ready','repairing','repaired','rescuing','completed','declined','expired'].includes(saved.status)){this.states[node.id]={status:saved.status,charges:Math.max(0,Math.min(node.charges||0,Number(saved.charges)||0)),progress:Math.max(0,Math.min(5,Number(saved.progress)||0)),lastWave:Number.isFinite(saved.lastWave)?Math.max(-1,saved.lastWave):-1,choice:['support','supplies','decline'].includes(saved.choice)?saved.choice:null};}}
      this.fields=(Array.isArray(data.fields)?data.fields:[]).filter(f=>f&&['water','frost','rock','pulse','support','smoke'].includes(f.effect)&&[f.x,f.y,f.radius,f.time].every(Number.isFinite)).slice(0,3).map(f=>({...f,radius:Math.max(1,Math.min(180,f.radius)),time:Math.max(0,Math.min(20,f.time)),duration:Math.max(1,Math.min(20,Number.isFinite(f.duration)?f.duration:f.time))}));this.clock=Number.isFinite(data.clock)?Math.max(0,data.clock):0;this.smokeUntil=Number.isFinite(data.smokeUntil)?data.smokeUntil:-1;this.platformOpen=Boolean(data.platformOpen);this.inherited=Boolean(data.inherited);this.claimedIncoming=Array.isArray(data.claimedIncoming)?data.claimedIncoming.filter(id=>typeof id==='string').slice(0,16):[];this.log=Array.isArray(data.log)?data.log.filter(t=>typeof t==='string').slice(-24):[];this.revision++;return true;
    }
    writeVictory(state){
      const context=this.context;if(context?.mode!=='story'||!context.store||!this.definition)return true;
      const result=this.outcome(),eligible=result.rescued||result.repaired||result.used;
      const profile=state.profiles[context.profileId];if(!profile||state.active!==context.profileId||profile.round!==context.round)throw Error('玩家身份已改變，地圖結果尚未儲存');
        const world=AdventureSystem.readWorld({state:{active:context.profileId,profiles:{[context.profileId]:profile}}});
        for(const list of Object.values(world.deliveries))for(const delivery of list)if(this.claimedIncoming.includes(delivery.id))delivery.claimed=true;
        const key=context.mission||this.mapId,prior=world.history[key];world.history[key]={...result,completed:true};
        if(eligible&&!prior?.delivered&&this.definition.next){const id=key+':'+this.definition.next,list=world.deliveries[this.definition.next]||=[];if(!list.some(d=>d.id===id))list.push({id,kind:this.definition.carry,claimed:false});world.history[key].delivered=true;}
        else if(prior?.delivered)world.history[key].delivered=true;
        profile.data[KEY]=JSON.stringify(world);
      return true;
    }
  }
  AdventureSystem.WORLD_KEY=KEY;ns.systems.AdventureSystem=AdventureSystem;
})(globalThis.TowerFrontier);
