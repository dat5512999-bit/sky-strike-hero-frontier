'use strict';
const { chromium } = require('playwright'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const checks = [], errors = [];
  try {
    const page = await browser.newPage({ serviceWorkers: 'block' });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4175/td.html');
    await page.evaluate(() => { towerFrontierGame.paused = true; });
    // A neutral, sub-second decoder fixture, kept only in memory; never a story asset.
    const bytes = await page.evaluate(async () => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
      document.body.append(canvas);
      const ctx = canvas.getContext('2d'); ctx.fillRect(0, 0, 32, 32);
      const stream = canvas.captureStream(0), chunks = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
      const stopped = new Promise(resolve => recorder.onstop = resolve);
      recorder.ondataavailable = event => chunks.push(event.data); recorder.start();
      let frame = 0;
      const draw = setInterval(() => { ctx.fillStyle = ++frame % 2 ? '#182631' : '#182632'; ctx.fillRect(0, 0, 32, 32); stream.getVideoTracks()[0].requestFrame(); }, 80);
      await new Promise(resolve => setTimeout(resolve, 800)); recorder.stop(); await stopped;
      clearInterval(draw); stream.getTracks().forEach(track => track.stop()); canvas.remove();
      return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
    });
    assert.ok(bytes.length > 300, 'decoder fixture contains video frames');
    await page.route('**/prologue_zh_tw.mp4', route => route.fulfill({ status: 200, contentType: 'video/webm', body: Buffer.from(bytes) }));
    await page.evaluate(() => {
      const api = TowerFrontier.cinematic;
      window.qaMediaEvents = [];
      const create = document.createElement.bind(document);
      document.createElement = function (tag, ...args) {
        const node = create(tag, ...args);
        if (tag === 'video') for (const type of ['loadedmetadata', 'canplay', 'playing', 'error', 'ended', 'stalled']) node.addEventListener(type, () => qaMediaEvents.push({ type, time: node.currentTime, error: node.error?.message }));
        return node;
      };
      window.qaPlayer = new api.CinematicPlayer(); window.qaResult = null;
      qaPlayer.play(api.prologue.cinematicId).then(value => { window.qaResult = value; });
    });
    if (await page.getByRole('button', { name: '點此播放', exact: true }).isVisible()) {
      await page.getByRole('button', { name: '點此播放', exact: true }).click();
    }
    await page.waitForFunction(() => window.qaResult).catch(async error => {
      console.error(await page.evaluate(() => { const v = document.querySelector('.hf-cinematic video'); return { status: document.querySelector('.hf-cinematic-status')?.textContent, paused: v?.paused, time: v?.currentTime, duration: v?.duration, error: v?.error?.message, events: qaMediaEvents }; }));
      throw error;
    });
    assert.deepEqual(await page.evaluate(() => [qaResult.reason, qaResult.playback, qaResult.watched]), ['ended', 'video', true]);
    assert.equal(await page.locator('.hf-cinematic').count(), 0);
    checks.push('real browser decoder fixture finishes video playback and cleans up dialog');
    await page.unroute('**/prologue_zh_tw.mp4');
    await page.route('**/prologue_zh_tw.mp4', () => {});
    await page.clock.install();
    await page.evaluate(() => { qaPlayer.play(TowerFrontier.cinematic.prologue.cinematicId); });
    await page.clock.fastForward(5200);
    await page.locator('.hf-cinematic-frame').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    checks.push('pending media request times out to storyboard');
    const local = await browser.newPage({ serviceWorkers: 'block' });
    local.on('pageerror', e => errors.push(e.message));
    await local.goto(pathToFileURL(path.resolve('td.html')).href);
    await local.waitForFunction(() => globalThis.frontierApp);
    await local.locator('[data-action="story"]').first().click();
    await local.locator('[data-action="cinematic"]').first().click();
    await local.locator('.hf-cinematic-frame').waitFor({ state: 'visible' });
    await local.getByRole('button', { name: '跳過，進入第一章', exact: true }).click();
    await local.locator('[data-action="chapter-battle"]').waitFor();
    checks.push('file URL missing-media fallback and Story completion');
    assert.deepEqual(errors, []);
    fs.mkdirSync('artifacts/qa-prologue-v0833', { recursive: true });
    fs.writeFileSync('artifacts/qa-prologue-v0833/media-results.json', JSON.stringify({ errors, checks }, null, 2));
    console.log(JSON.stringify({ errors, checks }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
