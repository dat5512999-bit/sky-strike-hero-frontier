'use strict';
// Publish only the established web roots; retain authoring references locally.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDED = ['assets/td/concepts/', 'assets/td/reference/', 'codex-dev.html', 'src/td/codex/CodexDebug.js'];

function excluded(relative) {
  return EXCLUDED.some(rule => rule.endsWith('/') ? relative.startsWith(rule) : relative === rule);
}

function plan(root = ROOT) {
  root = fs.realpathSync(root);
  const files = [], omitted = [];
  function walk(relative) {
    const absolute = path.join(root, relative), stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw Error('發布來源不可使用連結：' + relative);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(absolute).sort()) walk(relative + '/' + name);
    } else if (stat.isFile()) {
      (excluded(relative) ? omitted : files).push({ path: relative, bytes: stat.size });
    }
  }
  for (const name of fs.readdirSync(root).sort()) {
    if (['assets', 'src'].includes(name) || /\.(html|css|webmanifest)$/.test(name) || ['sw.js', '.nojekyll'].includes(name)) walk(name);
  }
  for (const entry of ['index.html', 'td.html', 'td-mobile.html', 'update.html', 'sw.js', '.nojekyll']) {
    if (!files.some(file => file.path === entry)) throw Error('缺少發布入口：' + entry);
  }
  return { root, files, omitted, bytes: files.reduce((total, file) => total + file.bytes, 0) };
}

function build(root = ROOT) {
  const result = plan(root), destination = path.join(result.root, '_site');
  // Never erase or merge a previous output: that could leave stale authoring files public.
  if (fs.existsSync(destination)) throw Error('_site 已存在；請先將舊輸出移到備份位置，再重新建立。');
  fs.mkdirSync(destination);
  for (const file of result.files) {
    const target = path.join(destination, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(result.root, file.path), target, fs.constants.COPYFILE_EXCL);
  }
  return { ...result, destination };
}

module.exports = { plan, build, EXCLUDED };
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 1 || args[0] !== '--check')) throw Error('用法：node scripts/build-static-site.cjs [--check]');
    const result = args.length ? plan() : build();
    console.log(JSON.stringify({ mode: args.length ? 'check' : 'build', files: result.files.length, bytes: result.bytes, omittedFiles: result.omitted.length, omittedBytes: result.omitted.reduce((n, f) => n + f.bytes, 0), destination: result.destination || null }, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
