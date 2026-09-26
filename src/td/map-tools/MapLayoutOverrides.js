(function(ns){
  'use strict';
  const KEY='heroFrontierMapLayoutOverridesV1',VERSION=1;
  function storage(){try{return globalThis.localStorage||null;}catch(error){return null;}}
  function empty(){return {version:VERSION,maps:{}};}
  function read(){const store=storage();if(!store)return empty();try{const value=JSON.parse(store.getItem(KEY));if(!value||value.version!==VERSION||!value.maps||typeof value.maps!=='object')return empty();return value;}catch(error){return empty();}}
  function write(value){const store=storage();if(!store)return false;try{store.setItem(KEY,JSON.stringify(value));return true;}catch(error){return false;}}
  function cellKey(map,x,y,cellSize){return Math.floor(x/cellSize)+':'+Math.floor(y/cellSize);}
  function get(mapId){const published=globalThis.HeroFrontierPublishedMaps;if(published&&(!ns.mapTools?.isEditor||ns.mapTools.Publisher?.connected))return published.maps[mapId]?.layout||null;return read().maps[mapId]||null;}
  function save(map,payload){if(!map||!payload||payload.map!==map.id||payload.format!=='hero-frontier-grid-v2'||payload.cellSize!==64||!Array.isArray(payload.buildable))return false;const selected=payload.buildable.filter(cell=>Number.isInteger(cell.column)&&Number.isInteger(cell.row)&&cell.column>=0&&cell.row>=0&&cell.column<map.width/64&&cell.row<map.height/64).map(cell=>({column:cell.column,row:cell.row,x:cell.column*64+32,y:cell.row*64+32,originalState:cell.originalState||'candidate',requiresReview:Boolean(cell.requiresReview)}));const state=read();state.maps[map.id]={version:VERSION,cellSize:64,buildable:selected,savedAt:new Date().toISOString()};return write(state);}
  function remove(mapId){const state=read();if(!state.maps[mapId])return true;delete state.maps[mapId];return write(state);}
  function placement(mapId,x,y){const override=get(mapId);if(!override)return null;const enabled=override.buildable.some(cell=>cellKey(mapId,x,y,override.cellSize)===cell.column+':'+cell.row);return {active:true,enabled};}
  ns.systems.MapLayoutOverrides=Object.freeze({KEY,VERSION,read,get,save,remove,placement});
})(globalThis.TowerFrontier);
