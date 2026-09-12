'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('index.html 引用的本機樣式與腳本全部存在', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const references = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), (match) => match[1]);
  assert.ok(references.length > 0);
  references.forEach((reference) => {
    assert.ok(!/^https?:/i.test(reference), `不得依賴網路資源：${reference}`);
    assert.ok(fs.existsSync(path.join(root, reference)), `缺少檔案：${reference}`);
  });
});

test('瀏覽器入口使用傳統腳本，以支援 file:// 直接開啟', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal(/<script[^>]+type=["']module["']/i.test(html), false);
  assert.equal(/\bfetch\s*\(/.test(html), false);
});

test('英雄塔防入口引用的本機資產完整且不依賴網路', () => {
  const html = fs.readFileSync(path.join(root, 'td.html'), 'utf8');
  const references = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), (match) => match[1]);
  references.forEach((reference) => {
    assert.ok(!/^https?:/i.test(reference), `不得依賴網路資源：${reference}`);
    assert.ok(fs.existsSync(path.join(root, reference)), `TD 缺少檔案：${reference}`);
  });
  assert.equal(/<script[^>]+type=["']module["']/i.test(html), false);
});

test('RTS HUD 保留必要控制並提供英雄狀態與快捷技能', () => {
  const html = fs.readFileSync(path.join(root, 'td.html'), 'utf8');
  ['td-wave-number','td-pause','td-hero-hp-fill','td-hero-mp-fill','td-stat-attack','td-stat-range','td-stat-speed','td-stat-move'].forEach((id) => {
    assert.equal((html.match(new RegExp(`id=["']${id}["']`, 'g')) || []).length, 1, `${id} 應唯一存在`);
  });
  [1, 2, 3].forEach((speed) => assert.match(html, new RegExp(`data-game-speed=["']${speed}["']`)));
  ['Q','W','E','R','F'].forEach((key) => assert.match(html, new RegExp(`<kbd>${key}</kbd>`)));
  assert.match(html, /id="td-ultimate"[^>]*aria-keyshortcuts="F"/);
  ['story','standard','veteran','calamity'].forEach((mode) => assert.match(html, new RegExp(`data-td-difficulty=["']${mode}["']`)));
  ['td-report-open','td-report-screen','td-report-rows','td-final-report'].forEach((id) => assert.equal((html.match(new RegExp(`id=["']${id}["']`, 'g')) || []).length, 1));
  ['td-armory-open','td-armory-screen','td-armory-loadout','td-armory-items','td-armory-target'].forEach((id) => assert.equal((html.match(new RegExp(`id=["']${id}["']`, 'g')) || []).length, 1));
});

test('手機版提供可記憶的戰場優先指揮面板與安全區', () => {
  const html = fs.readFileSync(path.join(root, 'td.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'td.css'), 'utf8');
  const main = fs.readFileSync(path.join(root, 'src/td/main.js'), 'utf8');
  assert.match(html, /id="td-mobile-panel-toggle"/);
  assert.match(css, /data-mobile-panel="compact"/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /min-height:48px/);
  assert.match(main, /towerFrontierMobilePanel/);
  assert.match(main, /dataset\.mobilePanel/);
});

test('PWA manifest 與離線快取引用的遊戲檔案都存在', () => {
  ['manifest.webmanifest', 'td.webmanifest'].forEach((filename) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.orientation, 'portrait');
    manifest.icons.forEach((icon) => assert.ok(fs.existsSync(path.join(root, icon.src)), `缺少圖示：${icon.src}`));
  });
  const tdManifest = JSON.parse(fs.readFileSync(path.join(root, 'td.webmanifest'), 'utf8'));
  assert.equal(tdManifest.start_url, './td.html');

  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const assets = Array.from(worker.matchAll(/'\.\/([^']*)'/g), (match) => match[1] || 'index.html');
  assets.forEach((asset) => assert.ok(fs.existsSync(path.join(root, asset)), `離線快取缺少檔案：${asset}`));
  assert.match(worker, /const PRECACHE = ASSETS\.filter/);
  assert.match(worker, /!asset\.startsWith\('\.\/assets\/td\/'\)/);
  assert.match(worker, /caches\.match\(event\.request, \{ ignoreSearch: true \}\)/);
});

test('手機主畫面圖示具備標準 PNG 尺寸並由兩種模式引用', () => {
  const assets = [
    ['assets/icons/app-icon-1024.png', 1024],
    ['assets/icons/app-icon-512.png', 512],
    ['assets/icons/app-icon-192.png', 192],
    ['assets/icons/apple-touch-icon-180.png', 180]
  ];
  assets.forEach(([file, size]) => {
    const data = fs.readFileSync(path.join(root, file));
    assert.deepEqual(Array.from(data.subarray(0, 8)), [137,80,78,71,13,10,26,10]);
    assert.equal(data.readUInt32BE(16), size);
    assert.equal(data.readUInt32BE(20), size);
  });
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const td = fs.readFileSync(path.join(root, 'td.html'), 'utf8');
  assert.match(index, /apple-touch-icon-180\.png/);
  assert.match(td, /apple-touch-icon-180\.png/);
  assert.match(td, /td\.webmanifest/);
  const pages = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.match(pages, /enablement:\s*true/);
});

test('塔防正式 PNG 資產尺寸與透明圖集格式正確', () => {
  const assets = [
    ['assets/td/forest-valley-v1.png', 1254, 1254, 2],
    ['assets/td/towers-atlas-v1.png', 1774, 887, 6],
    ['assets/td/units-atlas-v1.png', 1536, 1024, 6],
    ['assets/td/frontier-keep-v1.png', 1304, 1206, 6]
  ];
  assets.forEach(([file, width, height, colorType]) => {
    const data = fs.readFileSync(path.join(root, file));
    assert.deepEqual(Array.from(data.subarray(0, 8)), [137,80,78,71,13,10,26,10]);
    assert.equal(data.readUInt32BE(16), width);
    assert.equal(data.readUInt32BE(20), height);
    assert.equal(data[25], colorType, `${file} 的 PNG 色彩格式不符`);
  });
});

test('人族 TD 戰場與職業單位圖集可離線載入', () => {
  const assets = [
    ['assets/td/human-td-battlefield-v2.png', 1254, 1254],
    ['assets/td/ranger-actions-v1.png', 1254, 1254],
    ['assets/td/arcanist-actions-v1.png', 1244, 1264],
    ['assets/td/rogue-actions-v1.png', 1254, 1254]
  ];
  assets.forEach(([file, width, height]) => {
    const data = fs.readFileSync(path.join(root, file));
    assert.equal(data.readUInt32BE(16), width);
    assert.equal(data.readUInt32BE(20), height);
  });
});

test('職業武器九宮格為本機透明資產', () => {
  const data = fs.readFileSync(path.join(root, 'assets/td/items/class-weapons-atlas-v1.png'));
  assert.equal(data.readUInt32BE(16), 1536);
  assert.equal(data.readUInt32BE(20), 1024);
  assert.equal(data[25], 6);
});

test('暗影英雄無武器底圖可供逐幀換裝', () => {
  const data = fs.readFileSync(path.join(root, 'assets/td/rogue-actions-unarmed-v2.png'));
  assert.equal(data.readUInt32BE(16), 1254);
  assert.equal(data.readUInt32BE(20), 1254);
  assert.equal(data[25], 6);
});

test('新增三族守軍與戰術敵軍都接入建造介面及離線快取', () => {
  const html = fs.readFileSync(path.join(root, 'td.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'td.css'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  ['knight','treant','golem'].forEach((type) => {
    assert.match(html, new RegExp(`data-build-type=["']${type}["']`));
    assert.match(css, new RegExp(`faction-${type}-v1\\.png`));
    assert.match(worker, new RegExp(`faction-${type}-v1\\.png`));
  });
  ['shaman','healer','boss'].forEach((type) => assert.match(worker, new RegExp(`enemy-${type}-actions-v1\\.png`)));
});

test('跨族傭兵名冊與召喚／換裝圖集完整加入離線版本', () => {
  const html = fs.readFileSync(path.join(root, 'td.html'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const game = fs.readFileSync(path.join(root, 'src/td/TDGame.js'), 'utf8');
  const mercenaries = Array.from(html.matchAll(/data-mercenary="([^"]+)"/g), (match) => match[1]);
  assert.deepEqual(mercenaries, ['hunter','shield','knight','musketeer','halberdier','arcanist','dragon','treant','dryad','moonblade','rogue','skeleton','golem','banshee','boneRider']);
  assert.equal(mercenaries.includes('orc'), false, '戰利解鎖的半獸人不應重複放入商店');
  assert.match(game, /if\(!self\.factions\.canHire\(type\)\)return/, '隱藏按鈕之外仍需阻擋本族傭兵購買');
  ['arcane-elemental-actions-v1.png','crypt-wraith-actions-v1.png','graveyard-revenant-actions-v1.png','hero-hunter-actions-unarmed-v4.png','hero-arcanist-actions-unarmed-v1.png'].forEach((file) => {
    assert.ok(fs.existsSync(path.join(root, 'assets/td', file)));
    assert.match(worker, new RegExp(file.replaceAll('.', '\\.')));
  });
});

test('六名新守軍和獨立盾衛旗手都有透明四乘四圖集並接入手機建造介面', () => {
  const html = fs.readFileSync(path.join(root, 'td.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'td.css'), 'utf8');
  const art = fs.readFileSync(path.join(root, 'src/td/systems/ArtSystem.js'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const units = {musketeer:'faction-musketeer-actions-v1.png',halberdier:'faction-halberdier-actions-v1.png',dryad:'faction-dryad-actions-v1.png',moonblade:'faction-moonblade-actions-v1.png',banshee:'faction-banshee-actions-v1.png',boneRider:'faction-bone-rider-actions-v1.png'};
  for (const [type,file] of Object.entries(units)) {
    assert.match(html, new RegExp('data-build-type="'+type+'"'));
    assert.match(html, new RegExp('data-mercenary="'+type+'"'));
    assert.ok(css.includes(file), type+' build card / selection portrait');
    assert.ok(art.includes(file), type+' combat atlas');
    assert.ok(worker.includes(file), type+' offline cache');
  }
  for (const file of [...Object.values(units),'enemy-warder-actions-v1.png','enemy-commander-actions-v1.png']) {
    const data = fs.readFileSync(path.join(root, 'assets/td', file));
    assert.deepEqual(Array.from(data.subarray(0,8)),[137,80,78,71,13,10,26,10]);
    assert.equal(data.readUInt32BE(16)%4,0,file+' width');
    assert.equal(data.readUInt32BE(20)%4,0,file+' height');
    assert.equal(data[25],6,file+' RGBA');
    assert.ok(worker.includes(file),file+' offline cache');
  }
});

test('戰地軍械九宮格為本機透明資產', () => {
  const data = fs.readFileSync(path.join(root, 'assets/td/items/equipment-atlas-v1.png'));
  assert.equal(data.readUInt32BE(16), 1254);
  assert.equal(data.readUInt32BE(20), 1254);
  assert.equal(data[25], 6);
});
