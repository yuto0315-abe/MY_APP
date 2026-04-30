/* ===== Core Application ===== */
class App {
  constructor() {
    this.currentTool = 'dashboard';
    this.initNav();
    this.initDashboard();
    this.proposal = new ProposalTool();
    this.requirements = new RequirementsTool();
  }
  initNav() {
    document.querySelectorAll('.sidebar nav a').forEach(a => {
      a.addEventListener('click', () => {
        const tool = a.dataset.tool;
        document.querySelectorAll('.sidebar nav a').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
        document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
        document.getElementById(tool).classList.add('active');
        this.currentTool = tool;
        // Lazy init
        if (tool === 'architecture' && !this.architecture) this.architecture = new DiagramTool('arch', archComponents, { paletteMode: 'dropdown' });
        if (tool === 'uml' && !this.uml) this.uml = new DiagramTool('uml', umlComponents);
        if (tool === 'layout' && !this.layout) this.layout = new LayoutTool();
        if (tool === 'erdiagram' && !this.erdiagram) this.erdiagram = new ERDiagramTool();
        if (tool === 'gantt' && !this.gantt) this.gantt = new GanttTool();
      });
    });
  }
  initDashboard() {
    const features = [
      { id:'proposal', icon:'💡', title:'技術スタック提案', desc:'プロジェクトに最適な言語・フレームワーク・サービスをAIが提案' },
      { id:'requirements', icon:'📋', title:'要件定義書作成', desc:'テンプレートベースで要件定義書を効率的に作成・出力' },
      { id:'architecture', icon:'🏗️', title:'システム構成図', desc:'ドラッグ&ドロップでシステムアーキテクチャを設計' },
      { id:'uml', icon:'🔄', title:'UML・画面遷移図', desc:'状態遷移図や画面フローを視覚的に作成' },
      { id:'layout', icon:'📐', title:'画面レイアウト', desc:'ワイヤーフレームをドラッグ&ドロップで構築' },
      { id:'erdiagram', icon:'🗃️', title:'E-R図', desc:'エンティティとリレーションシップを直感的に設計' },
      { id:'gantt', icon:'📅', title:'ガントチャート', desc:'プロジェクトスケジュールを視覚的に管理' },
    ];
    const container = document.getElementById('dashboard-cards');
    container.innerHTML = features.map(f => `
      <div class="card feature-card" data-nav="${f.id}">
        <div class="card-icon">${f.icon}</div>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
        <span class="card-arrow">→</span>
      </div>
    `).join('');
    container.querySelectorAll('.feature-card').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelector(`.sidebar nav a[data-tool="${c.dataset.nav}"]`).click();
      });
    });
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}

function showModal(title, bodyHtml, onConfirm) {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <h2>${title}</h2>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modal-cancel">キャンセル</button>
          <button class="btn btn-primary" id="modal-confirm">確定</button>
        </div>
      </div>
    </div>`;
  container.querySelector('#modal-cancel').onclick = () => container.innerHTML = '';
  container.querySelector('#modal-confirm').onclick = () => { if(onConfirm) onConfirm(); container.innerHTML = ''; };
  container.querySelector('.modal-overlay').addEventListener('click', e => { if(e.target === e.currentTarget) container.innerHTML = ''; });
}

// --- Hamburger menu toggle (mobile) ---
document.addEventListener('DOMContentLoaded', () => {
  // instantiate app
  if (!window.app) window.app = new App();

  const ham = document.getElementById('hamburger');
  const overlay = document.getElementById('menu-overlay');

  function closeMenu() { document.body.classList.remove('menu-open'); }
  function toggleMenu() { document.body.classList.toggle('menu-open'); }

  if (ham) ham.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close menu when navigation link clicked (mobile)
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    a.addEventListener('click', () => { closeMenu(); });
  });
});
