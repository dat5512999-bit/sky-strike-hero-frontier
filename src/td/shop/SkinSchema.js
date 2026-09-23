(function (root) {
  'use strict';
  const slots = Object.freeze({
    hero: Object.freeze(['portrait', 'selectionArt', 'battlefieldSprite', 'skillVfx', 'summonAppearance', 'animation', 'voice']),
    faction: Object.freeze(['soldierAppearance', 'towerAppearance', 'banner', 'buildVfx', 'attackVfx']),
    effect: Object.freeze(['skillVfx']), other: Object.freeze(['portrait', 'banner']), collaboration: Object.freeze(['selectionArt'])
  });
  const fail = () => { throw new Error('外觀資料格式錯誤；請檢查 Skin Catalog。'); };
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  const exact = (value, keys) => record(value) && Object.keys(value).every(key => keys.includes(key));
  const word = value => typeof value === 'string' && value.length > 0 && value.length <= 500;
  const id = value => typeof value === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(value);
  function asset(value) {
    if (value === null) return true; // Explicit fallback to the original appearance.
    if (!exact(value, ['type', 'src', 'columns', 'rows', 'frames']) || !['image', 'sprite', 'vfx', 'animation', 'voice'].includes(value.type)) return false;
    if (typeof value.src !== 'string' || !/^assets\/[a-zA-Z0-9/_-]+\.(png|webp|jpg|ogg|mp3)$/.test(value.src)) return false;
    const audio = /\.(ogg|mp3)$/.test(value.src);
    if ((value.type === 'voice') !== audio) return false;
    if (['sprite', 'animation'].includes(value.type)) return Number.isInteger(value.columns) && value.columns > 0 && value.columns <= 32 && Number.isInteger(value.rows) && value.rows > 0 && value.rows <= 32 && Number.isInteger(value.frames) && value.frames > 0 && value.frames <= value.columns;
    return !['columns', 'rows', 'frames'].some(key => key in value);
  }
  function validate(skin) {
    if (!exact(skin, ['schemaVersion', 'id', 'name', 'subtitle', 'description', 'category', 'targetId', 'rarity', 'cosmeticOnly', 'price', 'availability', 'cover', 'slots'])) fail();
    if (skin.schemaVersion !== 1 || skin.cosmeticOnly !== true || !id(skin.id) || !id(skin.targetId) || !Object.hasOwn(slots, skin.category)) fail();
    if (![skin.name, skin.subtitle, skin.description].every(word) || !['rare', 'epic', 'legendary'].includes(skin.rarity)) fail();
    if (!exact(skin.price, ['currency', 'amount']) || skin.price.currency !== 'mock-crystal' || !Number.isSafeInteger(skin.price.amount) || skin.price.amount < 0) fail();
    if (!exact(skin.availability, ['status', 'reason']) || !['available', 'locked'].includes(skin.availability.status) || typeof skin.availability.reason !== 'string' || (skin.availability.status === 'locked' && !word(skin.availability.reason))) fail();
    if (!asset(skin.cover) || !skin.cover || skin.cover.type !== 'image' || !exact(skin.slots, slots[skin.category]) || Object.keys(skin.slots).length === 0 || !Object.values(skin.slots).every(asset)) fail();
    return skin;
  }
  function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
  function catalog(items) {
    if (!Array.isArray(items) || !items.length) fail();
    const copy = JSON.parse(JSON.stringify(items));
    copy.forEach(validate);
    if (new Set(copy.map(item => item.id)).size !== copy.length) fail();
    return freeze(copy);
  }
  const api = { slots, validate, catalog, freeze };
  root.FrontierShop = Object.assign(root.FrontierShop || {}, { schema: api });
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
