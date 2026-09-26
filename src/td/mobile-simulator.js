(function () {
  'use strict';
  const MODES = {
    portrait: {
      viewport: { width: 430, height: 932 },
      entry: 'td-mobile.html',
      label: '430 × 932 · 直向開啟',
      deviceLabel: 'iPhone 15 Pro Max 直向機身',
      note: '直向開啟會使用與手機相同的 td-mobile.html 入口，包含遊戲橫轉流程；「橫向戰場」則直接檢查戰鬥畫面。兩者都共用同一個遊戲與存檔。Safari 網址列、真實多指手勢與硬體效能仍應以真機驗收。'
    },
    landscape: {
      viewport: { width: 932, height: 430 },
      entry: 'td.html',
      label: '932 × 430 · 橫向戰場',
      deviceLabel: 'iPhone 15 Pro Max 橫向機身',
      note: '橫向戰場會直接載入 td.html，適合檢查戰鬥 HUD、彈窗與安全區。若要比對使用者從直向瀏覽器開啟的流程，請切回「直向開啟」。'
    }
  };
  const DEVICE_EDGE = 20;
  const stage = document.getElementById('simulator-stage');
  const device = document.getElementById('simulator-device');
  const frame = document.getElementById('simulator-game');
  const reload = document.getElementById('simulator-reload');
  const fullscreen = document.getElementById('simulator-fullscreen');
  const viewportLabel = document.getElementById('simulator-viewport-label');
  const note = document.getElementById('simulator-note');
  const modeButtons = Array.from(document.querySelectorAll('[data-simulator-mode]'));
  let mode = 'portrait';
  if (!stage || !device || !frame) return;

  function currentMode() { return MODES[mode]; }
  function gameUrl() {
    const target = new URL(currentMode().entry, location.href);
    target.searchParams.set('preview', 'iphone15promax');
    return target.href;
  }
  function fit() {
    const bounds = stage.getBoundingClientRect();
    const viewport = currentMode().viewport;
    const deviceWidth = viewport.width + DEVICE_EDGE;
    const deviceHeight = viewport.height + DEVICE_EDGE;
    const scale = Math.min(1, (bounds.width - 28) / deviceWidth, (bounds.height - 28) / deviceHeight);
    device.style.transform = 'scale(' + Math.max(0.05, scale) + ')';
    stage.style.minHeight = Math.ceil(deviceHeight * scale + 28) + 'px';
  }
  function loadGame() { frame.src = gameUrl(); }
  function setMode(nextMode) {
    if (!MODES[nextMode]) return;
    mode = nextMode;
    const selected = currentMode();
    device.dataset.orientation = mode;
    device.setAttribute('aria-label', selected.deviceLabel);
    viewportLabel.textContent = selected.label;
    note.textContent = selected.note;
    modeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.simulatorMode === mode));
    });
    loadGame();
    fit();
  }

  loadGame();
  fit();
  new ResizeObserver(fit).observe(stage);
  reload && reload.addEventListener('click', loadGame);
  modeButtons.forEach(function (button) {
    button.addEventListener('click', function () { setMode(button.dataset.simulatorMode); });
  });
  fullscreen && fullscreen.addEventListener('click', function () {
    if (!document.fullscreenElement) stage.requestFullscreen && stage.requestFullscreen();
    else document.exitFullscreen && document.exitFullscreen();
  });
})();
