(function (ns) {
  'use strict';
  class CodexBattleBridge {
    static install(game, progression, onSummary = () => {}) {
      if (game.codexBattleBridge) return game.codexBattleBridge;
      const restorers = [];
      const wrap = (object, name, factory) => { const original = object[name]; if (typeof original !== 'function') return; const wrapped = factory(original); object[name] = wrapped; restorers.push(() => { if (object[name] === wrapped) object[name] = original; }); };
      const safe = fn => { try { return fn(); } catch (error) { progression.onError?.(error); return null; } };
      wrap(game.waves, 'update', original => function (dt, monsters) {
        const start = monsters.length, result = original.call(this, dt, monsters);
        // Only actual appended entities count. Preview/start/queued groups never count.
        for (const monster of monsters.slice(start)) safe(() => progression.encounter('enemy', monster.type));
        return result;
      });
      wrap(game.build, 'placeQueued', original => function (...args) {
        const start = this.items.length, result = original.apply(this, args);
        for (const unit of this.items.slice(start)) if (unit.kind === 'unit') safe(() => progression.encounter('unit', unit.type));
        return result;
      });
      wrap(game, 'reset', original => function (...args) { progression.beginBattle(); return original.apply(this, args); });
      wrap(game, 'end', original => function (...args) {
        const result = original.apply(this, args), summary = progression.endBattle();
        if (summary.entries.length) safe(() => onSummary(summary)); return result;
      });
      const binding = { dispose() { restorers.reverse().forEach(restore => restore()); delete game.codexBattleBridge; } };
      game.codexBattleBridge = binding; return binding;
    }
  }
  ns.codex.CodexBattleBridge = CodexBattleBridge;
})(globalThis.TowerFrontier);
