(function(ns){
  'use strict';
  const KEY='heroFrontierMapRouteOverridesV1',VERSION=1;
  function storage(){try{return globalThis.localStorage||null;}catch(error){return null;}}
  function empty(){return {version:VERSION,maps:{}};}
  function read(){const store=storage();if(!store)return empty();try{const data=JSON.parse(store.getItem(KEY));return data&&data.version===VERSION&&data.maps&&typeof data.maps==='object'?data:empty();}catch(error){return empty();}}
  function write(data){try{const store=storage();if(!store)return false;store.setItem(KEY,JSON.stringify(data));return true;}catch(error){return false;}}
  function get(mapId){const published=globalThis.HeroFrontierPublishedMaps;if(published&&(!ns.mapTools?.isEditor||ns.mapTools.Publisher?.connected)){const routes=published.maps[mapId]?.routes;return routes?{routes}:null;}return read().maps[mapId]||null;}
  function save(map,routes){const review=ns.mapTools.MapRoute.validate(map,routes);if(!review.valid)return review;const data=read();data.maps[map.id]={version:VERSION,routes:ns.mapTools.MapRoute.cloneRoutes(routes),savedAt:new Date().toISOString()};const saved=write(data);return {valid:saved,problems:saved?[]:['無法寫入本機儲存']};}
  function remove(mapId){const data=read();delete data.maps[mapId];return write(data);}
  function sharedLength(routes){if(routes.length<2)return 0;let length=0;const first=routes[0];for(let i=1;i<first.length;i++){const p=first[first.length-i],q=first[first.length-i-1];if(!routes.every(route=>{const a=route[route.length-i],b=route[route.length-i-1];return a&&b&&a.x===p.x&&a.y===p.y&&b.x===q.x&&b.y===q.y;}))break;length+=Math.hypot(q.x-p.x,q.y-p.y);}return length;}
  function remapPressure(map,route){if(!map.mapPressure)return null;const nearest=point=>route.reduce((best,p,i)=>Math.hypot(p.x-point.x,p.y-point.y)<Math.hypot(route[best].x-point.x,route[best].y-point.y)?i:best,0);return Object.assign({},map.mapPressure,{segments:map.mapPressure.segments.map(segment=>({startIndex:nearest(map.path[segment.startIndex]),endIndex:nearest(map.path[segment.endIndex])}))});}
  function install(){if(!ns.maps||ns.maps.routeOverrideInstalled)return;const originalApply=ns.maps.apply;ns.maps.apply=function(id){const map=originalApply.call(ns.maps,id),saved=get(id);if(!map||!saved||!Array.isArray(saved.routes))return map;const review=ns.mapTools.MapRoute.validate(map,saved.routes);if(!review.valid)return map;const routes=ns.mapTools.MapRoute.cloneRoutes(saved.routes);ns.config=Object.freeze(Object.assign({},ns.config,{path:routes[0],routes,sharedLength:sharedLength(routes),mapPressure:remapPressure(map,routes[0])}));return map;};ns.maps.routeOverrideInstalled=true;}
  ns.systems.MapRouteOverrides=Object.freeze({KEY,VERSION,read,get,save,remove,install});install();
})(globalThis.TowerFrontier);
