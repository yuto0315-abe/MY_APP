/* ===== Requirements Tool ===== */
class RequirementsTool {
  constructor() {
    this.sections = [
      { id:'overview', title:'1. 概要', fields:[
        {label:'プロジェクト名',type:'input',value:''},
        {label:'プロジェクト目的',type:'textarea',value:''},
        {label:'対象ユーザー',type:'textarea',value:''},
        {label:'スコープ',type:'textarea',value:''},
      ]},
      { id:'functional', title:'2. 機能要件', fields:[
        {label:'機能一覧',type:'textarea',value:'例:\n・ユーザー登録/ログイン\n・ダッシュボード表示\n・データ検索・フィルタリング\n・レポート出力'},
        {label:'画面一覧',type:'textarea',value:''},
        {label:'外部インターフェース',type:'textarea',value:''},
      ]},
      { id:'nonfunctional', title:'3. 非機能要件', fields:[
        {label:'パフォーマンス要件',type:'textarea',value:''},
        {label:'可用性要件',type:'textarea',value:''},
        {label:'セキュリティ要件',type:'textarea',value:''},
        {label:'拡張性要件',type:'textarea',value:''},
      ]},
      { id:'constraints', title:'4. 制約条件', fields:[
        {label:'技術的制約',type:'textarea',value:''},
        {label:'スケジュール制約',type:'textarea',value:''},
        {label:'予算制約',type:'textarea',value:''},
      ]},
      { id:'glossary', title:'5. 用語定義', fields:[
        {label:'用語集',type:'textarea',value:'用語 | 定義\n---|---\n'},
      ]},
    ];
    this.activeSection = 0;
    this.render();
  }
  render() {
    const nav = document.getElementById('req-nav');
    nav.innerHTML = this.sections.map((s,i) =>
      `<div class="req-nav-item ${i===this.activeSection?'active':''}" onclick="app.requirements.selectSection(${i})">${s.title}</div>`
    ).join('');
    this.renderContent();
  }
  selectSection(i) {
    this.saveCurrentFields();
    this.activeSection = i;
    this.render();
  }
  renderContent() {
    const s = this.sections[this.activeSection];
    const content = document.getElementById('req-content');
    content.innerHTML = `<h2 style="margin-bottom:24px;font-size:1.2rem;">${s.title}</h2>` +
      s.fields.map((f,i) => `
        <div class="form-group">
          <label>${f.label}</label>
          ${f.type==='input'
            ? `<input class="form-input req-field" data-idx="${i}" value="${this.escHtml(f.value)}">`
            : `<textarea class="form-textarea req-field" data-idx="${i}" rows="4">${this.escHtml(f.value)}</textarea>`
          }
        </div>`
      ).join('');
  }
  saveCurrentFields() {
    const s = this.sections[this.activeSection];
    document.querySelectorAll('.req-field').forEach(el => {
      s.fields[parseInt(el.dataset.idx)].value = el.value;
    });
  }
  addSection() {
    showModal('セクション追加',
      `<div class="form-group"><label>セクション名</label><input class="form-input" id="new-sec-name"></div>`,
      () => {
        const name = document.getElementById('new-sec-name').value;
        if(name) {
          this.saveCurrentFields();
          this.sections.push({ id:'custom_'+Date.now(), title:`${this.sections.length+1}. ${name}`, fields:[{label:'内容',type:'textarea',value:''}]});
          this.activeSection = this.sections.length-1;
          this.render();
          showToast('セクションを追加しました');
        }
      }
    );
  }
  exportDoc() {
    this.saveCurrentFields();
    let doc = '# 要件定義書\n\n作成日: ' + new Date().toLocaleDateString('ja-JP') + '\n\n---\n\n';
    this.sections.forEach(s => {
      doc += `## ${s.title}\n\n`;
      s.fields.forEach(f => { doc += `### ${f.label}\n\n${f.value||'（未記入）'}\n\n`; });
      doc += '---\n\n';
    });
    const blob = new Blob([doc], {type:'text/markdown'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '要件定義書.md';
    a.click();
    showToast('要件定義書をエクスポートしました');
  }
  escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
}
