/* ===== Diagram Tool (Architecture + UML) ===== */
const archComponents = [
  { icon:'🌐', label:'Webサーバー', color:'#7c3aed' },
  { icon:'🗄️', label:'データベース', color:'#06b6d4' },
  { icon:'⚙️', label:'APIサーバー', color:'#10b981' },
  { icon:'📦', label:'キャッシュ', color:'#f59e0b' },
  { icon:'☁️', label:'CDN', color:'#8b5cf6' },
  { icon:'🔐', label:'認証', color:'#ef4444' },
  { icon:'📨', label:'メッセージキュー', color:'#ec4899' },
  { icon:'📊', label:'ログ/監視', color:'#14b8a6' },
  { icon:'💾', label:'ストレージ', color:'#6366f1' },
  { icon:'🔄', label:'ロードバランサー', color:'#f97316' },
  { icon:'👤', label:'クライアント', color:'#64748b' },
  { icon:'📱', label:'モバイル', color:'#a855f7' },
];
const umlComponents = [
  { icon:'⬜', label:'画面', color:'#7c3aed' },
  { icon:'🔵', label:'開始', color:'#10b981' },
  { icon:'🔴', label:'終了', color:'#ef4444' },
  { icon:'◇', label:'分岐', color:'#f59e0b' },
  { icon:'▶️', label:'アクション', color:'#06b6d4' },
  { icon:'📋', label:'フォーム', color:'#8b5cf6' },
  { icon:'📊', label:'ダッシュボード', color:'#14b8a6' },
  { icon:'⚙️', label:'設定', color:'#6366f1' },
  { icon:'🔔', label:'通知', color:'#ec4899' },
  { icon:'📝', label:'入力', color:'#f97316' },
];

class DiagramTool {
  constructor(prefix, components, options = {}) {
    this.prefix = prefix;
    this.components = components;
    this.options = options;
    this.isDropdownPalette = this.options.paletteMode === 'dropdown';
    // connection mode flag: explicitly initialize to boolean to avoid
    // intermittent truthy/undefined states when UI sync happens.
    this.connectMode = false;
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.connectingFrom = null;
    this.undoHistory = [];
    this.redoHistory = [];
    this.isApplyingUndo = false;
    this.nodeIdCounter = 0;
    this.quickAddCounter = 0;
    this.defaultTextStyle = { fontSize: 14, color: '#e5e7eb' };
    this.selectedTextColor = '';
    this.textColorOptions = [
      { label: '自動', color: '' },
      { label: '黒', color: '#111111' },
      { label: '赤', color: '#ef4444' },
      { label: 'オレンジ', color: '#f59e0b' },
      { label: '黄', color: '#eab308' },
      { label: '緑', color: '#22c55e' },
      { label: '青緑', color: '#06b6d4' },
      { label: '青', color: '#3b82f6' },
      { label: '紫', color: '#8b5cf6' },
      { label: '濃い赤', color: '#dc2626' },
      { label: 'ピンク', color: '#f43f5e' },
      { label: 'レモン', color: '#facc15' },
      { label: '黄緑', color: '#84cc16' },
      { label: '緑青', color: '#14b8a6' },
      { label: '空色', color: '#0ea5e9' },
      { label: '紺青', color: '#1d4ed8' },
      { label: 'バイオレット', color: '#7c3aed' },
    ];
    this.canvas = document.getElementById(prefix + '-canvas');
    this.svg = document.getElementById(prefix + '-svg');
    this.initPalette();
    this.initCanvasEvents();
    this.initTextStyleControls();
  }
  initPalette() {
    const palette = document.getElementById(this.prefix + '-palette');
    if (this.isDropdownPalette) {
      palette.innerHTML = `
        <div class="palette-dropdown">
          <button type="button" class="palette-dropdown-btn" id="${this.prefix}-shape-toggle">◽ 図形を追加</button>
          <div class="palette-dropdown-menu" id="${this.prefix}-shape-menu">
            ${this.components.map((c, i) => `<button type="button" class="shape-option" data-idx="${i}" data-label="${c.label}" aria-label="${c.label}" title="${c.label}">${c.icon}</button>`).join('')}
          </div>
        </div>
        <button type="button" class="palette-action-btn" id="${this.prefix}-connect-mode">🔗 接続モード</button>`;

      const toggleButton = document.getElementById(this.prefix + '-shape-toggle');
      const shapeMenu = document.getElementById(this.prefix + '-shape-menu');
      toggleButton.addEventListener('click', e => {
        e.stopPropagation();
        shapeMenu.classList.toggle('open');
      });
      shapeMenu.querySelectorAll('.shape-option').forEach(option => {
        option.addEventListener('click', () => {
          const idx = parseInt(option.dataset.idx, 10);
          if (isNaN(idx)) return;
          this.addNodeFromPalette(idx);
          shapeMenu.classList.remove('open');
        });
      });
      document.addEventListener('click', e => {
        if (!palette.contains(e.target)) shapeMenu.classList.remove('open');
      });
    } else {
      palette.innerHTML = '<div class="palette-title">コンポーネント</div>' +
        this.components.map((c,i) => `
          <div class="palette-item" draggable="true" data-idx="${i}">
            <span class="p-icon">${c.icon}</span><span>${c.label}</span>
          </div>`).join('') +
        '<div class="palette-title" style="margin-top:16px;">操作</div>' +
        '<div class="palette-item" style="cursor:pointer;" id="'+this.prefix+'-connect-mode">🔗 接続モード</div>';

      palette.querySelectorAll('.palette-item[draggable]').forEach(item => {
        item.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', item.dataset.idx);
        });
      });
    }

    const connectButton = document.getElementById(this.prefix+'-connect-mode');
    this.updateConnectButton = () => {
      connectButton.classList.toggle('active', this.connectMode);
      connectButton.textContent = `🔗 接続モード ${this.connectMode ? 'ON' : 'OFF'}`;
      if (!this.isDropdownPalette) {
        connectButton.style.background = this.connectMode ? 'rgba(124,58,237,0.2)' : '';
      }
    };
    this.updateConnectButton();
    connectButton.addEventListener('click', () => {
      this.connectMode = !this.connectMode;
      this.updateConnectButton();
      this.canvas.style.cursor = this.connectMode ? 'crosshair' : 'default';
      showToast(this.connectMode ? '接続モード: ONー ノードをクリックして接続' : '接続モード: OFF');
    });
  }
  addNodeFromPalette(idx) {
    const comp = this.components[idx];
    if (!comp) return;
    const quickAddCounterBefore = this.quickAddCounter;
    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;
    const col = this.quickAddCounter % 4;
    const row = Math.floor(this.quickAddCounter / 4);
    const x = Math.min(80 + col * 140, Math.max(20, canvasWidth - 180));
    const y = Math.min(90 + row * 90, Math.max(20, canvasHeight - 80));
    this.quickAddCounter++;
    this.addNode(comp, x, y, { quickAddCounterBefore });
  }
  initCanvasEvents() {
    this.canvas.addEventListener('dragover', e => e.preventDefault());
    this.canvas.addEventListener('drop', e => {
      e.preventDefault();
      const idx = parseInt(e.dataTransfer.getData('text/plain'));
      if (isNaN(idx)) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - 60;
      const y = e.clientY - rect.top - 20;
      this.addNode(this.components[idx], x, y);
    });
    this.canvas.addEventListener('click', e => {
      if (e.target === this.canvas || e.target === this.svg) {
        this.deselectAll();
      }
    });
    document.addEventListener('keydown', e => {
      const target = e.target;
      const isEditingField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if (isEditingField) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (!this.selectedNode) return;
      e.preventDefault();
      this.deleteSelectedNode();
    });
  }
  addNode(comp, x, y, options = {}) {
    const id = this.prefix + '_node_' + (this.nodeIdCounter++);
    const node = {
      id,
      icon: comp.icon,
      label: comp.label,
      color: comp.color,
      x,
      y,
      textColor: this.defaultTextStyle.color,
      textSize: this.defaultTextStyle.fontSize,
    };
    this.nodes.push(node);
    this.renderNode(node);
    this.pushUndoAction({
      type: 'removeNode',
      nodeId: node.id,
      quickAddCounter: typeof options.quickAddCounterBefore === 'number' ? options.quickAddCounterBefore : this.quickAddCounter,
    });
  }
  renderNode(node) {
    const el = document.createElement('div');
    el.className = 'diagram-node';
    el.id = node.id;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';
    el.style.borderColor = node.color + '60';
    el.innerHTML = `<span class="node-icon">${node.icon}</span><span class="node-label">${node.label}</span>
      <span class="node-port port-top" data-port="top"></span>
      <span class="node-port port-bottom" data-port="bottom"></span>
      <span class="node-port port-left" data-port="left"></span>
      <span class="node-port port-right" data-port="right"></span>`;
    const labelEl = el.querySelector('.node-label');
    this.applyNodeTextStyle(node, labelEl);
    // Drag
    let dragging = false, ox, oy;
    el.addEventListener('mousedown', e => {
      if (this.editingNodeId === node.id) return;
      if (e.target.classList.contains('node-port')) return;
      if (this.connectMode) {
        if (!this.connectingFrom) {
          this.connectingFrom = node;
          el.classList.add('selected');
          showToast('接続先ノードをクリックしてください');
        } else if (this.connectingFrom.id !== node.id) {
          this.connections.push({ from: this.connectingFrom.id, to: node.id });
          this.drawConnections();
          document.getElementById(this.connectingFrom.id)?.classList.remove('selected');
          this.pushUndoAction({
            type: 'removeConnection',
            from: this.connectingFrom.id,
            to: node.id,
          });
          this.connectingFrom = null;
        }
        return;
      }
      dragging = true;
      this.selectNode(node, el);
      const dragStart = { x: node.x, y: node.y };
      let moved = false;
      ox = e.clientX - node.x;
      oy = e.clientY - node.y;
      e.preventDefault();
      const onMouseMove = e => {
        if (!dragging) return;
        const nextX = e.clientX - ox;
        const nextY = e.clientY - oy;
        if (nextX !== node.x || nextY !== node.y) moved = true;
        node.x = nextX;
        node.y = nextY;
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
        this.drawConnections();
      };
      const onMouseUp = () => {
        if (dragging && moved) {
          this.pushUndoAction({
            type: 'moveNode',
            nodeId: node.id,
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
    // Double click to rename inline
    el.addEventListener('dblclick', e => {
      e.preventDefault();
      e.stopPropagation();
      this.beginInlineRename(node, labelEl);
    });
    // Port click for connection
    el.querySelectorAll('.node-port').forEach(port => {
      port.addEventListener('mousedown', e => {
        e.stopPropagation();
        if (!this.connectingFrom) {
          this.connectingFrom = node;
          this.connectMode = true;
          // keep UI in sync when connect mode is programmatically enabled
          if (typeof this.updateConnectButton === 'function') this.updateConnectButton();
          this.canvas.style.cursor = 'crosshair';
          showToast('接続モード: ONー ノードをクリックして接続');
          el.classList.add('selected');
        }
      });
    });
    this.canvas.appendChild(el);
  }
  beginInlineRename(node, labelEl) {
    if (!labelEl || this.editingNodeId === node.id) return;
    this.editingNodeId = node.id;
    labelEl.dataset.originalText = labelEl.textContent;
    labelEl.contentEditable = 'true';
    labelEl.spellcheck = false;
    labelEl.classList.add('editing');
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(labelEl);
    selection.removeAllRanges();
    selection.addRange(range);
    labelEl.focus();

    const finish = () => {
      if (this.editingNodeId !== node.id) return;
      const newName = labelEl.textContent.trim();
      const oldName = node.label;
      node.label = newName || labelEl.dataset.originalText || node.label;
      labelEl.textContent = node.label;
      this.applyNodeTextStyle(node, labelEl);
      labelEl.contentEditable = 'false';
      labelEl.classList.remove('editing');
      delete labelEl.dataset.originalText;
      this.editingNodeId = null;
      if (node.label !== oldName) {
        this.pushUndoAction({
          type: 'renameNode',
          nodeId: node.id,
          label: oldName,
        });
      }
      labelEl.removeEventListener('blur', onBlur);
      labelEl.removeEventListener('keydown', onKeyDown);
    };
    const onBlur = () => finish();
    const onKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        labelEl.blur();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        labelEl.textContent = labelEl.dataset.originalText || node.label;
        labelEl.blur();
      }
    };
    labelEl.addEventListener('blur', onBlur);
    labelEl.addEventListener('keydown', onKeyDown);
  }
  selectNode(node, el) {
    this.deselectAll();
    this.selectedNode = node;
    el.classList.add('selected');
    this.syncTextStyleControls(node);
  }
  deselectAll() {
    this.selectedNode = null;
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.classList.remove('selected'));
  }
  pushUndoAction(action) {
    if (this.isApplyingUndo || !action) return;
    this.undoHistory.push(action);
    this.redoHistory = [];
  }
  pushRedoAction(action) {
    if (!action) return;
    this.redoHistory.push(action);
  }
  getNodeById(nodeId) {
    return this.nodes.find(node => node.id === nodeId) || null;
  }
  captureSnapshot() {
    return {
      nodes: this.nodes.map(node => ({ ...node })),
      connections: this.connections.map(conn => ({ ...conn })),
      nodeIdCounter: this.nodeIdCounter,
      quickAddCounter: this.quickAddCounter,
    };
  }
  detachNode(nodeId) {
    const index = this.nodes.findIndex(node => node.id === nodeId);
    if (index < 0) return null;
    const [node] = this.nodes.splice(index, 1);
    const removedConnections = this.connections.filter(conn => conn.from === nodeId || conn.to === nodeId);
    this.connections = this.connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId);
    const el = document.getElementById(nodeId);
    if (el) el.remove();
    if (this.selectedNode && this.selectedNode.id === nodeId) this.selectedNode = null;
    if (this.editingNodeId === nodeId) this.editingNodeId = null;
    if (this.connectingFrom && this.connectingFrom.id === nodeId) {
      this.connectingFrom = null;
      this.connectMode = false;
      if (typeof this.updateConnectButton === 'function') this.updateConnectButton();
      this.canvas.style.cursor = 'default';
    }
    return {
      node,
      connections: removedConnections,
    };
  }
  restoreNode(node, connections = []) {
    if (!node) return;
    this.nodes.push(node);
    this.renderNode(node);
    connections.forEach(conn => this.connections.push(conn));
    this.drawConnections();
  }
  restoreSnapshot(snapshot) {
    if (!snapshot) return;
    this.nodes = snapshot.nodes.map(node => ({ ...node }));
    this.connections = snapshot.connections.map(conn => ({ ...conn }));
    this.nodeIdCounter = snapshot.nodeIdCounter;
    this.quickAddCounter = snapshot.quickAddCounter;
    this.selectedNode = null;
    this.connectingFrom = null;
    this.editingNodeId = null;
    this.canvas.querySelectorAll('.diagram-node').forEach(nodeEl => nodeEl.remove());
    this.svg.innerHTML = '';
    this.nodes.forEach(node => this.renderNode(node));
    this.drawConnections();
  }
  applyHistoryAction(action) {
    if (!action) return null;

    if (action.type === 'removeNode') {
      const removed = this.detachNode(action.nodeId);
      if (!removed) return null;
      return {
        type: 'restoreNode',
        node: { ...removed.node },
        connections: removed.connections.map(conn => ({ ...conn })),
      };
    }

    if (action.type === 'restoreNode') {
      this.restoreNode(action.node, action.connections || []);
      return {
        type: 'removeNode',
        nodeId: action.node.id,
      };
    }

    if (action.type === 'moveNode') {
      const node = this.getNodeById(action.nodeId);
      const el = node ? document.getElementById(node.id) : null;
      if (!node || !el) return null;
      const inverse = { type: 'moveNode', nodeId: action.nodeId, x: node.x, y: node.y };
      node.x = action.x;
      node.y = action.y;
      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;
      this.drawConnections();
      return inverse;
    }

    if (action.type === 'removeConnection') {
      const beforeCount = this.connections.length;
      this.connections = this.connections.filter(conn => !(conn.from === action.from && conn.to === action.to));
      if (this.connections.length === beforeCount) return null;
      this.drawConnections();
      return {
        type: 'addConnection',
        from: action.from,
        to: action.to,
      };
    }

    if (action.type === 'addConnection') {
      this.connections.push({ from: action.from, to: action.to });
      this.drawConnections();
      return {
        type: 'removeConnection',
        from: action.from,
        to: action.to,
      };
    }

    if (action.type === 'renameNode') {
      const node = this.getNodeById(action.nodeId);
      const labelEl = node ? document.getElementById(node.id)?.querySelector('.node-label') : null;
      if (!node || !labelEl) return null;
      const inverse = { type: 'renameNode', nodeId: action.nodeId, label: node.label };
      node.label = action.label;
      labelEl.textContent = action.label;
      this.applyNodeTextStyle(node, labelEl);
      return inverse;
    }

    if (action.type === 'styleNode') {
      const node = this.getNodeById(action.nodeId);
      const labelEl = node ? document.getElementById(node.id)?.querySelector('.node-label') : null;
      if (!node || !labelEl) return null;
      const inverse = {
        type: 'styleNode',
        nodeId: action.nodeId,
        textSize: node.textSize,
        textColor: node.textColor,
      };
      node.textSize = action.textSize;
      node.textColor = action.textColor;
      this.applyNodeTextStyle(node, labelEl);
      if (this.selectedNode && this.selectedNode.id === node.id) this.syncTextStyleControls(node);
      return inverse;
    }

    if (action.type === 'clearAll') {
      this.restoreSnapshot(action.snapshot);
      return { type: 'clearCanvas', snapshot: action.snapshot };
    }

    if (action.type === 'clearCanvas') {
      const snapshot = this.captureSnapshot();
      this.nodes = [];
      this.connections = [];
      this.nodeIdCounter = 0;
      this.quickAddCounter = 0;
      this.canvas.querySelectorAll('.diagram-node').forEach(n => n.remove());
      this.svg.innerHTML = '';
      return { type: 'clearAll', snapshot };
    }

    return null;
  }
  undoLastAction() {
    const action = this.undoHistory.pop();
    if (!action) {
      showToast('戻せる操作がありません');
      return;
    }

    this.isApplyingUndo = true;
    try {
      const redoAction = this.applyHistoryAction(action);
      if (redoAction) this.pushRedoAction(redoAction);
      showToast('一つ戻しました');
    } finally {
      this.isApplyingUndo = false;
    }
  }
  redoLastAction() {
    const action = this.redoHistory.pop();
    if (!action) {
      showToast('進められる操作がありません');
      return;
    }

    this.isApplyingUndo = true;
    try {
      const undoAction = this.applyHistoryAction(action);
      if (undoAction) this.undoHistory.push(undoAction);
      showToast('一つ先に戻しました');
    } finally {
      this.isApplyingUndo = false;
    }
  }
  deleteSelectedNode() {
    const node = this.selectedNode;
    if (!node) {
      showToast('削除する図形を選択してください');
      return;
    }

    const snapshotNode = { ...node };
    const snapshotConnections = this.connections
      .filter(conn => conn.from === node.id || conn.to === node.id)
      .map(conn => ({ ...conn }));
    this.detachNode(node.id);
    this.pushUndoAction({
      type: 'restoreNode',
      node: snapshotNode,
      connections: snapshotConnections,
    });
    this.deselectAll();
    this.drawConnections();
    showToast('選択した図形を削除しました');
  }
  initTextStyleControls() {
    this.fontSizeControl = document.getElementById(this.prefix + '-font-size');
    this.textColorButton = document.getElementById(this.prefix + '-text-color-btn');
    this.textColorSample = document.getElementById(this.prefix + '-text-color-sample');
    this.textColorText = document.getElementById(this.prefix + '-text-color-text');
    this.textColorMenu = document.getElementById(this.prefix + '-text-color-menu');
    this.themeRow = document.getElementById(this.prefix + '-theme-row');
    this.shadeGrid = document.getElementById(this.prefix + '-shade-grid');
    this.standardRow = document.getElementById(this.prefix + '-standard-row');
    this.otherColorButton = document.getElementById(this.prefix + '-other-color-btn');
    this.textColorPicker = document.getElementById(this.prefix + '-text-color-picker');
    if (!this.fontSizeControl || !this.textColorButton || !this.textColorMenu || !this.textColorPicker) return;

    this.buildColorPalette();

    const applyCurrent = () => {
      const node = this.selectedNode;
      if (!node) return;
      node.textSize = parseInt(this.fontSizeControl.value, 10) || this.defaultTextStyle.fontSize;
      const selectedColor = this.getSelectedTextColor();
      node.textColor = selectedColor || this.defaultTextStyle.color;
      const labelEl = document.getElementById(node.id)?.querySelector('.node-label');
      if (labelEl) this.applyNodeTextStyle(node, labelEl);
      this.refreshTextColorButton(node.textColor);
    };

    this.fontSizeControl.addEventListener('change', applyCurrent);
    this.textColorMenu.addEventListener('click', e => {
      const option = e.target.closest('[data-color]');
      if (!option) return;
      const selectedColor = option.dataset.color || '';
      const node = this.selectedNode;
      const previousState = node ? { textSize: node.textSize, textColor: node.textColor } : null;
      this.setTextColor(selectedColor);
      applyCurrent();
      if (node && previousState) {
        this.pushUndoAction({
          type: 'styleNode',
          nodeId: node.id,
          textSize: previousState.textSize,
          textColor: previousState.textColor,
        });
      }
      this.textColorPicker.open = false;
    });
    if (this.otherColorButton) {
      this.nativeColorInput = document.createElement('input');
      this.nativeColorInput.type = 'color';
      this.nativeColorInput.value = '#e5e7eb';
      this.nativeColorInput.style.position = 'fixed';
      this.nativeColorInput.style.left = '-9999px';
      this.nativeColorInput.style.opacity = '0';
      document.body.appendChild(this.nativeColorInput);
      this.otherColorButton.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.nativeColorInput.click();
      });
      this.nativeColorInput.addEventListener('input', () => {
        const selectedColor = this.nativeColorInput.value;
        const node = this.selectedNode;
        const previousState = node ? { textSize: node.textSize, textColor: node.textColor } : null;
        this.setTextColor(selectedColor);
        applyCurrent();
        if (node && previousState) {
          this.pushUndoAction({
            type: 'styleNode',
            nodeId: node.id,
            textSize: previousState.textSize,
            textColor: previousState.textColor,
          });
        }
        this.textColorPicker.open = false;
      });
    }
    document.addEventListener('click', e => {
      if (!this.textColorPicker.contains(e.target)) {
        this.textColorPicker.open = false;
      }
    });
    this.refreshTextColorButton(this.defaultTextStyle.color);
  }
  setTextColor(color) {
    this.selectedTextColor = color || '';
    this.updatePaletteSelection();
  }
  getSelectedTextColor() {
    return this.selectedTextColor || '';
  }
  refreshTextColorButton(color) {
    if (!this.textColorButton || !this.textColorSample || !this.textColorText) return;
    const isAuto = !color || color === this.defaultTextStyle.color;
    const activeColor = isAuto ? this.defaultTextStyle.color : color;
    const activeOption = isAuto ? this.textColorMenu?.querySelector('.diagram-color-auto-row') : this.textColorMenu?.querySelector(`.diagram-color-option[data-color="${activeColor}"]`);
    this.textColorSample.style.background = activeColor;
    this.textColorText.textContent = activeOption?.dataset.label || (isAuto ? '自動' : color);
    this.setTextColor(isAuto ? '' : color);
  }
  buildColorPalette() {
    if (!this.themeRow || !this.shadeGrid || !this.standardRow) return;
    const themeColors = [
      { label:'黒', color:'#111111', shades:['#f3f4f6','#d1d5db','#6b7280','#111111'] },
      { label:'赤', color:'#ef4444', shades:['#fee2e2','#fca5a5','#ef4444','#991b1b'] },
      { label:'灰', color:'#9ca3af', shades:['#f3f4f6','#d1d5db','#9ca3af','#4b5563'] },
      { label:'青', color:'#3b82f6', shades:['#dbeafe','#93c5fd','#3b82f6','#1d4ed8'] },
      { label:'水色', color:'#60a5fa', shades:['#dbeafe','#bfdbfe','#60a5fa','#2563eb'] },
      { label:'橙', color:'#f97316', shades:['#ffedd5','#fdba74','#f97316','#c2410c'] },
      { label:'銀', color:'#a3a3a3', shades:['#f5f5f5','#e5e7eb','#a3a3a3','#525252'] },
      { label:'黄', color:'#facc15', shades:['#fef9c3','#fde68a','#facc15','#ca8a04'] },
      { label:'青系', color:'#60a5fa', shades:['#eff6ff','#dbeafe','#60a5fa','#1d4ed8'] },
      { label:'緑', color:'#84cc16', shades:['#ecfccb','#bef264','#84cc16','#3f6212'] },
    ];
    const standardColors = ['#dc2626','#ff0000','#f59e0b','#ffea00','#84cc16','#10b981','#06b6d4','#0284c7','#1d4ed8','#7c3aed'];

    this.themeRow.innerHTML = themeColors.map(item => `
      <button type="button" class="diagram-color-option" data-color="${item.color}" data-label="${item.label}">
        <span class="diagram-color-option-swatch" style="background:${item.color}"></span>
      </button>
    `).join('');

    this.shadeGrid.innerHTML = themeColors.map(item => `
      <div class="diagram-color-shade-column" data-label="${item.label}">
        ${item.shades.map((shade, index) => `<button type="button" class="diagram-color-shade-option" data-color="${shade}" data-label="${item.label} ${index + 1}" style="background:${shade}"></button>`).join('')}
      </div>
    `).join('');

    this.standardRow.innerHTML = standardColors.map((color, index) => `
      <button type="button" class="diagram-color-option" data-color="${color}" data-label="標準 ${index + 1}">
        <span class="diagram-color-option-swatch" style="background:${color}"></span>
      </button>
    `).join('');
  }
  updatePaletteSelection() {
    if (!this.textColorMenu) return;
    this.textColorMenu.querySelectorAll('[data-color]').forEach(option => {
      option.classList.toggle('is-active', (option.dataset.color || '') === this.selectedTextColor);
    });
  }
  applyNodeTextStyle(node, labelEl) {
    if (!node || !labelEl) return;
    labelEl.style.fontSize = `${node.textSize || this.defaultTextStyle.fontSize}px`;
    labelEl.style.color = node.textColor || this.defaultTextStyle.color;
  }
  syncTextStyleControls(node) {
    if (!node || !this.fontSizeControl || !this.textColorButton) return;
    this.fontSizeControl.value = String(node.textSize || this.defaultTextStyle.fontSize);
    this.refreshTextColorButton(node.textColor || this.defaultTextStyle.color);
  }
  normalizeColor(color) {
    const fallback = this.defaultTextStyle.color;
    if (!color) return fallback;
    if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return fallback;
    const toHex = value => Number(value).toString(16).padStart(2, '0');
    return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
  }
  drawConnections() {
    this.svg.innerHTML = '<defs><marker id="arrow-'+this.prefix+'" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed"/></marker></defs>';
    this.connections.forEach(conn => {
      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;
      const cr = this.canvas.getBoundingClientRect();
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const x1 = fr.left + fr.width/2 - cr.left;
      const y1 = fr.top + fr.height/2 - cr.top;
      const x2 = tr.left + tr.width/2 - cr.left;
      const y2 = tr.top + tr.height/2 - cr.top;
      const mx = (x1+x2)/2, my = (y1+y2)/2;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',`M${x1},${y1} Q${mx},${y1} ${mx},${my} Q${mx},${y2} ${x2},${y2}`);
      path.setAttribute('fill','none');
      path.setAttribute('stroke','#7c3aed');
      path.setAttribute('stroke-width','2');
      path.setAttribute('marker-end',`url(#arrow-${this.prefix})`);
      path.setAttribute('opacity','0.7');
      this.svg.appendChild(path);
    });
  }
  clearAll() {
    const snapshot = this.captureSnapshot();
    this.nodes = []; this.connections = []; this.nodeIdCounter = 0;
    this.quickAddCounter = 0;
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.remove());
    this.svg.innerHTML = '';
    this.pushUndoAction({ type: 'clearAll', snapshot });
    showToast('キャンバスをクリアしました');
  }
  autoLayout() {
    const cols = Math.ceil(Math.sqrt(this.nodes.length));
    this.nodes.forEach((n,i) => {
      n.x = 80 + (i % cols) * 200;
      n.y = 60 + Math.floor(i / cols) * 120;
      const el = document.getElementById(n.id);
      if(el) { el.style.left = n.x+'px'; el.style.top = n.y+'px'; }
    });
    this.drawConnections();
    showToast('自動配置しました');
  }
  exportSVG() {
    const svgClone = this.svg.cloneNode(true);
    const w = this.canvas.offsetWidth, h = this.canvas.offsetHeight;
    svgClone.setAttribute('width', w);
    svgClone.setAttribute('height', h);
    svgClone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    // Add nodes as foreignObject
    this.nodes.forEach(n => {
      const fo = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
      fo.setAttribute('x',n.x); fo.setAttribute('y',n.y);
      fo.setAttribute('width','160'); fo.setAttribute('height','50');
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="background:#1f2937;border:2px solid ${n.color};border-radius:8px;padding:10px;display:flex;align-items:center;gap:8px;font-family:sans-serif;color:#e5e7eb;font-size:14px;">${n.icon} ${n.label}</div>`;
      svgClone.appendChild(fo);
    });
    const blob = new Blob([svgClone.outerHTML], {type:'image/svg+xml'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = this.prefix+'_diagram.svg'; a.click();
    showToast('SVGをエクスポートしました');
  }
}
