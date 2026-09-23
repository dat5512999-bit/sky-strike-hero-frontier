(function (ns) {
  'use strict';
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  class ShopView {
    constructor(root, store, { onClose = null } = {}) {
      this.root = root; this.store = store; this.onClose = onClose; this.category = 'all'; this.ownedOnly = false;
      this.selected = store.catalog[0].id; this.previewSlot = 'cover'; this.detailOpen = false; this.confirming = false;
      this.message = ''; this.pending = false; this.destroyed = false;
      this.rail = new ns.ScrollRail(root);
      this.click = event => { if (this.rail.suppressClick(event)) return; const button = event.target.closest('button[data-shop-action]'); if (button && root.contains(button)) this.act(button.dataset.shopAction, button.dataset.value); };
      this.key = event => {
        if (event.key === 'Escape' && (this.confirming || this.detailOpen)) { event.preventDefault(); this.act(this.confirming ? 'cancel' : 'close-detail'); }
        if (event.key === 'Tab' && this.detailOpen && this.mobile.matches && !this.confirming) {
          const buttons = Array.from(this.root.querySelectorAll('.hf-detail button:not(:disabled), .hf-detail a, .hf-detail summary, .hf-detail audio'));
          const first = buttons[0], last = buttons.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      };
      this.mobile = matchMedia('(max-width: 1000px), (max-height: 600px)');
      this.resize = () => this.syncDetail(); this.mobile.addEventListener('change', this.resize);
      root.classList.add('hf-shop'); root.addEventListener('click', this.click); root.addEventListener('keydown', this.key); this.render();
    }
    button(action, text, value = '', extra = '') { return `<button data-shop-action="${action}" data-value="${escape(value)}" ${extra}>${text}</button>`; }
    filtered() { const order = ['astral-oath', 'thunder-king', 'solar-lion', 'crimson-fox', 'bone-emperor', 'eclipse-court', 'silverleaf-oath', 'frontier-banner', 'guest-realm']; return [...this.store.catalog].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)).filter(s => s.category !== 'effect' && (this.category === 'all' || s.category === this.category) && (!this.ownedOnly || ['owned', 'equipped'].includes(this.store.status(s.id)))); }
    render() {
      if (this.destroyed) return;
      const active = this.root.contains(document.activeElement) ? { action: document.activeElement.dataset.shopAction, value: document.activeElement.dataset.value } : null;
      const scroll = this.root.querySelector('.hf-products')?.scrollTop || 0;
      const horizontal = this.root.querySelector('.hf-collection-track')?.scrollLeft || 0;
      const state = this.store.snapshot(), skin = this.store.get(this.selected), status = this.store.status(skin.id), items = this.filtered();
      const asset = this.previewSlot === 'cover' ? skin.cover : skin.slots[this.previewSlot];
      this.root.dataset.detail = String(this.detailOpen);
      this.root.dataset.category = this.category;
      this.root.innerHTML = ns.renderShop(this, { state, skin, status, items, asset });
      this.root.querySelector('.hf-products').scrollTop = scroll;
      this.rail.restore(horizontal);
      this.syncDetail();
      this.root.querySelectorAll('img').forEach(img => { img.onerror = () => { const fallback = document.createElement('p'); fallback.className = 'hf-asset-fallback'; fallback.textContent = '預覽圖片暫時無法載入'; img.replaceWith(fallback); }; });
      if (this.confirming) { const dialog = this.root.querySelector('dialog'); dialog.addEventListener('cancel', e => { e.preventDefault(); this.act('cancel'); }); dialog.showModal(); dialog.querySelector('[data-shop-action="cancel"]').focus(); }
      else if (active?.action) { Array.from(this.root.querySelectorAll('button')).find(b => b.dataset.shopAction === active.action && b.dataset.value === active.value)?.focus({ preventScroll: true }); }
    }
    preview(asset, skin) {
      if (!asset && skin.id === 'eclipse-court' && ['soldierAppearance', 'towerAppearance'].includes(this.previewSlot)) return '<div class="hf-fallback"><span>✧</span><h3>王國黑金配色</h3><p>裝備後套用到王國士兵與建築。<br>專屬逐格素材仍在製作。</p></div>';
      if (!asset) return '<div class="hf-fallback"><span>✧</span><h3>沿用原版呈現</h3><p>此造型尚未提供此項資產。<br>完整架構已預留替換欄位。</p></div>';
      if (asset.type === 'voice') return `<audio controls preload="none" src="${escape(asset.src)}" aria-label="語音預覽"></audio>`;
      if (['sprite', 'animation'].includes(asset.type)) return `<div class="hf-sprite" style="--cols:${asset.columns};--rows:${asset.rows};--frames:${asset.frames};--end:${100 * (asset.frames - 1) / (asset.columns - 1 || 1)}%;background-image:url('${escape(asset.src)}')" data-animated="${asset.type === 'animation'}" role="img" aria-label="${escape(skin.name)}角色預覽"></div>`;
      return `<img src="${escape(asset.src)}" alt="${escape(skin.name)}預覽">`;
    }
    async act(action, value) {
      if (this.pending || this.destroyed) return;
      if (action === 'scroll-collection') { this.rail.step(Number(value)); return; }
      if (action === 'exit') { this.onClose?.(); return; }
      if (action === 'category') { this.category = value; this.detailOpen = false; }
      if (action === 'owned') this.ownedOnly = !this.ownedOnly;
      if (action === 'select') { this.selected = value; this.previewSlot = 'cover'; this.detailOpen = true; }
      if (action === 'preview') this.previewSlot = value;
      if (action === 'close-detail') this.detailOpen = false;
      if (action === 'buy') this.confirming = true;
      if (action === 'cancel') this.confirming = false;
      if (['confirm', 'equip', 'unequip'].includes(action)) {
        this.pending = true; this.render();
        try { await this.store[action === 'confirm' ? 'buy' : action](value); this.message = action === 'confirm' ? '已加入收藏。可選擇「裝備外觀」。' : action === 'equip' ? '已裝備外觀；戰鬥能力維持不變。' : '已卸下外觀，恢復原版選擇。'; }
        catch (error) { this.message = error.message || '處理失敗，請稍後重試。'; }
        finally { this.pending = false; this.confirming = false; }
      }
      this.render();
      if (['close-detail', 'cancel'].includes(action)) this.root.querySelector(`[data-shop-action="${action === 'cancel' ? 'buy' : 'select'}"][data-value="${this.selected}"]`)?.focus({ preventScroll: true });
      if (action === 'select' && matchMedia('(max-width: 1000px), (max-height: 600px)').matches) this.root.querySelector('[data-shop-action="close-detail"]').focus();
    }
    syncDetail() {
      const modal = this.mobile.matches && this.detailOpen;
      this.root.querySelectorAll('.hf-browse, .hf-categories, .hf-top').forEach(element => { element.inert = modal; });
      const detail = this.root.querySelector('.hf-detail');
      if (modal) { detail.setAttribute('role', 'dialog'); detail.setAttribute('aria-modal', 'true'); }
      else { detail.removeAttribute('role'); detail.removeAttribute('aria-modal'); }
    }
    destroy() { this.destroyed = true; this.rail.destroy(); this.mobile.removeEventListener('change', this.resize); this.root.querySelector('dialog')?.close(); this.root.removeEventListener('click', this.click); this.root.removeEventListener('keydown', this.key); this.root.replaceChildren(); this.root.classList.remove('hf-shop'); delete this.root.dataset.detail; delete this.root.dataset.category; }
  }
  ns.ShopView = ShopView;
})(globalThis.FrontierShop);
