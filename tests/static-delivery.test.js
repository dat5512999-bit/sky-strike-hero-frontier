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

test('PWA manifest 與離線快取引用的遊戲檔案都存在', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'portrait');
  manifest.icons.forEach((icon) => assert.ok(fs.existsSync(path.join(root, icon.src)), `缺少圖示：${icon.src}`));

  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const assets = Array.from(worker.matchAll(/'\.\/([^']*)'/g), (match) => match[1] || 'index.html');
  assets.forEach((asset) => assert.ok(fs.existsSync(path.join(root, asset)), `離線快取缺少檔案：${asset}`));
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
