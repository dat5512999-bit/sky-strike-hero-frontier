(function (ns) {
  'use strict';
  class Enemy {
    constructor(x, y, options) {
      const cfg = ns.config.enemy;
      const opts = options || {};
      this.x = x;
      this.y = y;
      this.width = opts.width || cfg.width;
      this.height = opts.height || cfg.height;
      this.speed = opts.speed || cfg.speed;
      this.health = opts.health || cfg.health;
      this.scoreValue = opts.score || cfg.score;
      this.type = opts.type || 'normal';
      this.time = 0;
      this.fireCooldown = 1 + Math.random();
      this.maxHealth = this.health;
      this.active = true;
      this.destroyed = false;
      this.escaped = false;
      this.escapeHandled = false;
      this.hitFlash = 0;
    }

    update(dt, context) {
      const speedScale = context && context.enemySpeed ? context.enemySpeed : 1;
      const movementDt = dt * speedScale;
      this.time += movementDt;
      this.hitFlash=Math.max(0,this.hitFlash-dt);
      const player = context && context.player;
      if (this.type === 'swift') {
        this.y += this.speed * movementDt;
        this.x += Math.sin(this.time * 9) * 85 * movementDt;
      } else if (this.type === 'tracker') {
        this.y += this.speed * movementDt;
        if (player) this.x = ns.utils.moveToward(this.x, player.x, 72 * movementDt);
      } else if (this.type === 'gunner' || this.type === 'elite') {
        if (this.y < (this.type === 'elite' ? 115 : 145)) this.y += this.speed * movementDt;
        else this.x += Math.sin(this.time * (this.type === 'elite' ? 1.8 : 2.5)) * (this.type === 'elite' ? 48 : 34) * movementDt;
        this.fireCooldown -= movementDt * (context && context.enemyFireRate ? context.enemyFireRate : 1);
        if (this.fireCooldown <= 0 && player && context.enemyBullets) {
          this.shootAt(player, context.enemyBullets, speedScale);
          this.fireCooldown = this.type === 'elite' ? 1.05 : 1.7;
        }
      } else {
        this.y += this.speed * movementDt;
      }
      this.x = ns.utils.clamp(this.x, this.width / 2, ns.config.width - this.width / 2);
      if (this.y - this.height / 2 > ns.config.height + 20) { this.escaped = true; this.active = false; }
    }

    shootAt(player, bullets, speedScale) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const speed = (this.type === 'elite' ? 205 : 180) * (speedScale || 1);
      const offsets = this.type === 'elite' ? [-0.2, 0, 0.2] : [0];
      offsets.forEach(function (offset) {
        bullets.push(new ns.entities.EnemyBullet(this.x, this.y + this.height / 2, Math.cos(angle + offset) * speed, Math.sin(angle + offset) * speed));
      }, this);
    }

    takeDamage(amount) {
      if (!this.active) return false;
      this.health -= amount;
      this.hitFlash=.1;
      if (this.health <= 0) {
        this.health = 0;
        this.active = false;
        this.destroyed = true;
        return true;
      }
      return false;
    }

    draw(ctx) {
      ns.skins.draw('enemy', ctx, this);
      const colors={swift:'#ffd34f',tracker:'#65efb2',gunner:'#ff8b42',elite:'#b67cff'}; const color=colors[this.type];
      ctx.save();ctx.translate(this.x,this.y);
      if(this.type==='swift'){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.7;[-9,0,9].forEach(function(x,i){ctx.beginPath();ctx.moveTo(x,19);ctx.lineTo(x+(i-1)*4,38);ctx.stroke();});}
      if(this.type==='tracker'){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.shadowColor=color;ctx.shadowBlur=8;[0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(function(a){const x=Math.cos(a)*27,y=Math.sin(a)*27;ctx.beginPath();ctx.moveTo(x-Math.cos(a)*7,y-Math.sin(a)*7);ctx.lineTo(x,y);ctx.lineTo(x-Math.cos(a-.7)*7,y-Math.sin(a-.7)*7);ctx.stroke();});}
      if(this.type==='gunner'){ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=9;ctx.fillRect(-7,16,14,6);ctx.fillStyle='#fff';ctx.fillRect(-2,20,4,6);}
      if(this.type==='elite'){ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,0,34,-2.65,-.5);ctx.stroke();ctx.beginPath();ctx.arc(0,0,34,.5,2.65);ctx.stroke();}
      if(this.hitFlash>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=this.hitFlash*6;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,Math.max(this.width,this.height)*.55,0,Math.PI*2);ctx.fill();}
      if(this.maxHealth>=4){const width=this.type==='elite'?52:38;ctx.globalAlpha=.9;ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(-width/2,-this.height*.75,width,4);ctx.fillStyle=color||'#ff526e';ctx.fillRect(-width/2,-this.height*.75,width*(this.health/this.maxHealth),4);}
      ctx.restore();
    }
  }
  ns.entities.Enemy = Enemy;
})(globalThis.SkyStrike);
