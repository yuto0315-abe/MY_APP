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
  constructor(prefix, components) {
    this.prefix = prefix;
    this.components = components;
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.connectingFrom = null;
    this.nodeIdCounter = 0;
    this.canvas = document.getElementById(prefix + '-canvas');
    this.svg = document.getElementById(prefix + '-svg');
    this.initPalette();
    this.initCanvasEvents();
  }
  initPalette() {
    const palette = document.getElementById(this.prefix + '-palette');
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
    document.getElementById(this.prefix+'-connect-mode').addEventListener('click', () => {
      this.connectMode = !this.connectMode;
      document.getElementById(this.prefix+'-connect-mode').style.background =
        this.connectMode ? 'rgba(124,58,237,0.2)' : '';
      this.canvas.style.cursor = this.connectMode ? 'crosshair' : 'default';
      showToast(this.connectMode ? '接続モード: ONー ノードをクリックして接続' : '接続モード: OFF');
    });
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
  }
  addNode(comp, x, y) {
    const id = this.prefix + '_node_' + (this.nodeIdCounter++);
    const node = { id, icon: comp.icon, label: comp.label, color: comp.color, x, y };
    this.nodes.push(node);
    this.renderNode(node);
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
    // Drag
    let dragging = false, ox, oy;
    el.addEventListener('mousedown', e => {
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
          this.connectingFrom = null;
        }
        return;
      }
      dragging = true;
      this.selectNode(node, el);
      ox = e.clientX - node.x;
      oy = e.clientY - node.y;
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      node.x = e.clientX - ox;
      node.y = e.clientY - oy;
      el.style.left = node.x + 'px';
      el.style.top = node.y + 'px';
      this.drawConnections();
    });
    document.addEventListener('mouseup', () => { dragging = false; });
    // Double click to rename
    el.addEventListener('dblclick', () => {
      const newName = prompt('ノード名を入力:', node.label);
      if (newName) { node.label = newName; el.querySelector('.node-label').textContent = newName; }
    });
    // Port click for connection
    el.querySelectorAll('.node-port').forEach(port => {
      port.addEventListener('mousedown', e => {
        e.stopPropagation();
        if (!this.connectingFrom) {
          this.connectingFrom = node;
          this.connectMode = true;
          el.classList.add('selected');
        }
      });
    });
    this.canvas.appendChild(el);
  }
  selectNode(node, el) {
    this.deselectAll();
    this.selectedNode = node;
    el.classList.add('selected');
  }
  deselectAll() {
    this.selectedNode = null;
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.classList.remove('selected'));
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
    this.nodes = []; this.connections = []; this.nodeIdCounter = 0;
    this.canvas.querySelectorAll('.diagram-node').forEach(n => n.remove());
    this.svg.innerHTML = '';
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
