'use strict';
// Offline authoring export. Runtime reads PrologueData.js, never fetches JSON.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const root = path.resolve(__dirname, '..'), context = vm.createContext({ URL });
for (const file of ['src/td/namespace.js', 'src/td/cinematic/CinematicCatalog.js', 'src/td/cinematic/PrologueData.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
fs.writeFileSync(path.join(root, 'assets/cinematics/prologue/manifest.json'), JSON.stringify(context.TowerFrontier.cinematic.prologue, null, 2) + '\n');
console.log('Exported assets/cinematics/prologue/manifest.json');
