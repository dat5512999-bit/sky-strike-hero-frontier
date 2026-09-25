'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');

test('玩家主要操作介面提供繁體中文標示', () => {
  const battle = read('td.html');
  ['金幣', '戰局積分', '英雄指令', '生命', '能量', '戰場戰利品', '戰地軍械', '戰鬥紀錄'].forEach(text => assert.ok(battle.includes(text), text));
  assert.doesNotMatch(battle, />GOLD</);
  assert.doesNotMatch(battle, />BATTLE SCORE</);
  assert.doesNotMatch(battle, />FRONTIER MERCHANT</);
});

test('大廳、圖鑑、商城與過場都保有中文可見文字', () => {
  const app = read('src/td/app/FrontierApp.js');
  const codex = read('src/td/codex/CodexView.js');
  const shop = read('src/td/shop/ShopTemplates.js');
  const cinematic = read('src/td/cinematic/CinematicPlayer.js');
  ['localizeInterface', '劇情典藏', '即將推出', '帳戶錢包'].forEach(text => assert.ok(app.includes(text), text));
  ['圖鑑使用說明', '詳細數值', '史料更新', '新資訊'].forEach(text => assert.ok(codex.includes(text), text));
  ['精選', '不同的英雄', '霜雪誓約', '不只是力量'].forEach(text => assert.ok(shop.includes(text), text));
  ['第一章', '英雄邊境', '英文（待翻譯）', '第 '].forEach(text => assert.ok(cinematic.includes(text), text));
});
