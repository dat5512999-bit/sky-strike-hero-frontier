(function () {
  'use strict';
  function deadline(promise, milliseconds) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('更新逾時')), milliseconds);
    })]).finally(() => clearTimeout(timer));
  }
  function activated(worker) {
    return new Promise((resolve, reject) => {
      if (!worker) return reject(new Error('找不到遊戲更新'));
      const changed = () => {
        if (worker.state !== 'activated' && worker.state !== 'redundant') return;
        worker.removeEventListener('statechange', changed);
        if (worker.state === 'activated') resolve(worker);
        else reject(new Error('遊戲更新未完成'));
      };
      worker.addEventListener('statechange', changed);
      changed();
    });
  }
  async function refresh(serviceWorker, expectedVersion, Channel) {
    const registration = await serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    await registration.update();
    const worker = await activated(registration.installing || registration.waiting || registration.active);
    const channel = new Channel();
    try {
      const version = await deadline(new Promise(resolve => {
        channel.port1.onmessage = event => resolve(event.data);
        worker.postMessage({ type: 'GAME_VERSION' }, [channel.port2]);
      }), 5000);
      if (version !== 'sky-strike-v' + expectedVersion) throw new Error('新版檔案尚未準備完成');
    } finally {
      channel.port1.close();
      channel.port2.close();
    }
    return worker;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { refresh, activated, deadline };
    return;
  }
  const status = document.getElementById('update-status'), retry = document.getElementById('update-retry');
  async function run() {
    retry.hidden = true;
    status.textContent = '正在取得新版遊戲，完成後會自動開啟主大廳…';
    try {
      if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) throw new Error('不支援離線更新');
      const version = document.documentElement.dataset.release;
      await deadline(refresh(navigator.serviceWorker, version, MessageChannel), 60000);
      status.textContent = '更新完成，正在開啟主大廳…';
      const target = new URL('td.html', location.href);
      target.searchParams.set('release', version);
      location.replace(target.href);
    } catch (error) {
      status.textContent = '目前無法完成更新，原有存檔仍保留。請確認網路後重試；若使用聊天軟體內建瀏覽器，請改用 Chrome 或 Safari 開啟此網址。';
      retry.hidden = false;
    }
  }
  retry.addEventListener('click', run);
  run();
})();
