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
  class AudioCatalog{
    static identities=identities;
    static families=families;
    static events=events;
    static skill(hero,slot){
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
