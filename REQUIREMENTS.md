# MY_APP - 統合カレンダーアプリケーション 要件定義書

**作成日**: 2026年4月24日  
**ステータス**: 実装中  
**バージョン**: 1.0  

---

## 1. プロジェクト概要

### 1.1 目的
Google CalendarおよびMicrosoft 365 Outlook のカレンダーを統一されたFlutterアプリケーション上で表示・管理し、複数のカレンダープロバイダーのイベントをシームレスに同期・表示する。

### 1.2 対象ユーザー
- Google Calendar と Microsoft 365 Outlook の両方を使用するビジネスユーザー
- 複数のカレンダーを一元管理したいユーザー

### 1.3 主要な特性
- **マルチプロバイダー対応**: Google + Microsoft 365 Outlook
- **リアルタイム同期**: OAuth 2.0による定期的な同期
- **オフライン対応**: Supabaseのローカルキャッシング
- **日本語ローカライズ**: 完全日本語UI対応

---

## 2. 機能要件

### 2.1 フロントエンド (Flutter アプリケーション)

#### 2.1.1 カレンダー表示機能 ✅ (実装済み)

| 機能 | 詳細 | ステータス |
|------|------|----------|
| **日ビュー表示** | 1日の予定を時間帯別に表示 | ✅ 実装済み |
| **月ビュー表示** | 月全体の予定サマリーを表示 | ✅ 実装済み |
| **週ビュー切り替え** | 日/月ビューの切り替え機能 | ✅ 実装済み |
| **日付ナビゲーション** | 前後の日付移動ボタン | ✅ 実装済み |
| **日付ピッカー** | カレンダー式の日付選択 | ✅ 実装済み |
| **週間日程表示** | 日ビュー時に週の日付を水平表示 | ✅ 実装済み |

#### 2.1.2 予定管理機能 ✅ (実装済み)

| 機能 | 詳細 | ステータス |
|------|------|----------|
| **予定の表示** | タイトル・時間・場所・参加者情報 | ✅ 実装済み |
| **予定の詳細表示** | クリック時に詳細ページを表示 | ✅ 実装済み |
| **カテゴリ表示** | 授業・面接などのカテゴリ分類 | ✅ 実装済み |
| **参加者一覧** | 予定の参加者を表示 | ✅ 実装済み |
| **通知設定表示** | 事前通知タイミングを表示 | ✅ 実装済み |
| **色分け表示** | カテゴリ別に異なる色で表示 | ✅ 実装済み |

#### 2.1.3 アカウント管理機能

| 機能 | 詳細 | ステータス |
|------|------|----------|
| **OAuth ログイン** | Google/Microsoft アカウント連携 | ⏳ 実装予定 |
| **アカウント情報表示** | ユーザーのプロフィール情報 | ⏳ 実装予定 |
| **複数アカウント管理** | 複数のカレンダープロバイダーを管理 | ⏳ 実装予定 |
| **トークン更新** | 有効期限切れトークンの自動更新 | ⏳ 実装予定 |

#### 2.1.4 UI/UX機能 ✅ (実装済み)

| 機能 | 詳細 | ステータス |
|------|------|----------|
| **ドロワーメニュー** | サイドメニューで各ページにアクセス | ✅ 実装済み |
| **ダークモード対応** | ライト/ダークテーマ切り替え | ✅ 実装済み |
| **日本語ローカライズ** | 完全日本語表示 (ja_JP) | ✅ 実装済み |
| **レスポンシブデザイン** | 複数デバイスサイズに対応 | ✅ 実装済み |

### 2.2 バックエンド (Python FastAPI)

#### 2.2.1 OAuth認証 ⏳ (実装予定)

| 機能 | 詳細 |
|------|------|
| **Google OAuth 2.0** | Google Calendar API アクセス権限取得 |
| **Microsoft OAuth 2.0** | Microsoft Graph API アクセス権限取得 |
| **トークン管理** | Access Token / Refresh Token の管理 |
| **トークン更新** | 期限切れトークンの自動更新 |
| **Scope管理** | プロバイダー別に必要な権限設定 |

#### 2.2.2 カレンダー同期エンジン ⏳ (実装予定)

| 機能 | 詳細 |
|------|------|
| **Google Calendar 同期** | Sync Token による差分同期 |
| **Microsoft 365 同期** | Delta Query による差分同期 |
| **初期同期** | プロバイダーから全イベント取得 |
| **差分同期** | 前回同期以降の変更分のみ取得 |
| **イベント統合** | Google + Microsoft のイベントを統一形式に変換 |
| **削除イベント処理** | 削除されたイベントのマーク処理 |

#### 2.2.3 データ永続化 ⏳ (実装予定)

| 機能 | 詳細 |
|------|------|
| **Supabase への保存** | イベント・アカウント情報をDB保存 |
| **キャッシング** | オフラインアクセス用ローカルキャッシュ |
| **データベース同期** | Flutter ↔ Supabase の同期管理 |

### 2.3 データベース (Supabase PostgreSQL) ⏳ (実装予定)

#### 2.3.1 コアテーブル

| テーブル | 説明 | 主要カラム |
|---------|------|----------|
| `profiles` | ユーザープロフィール | id, display_name, timezone |
| `calendar_accounts` | OAuth アカウント連携 | user_id, provider, provider_user_id, refresh_token, status |
| `calendars` | プロバイダーのカレンダー | account_id, provider_calendar_id, name, is_primary |
| `events` | 統一形式のイベント | user_id, calendar_id, title, start_at, end_at, etag, is_deleted |
| `event_attendees` | イベント参加者 | event_id, email, response_status |
| `event_reminders` | イベント通知設定 | event_id, method, minutes_before |
| `sync_cursors` | 同期状態 | account_id, cursor_type, cursor_value, last_synced_at |

#### 2.3.2 RLS (Row Level Security)
- ユーザーは自分のデータのみアクセス可能
- プロバイダー間のデータ共有なし

---

## 3. データモデル

### 3.1 AppointmentRecord (フロントエンド)

```dart
class _AppointmentRecord {
  final Appointment appointment;           // 基本情報 (開始時刻、終了時刻、タイトル、色)
  final String ownerName;                  // 担当者名
  final List<String> participants;         // 参加者一覧
  final String category;                   // カテゴリ (授業、面接など)
  final String location;                   // 場所
  final String notification;               // 通知設定
  final String description;                // 説明
}
```

### 3.2 Appointment (Syncfusion)

```
- startTime: DateTime         // 開始時刻
- endTime: DateTime           // 終了時刻
- subject: String             // タイトル
- color: Color                // 表示色
```

### 3.3 イベント統一モデル (バックエンド)

```python
{
  "event_id": "unique_identifier",
  "user_id": "user_uuid",
  "calendar_id": "calendar_uuid",
  "provider": "google" | "microsoft",
  "provider_event_id": "original_id_from_provider",
  "title": "予定タイトル",
  "description": "説明",
  "start_at": "2026-04-24T10:00:00Z",
  "end_at": "2026-04-24T12:00:00Z",
  "location": "会議室 302",
  "category": "meeting",
  "attendees": [
    {"email": "user@example.com", "response_status": "accepted"}
  ],
  "reminders": [
    {"method": "notification", "minutes_before": 15}
  ],
  "etag": "provider_etag",  # 差分同期用
  "is_deleted": false,
  "is_recurring": false,
  "created_at": "2026-04-24T09:00:00Z",
  "updated_at": "2026-04-24T09:30:00Z"
}
```

---

## 4. UI/画面構成

### 4.1 画面一覧

| 画面 | 説明 | ステータス |
|------|------|----------|
| **カレンダーメイン画面** | 日/月ビュー表示、予定管理 | ✅ 実装済み |
| **予定詳細画面** | 予定の詳細情報表示 | ✅ 実装済み |
| **アカウント情報画面** | ユーザーアカウント情報表示 | ⏳ 実装予定 |
| **予定編集画面** | 予定の作成・編集 | ⏳ 実装予定 |
| **OAuth ログイン画面** | Google/Microsoft ログイン | ⏳ 実装予定 |

### 4.2 ナビゲーション構造

```
├─ カレンダーメイン画面
│  ├─ 予定詳細画面
│  ├─ ドロワーメニュー
│  │  ├─ アカウント情報画面
│  │  └─ 予定編集画面
│  └─ 日付ピッカー
└─ OAuth ログイン画面 (初回のみ)
```

---

## 5. 技術仕様

### 5.1 フロントエンド環境

| 項目 | バージョン |
|------|-----------|
| Dart SDK | ^3.11.4 |
| Flutter | latest |
| Material Design | 3 |
| Syncfusion Flutter Calendar | 28.2.12 |
| intl (国際化) | 0.20.2 |
| http (HTTP通信) | 1.6.0 |

### 5.2 バックエンド環境

| 項目 | バージョン/詳細 |
|------|-----------------|
| Python | 3.9+ |
| フレームワーク | FastAPI |
| ORM | SQLAlchemy |
| 非同期処理 | asyncio, aiohttp |
| 認証 | OAuth 2.0 (google-auth, msal) |

### 5.3 外部API

| API | 目的 | エンドポイント |
|-----|------|---------------|
| Google Calendar API | イベント取得・同期 | https://www.googleapis.com/calendar/v3 |
| Google OpenID | ユーザー情報取得 | https://openidconnect.googleapis.com/v1/userinfo |
| Microsoft Graph API | イベント取得・同期 | https://graph.microsoft.com/v1.0 |
| Microsoft Identity | 認証 | https://login.microsoftonline.com |

### 5.4 データベース

| 項目 | 詳細 |
|------|------|
| DBMS | PostgreSQL (Supabase) |
| ユーザー認証 | Supabase Auth (JWT) |
| セキュリティ | RLS (Row Level Security) |
| リアルタイム機能 | Supabase Realtime |

---

## 6. 実装済み機能の詳細

### 6.1 コード構造 (index.dart)

#### 6.1.1 主要クラス構成

```
CalendarApp
  └─ _CalendarAppState
      └─ LookOnlyCalendar (ステートフルウィジェット)
          └─ _LookOnlyCalendarState
              ├─ SfCalendar (日/月ビュー)
              ├─ 週間表示 (日ビュー時)
              ├─ ドロワーメニュー
              └─ 子ページ
                  ├─ _AppointmentDetailPage
                  ├─ _MenuPage
                  └─ _AccountInfoPage
```

#### 6.1.2 リファクタリング適用 (10項目)

| # | 対象 | 改善内容 | 効果 |
|---|------|--------|------|
| 1 | ナビゲーションボタン生成 | `_buildDateMoveButton()` に統合 | 2個のボタンコード削除 |
| 2 | ビュー切り替えUI | `_buildViewToggle()` に統合 | 2個のInkWellコード削除 |
| 3 | 日付選択ロジック | `_selectDisplayDate()` に統合 | 3箇所の重複削除 |
| 4 | 日付正規化処理 | `_normalizeDate()` メソッド化 | 4箇所の重複削除 |
| 5 | メニュー定義 | `_drawerMenuItems` リスト駆動 | 5個のListTileコード削除 |
| 6 | ナビゲーション | `_MenuDestination` enum化 | 文字列ベースの脆弱性排除 |
| 7 | 予定検索 | `_appointmentRecordIndex` Map使用 | O(n) → O(1) に改善 |
| 8 | DateFormat フィールド化 | `_monthYearFormatter`, `_detailFormatter` | 9箇所の重複DateFormat削除 |
| 9 | 子ページAPI | `_AppointmentDetailPage` の簡素化 | nullable 引数を排除 |
| 10 | 週間日付生成 | `_weekDates` プロパティ化 | 計算ロジック集約 |

#### 6.1.3 主要メソッド一覧

| メソッド | 役割 | 行数 |
|---------|------|-----|
| `_buildDateMoveButton()` | 前後移動ボタン生成 | 10 |
| `_buildViewToggle()` | 日/月ビュー切り替えボタン | 12 |
| `_selectDisplayDate()` | 表示日付変更 + ビュー切り替え | 10 |
| `_moveDisplayDate()` | 日付の加算処理 (月跨ぎ対応) | 17 |
| `_changeCalendarView()` | カレンダービュー変更 | 5 |
| `_normalizeDate()` | 時刻を00:00:00に正規化 | 2 |
| `_isSameDate()` | 日付同一判定 | 3 |
| `_startOfWeek()` | 週の開始日(月曜)を計算 | 3 |
| `_pickDate()` | 日付ピッカーダイアログ | 13 |
| `_findRecord()` | Appointmentから詳細情報を検索 | 2 |

#### 6.1.4 状態管理

| 状態変数 | 型 | 役割 |
|---------|-----|------|
| `_displayDate` | DateTime | 現在表示している日付 |
| `_calendarView` | CalendarView | 現在のビューモード (day/month) |
| `_appointmentRecords` | List<_AppointmentRecord> | 予定データ一覧 |
| `_appointmentRecordIndex` | Map<String, _AppointmentRecord> | 予定への高速アクセスマップ |
| `_isDarkMode` | bool | ダークモード有効フラグ |

---

## 7. 実装予定機能

### 7.1 Phase 1: OAuth統合 ⏳

**期間**: 2026年4月下旬  
**成果物**: OAuth ログイン機能、トークン取得

- [ ] Google OAuth 2.0 フロー実装 (flutter_appauth)
- [ ] Microsoft OAuth 2.0 フロー実装 (flutter_appauth)
- [ ] Access Token / Refresh Token 保存 (Secure Storage)
- [ ] トークン有効期限チェック
- [ ] トークン自動更新ロジック

### 7.2 Phase 2: バックエンド構築 ⏳

**期間**: 2026年5月初旬  
**成果物**: Python FastAPI サーバー、OAuth管理、同期エンジン

- [ ] FastAPI プロジェクト初期設定
- [ ] Google Calendar API との連携
- [ ] Microsoft Graph API との連携
- [ ] Sync Token / Delta Query による差分同期
- [ ] イベント統一形式への変換
- [ ] タイムゾーン処理

### 7.3 Phase 3: Supabase連携 ⏳

**期間**: 2026年5月中旬  
**成果物**: PostgreSQL テーブル、RLS ポリシー、リアルタイム同期

- [ ] 7コアテーブル作成
- [ ] RLS ポリシー設定
- [ ] インデックス最適化
- [ ] リアルタイム更新設定

### 7.4 Phase 4: Flutter → バックエンド統合 ⏳

**期間**: 2026年5月下旬  
**成果物**: 実装されたカレンダー表示、同期機能

- [ ] Supabase Flutter パッケージ統合
- [ ] Realtime リスナー設定
- [ ] オフライン同期キュー
- [ ] 予定作成・編集・削除 API 連携

### 7.5 Phase 5: UI拡張 ⏳

**期間**: 2026年6月初旬  
**成果物**: 完全な予定管理UI

- [ ] 予定作成フォーム
- [ ] 予定編集フォーム
- [ ] 予定削除機能
- [ ] 参加者管理UI
- [ ] 通知設定UI

---

## 8. 非機能要件

### 8.1 パフォーマンス

| 項目 | 目標 |
|------|------|
| 初期起動時間 | < 3秒 |
| 月単位スクロール | < 500ms |
| 予定詳細表示 | < 300ms |
| API同期時間 | < 5秒 (100イベント) |
| キャッシュヒット率 | > 90% |

### 8.2 セキュリティ

| 項目 | 要件 |
|------|------|
| OAuth トークン | Secure Storage に暗号化保存 |
| ネットワーク通信 | HTTPS のみ使用 |
| RLS ポリシー | ユーザー間のデータ隔離 |
| Refresh Token | 安全な回転ロジック |

### 8.3 信頼性

| 項目 | 要件 |
|------|------|
| エラーハンドリング | すべてのAPI呼び出しに対応 |
| リトライロジック | 指数バックオフ実装 |
| データ同期ロック | 並行同期の防止 |
| バックアップ | Supabase のバージョン管理 |

### 8.4 ユーザビリティ

| 項目 | 要件 |
|------|------|
| 日本語ローカライズ | 完全対応 |
| ダークモード | サポート対応 |
| アクセシビリティ | Semantics ウィジェット活用 |
| オフライン表示 | キャッシュデータ表示 |

---

## 9. テスト方針

### 9.1 単体テスト

- [ ] 日付計算関数 (`_normalizeDate`, `_startOfWeek` など)
- [ ] 状態管理ロジック (`_selectDisplayDate`, `_moveDisplayDate`)
- [ ] バックエンド API レスポンスパース

### 9.2 統合テスト

- [ ] Google Calendar API 実装
- [ ] Microsoft Graph API 実装
- [ ] Supabase RLS ポリシー

### 9.3 UIテスト

- [ ] 日/月ビュー表示切り替え
- [ ] 予定詳細ページ表示
- [ ] ドロワーメニューナビゲーション
- [ ] ダークモード切り替え

### 9.4 性能テスト

- [ ] 1000+ イベントの表示パフォーマンス
- [ ] 同期処理のメモリ使用量
- [ ] バッテリー消費 (バックグラウンド同期)

---

## 10. リスク管理

| リスク | 影響度 | 対策 |
|--------|--------|------|
| OAuth トークン失効 | 高 | 自動更新 + ユーザーへの再認証案内 |
| API レート制限 | 中 | 同期間隔の調整、キューイング |
| データ競合 | 中 | Supabase RLS + 楽観的ロック |
| ネットワーク遅延 | 低 | キャッシング + オフラインモード |
| Provider API 変更 | 中 | バージョン管理 + テストの継続 |

---

## 11. 参考資料・連携API仕様

### 11.1 Google Calendar API

**OAuth Scope**:
```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/userinfo.profile
```

**主要エンドポイント**:
- `GET /calendars/primary` - プライマリカレンダー情報
- `GET /calendars/primary/events` - イベント一覧 (Sync Token サポート)
- `POST /calendars/primary/events` - イベント作成
- `PATCH /calendars/primary/events/{eventId}` - イベント更新
- `DELETE /calendars/primary/events/{eventId}` - イベント削除

### 11.2 Microsoft Graph API

**OAuth Scope**:
```
Calendars.Read
Calendars.Read.Shared
user.read
```

**主要エンドポイント**:
- `GET /me` - ユーザー情報
- `GET /me/calendars` - カレンダー一覧
- `GET /me/calendarview` - イベント一覧 (日付範囲指定)
- `POST /me/events` - イベント作成
- `PATCH /me/events/{eventId}` - イベント更新
- `DELETE /me/events/{eventId}` - イベント削除

### 11.3 Supabase テーブル例

**calendar_accounts テーブル**:
```sql
CREATE TABLE calendar_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  provider TEXT NOT NULL ('google' | 'microsoft'),
  provider_user_id TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMP,
  status TEXT ('active' | 'revoked'),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, provider)
);
```

---

## 12. 承認フロー

| 役割 | 承認者 | 日付 |
|------|--------|------|
| 要件確認 | [ユーザー名] | - |
| 技術設計承認 | [開発者] | - |
| 最終承認 | [PM/マネージャー] | - |

---

## 付録: ファイル構成

```
my_app/
├── lib/
│   ├── main.dart                      (旧 - 置き換え中)
│   ├── index.dart                     ✅ (メインアプリ)
│   └── email_response_test_page.dart  ✅ (OAuth テスト)
├── pubspec.yaml                       ✅ (依存関係)
├── REQUIREMENTS.md                    (このドキュメント)
├── android/
├── ios/
├── web/
├── linux/
├── macos/
└── windows/
```

---

**更新履歴**:
- 2026-04-24: 初版作成
