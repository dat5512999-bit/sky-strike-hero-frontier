(function(ns){
  'use strict';
  const proto=ns.TDGame.prototype;
  const originalAttach=proto.attachArmoryUi,originalUpdate=proto.updateUi,originalOpen=proto.openArmory,originalClose=proto.closeArmory,originalPosition=proto.positionSelectionActions,originalReset=proto.reset;
  const icon=(node,item)=>{node.style.setProperty('--gear-column',item.column);node.style.setProperty('--gear-row',item.row);};
  const card=(item,status)=>{
    const row=document.createElement('article');row.className='armory-item';row.dataset.rarity=item.rarity;
    const art=document.createElement('i');art.setAttribute('aria-hidden','true');icon(art,item);
    const details=document.createElement('span'),rarity=document.createElement('small'),name=document.createElement('b'),effect=document.createElement('em');
    rarity.textContent=item.rarity+' · '+({weapon:'武器',armor:'護甲',relic:'戰器'}[item.slot]||'裝備');name.textContent=item.name;effect.textContent=item.description;
    details.append(rarity,name,effect);
    const actions=document.createElement('div');actions.className='armory-card-actions';const badge=document.createElement('strong');badge.className='gear-status';badge.textContent=status;actions.append(badge);
    row.append(art,details,actions);return{row,actions};
  };
  proto.renderArmory=function(){
    const list=this.ui.armoryItems;if(!list)return;list.replaceChildren();this.ui.armoryTarget.textContent=this.armory.owned.length+' 件';
    if(!this.armory.owned.length){const empty=document.createElement('p');empty.className='armory-empty';empty.textContent='尚未取得裝備。軍械波次與 Boss 戰利品可帶回軍械。';list.append(empty);return;}
    for(const id of this.armory.owned){const item=this.armory.get(id),wearer=this.armory.wearer(id),{row,actions}=card(item,wearer?'裝備中：'+this.armory.targetLabel(wearer):'閒置');
      if(!wearer){const button=document.createElement('button');button.type='button';button.className='gear-sell';button.textContent='販售 +'+this.armory.resaleValue(id)+'G';button.onclick=()=>this.requestArmorySale(id,button);actions.append(button);}else row.dataset.equipped='true';list.append(row);
    }
  };
  proto.openArmory=function(){const opened=originalOpen.call(this);if(opened)this.ui.armoryMessage.textContent='此處可查看與販售閒置裝備；請點選士兵或英雄進行配裝。';return opened;};
  proto.requestArmorySale=function(id,trigger){
    const item=this.armory.get(id),screen=this.ui.armorySellScreen;if(!item||this.armory.wearer(id)||!screen)return false;
    this.armorySellId=id;this.armorySellTrigger=trigger||null;this.ui.armorySellTitle.textContent='販售「'+item.name+'」？';this.ui.armorySellCopy.textContent='將回收 '+this.armory.resaleValue(id)+'G。確認後，這件閒置裝備會永久從本局軍械庫移除。';screen.hidden=false;this.ui.armorySellCancel.focus();return true;
  };
  proto.closeArmorySale=function(returnFocus=true){
    const screen=this.ui.armorySellScreen;if(!screen||screen.hidden)return false;screen.hidden=true;const trigger=this.armorySellTrigger;this.armorySellId=null;this.armorySellTrigger=null;
    if(returnFocus){if(trigger&&trigger.isConnected&&!trigger.disabled)trigger.focus();else this.ui.armoryClose?.focus();}return true;
  };
  proto.confirmArmorySale=function(){
    const id=this.armorySellId,item=this.armory.get(id);if(!item||this.armory.wearer(id)){this.closeArmorySale(false);this.ui.armoryMessage.textContent='這件裝備目前無法販售。';this.renderArmory();this.updateUi();return false;}
    const result=this.armory.sell(id,this.economy);this.closeArmorySale(false);this.ui.armoryMessage.textContent=result.message;this.renderArmory();this.updateUi();this.ui.armoryClose.focus();return result.ok;
  };
  proto.closeArmory=function(){this.closeArmorySale?.(false);return originalClose.call(this);};
  proto.openEquipmentPicker=function(target){
    if(this.status!=='playing'||!this.profession.selected||!target||!document.getElementById('td-equip-screen').hidden)return false;
    this.equipTarget=target;this.equipWasPaused=Boolean(this.paused);this.paused=true;this.renderEquipmentPicker();document.getElementById('td-equip-screen').hidden=false;document.getElementById('td-equip-close').focus();return true;
  };
  proto.closeEquipmentPicker=function(){const screen=document.getElementById('td-equip-screen');if(screen.hidden)return;screen.hidden=true;this.paused=Boolean(this.equipWasPaused);this.equipTarget=null;this.updateUi();};
  proto.renderEquipmentPicker=function(){
    const target=this.equipTarget,list=document.getElementById('td-equip-items');if(!target||!list)return;
    document.getElementById('td-equip-title').textContent=this.armory.targetLabel(target)+' · 選擇裝備';
    document.getElementById('td-equip-summary').textContent=target.kind==='unit'?'僅顯示這名士兵能用的裝備；每名士兵最多一件。':'僅顯示這位英雄能用的裝備；武器、護甲、戰器各一件。';
    list.replaceChildren();let count=0;
    for(const id of this.armory.owned){if(!this.armory.canEquip(id,target))continue;count++;const item=this.armory.get(id),wearer=this.armory.wearer(id),equipped=wearer===target,status=equipped?'目前裝備':wearer?'裝備中：'+this.armory.targetLabel(wearer):'可裝備';
      const {row,actions}=card(item,status),button=document.createElement('button');row.dataset.gearId=id;button.type='button';button.dataset.equipGear=id;button.textContent=equipped?'卸下':wearer?'轉裝':'裝上';button.onclick=()=>{
        const result=equipped?this.armory.unequip(item.slot,target):this.armory.equip(id,target);
        document.getElementById('td-equip-message').textContent=result.message;
        if(result.ok){this.renderEquipmentPicker();this.updateUi();}
      };actions.append(button);if(equipped)row.dataset.equipped='true';list.append(row);
    }
    if(!count){const empty=document.createElement('p');empty.className='armory-empty';empty.textContent='目前沒有適合這名角色的裝備。';list.append(empty);}
  };
  proto.attachArmoryUi=function(){originalAttach.call(this);const unit=document.getElementById('td-unit-equip'),hero=document.getElementById('td-hero-equip'),close=document.getElementById('td-equip-close'),screen=document.getElementById('td-equip-screen'),sellScreen=this.ui.armorySellScreen;
    unit.onclick=()=>this.openEquipmentPicker(this.build.selected);hero.onclick=()=>this.openEquipmentPicker(this.hero);
    close.onclick=()=>this.closeEquipmentPicker();screen.addEventListener('click',event=>{if(event.target===screen)this.closeEquipmentPicker();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!screen.hidden){this.closeEquipmentPicker();event.preventDefault();event.stopImmediatePropagation();}},true);
    if(sellScreen){this.ui.armorySellCancel.onclick=()=>this.closeArmorySale();this.ui.armorySellConfirm.onclick=()=>this.confirmArmorySale();sellScreen.addEventListener('click',event=>{if(event.target===sellScreen)this.closeArmorySale();});document.addEventListener('keydown',event=>{if(sellScreen.hidden)return;if(event.key==='Escape'){this.closeArmorySale();event.preventDefault();event.stopImmediatePropagation();return;}if(event.key==='Tab'){const buttons=Array.from(sellScreen.querySelectorAll('button:not(:disabled)')),first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}},true);}
  };
  proto.updateUi=function(){originalUpdate.call(this);const button=document.getElementById('td-unit-equip');if(button){const unit=this.build.selected;button.hidden=!(unit&&unit.kind==='unit');button.disabled=this.status!=='playing';}const hero=document.getElementById('td-hero-equip');if(hero)hero.disabled=!this.profession.selected||this.status!=='playing';};
  proto.positionSelectionActions=function(){originalPosition.call(this);const panel=this.ui.selectionActions;if(panel&&!panel.hidden){const max=this.canvas.parentElement.clientWidth-panel.offsetWidth-6;panel.style.left=Math.max(6,Math.min(Number.parseFloat(panel.style.left)||6,max))+'px';}};
  proto.reset=function(){const picker=document.getElementById('td-equip-screen');if(picker)picker.hidden=true;this.closeArmorySale?.(false);this.equipTarget=null;return originalReset.call(this);};
})(globalThis.TowerFrontier);
