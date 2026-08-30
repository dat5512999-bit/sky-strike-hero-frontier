(function (ns) {
  'use strict';
  class Game {
    constructor(canvas, ui) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.ui = ui;
      ns.difficulty.restore();
      this.difficulty = ns.difficulty;
      this.state = new ns.systems.GameState();
      this.skills = new ns.systems.SkillSystem();
      this.weapon = new ns.systems.Weapon();
      this.spawner = new ns.systems.Spawner();
      this.effects = new ns.systems.Effects();
      this.battlefield = new ns.systems.BattlefieldRenderer();
      this.challenge = new ns.systems.ChallengeSystem();
      this.stage = new ns.systems.StageDirector();
      this.support = new ns.systems.SupportSystem();
      ns.skins.restore();
      this.player = null;
      this.bullets = [];
      this.enemyBullets = [];
      this.enemies = [];
      this.powerUps = [];
      this.previousThreat = 1;
      this.lastTime = 0;
      this.boundLoop = this.loop.bind(this);
      this.attachInput();
      this.buildDifficultyPicker();
      this.buildSkinPicker();
      this.applyDifficulty();
      this.applySkin();
      this.resetWorld();
      requestAnimationFrame(this.boundLoop);
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

    buildDifficultyPicker() {
      const self = this;
      this.ui.difficultyOptions.textContent = '';
      this.difficulty.all().forEach(function (mode) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'difficulty-option';
        button.dataset.difficulty = mode.id;
        button.title = mode.description;
        button.setAttribute('aria-pressed', String(mode.id === self.difficulty.selectedId));
        button.setAttribute('aria-label', mode.name + '模式：' + mode.description);
        button.innerHTML = '<span aria-hidden="true">' + mode.icon + '</span><strong>' + mode.name + '</strong>';
        button.onclick = function () {
          self.difficulty.select(mode.id);
          self.applyDifficulty();
        };
        self.ui.difficultyOptions.appendChild(button);
      });
    }

    applyDifficulty() {
      const mode = this.difficulty.current();
      document.documentElement.dataset.difficulty = mode.id;
      this.ui.difficultyDescription.textContent = mode.description;
      Array.from(this.ui.difficultyOptions.children).forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.difficulty === mode.id));
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
      this.enemyBullets.length = 0;
      this.enemies.length = 0;
      this.powerUps.length = 0;
      this.weapon.reset();
      this.spawner.reset();
      this.skills.reset();
      this.challenge.reset();
      this.stage.reset();
      this.support.reset();
      this.effects.clear();
      this.battlefield.reset();
      this.previousThreat = 1;
      this.updateHud();
    }

    start() {
      this.state.reset();
      this.resetWorld();
      this.state.start();
      const mode = this.difficulty.current();
      this.effects.announce(mode.icon + ' ' + mode.name + '模式 · 維持 Combo', ns.skins.current().accent);
      this.ui.supportStatus.hidden=false;
      this.ui.defenseStatus.hidden=false;
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
        this.ui.supportStatus.hidden=false;
        this.ui.defenseStatus.hidden=false;
        this.ui.overlay.classList.add('hidden');
      }
    }

    showOverlay(title, message, buttonText, resume) {
      const self = this;
      this.ui.title.textContent = title;
      this.ui.message.innerHTML = message;
      this.ui.button.textContent = buttonText;
      this.ui.skinPicker.hidden = Boolean(resume);
      this.ui.difficultyPicker.hidden = Boolean(resume);
      this.ui.supportStatus.hidden=true;
      this.ui.defenseStatus.hidden=true;
      this.ui.overlay.classList.remove('hidden');
      this.ui.button.onclick = resume ? function () { self.togglePause(); } : function () { self.start(); };
    }

    update(dt) {
      const self = this;
      this.state.update(dt);
      this.player.update(dt);
      this.skills.update(dt, this.powerUps);
      this.weapon.update(dt, this.player, this.bullets, this.skills);
      const stageContext={player:this.player,enemies:this.enemies,powerUps:this.powerUps,enemyBullets:this.enemyBullets,effects:this.effects};
      this.stage.update(dt,stageContext);
      const stageModifiers=this.stage.modifiers();
      this.spawner.setModifiers(stageModifiers);
      if(this.stage.shouldSpawn())this.spawner.update(dt, this.enemies);
      this.support.update(dt,this.player,this.enemies,this.bullets);
      const challengeContext = { player:this.player, powerUps:this.powerUps, effects:this.effects };
      if(this.stage.canRunChallenge())this.challenge.update(dt, challengeContext);else if(this.challenge.active)this.challenge.reset();
      const currentThreat = this.spawner.threatLevel();
      if (currentThreat !== this.previousThreat) {
        this.previousThreat = currentThreat;
        this.effects.announce('⚠ 威脅升級 · ' + currentThreat, currentThreat >= 4 ? '#ff496d' : '#ffd34f');
      }
      this.bullets.forEach(function (bullet) { bullet.update(dt); });
      const combatContext = { player:this.player, enemyBullets:this.enemyBullets, threat:this.spawner.threatLevel(), enemySpeed:this.difficulty.current().enemySpeed*stageModifiers.speed, enemyFireRate:stageModifiers.fireRate };
      this.enemies.forEach(function (enemy) { enemy.update(dt, combatContext); });
      this.enemies.forEach(function(enemy){
        if(enemy.phaseChanged){self.effects.announce('⚠ 霸主進入第 '+enemy.phase+' 階段','#ff5f88');enemy.phaseChanged=false;}
        if(enemy.escaped&&!enemy.escapeHandled){enemy.escapeHandled=true;self.stage.onEnemyEscaped(enemy,{effects:self.effects});self.state.breakCombo();}
      });
      this.enemyBullets.forEach(function (bullet) { bullet.update(dt); });
      this.powerUps.forEach(function (powerUp) { powerUp.update(dt); });
      this.effects.update(dt);

      ns.systems.Collision.resolvePlayerBullets(this.bullets, this.enemies, function (enemy) {
        self.onEnemyDestroyed(enemy, true);
      }, function(enemy, bullet) {
        self.effects.hit(bullet.x, bullet.y, ns.skins.current().accent);
      });
      ns.systems.Collision.resolvePlayerEnemies(this.player, this.enemies, function (enemy) {
        self.effects.burst(enemy.x, enemy.y, ns.skins.current().secondary, 1.35);
        if (!self.player.lastDamageBlocked) { self.state.breakCombo(); self.challenge.onPlayerDamaged(challengeContext); }
        self.updateHud();
      });
      ns.systems.Collision.resolveEnemyBullets(this.player, this.enemyBullets, function (bullet) {
        self.effects.burst(bullet.x, bullet.y, self.player.lastDamageBlocked?'#b67cff':'#ff395f', .8);
        if (!self.player.lastDamageBlocked) { self.state.breakCombo(); self.challenge.onPlayerDamaged(challengeContext); }
        self.updateHud();
      });
      ns.systems.Collision.resolvePlayerPowerUps(this.player, this.powerUps, function (powerUp) {
        const pickup = self.support.isSupport(powerUp.type) ? self.support.collect(powerUp.type) : self.skills.collect(powerUp, {
          player:self.player, enemies:self.enemies, enemyBullets:self.enemyBullets,
          onDestroyed:function(enemy, drop){ self.onEnemyDestroyed(enemy, drop); }
        });
        self.effects.announce(pickup.label, pickup.color);
        self.effects.burst(powerUp.x,powerUp.y,'#ffffff'); self.updateHud();
      });

      this.bullets = this.bullets.filter(function (bullet) { return bullet.active; });
      this.enemyBullets = this.enemyBullets.filter(function (bullet) { return bullet.active; });
      this.enemies = this.enemies.filter(function (enemy) { return enemy.active; });
      this.powerUps = this.powerUps.filter(function (powerUp) { return powerUp.active; });
      this.updateHud();
      if (this.stage.completed && this.state.status === 'playing') {
        this.state.end();this.challenge.reset();this.updateHud();
        this.showOverlay('遠征完成', '你已突破全部 100 波！<br>最終分數：'+String(this.state.score).padStart(6,'0')+'　最佳 Combo：'+this.state.bestCombo, '再次遠征', false);
        return;
      }
      if (this.stage.failed && this.state.status === 'playing') {
        this.state.end();this.challenge.reset();this.updateHud();
        this.showOverlay('防線崩潰', '敵軍突破了空域防線。<br>本局：'+String(this.state.score).padStart(6,'0')+'　抵達第 '+this.stage.wave+' 波', '重新整備', false);
        return;
      }
      if (!this.player.active) {
        this.state.end();
        this.challenge.reset();
        this.updateHud();
        this.showOverlay('任務失敗', '本局：' + String(this.state.score).padStart(6, '0') + '　最高：' + String(this.state.highScore).padStart(6, '0') + '<br>最佳 Combo：' + this.state.bestCombo + '　歷史：' + this.state.highCombo, '重新開始', false);
      }
    }

    onEnemyDestroyed(enemy, allowDrop) {
      this.stage.onEnemyDestroyed(enemy);
      this.state.registerKill(enemy.scoreValue);
      this.challenge.onKill({ player:this.player, powerUps:this.powerUps, effects:this.effects });
      this.effects.burst(enemy.x, enemy.y, ns.skins.current().effect, enemy.type==='elite'?1.7:1);
      if (allowDrop) this.skills.maybeDrop(enemy, this.powerUps);
    }

    drawBackground() {
      this.battlefield.draw(this.ctx, ns.skins.current(), this.spawner.threatLevel(), this.stage.affix());
    }

    draw() {
      this.drawBackground();
      const offset=this.state.status==='playing'?this.effects.offset():{x:0,y:0};
      this.ctx.save();this.ctx.translate(offset.x,offset.y);
      this.powerUps.forEach(function (powerUp) { powerUp.draw(this.ctx); }, this);
      this.bullets.forEach(function (bullet) { bullet.draw(this.ctx); }, this);
      this.enemies.forEach(function (enemy) { enemy.draw(this.ctx); }, this);
      this.enemyBullets.forEach(function (bullet) { bullet.draw(this.ctx); }, this);
      this.support.draw(this.ctx,this.player);
      if (this.player.active) this.player.draw(this.ctx);
      this.effects.draw(this.ctx);
      this.ctx.restore();
    }

    updateHud() {
      this.ui.score.textContent = String(this.state.score).padStart(6, '0');
      this.ui.health.textContent = Array.from({ length: this.player ? this.player.maxHealth : 3 }, function (_, i) { return i < (this.player ? this.player.health : 3) ? '●' : '○'; }, this).join(' ');
      this.ui.threat.textContent = this.stage.status();
      this.ui.skillStatus.textContent = this.skills.status(this.player);
      const challengeStatus = this.challenge.status();
      this.ui.challengeStatus.textContent = challengeStatus;
      this.ui.challengeStatus.hidden = !challengeStatus;
      this.ui.combo.textContent = 'COMBO ' + this.state.combo + ' · ×' + this.state.multiplier;
      this.ui.bestScore.textContent = 'BEST ' + String(Math.max(this.state.highScore, this.state.score)).padStart(6, '0');
      this.ui.supportStatus.textContent = this.support.status();
      this.ui.defenseStatus.textContent = this.stage.defenseStatus();
      this.ui.defenseStatus.classList.toggle('critical',this.stage.integrity<=2);
    }

    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000 || 0, 0.033);
      this.lastTime = timestamp;
      if (this.state.status === 'playing') {
        this.battlefield.update(dt);
        this.update(dt);
      }
      this.draw();
      requestAnimationFrame(this.boundLoop);
    }
  }
  ns.Game = Game;
})(globalThis.SkyStrike);
