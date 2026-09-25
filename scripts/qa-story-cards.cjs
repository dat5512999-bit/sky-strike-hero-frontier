'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.STORY_CARDS_TEST_URL || 'http://127.0.0.1:4175/td.html';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const folder = 'artifacts/qa-story-cards-v08512';
  fs.mkdirSync(folder, { recursive: true });
  try {
    for (const view of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'landscape', width: 844, height: 390 }, { name: 'portrait', width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: { width: view.width, height: view.height }, serviceWorkers: 'block', hasTouch: view.name !== 'desktop' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(url);
      await page.waitForFunction(() => globalThis.frontierApp || document.querySelector('iframe')?.contentWindow?.frontierApp, null, { timeout: 12000 }).catch(async error => { const state = await page.evaluate(() => ({ ready: document.readyState, page: location.href, frames: document.querySelectorAll('iframe').length })); throw Error(error.message + '\n' + JSON.stringify(state) + '\n' + errors.join('\n')); });
      const frame = page.frames().find(item => item.url().endsWith('/td.html'));
      assert.ok(frame, 'game frame available');
      const before = await frame.evaluate(() => frontierApp.store.export());
      await frame.locator('[data-action="story"]').first().click();
      await frame.locator('[data-action="story-card-replay"]').click();
      for (let index = 0; index < 3; index++) {
        await frame.locator('.story-card-stage img').evaluate(image => image.decode());
        assert.equal(await frame.locator('.story-card').count(), 1);
        const bounds = await frame.locator('.story-card-actions').boundingBox();
        assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= view.width, view.name + ' actions clipped');
        await page.waitForTimeout(550);
        await page.screenshot({ path: folder + '/' + view.name + '-' + (index + 1) + '.png' });
        if (index < 2) await frame.locator('[data-action="story-card-next"]').click();
      }
      await frame.locator('[data-action="story-card-next"]').click();
      assert.equal(await frame.evaluate(() => document.body.dataset.appPage), 'story');
      assert.equal(await frame.evaluate(() => frontierApp.store.export()), before);
      if (view.name === 'desktop') {
        const laterMissions = await frame.evaluate(() => frontierApp.constructor && towerFrontierGame.systems.StoryCatalog.missions.slice(1).map(mission => ({ id: mission.id, name: mission.name })));
        for (const mission of laterMissions) {
          await frame.evaluate(id => {
            const selected = towerFrontierGame.systems.StoryCatalog.getMission(id);
            frontierApp.startStoryCards(selected, true);
          }, mission.id);
          assert.equal(await frame.locator('.story-card').getAttribute('aria-label'), mission.name + '戰前劇情');
          for (let index = 0; index < 3; index++) {
            await frame.locator('.story-card-stage img').evaluate(image => image.decode());
            if (index < 2) await frame.locator('[data-action="story-card-next"]').click();
          }
          await frame.locator('[data-action="story-card-next"]').click();
          assert.equal(await frame.evaluate(() => document.body.dataset.appPage), 'story');
        }
        assert.equal(await frame.evaluate(() => frontierApp.store.export()), before);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Story cards: all four Chapter I card sets, desktop, landscape, portrait, image decode, navigation, and read-only replay passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
