(function(ns){
  'use strict';
  const CELL_SIZE=64,MAP_ID='emberroad';
  function key(column,row){return column+':'+row;}
  function pointInPolygon(x,y,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j],cross=(a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x;if(cross)inside=!inside;}return inside;}
  function segmentDistance(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;if(!length)return Math.hypot(x-a.x,y-a.y);const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/length));return Math.hypot(x-(a.x+t*dx),y-(a.y+t*dy));}
  function offsets(map){const footprint=map.buildFootprint||0,rx=typeof footprint==='number'?footprint:footprint.x||0,ry=typeof footprint==='number'?footprint:footprint.y||0;return rx||ry?[[0,0],[rx,0],[-rx,0],[0,ry],[0,-ry],[rx*.7,ry*.7],[-rx*.7,ry*.7],[rx*.7,-ry*.7],[-rx*.7,-ry*.7]]:[[0,0]];}
  function terrainState(map,x,y){
    if(x<42||x>map.width-42||y<62||y>map.height-46)return 'locked';
    const routes=map.routes||[map.path];
    if(routes.some(route=>route.some((point,index,path)=>index&&segmentDistance(x,y,path[index-1],point)<(map.roadClearance||55))))return 'locked';
    const footprint=offsets(map);
    if((map.blockedAreas||[]).some(area=>footprint.some(([dx,dy])=>pointInPolygon(x+dx,y+dy,area))))return 'locked';
    if((map.buildAreas||[]).some(area=>footprint.every(([dx,dy])=>pointInPolygon(x+dx,y+dy,area))))return 'gameLegal';
    return 'candidate';
  }
  function cells(map){const result=[];for(let row=0;row<map.height/CELL_SIZE;row++)for(let column=0;column<map.width/CELL_SIZE;column++){const x=column*CELL_SIZE+CELL_SIZE/2,y=row*CELL_SIZE+CELL_SIZE/2;result.push({column,row,x,y,key:key(column,row),state:terrainState(map,x,y)});}return result;}
  function baseline(map){return cells(map).filter(cell=>cell.state==='gameLegal').map(cell=>cell.key);}
  function selectionPayload(map,selected){const available=new Map(cells(map).filter(cell=>cell.state!=='locked').map(cell=>[cell.key,cell]));const buildable=[...selected].filter(id=>available.has(id)).map(id=>{const cell=available.get(id);return {column:cell.column,row:cell.row,x:cell.x,y:cell.y};}).sort((a,b)=>a.row-b.row||a.column-b.column);return {format:'hero-frontier-grid-v1',map:map.id,cellSize:CELL_SIZE,buildable};}
  ns.mapTools=ns.mapTools||{};
  ns.mapTools.EmberroadGrid=Object.freeze({CELL_SIZE,MAP_ID,key,cells,baseline,selectionPayload,terrainState});
})(globalThis.TowerFrontier);
