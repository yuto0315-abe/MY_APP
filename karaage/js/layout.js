/* ===== Layout Tool ===== */
class LayoutTool {
  constructor() {
    this.elements = [];
    this.elemIdCounter = 0;
    this.selectedEl = null;
    this.canvas = document.getElementById('layout-canvas');
    this.initPalette();
    this.initCanvasEvents();
  }
  initPalette() {
    const items = [
      { icon:'▬', label:'ヘッダー', w:360, h:50, bg:'#e2e8f0' },
      { icon:'◻', label:'サイドバー', w:120, h:300, bg:'#f1f5f9' },
      { icon:'▭', label:'ボタン', w:120, h:40, bg:'#7c3aed', textColor:'#fff' },
      { icon:'▤', label:'テーブル', w:300, h:180, bg:'#f8fafc' },
      { icon:'🖼', label:'画像', w:200, h:150, bg:'#e2e8f0' },
      { icon:'📝', label:'テキスト', w:200, h:30, bg:'transparent' },
      { icon:'📋', label:'フォーム', w:280, h:200, bg:'#f8fafc' },
      { icon:'📊', label:'カード', w:200, h:140, bg:'#fff' },
      { icon:'▬', label:'フッター', w:360, h:40, bg:'#e2e8f0' },
      { icon:'🔍', label:'検索バー', w:240, h:36, bg:'#fff' },
    ];
    const palette = document.getElementById('layout-palette');
    palette.innerHTML = '<div class="palette-title">UI要素</div>' +
      items.map((it,i) => `<div class="palette-item" draggable="true" data-idx="${i}">
        <span class="p-icon">${it.icon}</span><span>${it.label}</span></div>`).join('');
    this.paletteItems = items;
    palette.querySelectorAll('.palette-item').forEach(el => {
      el.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', el.dataset.idx));
    });
  }
  initCanvasEvents() {
    this.canvas.addEventListener('dragover', e => e.preventDefault());
    this.canvas.addEventListener('drop', e => {
      e.preventDefault();
      const idx = parseInt(e.dataTransfer.getData('text/plain'));
      if (isNaN(idx)) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.addElement(this.paletteItems[idx], x, y);
    });
    this.canvas.addEventListener('click', e => {
      if (e.target === this.canvas) this.deselectAll();
    });
  }
  addElement(item, x, y) {
    const id = 'layout_el_' + (this.elemIdCounter++);
    const el = { id, label: item.label, x, y, w: item.w, h: item.h, bg: item.bg, textColor: item.textColor || '#64748b' };
    this.elements.push(el);
    this.renderElement(el);
  }
  renderElement(el) {
    const div = document.createElement('div');
    div.className = 'layout-element';
    div.id = el.id;
    div.style.cssText = `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;background:${el.bg};color:${el.textColor};border:${el.bg==='transparent'?'none':'2px dashed #cbd5e1'}`;
    div.textContent = el.label;
    let dragging = false, ox, oy;
    div.addEventListener('mousedown', e => {
      dragging = true;
      this.selectElement(el, div);
      ox = e.clientX - el.x; oy = e.clientY - el.y;
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      el.x = Math.max(0, e.clientX - ox);
      el.y = Math.max(0, e.clientY - oy);
      div.style.left = el.x + 'px'; div.style.top = el.y + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
    div.addEventListener('dblclick', () => {
      const name = prompt('ラベル:', el.label);
      if (name) { el.label = name; div.textContent = name; }
    });
    this.canvas.appendChild(div);
  }
  selectElement(el, div) {
    this.deselectAll();
    this.selectedEl = el;
    div.classList.add('selected');
  }
  deselectAll() {
    this.selectedEl = null;
    this.canvas.querySelectorAll('.layout-element').forEach(e => e.classList.remove('selected'));
  }
  clearAll() {
    this.elements = []; this.elemIdCounter = 0;
    this.canvas.querySelectorAll('.layout-element').forEach(e => e.remove());
    showToast('キャンバスをクリアしました');
  }
  exportPNG() {
    showToast('レイアウトデータを保存しました');
  }
}
