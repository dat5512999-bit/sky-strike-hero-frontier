(function (ns) {
  'use strict';
  // Native touch scrolling; mouse drag and keyboard are progressive enhancements.
  class ScrollRail {
    constructor(root) {
      this.root = root;
      this.listeners = [];
      const on = (name, handler, capture = false) => { root.addEventListener(name, handler, capture); this.listeners.push([name, handler, capture]); };
      on('scroll', () => this.sync(), true);
      on('pointerdown', event => {
        this.drag = null; this.dragged = false;
        const track = event.target.closest('.hf-collection-track');
        if (track && event.pointerType === 'mouse' && event.button === 0) this.drag = { track, x: event.clientX, start: track.scrollLeft, id: event.pointerId };
      });
      on('pointermove', event => {
        const drag = this.drag;
        if (!drag || event.pointerId !== drag.id || !event.buttons) return;
        const dx = event.clientX - drag.x;
        if (Math.abs(dx) > 6) { this.dragged = true; drag.track.setPointerCapture(drag.id); drag.track.dataset.dragging = 'true'; }
        if (this.dragged) { event.preventDefault(); drag.track.scrollLeft = drag.start - dx; }
      });
      const end = () => { if (this.drag) { delete this.drag.track.dataset.dragging; this.drag = null; } };
      on('pointerup', end); on('pointercancel', end);
      on('dragstart', event => { if (event.target.closest('.hf-collection-track')) event.preventDefault(); });
      on('keydown', event => {
        if (!event.target.closest('.hf-collection-track')) return;
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          if (event.key === 'Home' || event.key === 'End') this.track.scrollTo({ left: event.key === 'Home' ? 0 : this.track.scrollWidth, behavior: 'instant' });
          else this.step(event.key === 'ArrowRight' ? 1 : -1);
        }
      });
      this.observer = new ResizeObserver(() => this.sync()); this.observer.observe(root);
    }
    get track() { return this.root.querySelector('.hf-collection-track'); }
    behavior() { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'; }
    restore(left) { if (this.track) this.track.scrollLeft = left; this.sync(); }
    step(direction) { const track = this.track; if (track) track.scrollBy({ left: direction * (track.querySelector('.hf-card').offsetWidth + 12), behavior: this.behavior() }); }
    sync() {
      const track = this.track;
      this.root.querySelectorAll('[data-shop-action="scroll-collection"]').forEach(button => {
        button.disabled = !track || (Number(button.dataset.value) < 0 ? track.scrollLeft <= 1 : track.scrollLeft >= track.scrollWidth - track.clientWidth - 1);
      });
    }
    suppressClick(event) { if (this.dragged && event.target.closest('.hf-collection-track')) { event.preventDefault(); this.dragged = false; return true; } return false; }
    destroy() { this.observer.disconnect(); this.listeners.forEach(args => this.root.removeEventListener(...args)); }
  }
  ns.ScrollRail = ScrollRail;
})(globalThis.FrontierShop);
