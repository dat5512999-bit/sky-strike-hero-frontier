(function(ns){
  'use strict';
  const cloneRoutes=routes=>routes.map(route=>route.map(point=>({x:Math.round(point.x),y:Math.round(point.y)})));
  function routesOf(map){return cloneRoutes(map.routes||[map.path]);}
  function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
  function samePoint(a,b){return Boolean(a&&b)&&Math.abs(a.x-b.x)<.5&&Math.abs(a.y-b.y)<.5;}
  function validate(map,routes){
    const original=routesOf(map),problems=[];
    if(!Array.isArray(routes)||routes.length!==original.length)return {valid:false,problems:['路線數量與原地圖不一致。']};
    routes.forEach((route,index)=>{
      const base=original[index];if(!Array.isArray(route)||route.length<2){problems.push('路線 '+(index+1)+' 至少需要起點與城門。');return;}
      if(distance(route[0],base[0])>.5||distance(route.at(-1),base.at(-1))>.5)problems.push('路線 '+(index+1)+' 的出生點與城門點不可移動。');
      route.forEach((point,pointIndex)=>{if(!Number.isFinite(point.x)||!Number.isFinite(point.y))problems.push('路線 '+(index+1)+' 的第 '+(pointIndex+1)+' 點座標無效。');});
    });
    return {valid:problems.length===0,problems};
  }
  function nearestSegment(route,point){let best={index:0,distance:Infinity};for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/length)):0,x=a.x+t*dx,y=a.y+t*dy,distance=Math.hypot(point.x-x,point.y-y);if(distance<best.distance)best={index:i,distance};}return best;}
  ns.mapTools=ns.mapTools||{};
  ns.mapTools.MapRoute=Object.freeze({routesOf,cloneRoutes,validate,nearestSegment});
})(globalThis.TowerFrontier);
