/* ===== Layout Tool ===== */
class LayoutTool {
  constructor() {
    this.elements = [];
    this.elemIdCounter = 0;
    this.selectedEl = null;
    this.undoHistory = [];
    this.isApplyingUndo = false;
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
    this.pushUndoAction({
      type: 'removeElement',
      elementId: el.id,
      elemIdCounter: this.elemIdCounter - 1,
    });
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
      const dragStart = { x: el.x, y: el.y };
      let moved = false;
      ox = e.clientX - el.x; oy = e.clientY - el.y;
      e.preventDefault();
      const onMouseMove = event => {
        if (!dragging) return;
        const nextX = Math.max(0, event.clientX - ox);
        const nextY = Math.max(0, event.clientY - oy);
        if (nextX !== el.x || nextY !== el.y) moved = true;
        el.x = nextX;
        el.y = nextY;
        div.style.left = el.x + 'px'; div.style.top = el.y + 'px';
      };
      const onMouseUp = () => {
        if (dragging && moved) {
          this.pushUndoAction({
            type: 'moveElement',
            elementId: el.id,
            x: dragStart.x,
            y: dragStart.y,
          });
        }
        dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    div.addEventListener('dblclick', () => {
      const name = prompt('ラベル:', el.label);
      if (name && name !== el.label) {
        const oldLabel = el.label;
        el.label = name;
        div.textContent = name;
        this.pushUndoAction({
          type: 'renameElement',
          elementId: el.id,
          label: oldLabel,
        });
      }
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
  pushUndoAction(action) {
    if (this.isApplyingUndo || !action) return;
    this.undoHistory.push(action);
  }
  getElementById(elementId) {
    return this.elements.find(element => element.id === elementId) || null;
  }
  removeElementById(elementId) {
    const index = this.elements.findIndex(element => element.id === elementId);
    if (index < 0) return null;
    const [element] = this.elements.splice(index, 1);
    const div = document.getElementById(elementId);
    if (div) div.remove();
    if (this.selectedEl && this.selectedEl.id === elementId) this.selectedEl = null;
    return element;
  }
  restoreSnapshot(snapshot) {
    if (!snapshot) return;
    this.elements = snapshot.elements.map(element => ({ ...element }));
    this.elemIdCounter = snapshot.elemIdCounter;
    this.selectedEl = null;
    this.canvas.querySelectorAll('.layout-element').forEach(element => element.remove());
    this.elements.forEach(element => this.renderElement(element));
  }
  undoLastAction() {
    const action = this.undoHistory.pop();
    if (!action) {
      showToast('戻せる操作がありません');
      return;
    }

    this.isApplyingUndo = true;
    try {
      if (action.type === 'removeElement') {
        this.removeElementById(action.elementId);
        this.elemIdCounter = action.elemIdCounter;
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'moveElement') {
        const element = this.getElementById(action.elementId);
        const div = element ? document.getElementById(element.id) : null;
        if (element && div) {
          element.x = action.x;
          element.y = action.y;
          div.style.left = `${element.x}px`;
          div.style.top = `${element.y}px`;
        }
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'renameElement') {
        const element = this.getElementById(action.elementId);
        const div = element ? document.getElementById(element.id) : null;
        if (element && div) {
          element.label = action.label;
          div.textContent = action.label;
        }
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'clearAll') {
        this.restoreSnapshot(action.snapshot);
        showToast('一つ戻しました');
        return;
      }

      showToast('戻し処理に失敗しました');
    } finally {
      this.isApplyingUndo = false;
    }
  }
  clearAll() {
    const snapshot = {
      elements: this.elements.map(element => ({ ...element })),
      elemIdCounter: this.elemIdCounter,
    };
    this.elements = []; this.elemIdCounter = 0;
    this.canvas.querySelectorAll('.layout-element').forEach(e => e.remove());
    this.pushUndoAction({ type: 'clearAll', snapshot });
    showToast('キャンバスをクリアしました');
  }
  exportPNG() {
    showToast('レイアウトデータを保存しました');
  }
}
