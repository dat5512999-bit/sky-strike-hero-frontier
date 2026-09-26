(function(ns){
  'use strict';
  const MIN_SEGMENT=32,EDGE=24;
  const cloneRoutes=routes=>routes.map(route=>route.map(point=>({x:Math.round(point.x),y:Math.round(point.y)})));
  function routesOf(map){return cloneRoutes(map.routes||[map.path]);}
  function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
  function samePoint(a,b){return Boolean(a&&b)&&Math.abs(a.x-b.x)<.5&&Math.abs(a.y-b.y)<.5;}
  function orient(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
  function intersects(a,b,c,d){const ab1=orient(a,b,c),ab2=orient(a,b,d),cd1=orient(c,d,a),cd2=orient(c,d,b);return ab1===0||ab2===0||cd1===0||cd2===0?false:(ab1>0)!==(ab2>0)&&(cd1>0)!==(cd2>0);}
  function crossesPolygon(a,b,polygon){for(let i=0;i<polygon.length;i++)if(intersects(a,b,polygon[i],polygon[(i+1)%polygon.length]))return true;return false;}
  function validate(map,routes){
    const original=routesOf(map),problems=[];
    if(!Array.isArray(routes)||routes.length!==original.length)return {valid:false,problems:['路線數量與原地圖不一致。']};
    routes.forEach((route,index)=>{
      const base=original[index];if(!Array.isArray(route)||route.length<2){problems.push('路線 '+(index+1)+' 至少需要起點與城門。');return;}
      if(distance(route[0],base[0])>.5||distance(route.at(-1),base.at(-1))>.5)problems.push('路線 '+(index+1)+' 的出生點與城門點不可移動。');
      route.forEach((point,pointIndex)=>{const endpoint=pointIndex===0||pointIndex===route.length-1,officialNode=base.some(node=>samePoint(node,point));if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||(!endpoint&&!officialNode&&(point.x<EDGE||point.x>map.width-EDGE||point.y<EDGE||point.y>map.height-EDGE)))problems.push('路線 '+(index+1)+' 的第 '+(pointIndex+1)+' 點超出地圖安全邊界。');if(pointIndex){const prior=route[pointIndex-1],officialSegment=base.some((node,baseIndex)=>baseIndex&&samePoint(base[baseIndex-1],prior)&&samePoint(node,point));if(!officialSegment&&distance(prior,point)<MIN_SEGMENT)problems.push('路線 '+(index+1)+' 有相鄰節點少於 '+MIN_SEGMENT+'px。');}});
      for(let i=1;i<route.length;i++){const officialSegment=base.some((node,baseIndex)=>baseIndex&&samePoint(base[baseIndex-1],route[i-1])&&samePoint(node,route[i]));if(officialSegment)continue;for(const obstacle of map.blockedAreas||[])if(crossesPolygon(route[i-1],route[i],obstacle))problems.push('路線 '+(index+1)+' 穿過一個禁行障礙。');}
    });
    return {valid:problems.length===0,problems};
  }
  function nearestSegment(route,point){let best={index:0,distance:Infinity};for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/length)):0,x=a.x+t*dx,y=a.y+t*dy,distance=Math.hypot(point.x-x,point.y-y);if(distance<best.distance)best={index:i,distance};}return best;}
  ns.mapTools=ns.mapTools||{};
  ns.mapTools.MapRoute=Object.freeze({MIN_SEGMENT,EDGE,routesOf,cloneRoutes,validate,nearestSegment});
})(globalThis.TowerFrontier);
