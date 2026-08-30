(function(root){
  'use strict';
  root.TowerFrontier={entities:{},systems:{},utils:{
    clamp:function(value,min,max){return Math.max(min,Math.min(max,value));},
    distance:function(a,b){return Math.hypot(a.x-b.x,a.y-b.y);},
    moveToward:function(value,target,amount){return value<target?Math.min(value+amount,target):Math.max(value-amount,target);}
  }};
})(globalThis);
