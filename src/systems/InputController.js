(function (ns) {
  'use strict';
  class InputController {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.canControl = options.canControl;
      this.getPlayer = options.getPlayer;
      this.touchDrag = null;
      this.attach();
    }

    static canvasPoint(event, rect, canvas) {
      return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
      };
    }

    static touchTarget(anchor, event, rect, canvas) {
      return {
        x: anchor.playerX + (event.clientX - anchor.clientX) * canvas.width / rect.width,
        y: anchor.playerY + (event.clientY - anchor.clientY) * canvas.height / rect.height
      };
    }

    attach() {
      this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
      this.canvas.addEventListener('pointerup', this.onPointerEnd.bind(this));
      this.canvas.addEventListener('pointercancel', this.onPointerEnd.bind(this));
    }

    onPointerDown(event) {
      if (!this.canControl()) return;
      if (event.cancelable) event.preventDefault();
      this.canvas.focus();
      if (this.canvas.setPointerCapture) this.canvas.setPointerCapture(event.pointerId);
      if (event.pointerType === 'touch') {
        const player = this.getPlayer();
        this.touchDrag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, playerX: player.targetX, playerY: player.targetY };
      } else {
        const point = InputController.canvasPoint(event, this.canvas.getBoundingClientRect(), this.canvas);
        this.getPlayer().setTarget(point.x, point.y);
      }
    }

    onPointerMove(event) {
      if (!this.canControl()) return;
      if (event.cancelable) event.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      if (event.pointerType === 'touch') {
        if (!this.touchDrag || this.touchDrag.pointerId !== event.pointerId) return;
        const target = InputController.touchTarget(this.touchDrag, event, rect, this.canvas);
        this.getPlayer().setTarget(target.x, target.y);
      } else {
        const point = InputController.canvasPoint(event, rect, this.canvas);
        this.getPlayer().setTarget(point.x, point.y);
      }
    }

    onPointerEnd(event) {
      if (event.cancelable) event.preventDefault();
      if (this.touchDrag && this.touchDrag.pointerId === event.pointerId) this.touchDrag = null;
      if (this.canvas.releasePointerCapture && this.canvas.hasPointerCapture && this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    }
  }
  ns.systems.InputController = InputController;
})(globalThis.SkyStrike);
