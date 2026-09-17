(function(ns){
  'use strict';
  class EconomySystem{
    constructor(){this.reset();}
    reset(){this.gold=ns.config.startGold;this.lumber=ns.config.startLumber;this.merit=0;this.totalEarned=0;this.totalSpent=0;this.rewardRate=1;}
    setRewardRate(rate){this.rewardRate=Math.max(.3,Math.min(2,Number(rate)||1));return this.rewardRate;}
    canAfford(cost){return this.gold>=(cost.gold||0)&&this.lumber>=(cost.wood||cost.lumber||0)&&this.merit>=(cost.merit||0);}
    spend(cost){if(!this.canAfford(cost))return false;const gold=cost.gold||0;this.gold-=gold;this.lumber-=cost.wood||cost.lumber||0;this.merit-=cost.merit||0;this.totalSpent+=gold;return true;}
    addGold(amount){const value=Math.max(0,Math.round(amount||0));this.gold+=value;this.totalEarned+=value;return value;}
    addKill(monster,bountyBonus){const gold=this.addGold(monster.reward*(1+(bountyBonus||0))*this.rewardRate);const merit=monster.type==='boss'?1:0;this.merit+=merit;return{gold:gold,merit:merit};}
    completeWave(reward){const gold=this.addGold(reward.gold*this.rewardRate);const lumber=Math.max(0,Math.round(reward.lumber||0));this.lumber+=lumber;return{gold:gold,lumber:lumber};}
    refundGold(amount){const gold=Math.max(0,Math.round(amount||0));this.gold+=gold;return gold;}
    exchangeGoldForMerit(){if(this.gold<EconomySystem.MERIT_GOLD_RATE)return false;this.gold-=EconomySystem.MERIT_GOLD_RATE;this.merit+=1;return true;}
    exchangeMeritForGold(){if(this.merit<1)return false;this.merit-=1;this.gold+=EconomySystem.MERIT_GOLD_RATE;return true;}
  }
  EconomySystem.MERIT_GOLD_RATE=1000;
  ns.systems.EconomySystem=EconomySystem;
})(globalThis.TowerFrontier);
