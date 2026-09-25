'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');

test('all seven faction cards use their own painted group portraits instead of legacy emblems',()=>{
  const {ns}=load(),css=fs.readFileSync('td-polish.css','utf8');
  const factions=ns.systems.FactionSystem.FACTIONS;
  assert.equal(Object.keys(factions).length,7);
  for(const [id,faction] of Object.entries(factions)){
    assert.ok(faction.selectionArt,id+' needs selectionArt');
    assert.ok(fs.existsSync(faction.selectionArt),id+' painted faction art is missing');
    assert.ok(fs.statSync(faction.selectionArt).size>100000,id+' still looks like a placeholder asset');
  }
  assert.match(css,/\.faction-list button\[data-faction\]::before\{display:none!important/);
  assert.match(css,/\.faction-list button\[data-faction\]\{background-image:[^}]*var\(--selection-art\)!important/);
});

test('Frostfang selection uses a full-body portrait and the painted frost skill atlas',()=>{
  const {ns}=load(),hero=ns.systems.HeroRoster.get('frostland');
  const css=fs.readFileSync('td-polish.css','utf8'),png=fs.readFileSync(hero.selectionArt),sw=fs.readFileSync('sw.js','utf8');
  assert.equal(hero.selectionArt,'assets/td/frostland/hero-selection-v2.png');
  assert.equal(png.readUInt32BE(16),1024);assert.equal(png.readUInt32BE(20),1536);
  assert.match(css,/#td-hero-detail-art\[data-hero="frostland"\][^}]*background-size:contain!important/);
  assert.match(css,/#td-hero-skills\[data-hero="frostland"\] span::before[^}]*skill-icons-v1\.png/);
  for(const position of ['0 0','100% 0','0 100%'])assert.ok(css.includes('background-position:'+position+'!important'));
  assert.ok(sw.includes('assets/td/frostland/hero-selection-v2.png'));
});
