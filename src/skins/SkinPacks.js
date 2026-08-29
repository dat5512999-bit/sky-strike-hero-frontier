(function (ns) {
  'use strict';
  const skins = ns.skins;

  function atEntity(ctx, entity, draw) {
    ctx.save();
    ctx.translate(entity.x, entity.y);
    if (entity.type === 'elite') ctx.scale(1.55, 1.45);
    if (entity.rotation) ctx.rotate(entity.rotation);
    draw(ctx, entity);
    ctx.restore();
  }

  function glow(ctx, color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur || 10; }
  function circle(ctx, x, y, radius, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  function polygon(ctx, points, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(function (point) { ctx.lineTo(point[0], point[1]); });
    ctx.closePath(); ctx.fill();
  }

  const classic = {
    player: function (ctx, e) { atEntity(ctx, e, function (c) {
      glow(c, '#54e8ff', 14); polygon(c, [[0,-26],[9,4],[19,17],[12,20],[7,26],[-7,26],[-12,20],[-19,17],[-9,4]], '#c9f7ff');
      c.fillStyle = '#1489b2'; c.fillRect(-4,-10,8,25); c.fillStyle = '#ffb64f'; c.fillRect(-9,24,5,10); c.fillRect(4,24,5,10);
    }); },
    bullet: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#54e8ff',12); c.fillStyle='#fff'; c.fillRect(-3,-9,6,18); c.fillStyle='#54e8ff'; c.fillRect(-1,9,2,8); }); },
    enemy: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#ff496d',9); polygon(c, [[0,21],[8,-4],[19,-14],[12,-21],[-12,-21],[-19,-14],[-8,-4]], '#ff5272'); c.fillStyle='#5c1630'; c.fillRect(-4,-14,8,21); }); }
  };

  const fastFood = {
    player: function (ctx, e) { atEntity(ctx, e, function (c) {
      glow(c,'#ffcc3d',13); polygon(c,[[-14,-21],[14,-21],[11,23],[-11,23]],'#e83b45'); polygon(c,[[-18,6],[-11,-2],[-9,17],[-20,17]],'#ffcc3d'); polygon(c,[[18,6],[11,-2],[9,17],[20,17]],'#ffcc3d');
      c.strokeStyle='#f7f3e8'; c.lineWidth=4; c.beginPath(); c.moveTo(4,-21); c.lineTo(10,-35); c.stroke(); c.fillStyle='#fff4de'; c.fillRect(-8,-13,16,6); c.fillStyle='#ff8a35'; c.fillRect(-8,22,5,10); c.fillRect(3,22,5,10);
    }); },
    bullet: function (ctx, e) { atEntity(ctx, e, function (c) {
      glow(c,'#ffcc3d',10);
      if (e.variant % 2 === 0) { circle(c,0,-3,8,'#e89a35'); c.fillStyle='#66a840'; c.fillRect(-8,-3,16,3); c.fillStyle='#6b321d'; c.fillRect(-7,0,14,5); c.fillStyle='#ffd45c'; c.fillRect(-8,5,16,3); }
      else { c.fillStyle='#ef3f49'; c.fillRect(-7,-1,14,11); c.fillStyle='#ffd44e'; [-5,-1,3].forEach(function(x){ c.save(); c.translate(x,-4); c.rotate(x*.04); c.fillRect(-2,-10,4,13); c.restore(); }); }
    }); },
    enemy: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#6bd35f',8); c.fillStyle='#4aa94a'; c.fillRect(-5,-2,10,22); circle(c,-10,-8,10,'#68c85f'); circle(c,0,-14,12,'#72d46b'); circle(c,11,-7,10,'#5bbb53'); circle(c,-4,-2,9,'#6fce63'); }); }
  };

  const cat = {
    player: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#ff9bd2',12); polygon(c,[[-17,-10],[-15,-27],[-5,-18],[5,-18],[15,-27],[17,-10],[13,16],[-13,16]],'#ffd0a6'); circle(c,-6,-7,2,'#44364a'); circle(c,6,-7,2,'#44364a'); polygon(c,[[0,-1],[-3,2],[3,2]],'#ef7da8'); c.fillStyle='#ff9bd2'; c.fillRect(-19,8,38,9); c.fillStyle='#fff'; c.fillRect(-3,16,6,14); }); },
    bullet: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#ff9bd2',9); if(e.variant%2===0){ circle(c,0,2,6,'#ff9bd2'); circle(c,-6,-6,3,'#ffd0e8'); circle(c,0,-9,3,'#ffd0e8'); circle(c,6,-6,3,'#ffd0e8'); } else { polygon(c,[[-9,0],[-3,-6],[5,-6],[10,0],[5,6],[-3,6]],'#77dbea'); polygon(c,[[10,0],[16,-6],[16,6]],'#77dbea'); circle(c,-4,-2,1,'#263d59'); } }); },
    enemy: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#a77bff',8); circle(c,0,0,17,'#9b6ee8'); c.strokeStyle='#d6c5ff'; c.lineWidth=2; c.beginPath(); c.arc(0,0,11,0,Math.PI*1.4); c.stroke(); c.beginPath(); c.moveTo(12,12); c.quadraticCurveTo(22,20,13,25); c.stroke(); }); }
  };

  const candy = {
    player: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#72f1d1',12); polygon(c,[[0,-28],[13,-10],[13,19],[0,27],[-13,19],[-13,-10]],'#f977bd'); circle(c,0,-7,8,'#72f1d1'); polygon(c,[[-13,6],[-24,17],[-12,18]],'#ffe56d'); polygon(c,[[13,6],[24,17],[12,18]],'#ffe56d'); c.fillStyle='#72f1d1'; c.fillRect(-8,24,5,10); c.fillRect(3,24,5,10); }); },
    bullet: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#ffe56d',10); if(e.variant%2===0){ circle(c,0,-4,8,'#70e7d2'); c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(0,-4,5,0,Math.PI*1.4); c.stroke(); c.fillStyle='#fff'; c.fillRect(-1,4,2,10); } else { polygon(c,[[0,-10],[8,-4],[6,7],[0,11],[-7,6],[-8,-4]],'#ffe56d'); } }); },
    enemy: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#8d69ff',9); c.fillStyle='#8d69ff'; c.fillRect(-13,-13,26,26); polygon(c,[[-13,-13],[-22,-4],[-13,4]],'#f977bd'); polygon(c,[[13,-13],[22,-4],[13,4]],'#f977bd'); circle(c,-5,-3,2,'#fff'); circle(c,5,-3,2,'#fff'); }); }
  };

  const ocean = {
    player: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#42d9ff',13); polygon(c,[[0,-27],[12,-13],[19,12],[8,22],[-8,22],[-19,12],[-12,-13]],'#278fc0'); c.fillStyle='#9af2ff'; c.fillRect(-5,-15,10,24); polygon(c,[[-17,3],[-29,17],[-15,14]],'#48c9c2'); polygon(c,[[17,3],[29,17],[15,14]],'#48c9c2'); circle(c,0,-10,4,'#dffcff'); }); },
    bullet: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#8ff6ff',8); if(e.variant%2===0){ c.strokeStyle='#9af2ff'; c.lineWidth=3; c.beginPath(); c.arc(0,0,7,0,Math.PI*2); c.stroke(); circle(c,-2,-2,2,'#fff'); } else { polygon(c,[[0,-10],[3,-3],[10,-3],[5,2],[7,10],[0,5],[-7,10],[-5,2],[-10,-3],[-3,-3]],'#ffd36b'); } }); },
    enemy: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#b56dff',9); c.fillStyle='#a56be0'; c.beginPath(); c.arc(0,-4,17,Math.PI,0); c.lineTo(17,7); c.lineTo(-17,7); c.closePath(); c.fill(); c.strokeStyle='#d7b5ff'; c.lineWidth=3; [-10,0,10].forEach(function(x){ c.beginPath(); c.moveTo(x,7); c.quadraticCurveTo(x+6,18,x,25); c.stroke(); }); }); }
  };

  const paper = {
    player: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#f1f1e8',8); polygon(c,[[0,-29],[22,18],[2,10],[0,27],[-3,10],[-22,18]],'#f5f2df'); c.strokeStyle='#8aa0a8'; c.lineWidth=1.5; c.beginPath(); c.moveTo(0,-27); c.lineTo(2,10); c.lineTo(22,18); c.stroke(); }); },
    bullet: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#ffd253',7); if(e.variant%2===0){ c.save(); c.rotate(-.2); c.fillStyle='#ffd253'; c.fillRect(-3,-12,6,20); polygon(c,[[-3,-12],[3,-12],[0,-18]],'#414c55'); c.fillStyle='#ef7d82'; c.fillRect(-3,8,6,5); c.restore(); } else { c.fillStyle='#ef8fa0'; c.fillRect(-7,-6,14,12); c.strokeStyle='#fff'; c.strokeRect(-7,-6,14,12); } }); },
    enemy: function (ctx, e) { atEntity(ctx, e, function (c) { glow(c,'#aebbc0',6); polygon(c,[[-13,-18],[7,-20],[19,-8],[14,13],[0,21],[-18,11],[-20,-7]],'#b9c2c5'); c.strokeStyle='#778890'; c.lineWidth=2; c.beginPath(); c.moveTo(-13,-18); c.lineTo(3,-5); c.lineTo(19,-8); c.moveTo(-18,11); c.lineTo(3,-5); c.lineTo(0,21); c.stroke(); }); }
  };

  [
    { id:'classic', name:'經典戰機', icon:'✈️', accent:'#52e7ff', secondary:'#ffca58', background:['#071a2b','#020a12'], star:'#8ed9ef', effect:'#ff496d', renderers:classic },
    { id:'fast-food', name:'歡樂速食', icon:'🍔', accent:'#ffcc3d', secondary:'#ef4651', background:['#321521','#12090d'], star:'#ffd879', effect:'#6bd35f', renderers:fastFood },
    { id:'cat-squad', name:'貓咪中隊', icon:'🐱', accent:'#ff9bd2', secondary:'#a77bff', background:['#271731','#0e0915'], star:'#ffd0e8', effect:'#a77bff', renderers:cat },
    { id:'candy-planet', name:'糖果星球', icon:'🍭', accent:'#72f1d1', secondary:'#f977bd', background:['#2c1742','#10091b'], star:'#ffe56d', effect:'#f977bd', renderers:candy },
    { id:'deep-ocean', name:'深海巡航', icon:'🫧', accent:'#42d9ff', secondary:'#b56dff', background:['#062b42','#020c1c'], star:'#8ff6ff', effect:'#b56dff', renderers:ocean },
    { id:'paper-mission', name:'紙上作戰', icon:'✏️', accent:'#f1f1e8', secondary:'#ffd253', background:['#28343a','#101719'], star:'#d7e0dd', effect:'#ffd253', renderers:paper }
  ].forEach(function (pack) { skins.register(pack); });
})(globalThis.SkyStrike);
