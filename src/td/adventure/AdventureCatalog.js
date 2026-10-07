(function(ns){
  'use strict';
  // Explicit gameplay data. Coordinates derive from the published road and
  // deployment polygons, including the owner's route edits, never image pixels.
  const MAPS={
    twinpass:{name:'雙隘口訊號台',kind:'repair',effect:'scout'},
    autumn:{name:'遺跡脈衝石',kind:'mechanism',effect:'pulse',trade:'遺跡補給商隊'},
    beginner:{name:'谷地舊哨',kind:'repair',effect:'scout',carry:'scout',next:'silverleaf'},
    silverleaf:{name:'溪谷水閘',kind:'mechanism',effect:'water',carry:'sluice',next:'shadowfall'},
    shadowfall:{name:'舊城燈塔',kind:'repair',effect:'scout',carry:'scout',next:'frostborn',trade:'補給商隊'},
    frostborn:{name:'裂谷冰堤',kind:'mechanism',effect:'frost',transition:'融雪平台',atWave:4,carry:'supplies',next:'westernsignal'},
    westernsignal:{name:'西境瞭望台',kind:'repair',effect:'scout',carry:'scout',next:'emberroad'},
    emberroad:{name:'商道蓄水桶',kind:'mechanism',effect:'smoke',rescue:'受困補給車',carry:'supplies',next:'stonecircle'},
    stonecircle:{name:'石環守望火',kind:'repair',effect:'scout',rescue:'等待護送的見證者',carry:'witness',next:'redmesa'},
    redmesa:{name:'峽橋落石機',kind:'mechanism',effect:'rock',trade:'奧魯姆的交易',carry:'supplies',next:'whitetrace'},
    whitetrace:{name:'霜痕引流石',kind:'mechanism',effect:'frost',rescue:'裂石霜痕樣本',carry:'samples',next:'echoyard'},
    echoyard:{name:'回聲脈衝機',kind:'repair',effect:'pulse',trade:'工程團急件',carry:'samples',next:'crossmark'},
    crossmark:{name:'交會訊號柱',kind:'mechanism',effect:'pulse',rescue:'橋頭的兩份紀錄',carry:'samples',next:'nightwatch'},
    nightwatch:{name:'校準站燈塔',kind:'repair',effect:'scout',rescue:'尚未封存的觀測本',carry:'records',next:'tidegateoutfall'},
    tidegateoutfall:{name:'逆潮水閘',kind:'mechanism',effect:'water',transition:'退潮礁台',atWave:5,carry:'sluice',next:'brineway'},
    brineway:{name:'海堤洩壓閘',kind:'mechanism',effect:'water',rescue:'海堤上的工程隊',carry:'supplies',next:'reefconfluence'},
    reefconfluence:{name:'礁岸共鳴柱',kind:'mechanism',effect:'pulse',transition:'低潮觀測平台',atWave:6,carry:'samples',next:'tideobservatory'},
    tideobservatory:{name:'潮儀守夜燈',kind:'repair',effect:'scout',rescue:'未封存的原始讀值',carry:'records'}
  };
  const EFFECTS={
    water:{label:'放水',detail:'選定路段 7 秒內敵軍移速降至 55%，並揭露隱形敵人。',duration:7,color:'#74ded5'},
    frost:{label:'釋放寒流',detail:'選定路段 6 秒內敵軍移速降至 60%。',duration:6,color:'#c2e7ff'},
    rock:{label:'釋放落石',detail:'打擊選定路段敵軍（每目標 45＋本波×5 混沌傷害），並緩速 2 秒。',duration:2,color:'#e5b377'},
    pulse:{label:'啟動脈衝',detail:'選定路段 7 秒內持續揭露隱形敵人並使其移速降至 75%。',duration:7,color:'#c6a4f5'},
    smoke:{label:'撲滅煙障',detail:'本波與接下來兩波的燼火煙障護甲降為 0；本波啟動後不能重複延長。',duration:0,color:'#76d5b3'},
    scout:{label:'偵察照明',detail:'修復後持續揭露指定路段上的隱形敵人。',duration:0,color:'#f2d78e'}
  };
  const CARRY={scout:{name:'前關哨站情報',gold:35,lumber:0,scout:true},supplies:{name:'救援隊的補給',gold:50,lumber:1},witness:{name:'見證者提供的橋頭情報',gold:35,lumber:1,scout:true},samples:{name:'調查隊準備的器材',gold:25,lumber:1},records:{name:'觀測隊的後續支援',gold:40,lumber:1},sluice:{name:'水閘維修隊的補給',gold:30,lumber:1}};
  function center(poly){return poly.reduce((p,q)=>({x:p.x+q.x/poly.length,y:p.y+q.y/poly.length}),{x:0,y:0});}
  function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
  function legalPad(map,p){const footprint=map.buildFootprint||0,rx=typeof footprint==='number'?footprint:footprint.x||0,ry=typeof footprint==='number'?footprint:footprint.y||0,points=[[0,0],[rx,0],[-rx,0],[0,ry],[0,-ry],[rx*.7,ry*.7],[-rx*.7,ry*.7],[rx*.7,-ry*.7],[-rx*.7,-ry*.7]].map(([x,y])=>({x:p.x+x,y:p.y+y}));if(!map.buildAreas.some(poly=>points.every(q=>inside(q,poly)))||(map.blockedAreas||[]).some(poly=>points.some(q=>inside(q,poly))))return false;return !(map.routes||[map.path]).some(route=>route.some((b,i)=>{if(!i)return false;const a=route[i-1],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)<(map.roadClearance||55);}));}
  function nearRoad(map,ratio){const route=map.path,index=Math.max(1,Math.min(route.length-2,Math.floor(route.length*ratio)));return {x:route[index].x,y:route[index].y};}
  function describe(map){
    const source=MAPS[map?.id];if(!source)return null;
    const areas=map.buildAreas||[],road=nearRoad(map,.53),side=areas.length?center(areas[Math.min(1,areas.length-1)]):{x:road.x,y:road.y-95};
    const rescue=areas.length?center(areas[0]):{x:road.x-100,y:road.y-95};
    let platform=source.transition&&areas.length>2?center(areas[areas.length-1]):null;
    const main={id:'main',kind:source.kind,name:source.name,effect:source.effect,x:side.x,y:side.y,target:road,radius:150,charges:2,cost:{gold:60,wood:1}};
    const nodes=[main];
    if(source.rescue)nodes.push({id:'rescue',kind:'rescue',name:source.rescue,x:rescue.x,y:rescue.y,startsAt:2,expiresAfter:5,seconds:5,reward:{gold:65,lumber:2}});
    if(source.trade)nodes.push({id:'trade',kind:'trade',name:source.trade,x:rescue.x,y:rescue.y,cost:{gold:75},target:road,radius:170});
    // Published grids can exclude a polygon's arithmetic center. Anchor the
    // temporary platform to a genuinely enabled cell, never a painted cliff.
    const layout=platform&&ns.systems.MapLayoutOverrides?.get(map.id);
    if(layout){const choices=layout.buildable.map(cell=>({x:cell.column*layout.cellSize+layout.cellSize/2,y:cell.row*layout.cellSize+layout.cellSize/2})).filter(p=>nodes.every(n=>Math.hypot(p.x-n.x,p.y-n.y)>110));choices.sort((a,b)=>Math.hypot(a.x-platform.x,a.y-platform.y)-Math.hypot(b.x-platform.x,b.y-platform.y));platform=choices[0]||null;}
    else if(platform){const choices=[];for(let y=80;y<map.height-60;y+=32)for(let x=64;x<map.width-64;x+=32){const p={x,y};if(nodes.every(n=>Math.hypot(x-n.x,y-n.y)>110)&&legalPad(map,p))choices.push(p);}choices.sort((a,b)=>Math.hypot(a.x-platform.x,a.y-platform.y)-Math.hypot(b.x-platform.x,b.y-platform.y));platform=choices[0]||null;}
    return {...source,id:map.id,nodes,platform:platform?{...platform,radius:58,name:source.transition,atWave:source.atWave}:null};
  }
  ns.systems.AdventureCatalog={MAPS,EFFECTS,CARRY,describe,VERSION:'1.0.0'};
})(globalThis.TowerFrontier);
