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

test('PWA manifest 與離線快取引用的遊戲檔案都存在', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'portrait');
  manifest.icons.forEach((icon) => assert.ok(fs.existsSync(path.join(root, icon.src)), `缺少圖示：${icon.src}`));

  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const assets = Array.from(worker.matchAll(/'\.\/([^']*)'/g), (match) => match[1] || 'index.html');
  assets.forEach((asset) => assert.ok(fs.existsSync(path.join(root, asset)), `離線快取缺少檔案：${asset}`));
});
