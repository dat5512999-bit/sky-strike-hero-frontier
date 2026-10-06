'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs } = require('../scripts/qa-desktop-soak.cjs');

test('桌面長測限制軍團、時間與本機證據路徑', () => {
  assert.equal(parseArgs(['--faction', 'naga', '--seconds', '90']).seconds, 90);
  assert.equal(parseArgs(['--headed']).headed, true);
  assert.equal(parseArgs(['--faction', 'egypt']).faction, 'egypt');
  assert.throws(() => parseArgs(['--faction', 'unknown']), /naga、dwarf 或 egypt/);
  assert.throws(() => parseArgs(['--seconds', '601']), /10–600/);
  assert.throws(() => parseArgs(['--out', '..']), /artifacts/);
});
