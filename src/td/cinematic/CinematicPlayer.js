(function (ns) {
  'use strict';
  const api = ns.cinematic;
  const element = (tag, className, text) => {
    const node = document.createElement(tag); node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  class CinematicPlayer {
    constructor(catalog = api.prologueCatalog) { this.catalog = catalog; this.active = null; }
    play(id, options = {}) {
      if (this.active) return Promise.resolve({ cinematicId: id, watched: false, reason: 'busy' });
      const entry = this.catalog.get(id);
      if (!entry) return Promise.resolve({ cinematicId: id, watched: false, reason: 'unknown' });
      return new Promise(resolve => {
        const previousFocus = document.activeElement;
        const dialog = element('dialog', 'hf-cinematic');
        dialog.setAttribute('aria-label', entry.title);
        const head = element('header', 'hf-cinematic-head');
        head.append(element('span', '', options.replay ? 'CINEMATIC COLLECTION · 回顧' : entry.productionTitle), element('h2', '', entry.title));
        const stage = element('div', 'hf-cinematic-stage');
        const video = element('video', 'hf-cinematic-video'); video.playsInline = true; video.preload = 'auto';
        const frame = element('div', 'hf-cinematic-frame'); frame.hidden = true;
        const image = element('img', 'hf-cinematic-image'); image.alt = ''; image.hidden = true;
        const placeholder = element('div', 'hf-cinematic-placeholder');
        const shotLabel = element('small', ''), shotTitle = element('h3', ''), description = element('p', '');
        placeholder.append(shotLabel, shotTitle, description); frame.append(image, placeholder);
        const captions = element('p', 'hf-cinematic-captions');
        stage.append(video, frame, captions);
        const status = element('p', 'hf-cinematic-status', '正在載入影像；也可以隨時跳過。'); status.setAttribute('role', 'status');
        const controls = element('footer', 'hf-cinematic-controls');
        const pause = element('button', '', '暫停'), skip = element('button', 'hf-cinematic-skip', options.replay ? '結束回顧' : '跳過，進入第一章');
        const fallbackButton = element('button', '', '使用分鏡預覽');
        const language = element('select', ''); language.setAttribute('aria-label', '字幕語言');
        for (const track of entry.subtitleTracks) {
          const option = element('option', '', track.label); option.value = track.language;
          option.disabled = track.status === 'pending-translation'; language.append(option);
          if (!option.disabled) {
            const node = element('track', ''); node.kind = 'subtitles'; node.srclang = track.language;
            node.label = track.label; node.src = track.src; node.default = track.language === 'zh-TW';
            video.append(node);
          }
        }
        const off = element('option', '', '關閉字幕'); off.value = 'off'; language.append(off); language.value = 'zh-TW';
        const progress = element('span', 'hf-cinematic-time', '0 / ' + entry.duration + ' 秒');
        controls.append(pause, language, fallbackButton, progress, skip); dialog.append(head, stage, status, controls);
        let done = false, mode = 'loading', paused = false, elapsed = 0, shotIndex = -1;
        let last = performance.now(), lastVideoTime = 0, lastAdvance = last, raf, resumeAfterVisibility = false;
        const timers = new Set();
        const later = (fn, delay) => { const timer = setTimeout(fn, delay); timers.add(timer); return timer; };
        const setPaused = value => {
          paused = value; pause.textContent = value ? '繼續播放' : '暫停'; last = performance.now(); lastAdvance = last;
          if (mode === 'video' || mode === 'loading') {
            if (value) video.pause(); else attemptPlay();
          }
        };
        const showShot = () => {
          const index = entry.shots.findIndex(shot => elapsed >= shot.start && elapsed < shot.end);
          if (index < 0 || index === shotIndex) return;
          shotIndex = index; const shot = entry.shots[index];
          shotLabel.textContent = '分鏡預覽 · SHOT ' + String(index + 1).padStart(2, '0') + ' / ' + entry.shots.length;
          shotTitle.textContent = shot.title; description.textContent = shot.description;
          placeholder.hidden = false; image.hidden = true;
          image.onload = () => { if (!done) { image.hidden = false; placeholder.hidden = true; } };
          image.onerror = () => { image.hidden = true; placeholder.hidden = false; };
          image.src = shot.imageAsset;
        };
        const fallback = () => {
          if (done || mode === 'storyboard') return;
          elapsed = Math.min(Number.isFinite(video.currentTime) ? video.currentTime : 0, entry.duration - .01);
          mode = 'storyboard'; video.pause(); video.hidden = true; video.removeAttribute('src'); video.load();
          frame.hidden = false; fallbackButton.hidden = true; last = performance.now();
          status.textContent = '分鏡預覽：缺少圖片時顯示文字，播放完成或跳過都會收錄。'; showShot();
        };
        const finish = reason => {
          if (done) return;
          done = true; timers.forEach(clearTimeout); cancelAnimationFrame(raf);
          document.removeEventListener('visibilitychange', visibility);
          video.pause(); video.removeAttribute('src'); video.load();
          image.onload = image.onerror = null; dialog.close(); dialog.remove(); this.active = null;
          previousFocus?.focus?.();
          resolve({ cinematicId: id, watched: ['ended', 'skipped'].includes(reason), reason, playback: mode, replay: Boolean(options.replay) });
        };
        const attemptPlay = () => {
          if (done || mode === 'storyboard') return;
          let promise;
          try { promise = video.play(); } catch (_) { fallback(); return; }
          promise?.catch(error => {
            if (done || mode === 'storyboard') return;
            if (error.name === 'NotAllowedError') {
              paused = true; pause.textContent = '點此播放';
              status.textContent = '瀏覽器需要你點一下才能播放，也可以選擇分鏡預覽或跳過。';
            } else if (error.name !== 'AbortError') fallback();
          });
        };
        const visibility = () => {
          if (document.hidden) { resumeAfterVisibility = !paused; setPaused(true); }
          else if (resumeAfterVisibility) { resumeAfterVisibility = false; setPaused(false); }
        };
        const tick = now => {
          if (done) return;
          const dt = Math.max(0, (now - last) / 1000); last = now;
          if (mode === 'storyboard' && !paused && !document.hidden) elapsed += dt;
          if (mode === 'loading' && !paused && !document.hidden && now - lastAdvance > 5000) fallback();
          if (mode === 'video') {
            elapsed = video.currentTime || 0;
            if (elapsed !== lastVideoTime || paused || document.hidden) { lastVideoTime = elapsed; lastAdvance = now; }
            else if (now - lastAdvance > 8000) fallback();
          }
          if (mode === 'storyboard') {
            if (elapsed >= entry.duration) { finish('ended'); return; }
            showShot();
          }
          // VTT is preferred for video. The inline concept cues are a file:// / missing-track fallback.
          for (const track of Array.from(video.textTracks || [])) track.mode = track.language === language.value ? 'showing' : 'disabled';
          const nativeCaptions = mode === 'video' && Array.from(video.textTracks || []).some(track => track.language === language.value && track.cues?.length);
          captions.textContent = nativeCaptions ? '' : (entry.subtitles?.cues || []).filter(cue => cue.language === language.value && elapsed >= cue.start && elapsed < cue.end).map(cue => cue.text).join('\n');
          progress.textContent = Math.floor(elapsed) + ' / ' + entry.duration + ' 秒';
          raf = requestAnimationFrame(tick);
        };
        pause.onclick = () => setPaused(!paused); skip.onclick = () => finish('skipped');
        fallbackButton.onclick = () => { fallback(); setPaused(false); };
        dialog.addEventListener('cancel', event => { event.preventDefault(); finish('skipped'); });
        video.addEventListener('error', fallback);
        video.addEventListener('playing', () => {
          if (done || mode === 'storyboard') return;
          mode = 'video'; paused = false; pause.textContent = '暫停'; lastAdvance = performance.now();
          status.textContent = '觀看或跳過後，可於世界圖鑑 → 編年史重播。';
        });
        video.addEventListener('ended', () => { if (mode === 'video') finish('ended'); });
        document.addEventListener('visibilitychange', visibility);
        document.body.append(dialog); dialog.showModal(); skip.focus(); this.active = { finish, fallback };
        video.src = entry.videoAsset; attemptPlay();
        later(() => { if (mode === 'loading' && !paused) fallback(); }, 5000);
        raf = requestAnimationFrame(tick);
      });
    }
  }
  api.CinematicPlayer = CinematicPlayer;
})(globalThis.TowerFrontier);
