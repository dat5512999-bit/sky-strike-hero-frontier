const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('td.html','utf8'),css=fs.readFileSync('td.css','utf8'),game=fs.readFileSync('src/td/TDGame.js','utf8'),main=fs.readFileSync('src/td/main.js','utf8');

test('遠征配置固定為選擇戰場與組建遠征隊兩頁',()=>{
  assert.equal((html.match(/data-expedition-page=/g)||[]).length,2);
  for(const page of ['battlefield','party'])assert.match(html,new RegExp('data-expedition-page="'+page+'"'));
  assert.match(html,/id="td-select-battlefield"/);assert.match(html,/id="td-change-battlefield"/);
  assert.match(game,/showOpeningPage\('battlefield'\)/);assert.match(game,/showOpeningPage\('party'\)/);
});

test('PAGE 1 使用可擴充地圖瀏覽列並保留四種難度',()=>{
  assert.equal((html.match(/data-map-id=/g)||[]).length,6);
  assert.equal((html.match(/data-td-difficulty=/g)||[]).length,4);
  for(const id of ['td-map-preview','td-map-tags','td-map-features','td-route-label','td-map-record'])assert.ok(html.includes('id="'+id+'"'));
  assert.match(css,/\.map-thumbnail-strip/);assert.match(css,/overflow-x:auto/);assert.match(main,/ui\.mapButtons/);assert.match(game,/attachFreeChapterMaps/);assert.match(game,/westernsignal/);assert.match(game,/emberroad/);
});

test('PAGE 2 保持英雄軍團獨立選擇並即時組合摘要',()=>{
  assert.equal((html.match(/data-profession=/g)||[]).length,7);
  assert.equal((html.match(/data-faction=/g)||[]).length,7);
  for(const id of ['td-hero-detail','td-faction-detail','td-summary-map','td-summary-difficulty','td-summary-hero','td-summary-faction','td-combination-hint'])assert.ok(html.includes('id="'+id+'"'));
  assert.match(game,/hero\.name\+' × '\+faction\.name/);assert.match(game,/chooseProfession\(this\.selectedProfession,this\.selectedFaction\)/);
});

test('PAGE 2 同屏比較四個選項並提供技能與代表軍隊',()=>{
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(html,/class="expedition-tags hero-skill-list"/);
  assert.match(html,/class="faction-roster-list"/);
  assert.match(game,/UNIT_CARD_ART/);
  assert.match(game,/factionRoster\.innerHTML/);
  assert.match(fs.readFileSync('src/td/systems/HeroRoster.js','utf8'),/hero-chief-selection-v2\.png/);
  assert.ok(fs.existsSync('assets/td/opening/hero-chief-selection-v2.png'));
});

test('Mobile Landscape 共用內容並以英雄軍團頁籤切換',()=>{
  assert.match(html,/data-party-tab="hero"/);assert.match(html,/data-party-tab="faction"/);
  assert.match(css,/data-party-tab="faction"/);assert.match(css,/party-mobile-tabs/);
});
