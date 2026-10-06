'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { parseArgs, summarizeSamples, VERSION } = require('../scripts/qa-battlefield-acceptance.cjs');

test('戰場驗收工具有獨立規格版號與安全的預設輸出', () => {
  const options = parseArgs([]);
  assert.equal(VERSION, '1.0.0');
  assert.equal(options.faction, 'naga');
  assert.equal(options.out, path.resolve(__dirname, '..', 'artifacts', 'battlefield-acceptance'));
});

test('只接受已知軍團與 artifacts 內的輸出路徑', () => {
  assert.equal(parseArgs(['--faction', 'dragonkin']).faction, 'dragonkin');
  assert.throws(() => parseArgs(['--faction', 'unknown']), /未知軍團/);
  assert.throws(() => parseArgs(['--out', '..']), /artifacts/);
  assert.throws(() => parseArgs(['--out']), /artifacts/);
  assert.throws(() => parseArgs(['--surprise']), /不支援/);
});

test('效能報告以相同 P95 定義統計，不把各欄相加', () => {
  const samples = Array.from({ length: 20 }, (_, i) => ({
    realMs: i + 1, updateMs: i / 2, uiMs: 1, simulationMs: .5,
    drawMs: 2, backlogMs: 0, discardedMs: 0
  }));
  const report = summarizeSamples(samples);
  assert.equal(report.frames, 20);
  assert.equal(report.frameP95, 19);
  assert.equal(report.updateP95, 9);
  assert.equal(report.fps, 95.2);
});
