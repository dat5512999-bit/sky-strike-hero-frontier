(function (ns) {
  'use strict';
  class Game {
    constructor(canvas, ui) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.ui = ui;
      this.state = new ns.systems.GameState();
      this.weapon = new ns.systems.Weapon();
      this.spawner = new ns.systems.Spawner();
      this.effects = new ns.systems.Effects();
      ns.skins.restore();
      this.player = null;
      this.bullets = [];
      this.enemies = [];
      this.stars = this.createStars();
      this.lastTime = 0;
      this.boundLoop = this.loop.bind(this);
      this.attachInput();
      this.buildSkinPicker();
      this.applySkin();
      this.resetWorld();
      requestAnimationFrame(this.boundLoop);
    }

    createStars() {
      const stars = [];
      for (let i = 0; i < 70; i += 1) {
        stars.push({ x: Math.random() * ns.config.width, y: Math.random() * ns.config.height, size: 0.5 + Math.random() * 1.7, speed: 18 + Math.random() * 55 });
      }
      return stars;
    }

    attachInput() {
      const self = this;
      this.input = new ns.systems.InputController(this.canvas, {
        canControl: function () { return self.state.status === 'playing'; },
        getPlayer: function () { return self.player; }
      });
      this.ui.button.onclick = function () { self.start(); };
      globalThis.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && (self.state.status === 'ready' || self.state.status === 'gameover')) self.start();
        if (event.key === 'Escape') self.togglePause();
      });
      globalThis.addEventListener('blur', function () { if (self.state.status === 'playing') self.togglePause(); });
    }

    buildSkinPicker() {
      const self = this;
      this.ui.skinOptions.textContent = '';
      ns.skins.all().forEach(function (pack) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'skin-option';
        button.dataset.skin = pack.id;
        button.setAttribute('aria-pressed', String(pack.id === ns.skins.selectedId));
        button.setAttribute('aria-label', '選擇' + pack.name + '外觀包');
        button.innerHTML = '<span class="skin-icon" aria-hidden="true">' + pack.icon + '</span>' + pack.name;
        button.onclick = function () {
          ns.skins.select(pack.id);
          self.applySkin();
        };
        self.ui.skinOptions.appendChild(button);
      });
    }

    applySkin() {
      const pack = ns.skins.current();
      document.documentElement.style.setProperty('--accent', pack.accent);
      document.documentElement.style.setProperty('--accent-secondary', pack.secondary);
      Array.from(this.ui.skinOptions.children).forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.skin === pack.id));
      });
    }

    resetWorld() {
      this.player = new ns.entities.Player(ns.config.width / 2, ns.config.height * 0.78);
      this.bullets.length = 0;
      this.enemies.length = 0;
      this.weapon.reset();
      this.spawner.reset();
      this.effects.clear();
      this.updateHud();
    }

    start() {
      this.state.reset();
      this.resetWorld();
      this.state.start();
      this.ui.overlay.classList.add('hidden');
      this.canvas.focus();
    }

    togglePause() {
      if (this.state.status === 'playing') {
        this.state.pause();
        const touch = globalThis.matchMedia && globalThis.matchMedia('(pointer: coarse)').matches;
        this.showOverlay('任務暫停', touch ? '按下方按鈕繼續任務' : '移動滑鼠後按 Esc 繼續', '繼續任務', true);
      } else if (this.state.status === 'paused') {
        this.state.resume();
        this.ui.overlay.classList.add('hidden');
      }
    }

    showOverlay(title, message, buttonText, resume) {
      const self = this;
      this.ui.title.textContent = title;
      this.ui.message.innerHTML = message;
      this.ui.button.textContent = buttonText;
      this.ui.skinPicker.hidden = Boolean(resume);
      this.ui.overlay.classList.remove('hidden');
      this.ui.button.onclick = resume ? function () { self.togglePause(); } : function () { self.start(); };
    }

    update(dt) {
      this.state.update(dt);
      this.player.update(dt);
      this.weapon.update(dt, this.player, this.bullets);
      this.spawner.update(dt, this.enemies);
      this.bullets.forEach(function (bullet) { bullet.update(dt); });
      this.enemies.forEach(function (enemy) { enemy.update(dt); });
      this.effects.update(dt);

      const self = this;
      ns.systems.Collision.resolvePlayerBullets(this.bullets, this.enemies, function (enemy) {
        self.state.addScore(enemy.scoreValue);
        self.effects.burst(enemy.x, enemy.y, ns.skins.current().effect);
      });
      ns.systems.Collision.resolvePlayerEnemies(this.player, this.enemies, function (enemy) {
        self.effects.burst(enemy.x, enemy.y, ns.skins.current().secondary);
        self.updateHud();
      });

      this.bullets = this.bullets.filter(function (bullet) { return bullet.active; });
      this.enemies = this.enemies.filter(function (enemy) { return enemy.active; });
      this.updateHud();
      if (!this.player.active) {
        this.state.end();
        this.showOverlay('任務失敗', '最終分數：' + String(this.state.score).padStart(6, '0') + '<br>重新整備後再次出擊', '重新開始', false);
      }
    }

    updateStars(dt) {
      this.stars.forEach(function (star) {
        star.y += star.speed * dt;
        if (star.y > ns.config.height) { star.y = -4; star.x = Math.random() * ns.config.width; }
      });
    }

    drawBackground() {
      const ctx = this.ctx;
      const skin = ns.skins.current();
      const gradient = ctx.createLinearGradient(0, 0, 0, ns.config.height);
      gradient.addColorStop(0, skin.background[0]);
      gradient.addColorStop(1, skin.background[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, ns.config.width, ns.config.height);
      ctx.fillStyle = skin.star;
      this.stars.forEach(function (star) { ctx.globalAlpha = 0.2 + star.size / 3; ctx.fillRect(star.x, star.y, star.size, star.size * 2.3); });
      ctx.globalAlpha = 1;
    }

    draw() {
      this.drawBackground();
      this.bullets.forEach(function (bullet) { bullet.draw(this.ctx); }, this);
      this.enemies.forEach(function (enemy) { enemy.draw(this.ctx); }, this);
      if (this.player.active) this.player.draw(this.ctx);
      this.effects.draw(this.ctx);
    }

    updateHud() {
      this.ui.score.textContent = String(this.state.score).padStart(6, '0');
      this.ui.health.textContent = Array.from({ length: this.player ? this.player.maxHealth : 3 }, function (_, i) { return i < (this.player ? this.player.health : 3) ? '●' : '○'; }, this).join(' ');
    }

    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000 || 0, 0.033);
      this.lastTime = timestamp;
      if (this.state.status === 'playing') {
        this.updateStars(dt);
        this.update(dt);
      }
      this.draw();
      requestAnimationFrame(this.boundLoop);
    }
  }
  ns.Game = Game;
})(globalThis.SkyStrike);
