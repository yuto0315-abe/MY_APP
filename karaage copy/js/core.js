/* ===== Core Application ===== */

/**
 * セクション定義: html/ フォルダのパーシャルファイルと対応
 * id       — <section> の id 属性 / サイドバーの data-tool 値
 * file     — html/ 内のファイル名
 * default  — 初期表示時に active にするかどうか
 */
const SECTIONS = [
  { id: 'dashboard',    file: 'html/dashboard.html',    default: true },
  { id: 'proposal',     file: 'html/proposal.html' },
  { id: 'requirements', file: 'html/requirements.html' },
  { id: 'architecture', file: 'html/architecture.html' },
  { id: 'uml',          file: 'html/uml.html' },
  { id: 'layout',       file: 'html/layout.html' },
  { id: 'erdiagram',    file: 'html/erdiagram.html' },
  { id: 'gantt',        file: 'html/gantt.html' },
];

class App {
  constructor() {
    this.currentTool = 'dashboard';
  }

  /**
   * HTMLパーシャルを読み込んでから各機能を初期化する
   */
  async init() {
    await this.loadSections();
    this.initNav();
    this.initDashboard();
    this.proposal = new ProposalTool();
    this.requirements = new RequirementsTool();
  }

  /**
   * html/ フォルダのパーシャルファイルを fetch し、
   * <main> 内に <section> として挿入する
   */
  async loadSections() {
    const main = document.getElementById('main-content');
    const results = await Promise.all(
      SECTIONS.map(async (sec) => {
        try {
          const res = await fetch(sec.file);
          if (!res.ok) throw new Error(`${sec.file}: ${res.status}`);
          const html = await res.text();
          return { ...sec, html };
        } catch (err) {
          console.error(`[loadSections] Failed to load ${sec.file}:`, err);
          return { ...sec, html: `<p style="color:var(--danger);">セクションの読み込みに失敗しました</p>` };
        }
      })
    );

    results.forEach((sec) => {
      const section = document.createElement('section');
      section.id = sec.id;
      section.className = 'tool-section' + (sec.default ? ' active' : '');
      section.innerHTML = sec.html;
      main.appendChild(section);
    });
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

// Helper to open the architecture shape palette from the toolbar.
function openArchShapeMenu() {
  const tryCall = () => {
    if (window.app && app.architecture && typeof app.architecture.openPaletteMenu === 'function') {
      app.architecture.openPaletteMenu();
      return true;
    }
    return false;
  };

  if (tryCall()) return;

  // If the app exists but the architecture tool hasn't been created yet,
  // instantiate it here so the toolbar button can work without requiring
  // a separate sidebar navigation click.
  if (window.app && !app.architecture) {
    try {
      // Try to trigger the architecture section to initialize (click sidebar nav)
      const navAnchor = document.querySelector('.sidebar nav a[data-tool="architecture"]');
      if (navAnchor) navAnchor.click();
      // If clicking didn't create it immediately, try to instantiate as fallback
      if (!app.architecture) app.architecture = new DiagramTool('arch', archComponents, { paletteMode: 'dropdown' });
      // Give it a short moment to build DOM and then open menu.
      setTimeout(() => { tryCall(); }, 120);
      return;
    } catch (err) {
      console.warn('[openArchShapeMenu] failed to create app.architecture', err);
    }
  }

  // Fallback retry loop (for cases where app isn't ready yet)
  const timeout = 2000; // retry window
  const start = Date.now();
  const retry = () => {
    if (tryCall()) return;
    if (Date.now() - start > timeout) {
      console.warn('[openArchShapeMenu] app.architecture not ready');
      return;
    }
    setTimeout(retry, 80);
  };
  setTimeout(retry, 80);
}

// --- Hamburger menu toggle (mobile) ---
document.addEventListener('DOMContentLoaded', async () => {
  // instantiate app & load HTML partials
  if (!window.app) {
    window.app = new App();
    await window.app.init();
  }

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
