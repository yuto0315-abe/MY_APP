/* ===== Proposal Tool ===== */
class ProposalTool {
  constructor() {
    this.initForm();
  }
  initForm() {
    const form = document.getElementById('proposal-form');
    form.innerHTML = `
      <h3 style="margin-bottom:20px;">プロジェクト情報</h3>
      <div class="form-group">
        <label>プロジェクト種別</label>
        <select class="form-select" id="proj-type">
          <option value="">選択してください</option>
          <option value="web">Webアプリケーション</option>
          <option value="mobile">モバイルアプリ</option>
          <option value="api">API / マイクロサービス</option>
          <option value="ai">AI / 機械学習</option>
          <option value="iot">IoTシステム</option>
          <option value="enterprise">業務システム</option>
          <option value="ec">ECサイト</option>
          <option value="cms">CMS / ポータル</option>
        </select>
      </div>
      <div class="form-group">
        <label>規模</label>
        <select class="form-select" id="proj-scale">
          <option value="small">小規模（〜5人）</option>
          <option value="medium">中規模（5〜20人）</option>
          <option value="large">大規模（20人〜）</option>
        </select>
      </div>
      <div class="form-group">
        <label>重視するポイント</label>
        <select class="form-select" id="proj-priority">
          <option value="speed">開発スピード</option>
          <option value="performance">パフォーマンス</option>
          <option value="security">セキュリティ</option>
          <option value="scalability">スケーラビリティ</option>
          <option value="cost">コスト削減</option>
        </select>
      </div>
      <div class="form-group">
        <label>プロジェクト概要</label>
        <textarea class="form-textarea" id="proj-desc" placeholder="プロジェクトの概要を入力..."></textarea>
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="app.proposal.generate()">🚀 提案を生成</button>`;
  }
  generate() {
    const type = document.getElementById('proj-type').value;
    const scale = document.getElementById('proj-scale').value;
    const priority = document.getElementById('proj-priority').value;
    if (!type) { showToast('プロジェクト種別を選択してください'); return; }
    const db = {
      web: {
        langs: ['TypeScript','JavaScript','Python','Go'],
        frameworks: ['React','Next.js','Vue.js','Django','Express'],
        services: ['AWS','Vercel','Firebase','Cloudflare'],
        features: ['SPA/SSR','認証','REST API','WebSocket','CI/CD'],
      },
      mobile: {
        langs: ['Dart','Kotlin','Swift','TypeScript'],
        frameworks: ['Flutter','React Native','SwiftUI','Jetpack Compose'],
        services: ['Firebase','AWS Amplify','Supabase'],
        features: ['プッシュ通知','オフライン対応','カメラ','GPS','生体認証'],
      },
      api: {
        langs: ['Go','Rust','TypeScript','Python','Java'],
        frameworks: ['Gin','Actix','NestJS','FastAPI','Spring Boot'],
        services: ['AWS Lambda','Docker/K8s','API Gateway','Redis'],
        features: ['RESTful','GraphQL','gRPC','キャッシュ','レート制限'],
      },
      ai: {
        langs: ['Python','R','Julia','C++'],
        frameworks: ['PyTorch','TensorFlow','scikit-learn','LangChain'],
        services: ['AWS SageMaker','GCP Vertex AI','Azure ML','Hugging Face'],
        features: ['モデル学習','推論API','データパイプライン','MLOps'],
      },
      iot: {
        langs: ['C/C++','Python','Rust','MicroPython'],
        frameworks: ['ESP-IDF','Arduino','MQTT','Node-RED'],
        services: ['AWS IoT Core','Azure IoT Hub','ThingsBoard'],
        features: ['センサーデータ収集','リアルタイム監視','エッジ計算','OTA更新'],
      },
      enterprise: {
        langs: ['Java','C#','TypeScript','Python'],
        frameworks: ['Spring Boot','ASP.NET','Angular','React'],
        services: ['AWS','Azure','Oracle Cloud','SAP'],
        features: ['SSO認証','権限管理','帳票出力','ワークフロー','監査ログ'],
      },
      ec: {
        langs: ['TypeScript','PHP','Python','Ruby'],
        frameworks: ['Next.js','Laravel','Shopify API','Stripe'],
        services: ['AWS','Shopify','Stripe','SendGrid'],
        features: ['決済連携','在庫管理','検索','レコメンド','通知'],
      },
      cms: {
        langs: ['TypeScript','PHP','Python'],
        frameworks: ['Next.js','WordPress','Strapi','Contentful'],
        services: ['Vercel','AWS S3','Cloudinary'],
        features: ['WYSIWYG編集','メディア管理','SEO','多言語対応','RBAC'],
      },
    };
    const data = db[type];
    const priorityMap = {
      speed: { tip: '開発スピードを重視する場合、フルスタックフレームワークとBaaSの活用を推奨します。', highlight: 1 },
      performance: { tip: 'パフォーマンス重視の場合、コンパイル言語やCDN活用を検討してください。', highlight: 0 },
      security: { tip: 'セキュリティ重視の場合、型安全な言語とWAF・認証基盤の導入を推奨します。', highlight: 0 },
      scalability: { tip: 'スケーラビリティ重視の場合、マイクロサービスとコンテナオーケストレーションを推奨します。', highlight: 2 },
      cost: { tip: 'コスト重視の場合、サーバーレスアーキテクチャとOSSの活用を推奨します。', highlight: 2 },
    };
    const pInfo = priorityMap[priority];
    const results = document.getElementById('proposal-results');
    results.innerHTML = `
      <div style="padding:16px;border-radius:8px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);margin-bottom:8px;">
        <strong>💡 アドバイス:</strong> ${pInfo.tip}
      </div>
      <div>
        <h4 style="margin-bottom:10px;">📝 推奨プログラミング言語</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${data.langs.map(l => `<span class="tech-tag lang">${l}</span>`).join('')}
        </div>
      </div>
      <div>
        <h4 style="margin-bottom:10px;">⚙️ フレームワーク / ライブラリ</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${data.frameworks.map(f => `<span class="tech-tag">${f}</span>`).join('')}
        </div>
      </div>
      <div>
        <h4 style="margin-bottom:10px;">☁️ 推奨サービス</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${data.services.map(s => `<span class="tech-tag service">${s}</span>`).join('')}
        </div>
      </div>
      <div>
        <h4 style="margin-bottom:10px;">🔧 推奨機能</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${data.features.map(f => `<span class="tech-tag">${f}</span>`).join('')}
        </div>
      </div>`;
    showToast('提案を生成しました');
  }
}
