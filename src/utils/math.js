(function (ns) {
  'use strict';
  ns.utils.clamp = function (value, min, max) { return Math.max(min, Math.min(max, value)); };
  ns.utils.moveToward = function (current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) return target;
    return current + Math.sign(target - current) * maxDelta;
  };
})(globalThis.SkyStrike);
