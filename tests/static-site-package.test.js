'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), vm = require('node:vm');
const { plan, build } = require('../scripts/build-static-site.cjs');
const root = path.resolve(__dirname, '..');

test('發布包保留全部離線快取、入口引用及動態序章／首領／地標素材', () => {
  const files = new Set(plan(root).files.map(file => file.path));
  const source = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const assets = vm.runInNewContext(source.slice(0, source.indexOf("self.addEventListener('install'")) + ';ASSETS');
  for (const asset of assets) assert.ok(files.has(asset === './' ? 'index.html' : asset.replace(/^\.\//, '')), asset);
  for (const file of [...files].filter(file => file.endsWith('.html'))) {
    for (const match of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/(?:src|href)="([^"?#]+\.(?:js|css|webmanifest))"/g)) {
      if (!/^(https?:|data:|\/)/.test(match[1])) assert.ok(files.has(path.posix.join(path.posix.dirname(file), match[1])), file + ': ' + match[1]);
    }
  }
  for (const directory of ['assets/cinematics/prologue', 'assets/td/story', 'assets/td/bosses', 'assets/td/adventure']) {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      if (entry.isFile()) assert.ok(files.has(directory + '/' + entry.name), directory + '/' + entry.name);
    }
  }
});

test('發布包排除概念、參考圖、偵錯入口、Git 與驗收備份，但保留本機原稿', () => {
  const result = plan(root);
  assert.ok(result.omitted.some(file => file.path.startsWith('assets/td/concepts/')));
  for (const file of result.files) assert.doesNotMatch(file.path, /^(?:\.git\/|artifacts\/|docs\/|tests\/|scripts\/|assets\/td\/(?:concepts|reference)\/|codex-dev\.html$|src\/td\/codex\/CodexDebug\.js$)/);
  for (const file of result.omitted) assert.ok(fs.existsSync(path.join(root, file.path)));
});

test('建立靜態包保留素材位元組，拒絕覆寫既有輸出並不刪除檔案', t => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'frontier-package-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  for (const file of ['index.html','td.html','td-mobile.html','update.html','sw.js','.nojekyll','assets/runtime.png','assets/td/concepts/draft.png']) {
    fs.mkdirSync(path.dirname(path.join(fixture, file)), { recursive: true }); fs.writeFileSync(path.join(fixture, file), Buffer.from([0, 1, 255, 10]));
  }
  const result = build(fixture);
  assert.deepEqual(fs.readFileSync(path.join(result.destination, 'assets/runtime.png')), Buffer.from([0, 1, 255, 10]));
  assert.equal(fs.existsSync(path.join(result.destination, 'assets/td/concepts/draft.png')), false);
  assert.ok(fs.existsSync(path.join(fixture, 'assets/td/concepts/draft.png')));
  assert.throws(() => build(fixture), /_site 已存在/);
  assert.ok(fs.existsSync(path.join(result.destination, 'td.html')));
});
