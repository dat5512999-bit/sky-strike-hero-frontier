(function (ns) {
  'use strict';
  // Presentation assets and code-native icons. No game-state or progression dependencies.
  const paths = {
    all: 'M3 4h3l3 12h10l3-9H7 M10 21h1 M18 21h1 M12 8l1 2 3 .3-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 3-.3Z',
    hero: 'M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M8 11l-4 3-2 7 6 1 1-5 M16 11l4 3 2 7-6 1-1-5 M8 12l4 3 4-3 M12 15v7',
    faction: 'M4 2v20 M20 2v20 M5 4h14v13l-7 4-7-4Z M12 6v10 M9 10h6',
    effect: 'M12 1l2.7 7.3L22 11l-7.3 2.7L12 21l-2.7-7.3L2 11l7.3-2.7Z M20 2v4 M18 4h4 M3 17v5 M.5 19.5h5',
    other: 'M4 6l4-4 4 4 4-4 4 4v15H4Z M4 10h16 M12 6v15 M8 6C1 6 4-2 8 6 M16 6c7 0 4-8 0 0',
    collaboration: 'M12 3l9 5v9l-9 5-9-5V8Z M3 8l9 5 9-5 M12 13v9 M8 5l9 5',
    book: 'M12 5v17 M12 5C9 2 5 2 2 4v16c4-2 7-2 10 1 3-3 6-3 10-1V4c-3-2-7-2-10 1',
    arrow: 'M4 12h16 M14 6l6 6-6 6',
    close: 'M5 5l14 14 M5 19 19 5'
  };
  ns.icon = name => `<svg class="hf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[name] || paths.other}"/></svg>`;
  ns.crystal = '<svg class="hf-crystal" viewBox="0 0 30 42" aria-hidden="true"><path fill="#0479ff" d="M15 0 28 12 25 29 15 42 3 28 1 12Z"/><path fill="#82f3ff" d="M15 0 10 14 1 12Z"/><path fill="#c6fdff" d="M15 0 23 13 10 14Z"/><path fill="#21baff" d="m23 13 5-1-3 17-10 13Z"/><path fill="#0061e4" d="m10 14 13-1-8 29Z"/><path fill="#52dfff" d="M1 12 10 14 15 42 3 28Z"/><path fill="#e7ffff" d="m10 14 5 6 8-7-7 3Z"/></svg>';
})(globalThis.FrontierShop);
