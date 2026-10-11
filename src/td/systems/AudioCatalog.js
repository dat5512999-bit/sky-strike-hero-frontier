(function(ns){
  'use strict';
  // Original procedural sound design: [frequency, end frequency, seconds, wave, delay, level].
  // Noise layers provide material transients; pitches/voicings give factions identity.
  const identities={hunter:[392,'triangle',2400],arcanist:[660,'sine',3600],rogue:[220,'triangle',900],wild:[110,'triangle',650],chief:[110,'triangle',650],goblin:[185,'square',1800],frostland:[880,'sine',4800],naga:[330,'sine',1300],dwarf:[147,'triangle',1100],dragonkin:[494,'sawtooth',2600],egypt:[554,'triangle',3200],bull:[82,'triangle',700],neutral:[262,'triangle',2000]};
  const tone=(a,b,d,w='sine',at=0,level=.12)=>({a,b,d,w,at,level});
  const noise=(cut,d,at=0,level=.16)=>({noise:true,cut,d,at,level});
  const families={
    blade:[noise(2200,.11),tone(340,95,.12,'triangle')],arrow:[noise(3500,.09),tone(580,210,.09,'triangle')],
    gun:[noise(1800,.16,0,.25),tone(125,45,.14,'triangle')],siege:[noise(700,.32,0,.3),tone(95,32,.35,'triangle')],
    ice:[noise(4200,.16),tone(1500,750,.19),tone(2100,1000,.13,'sine',.035,.07)],
    fire:[noise(900,.32),tone(180,65,.28,'sawtooth',0,.06)],lightning:[noise(2800,.09),tone(1100,180,.18,'sawtooth',.025,.06)],
    tide:[noise(1000,.25),tone(410,170,.24),tone(180,340,.18,'sine',.045,.07)],
    shadow:[noise(500,.19),tone(240,70,.25,'triangle'),tone(247,80,.23,'sine',.035,.07)],
    nature:[noise(1800,.14),tone(540,320,.19,'triangle')],stone:[noise(420,.19),tone(110,35,.24,'triangle')],
    arcane:[tone(620,1000,.2),tone(930,1240,.23,'sine',.03,.07)],support:[tone(330,440,.2),tone(660,880,.27,'sine',.08,.06)]
  };
  const events={
    click:[tone(480,620,.055,'sine',0,.055)],error:[tone(190,145,.13,'triangle',0,.1)],
    build:[noise(1200,.1),tone(165,95,.14,'triangle'),tone(440,660,.2,'sine',.11,.09)],
    upgrade:[tone(330,330,.17),tone(440,440,.18,'sine',.09),tone(660,660,.3,'sine',.18)],
    purchase:[noise(3800,.04,0,.08),tone(1046,1046,.12),tone(1318,1318,.2,'sine',.08)],
    sell:[tone(880,660,.14),tone(660,440,.18,'sine',.09)],loot:[tone(660,880,.15),tone(1320,1760,.25,'sine',.1)],
    wave:[tone(196,196,.25,'triangle'),tone(294,294,.35,'triangle',.16)],
    boss:[noise(380,.6),tone(65,49,.65,'sawtooth',0,.1),tone(98,73,.5,'triangle',.22)],
    clear:[tone(392,392,.16),tone(494,494,.2,'sine',.1),tone(587,587,.28,'sine',.2)],
    victory:[tone(262,262,.3,'triangle'),tone(330,330,.3,'triangle',.18),tone(392,392,.3,'triangle',.36),tone(524,524,.7,'triangle',.54)],
    defeat:[tone(220,196,.4,'triangle'),tone(175,147,.5,'triangle',.25),tone(130,98,.65,'triangle',.5)],
    hurt:[noise(700,.15),tone(120,70,.18,'triangle')],down:[noise(400,.3),tone(147,49,.65,'triangle')],
    death:[noise(650,.12,0,.07),tone(90,45,.18,'triangle',0,.06)],leak:[tone(330,220,.18,'square',0,.07),tone(220,165,.2,'triangle',.15)]
  };
  const groupFamilies={slash:'blade',thrust:'blade',shield:'stone',slam:'stone',tideSlash:'tide',charge:'stone',breath:'fire',arrow:'arrow',bullet:'gun',cannon:'siege',inferno:'fire',emberBreath:'fire',frostBreath:'ice',lightning:'lightning',poison:'shadow',nature:'nature',moon:'blade',spirit:'shadow',ice:'ice',arcane:'arcane',tide:'tide'};
  const material=(name,d,at=0,level=.35)=>({material:name,materialBank:'character',d,at,level});
  const characterCues={
    hunter:{
      attack:[material('bow',.3,0,.3),material('leaves',.18,.03,.1)],
      hit:[material('wood',.3,0,.21),material('blade',.16,0,.08)],
      q:[material('bow',.3,0,.36),material('bow',.3,.065,.3),material('bow',.3,.13,.25),material('leaves',.6,0,.18)],
      w:[material('wood',.42,0,.32),material('steel',.28,.06,.18)],
      e:[material('horn',.8,0,.2),material('leaves',.65,.06,.3)],
      f:[material('bow',.32,0,.4),material('blade',.34,.1,.28),material('leaves',.65,.2,.38),material('wood',.44,.4,.35)]
    },
    arcanist:{
      attack:[material('arcane',.3,0,.2),material('crystal',.23,0,.12)],
      hit:[material('crystal',.3,0,.17),material('leaves',.22,0,.06)],
      q:[material('crystal',.8,0,.35),material('frost',.9,0,.28)],
      w:[material('thunder',.85,0,.32),material('crystal',.4,.13,.18),material('thunder',.6,.24,.22)],
      e:[material('arcane',1.15,0,.32),material('leaves',.65,.12,.2)],
      f:[material('arcane',1.1,0,.3),material('crystal',.85,.12,.4),material('frost',1.2,.2,.36),material('thunder',1.25,.1,.32)]
    },
    rogue:{
      attack:[material('blade',.22,0,.22),material('veil',.18,0,.1)],
      hit:[material('blade',.16,0,.16),material('wood',.12,0,.1)],
      q:[material('veil',.65,0,.28),material('blade',.3,.09,.4)],
      w:[material('veil',.8,0,.4),material('sand',.85,0,.18)],
      e:[material('veil',.75,0,.35),material('blade',.22,.12,.16)],
      f:[material('veil',.8,0,.36),material('blade',.34,.12,.44),material('blade',.32,.28,.32),material('wood',.3,.32,.18)]
    },
    chief:{
      attack:[material('wood',.35,0,.28),material('drum',.25,.02,.17)],
      hit:[material('drum',.38,0,.28),material('wood',.2,0,.12)],
      q:[material('horn',1.05,0,.35),material('drum',.55,0,.3)],
      w:[material('flame',1.1,0,.36),material('drum',.5,0,.25)],
      e:[material('drum',.7,0,.42),material('wood',.44,.08,.3),material('thunder',.9,.04,.18)],
      f:[material('horn',1.05,0,.38),material('drum',.7,.04,.5),material('wood',.44,.16,.28),material('flame',1.15,.12,.3)]
    },
    frostland:{
      attack:[material('blade',.24,0,.19),material('crystal',.32,.02,.14)],
      hit:[material('crystal',.4,0,.24),material('frost',.2,0,.09)],
      q:[material('frost',1.05,0,.33),material('horn',.7,0,.2)],
      w:[material('blade',.34,0,.3),material('crystal',.85,.07,.45)],
      e:[material('horn',1,0,.3),material('frost',.8,.08,.24)],
      f:[material('frost',1.2,0,.45),material('horn',1.05,.04,.27),material('crystal',.85,.16,.36),material('thunder',.95,.08,.16)]
    },
    dwarf:{
      attack:[material('steel',.33,0,.25),material('wood',.18,0,.12)],
      hit:[material('steel',.5,0,.26),material('drum',.24,0,.13)],
      q:[material('steel',.8,0,.43),material('drum',.6,0,.38)],
      w:[material('flame',1.15,0,.36),material('steel',.65,.05,.28)],
      e:[material('steel',.7,0,.27),material('steel',.7,.17,.2),material('horn',.9,0,.23)],
      f:[material('steel',.8,0,.48),material('drum',.7,0,.42),material('arcane',1.1,.07,.22),material('thunder',1.2,.04,.23)]
    },
    dragonkin:{
      attack:[material('thunder',.24,0,.22),material('blade',.25,0,.15)],
      hit:[material('thunder',.4,0,.24),material('crystal',.2,0,.08)],
      q:[material('blade',.34,0,.3),material('thunder',1,.03,.43)],
      w:[material('flame',1.15,0,.4),material('thunder',1.3,.08,.32)],
      e:[material('horn',1.05,0,.28),material('arcane',1.1,.08,.23)],
      f:[material('blade',.34,0,.25),material('thunder',1.35,.04,.58),material('flame',1.15,.12,.3),material('horn',1.05,.08,.2)]
    },
    egypt:{
      attack:[material('blade',.3,0,.22),material('sand',.25,0,.12)],
      hit:[material('steel',.25,0,.16),material('sand',.38,0,.19)],
      q:[material('blade',.34,0,.4),material('sand',.75,.04,.32)],
      w:[material('sand',.95,0,.44),material('arcane',1.1,0,.2)],
      e:[material('arcane',1.15,0,.28),material('steel',.7,.06,.18)],
      f:[material('sand',.95,0,.42),material('steel',.8,.14,.34),material('arcane',1.15,.03,.32),material('flame',1,.1,.28)]
    },
    goblin:{
      attack:[material('rivet',.26,0,.32),material('ratchet',.2,.04,.12)],
      hit:[material('rivet',.16,0,.18),material('ratchet',.25,0,.1)],
      q:[material('ratchet',.58,0,.38),material('motor',.85,.1,.25)],
      w:[material('rivet',.18,0,.18),material('steam',.95,.03,.46)],
      e:[material('ratchet',.5,0,.32),material('motor',1.1,.12,.35)],
      f:[material('motor',1.2,0,.52),material('ratchet',.58,.15,.36),material('steam',.95,.4,.38),material('rivet',.28,.35,.33)]
    },
    naga:{
      attack:[material('splash',.35,0,.27),material('conch',.2,.02,.065)],
      hit:[material('splash',.42,0,.24),material('current',.22,0,.1)],
      q:[material('splash',.48,0,.5),material('breaker',.85,.06,.32)],
      w:[material('splash',.4,0,.22),material('current',1.25,0,.52),material('current',.9,.25,.2)],
      e:[material('conch',.9,0,.34),material('current',.8,.08,.23)],
      f:[material('current',1.15,0,.3),material('breaker',1.35,.08,.65),material('splash',.48,.22,.4),material('conch',.85,.09,.18)]
    }
  };
  class AudioCatalog{
    static identities=identities;
    static families=families;
    static events=events;
    static character(hero,action){
      if(hero==='bull')return this.bull(action);
      const layers=characterCues[hero]?.[action];
      return layers?{key:hero+':'+action,layers,priority:action==='f'?3:['attack','hit'].includes(action)?0:2,gap:action==='hit'?.2:.12}:null;
    }
    static bull(action){
      const m=(material,d,at=0,level=.45)=>({material,d,at,level});
      const cues={
        attack:[m('swing',.3,0,.28),m('iron',.35,.07,.16)],
        hit:[m('impact',.38,0,.38),m('rubble',.45,.025,.16)],
        q:[m('impact',.7,0,.65),m('iron',.6,0,.24),m('rubble',1.1,.05,.36)],
        w:[m('impact',.65,0,.45),m('pressure',1.3,0,.38),m('rubble',1.1,.16,.22)],
        e:[m('resolve',1,0,.42),m('iron',.6,.08,.22)],
        f:[m('impact',.72,0,.85),m('iron',.62,0,.38),m('rubble',1.15,.04,.55),m('pressure',1.3,.05,.35)]
      };
      return cues[action]?{key:'bull:'+action,layers:cues[action],priority:action==='f'?3:['attack','hit'].includes(action)?0:2,gap:action==='hit'?.18:.12}:null;
    }
    static skill(hero,slot,legacy=false){
      if(!legacy&&['q','w','e','f'].includes(slot)){const cue=this.character(hero,slot);if(cue)return {...cue,key:'skill:'+hero+':'+slot};}
      const p=identities[hero];if(!p||!['q','w','e','f'].includes(slot))return null;
      const [f,w,cut]=p;
      const patterns={q:[noise(cut,.16),tone(f*1.8,f*.6,.24,w)],w:[noise(cut*.6,.48),tone(f*.5,f,.42,w),tone(f*1.5,f*.75,.38,'sine',.12,.07)],e:[tone(f,f,.23,w),tone(f*1.25,f*1.5,.3,w,.13),tone(f*2,f*2,.32,'sine',.26,.07)],f:[noise(cut*.5,.65,0,.24),tone(f*.25,f*.125,.65,'triangle'),tone(f,f*1.5,.55,w,.08),tone(f*2,f*3,.55,'sine',.22,.08)]};
      return {key:'skill:'+hero+':'+slot,layers:patterns[slot],priority:slot==='f'?3:2,gap:.12};
    }
    static faction(type,kind){
      this.members ||= Object.fromEntries(Object.values(ns.systems.FactionSystem?.FACTIONS||{}).flatMap(f=>[...(f.units||[]).map(t=>['unit:'+t,f.id]),...(f.buildings||[]).map(t=>['building:'+t,f.id])]));
      return this.members[kind+':'+type]||'neutral';
    }
    static attack(actor,shot){
      const cfg=actor.config?.()||{},faction=this.faction(actor.type,actor.kind),id=identities[faction]||identities.neutral;
      if(cfg.supportOnly)return this.support(actor);
      const group=ns.systems.UnitVFX?.key(actor),style=String(shot?.style||cfg.style||actor.type||'').toLowerCase();
      const family=groupFamilies[group]||(/frost|ice|blizzard|glacier|aurora/.test(style)?'ice':/tide|naga|manta/.test(style)?'tide':/lightning|storm|thunder|tesla/.test(style)?'lightning':/flame|fire|ember/.test(style)?'fire':/cannon|mortar|siege|rocket|shell/.test(style)?'siege':/rivet|bullet|gun|bolt/.test(style)?'gun':/soul|crypt|plague|shadow|wraith/.test(style)?'shadow':/root|grove|nature/.test(style)?'nature':/boulder|totem|stone/.test(style)?'stone':cfg.attackType==='pierce'?'arrow':cfg.range<80?'blade':'arcane');
      // Stable per-type variation (no RNG that could perturb combat simulation).
      const salt=[...actor.type||'summon'].reduce((a,c)=>a+c.charCodeAt(0),0),pitch=.94+(salt%13)/100;
      return {key:'attack:'+actor.kind+':'+actor.type+':'+(actor.branch||''),family,faction,priority:0,gap:.14,
        layers:families[family].map(l=>({...l,a:l.a*pitch,b:l.b*pitch})).concat(tone(id[0]*.5,id[0]*.36,.13,id[1],.025,.035))};
    }
    static support(actor){const id=identities[this.faction(actor.type,actor.kind)]||identities.neutral;return {key:'support:'+actor.type,layers:[tone(id[0],id[0]*1.5,.24,id[1],0,.06)],priority:0,gap:2};}
    static event(name){return events[name]?{key:'event:'+name,layers:events[name],priority:['boss','victory','defeat','down','leak'].includes(name)?3:1,gap:name==='click'?.08:name==='death'?.3:.2}:null;}
    static ambience(map){const text=String(map);return /frost|ice|snow|winter|calibrat/.test(text)?'wind':/tide|coast|outfall|bridge|reef|sea/.test(text)?'surf':/ember|lava|forge|fire/.test(text)?'embers':'woodland';}
  }
  ns.systems.AudioCatalog=AudioCatalog;
})(globalThis.TowerFrontier);
