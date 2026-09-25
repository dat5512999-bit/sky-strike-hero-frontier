(async function () {
  'use strict';
  const lab = globalThis.FrontierSkinLab, engine = globalThis.TowerFrontier;
  const status = document.querySelector('#lab-status'), afterCaption = document.querySelector('#after-caption');
  let model = new lab.PreviewModel(engine);
  const canvases = ['before-stage', 'after-stage'].map(id => document.getElementById(id));
  let renderers, bounds, zoom = 2.5, previous = 0, animation, selection = 0, chosenHero = null;
  const comparison = document.querySelector('#lab-comparison'), skinPicker = document.querySelector('#lab-skin-picker'), skinSelector = document.querySelector('#lab-skins');
  const imageCache = new Map();
  function load(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const image = new Image(); image.assetSrc = src;
      image.onload = () => { image.ready = true; resolve(image); };
      image.onerror = () => { imageCache.delete(src); reject(new Error('無法載入試裝素材')); }; image.src = src;
    });
    imageCache.set(src, promise); return promise;
  }
  function paint(canvas, renderer, hero) {
    const width = canvas.clientWidth, height = canvas.clientHeight, ratio = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
    const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const ground = ctx.createLinearGradient(0, 0, 0, height); ground.addColorStop(0, '#0d1b23'); ground.addColorStop(.5, '#243638'); ground.addColorStop(1, '#0e1b20'); ctx.fillStyle = ground; ctx.fillRect(0, 0, width, height);
    const camera = lab.fitCamera(width, height, zoom, bounds);
    ctx.strokeStyle = '#6a86822a'; ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(width / 2 + i * 22, 40); ctx.lineTo(width / 2 + i * 120, height); ctx.stroke(); }
    for (let y = 55; y < height; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    ctx.save(); ctx.translate(camera.x, camera.foot); ctx.scale(camera.scale, camera.scale);
    ctx.fillStyle = '#0007'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c6b377'; ctx.beginPath(); ctx.ellipse(0, 0, 28, 9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.translate(0, -12); renderer.drawHero(ctx, hero); ctx.restore();
    canvas.dataset.frame = String(hero.frame); canvas.dataset.motion = hero.state;
  }
  function draw(now) {
    if (previous && !document.hidden && document.body.dataset.ready !== 'loading') model.advance((now - previous) / 1000);
    previous = now;
    if (renderers) { const hero = model.snapshot(); canvases.forEach((canvas, index) => paint(canvas, renderers[index], hero)); }
    animation = requestAnimationFrame(draw);
  }
  document.querySelectorAll('button[data-motion]').forEach(button => button.addEventListener('click', () => {
    model.setMotion(button.dataset.motion);
    document.querySelectorAll('button[data-motion]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  }));
  document.querySelector('#lab-pause').addEventListener('click', event => { model.paused = !model.paused; event.currentTarget.textContent = model.paused ? '播放' : '暫停'; event.currentTarget.setAttribute('aria-pressed', String(model.paused)); });
  document.querySelector('#lab-facing').addEventListener('click', () => { model.facing = model.facing ? 0 : Math.PI; model.hero.facing = model.facing; });
  document.querySelector('#lab-zoom').addEventListener('change', event => { zoom = Number(event.target.value); });
  addEventListener('pagehide', () => cancelAnimationFrame(animation));
  addEventListener('pageshow', event => { if (event.persisted && renderers) { previous = 0; animation = requestAnimationFrame(draw); } });
  const selector = document.querySelector('#lab-heroes');
  [...new Set(lab.definitions.map(look => look.heroId))].forEach(heroId => {
    const roster = lab.rosterFor(engine, heroId);
    const button = document.createElement('button'); button.className = 'lab-hero'; button.dataset.hero = heroId;
    button.style.setProperty('--look-accent', roster.color); button.setAttribute('aria-pressed', 'false');
    const image = document.createElement('img'); image.src = roster.selectionArt; image.alt = '';
    const copy = document.createElement('span'), title = document.createElement('strong'), subtitle = document.createElement('small');
    title.textContent = roster.name; subtitle.textContent = roster.faction;
    copy.append(title, subtitle); button.append(image, copy); button.addEventListener('click', () => selectHero(heroId)); selector.append(button);
  });
  function selectHero(heroId) {
    chosenHero = heroId; ++selection; renderers = null; cancelAnimationFrame(animation); animation = null; previous = 0;
    comparison.hidden = true; skinPicker.hidden = false; skinSelector.replaceChildren();
    document.body.dataset.hero = heroId; delete document.body.dataset.skin; document.body.dataset.ready = 'pick-skin';
    document.querySelector('.lab-stage-section').setAttribute('aria-busy', 'false');
    const roster = lab.rosterFor(engine, heroId);
    document.title = roster.name + ' · 選擇試裝造型';
    document.querySelector('#look-subtitle').textContent = '已選擇 ' + roster.name + '，請選擇他的造型。';
    document.querySelector('#skins-heading').textContent = '02 選擇 ' + roster.name + ' 的造型';
    status.textContent = '僅顯示這位英雄可試看的造型。選好後才會開始比較。';
    selector.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.hero === heroId)));
    lab.looksFor(heroId).forEach(look => {
      const button = document.createElement('button'); button.className = 'lab-skin'; button.dataset.skin = look.skinId; button.setAttribute('aria-pressed', 'false');
      button.style.setProperty('--look-accent', look.accent);
      const image = document.createElement('img'); image.src = look.portrait; image.alt = '';
      const copy = document.createElement('span'), title = document.createElement('strong'), detail = document.createElement('small');
      title.textContent = look.name; detail.textContent = look.portraitOnly ? '已保留初稿 · 立繪預覽' : look.theme + ' · 立繪與動作';
      copy.append(title, detail); button.append(image, copy); button.addEventListener('click', () => selectLook(look)); skinSelector.append(button);
    });
  }
  async function selectLook(look) {
    if (look.heroId !== chosenHero || lab.getLook(chosenHero, look.skinId) !== look) return;
    const ticket = ++selection;
    cancelAnimationFrame(animation); animation = null; renderers = null; comparison.hidden = true;
    document.body.dataset.ready = 'loading'; document.querySelector('.lab-stage-section').setAttribute('aria-busy', 'true');
    document.body.dataset.skin = look.skinId;
    status.textContent = '正在準備「' + look.name + '」的試裝素材…';
    document.querySelectorAll('.lab-toolbar button,.lab-toolbar select').forEach(button => { button.disabled = true; });
    skinSelector.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.skin === look.skinId)));
    try {
      const skin = lab.cosmetic(look, globalThis.FrontierShop), roster = lab.rosterFor(engine, look.heroId);
      const actionPath = look.attack || look.cast || lab.actionLayouts[look.heroId]?.src || look.sprite;
      const [base, variant, action, cast, portrait, basePortrait] = await Promise.allSettled([
        ...(look.portraitOnly ? [Promise.resolve(null), Promise.resolve(null), Promise.resolve(null), Promise.resolve(null)] :
          [load(look.baseSprite), load(skin.slots.battlefieldSprite.src), load(actionPath), look.attack && look.cast ? load(look.cast) : Promise.resolve(null)]),
        load(look.portrait), load(roster.selectionArt)
      ]);
      if (ticket !== selection) return;
      if (base.status !== 'fulfilled') throw base.reason;
      if (basePortrait.status !== 'fulfilled') throw basePortrait.reason;
      lab.registerLook(engine, look); bounds = lab.lookBounds(engine, look);
      const available = variant.status === 'fulfilled' && action.status === 'fulfilled' && cast.status === 'fulfilled';
      model = new lab.PreviewModel(engine, look.heroId);
      model.paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!look.portraitOnly) renderers = [lab.createRenderer(engine, base.value), lab.createLookRenderer(engine, look, available ? variant.value : base.value, available ? action.value : null, available ? cast.value : null)];
      document.body.dataset.hero = look.heroId;
      document.title = look.name + ' · 英雄造型試裝';
      document.querySelector('#look-subtitle').textContent = roster.name + ' ／ ' + look.name + ' · 換裝前後同步比較';
      for (const [side, src, name, description, tag] of [
        ['before', roster.selectionArt, roster.name, look.originalDescription, '原版英雄 · ' + roster.faction],
        ['after', portrait.status === 'fulfilled' ? look.portrait : roster.selectionArt, look.name, portrait.status === 'fulfilled' ? look.description : '立繪載入失敗 · 暫顯原版', look.theme + ' · 造型試作']
      ]) {
        const section = document.querySelector('.lab-' + side), image = section.querySelector('img');
        image.src = src; image.alt = (side === 'before' ? '換裝前：' : '換裝後：') + name;
        section.querySelector('h2').textContent = name; section.querySelector('p').textContent = description; section.querySelector('small').textContent = tag;
      }
      document.querySelector('#after-name').textContent = look.name;
      afterCaption.textContent = available ? (look.portraitOnly ? '僅供立繪比較' : '可於商城取得並套用的動作素材') : '素材載入失敗 · 暫顯原版';
      status.textContent = look.portraitOnly ? '雷霆戰王初稿已保留。此處先查看立繪；動作圖尚待裁切校準，未開放動作模擬。' :
        available ? (look.heroId === 'chief' ? '' + look.name + '：待機、移動、揮斧與戰吼；兩邊共用角色數值，光效不增加傷害。' : look.heroId === 'arcanist' ? '待機、移動、攻擊、施法同步播放。' : '待機、移動、攻擊同步比較；技能動作沿用攻擊動作。') + '可切換戰場原尺寸。' : '動作素材載入失敗，目前兩邊都顯示原版。可重新選取此造型再試。';
      if (portrait.status !== 'fulfilled') status.textContent += ' 新立繪載入失敗，暫顯原版。';
      const stats = model.stats();
      document.querySelector('#lab-stats').innerHTML = `<span>兩種外觀共用</span><span>攻擊<strong>${stats.damage}</strong></span><span>生命<strong>${stats.maxHealth}</strong></span><span>射程<strong>${stats.range}</strong></span><span>攻擊間隔<strong>${stats.interval}s</strong></span><span>造型能力加成<strong>0</strong></span>`;
      document.querySelectorAll('button[data-motion]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.motion === 'idle')));
      const pause = document.querySelector('#lab-pause'); pause.textContent = model.paused ? '播放' : '暫停'; pause.setAttribute('aria-pressed', String(model.paused));
      document.querySelectorAll('.lab-toolbar button,.lab-toolbar select').forEach(button => { button.disabled = false; });
      document.body.dataset.ready = available ? 'true' : 'fallback'; previous = 0;
      document.querySelector('.lab-stage-section').hidden = Boolean(look.portraitOnly); comparison.hidden = false;
      if (renderers && !animation) animation = requestAnimationFrame(draw);
    } catch (error) {
      if (ticket !== selection) return;
      status.textContent = '試裝素材無法載入。請重新選取此造型，或改選其他英雄。'; document.body.dataset.ready = 'error';
    } finally {
      if (ticket === selection) document.querySelector('.lab-stage-section').setAttribute('aria-busy', 'false');
    }
  }
  document.body.dataset.ready = 'pick-hero';
  const query = new URLSearchParams(location.search), heroId = query.get('hero'), skinId = query.get('skin');
  if (heroId && lab.looksFor(heroId).length) {
    selectHero(heroId);
    if (skinId) {
      const look = lab.getLook(heroId, skinId);
      if (look) await selectLook(look);
      else status.textContent = '這個造型不屬於所選英雄或尚未提供，請從下方造型名單重新選擇。';
    }
  } else if (heroId || skinId) status.textContent = '找不到對應的英雄與造型，請先選擇英雄。';
})();
