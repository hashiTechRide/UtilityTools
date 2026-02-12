# WinForm → Next.js(React) Webアプリ移行提案

## 1. 背景と目的

現在、.NET Framework 4.8 WinForm (VB.NET) + オンプレOracle DBで製造業の社内システムを開発・運用している。
Excel管理からのシステム化、在庫管理、工程管理など多くの業務システムが稼働中。

本提案では、Webアプリが得意とする領域を明確にし、該当するシステムからNext.js(React)への段階的な移行を目指す。

---

## 2. Webアプリへの移行メリット

### 2.1 配布・展開コストの劇的な削減

| 項目 | WinForm | Webアプリ |
|------|---------|-----------|
| 初回配布 | 全PCにインストーラー配布・実行 | URLを共有するだけ |
| バージョンアップ | 全PCに再配布・再インストール | サーバー側デプロイのみ（即時全員反映） |
| .NETランタイム | 各PCにインストール必要 | 不要（ブラウザのみ） |
| 動作確認 | PC環境ごとに差異が出やすい | ブラウザが統一されていれば安定 |

> **実例**: 50台のPCにアプリ更新を配布する場合、WinFormでは数時間〜数日かかる作業が、Webアプリなら数分のデプロイで完了する。

### 2.2 マルチデバイス対応

- **現場タブレット**: 倉庫・製造ラインでタブレットからそのままアクセス可能
- **大型モニター**: 現場に設置したモニターにダッシュボードを常時表示
- **スマートフォン**: 管理者が外出先から状況確認
- **PC**: 従来通りのデスクワーク

WinFormでは各デバイス向けに別途開発が必要だが、レスポンシブWebアプリなら1つのコードベースで対応可能。

### 2.3 リアルタイム性・可視化

- WebSocket / Server-Sent Events によるリアルタイムデータ更新
- Recharts, Chart.js, D3.js など豊富な可視化ライブラリ
- アニメーション・インタラクティブなUIが容易に実現可能

### 2.4 開発エコシステムの広さ

- npm に100万以上のパッケージが存在
- UI コンポーネントライブラリ（shadcn/ui, MUI, Ant Design など）
- 豊富な学習リソース、コミュニティの活発さ
- GitHub Copilot 等AI支援ツールとの親和性が高い

### 2.5 人材確保

- VB.NET + WinForm のエンジニアは年々減少傾向
- React / Next.js は現在最も人気のあるフロントエンド技術の一つ
- 新卒・中途採用ともにWeb技術者の方が圧倒的に多い

---

## 3. Next.js を選ぶ理由

### 3.1 Next.js とは

React ベースのフルスタックWebフレームワーク。Vercel社が開発・メンテナンスしている。

### 3.2 Next.js の主な特徴

| 特徴 | 説明 |
|------|------|
| **App Router** | ファイルベースのルーティングで直感的なページ構成 |
| **Server Components** | サーバー側でレンダリングし、高速な初期表示を実現 |
| **API Routes** | フロントエンドと同じプロジェクト内にAPIを定義可能 |
| **TypeScript対応** | 型安全な開発が標準でサポート |
| **SSR / SSG / ISR** | 用途に応じた最適なレンダリング戦略を選択可能 |
| **ミドルウェア** | 認証・認可の制御が容易 |

### 3.3 社内システムに適している理由

- **API Routes でバックエンドも統合**: Oracle DBへの接続もAPI Routes経由で実装可能。フロントとバックが1プロジェクトで完結
- **段階的な移行が可能**: 既存のWinFormシステムと並行稼働しながら、画面単位で移行できる
- **認証・権限管理**: NextAuth.js 等で社内認証（Active Directory連携等）が容易
- **オンプレミスでもデプロイ可能**: Vercelだけでなく、Node.jsサーバーがあればオンプレでも動作する

---

## 4. Webアプリが得意とする領域（移行推奨システム）

### 4.1 移行に適しているもの ✅

| システム種別 | 理由 |
|-------------|------|
| **ダッシュボード・レポート系** | リアルタイム表示、グラフ可視化はWebが圧倒的に強い |
| **一覧・検索・参照系** | フィルタリング、ソート、ページネーションはWebの得意領域 |
| **承認ワークフロー系** | 外出先からの承認、通知連携が容易 |
| **在庫照会・棚卸** | 現場タブレットで即座に確認・入力が可能 |
| **工程進捗の可視化** | ガントチャート、カンバンボードなどリッチなUI |
| **Excel管理していたもの** | Web上でCRUD + 集計。Excel配布の手間がなくなる |
| **マスタメンテナンス** | シンプルなCRUD操作はWebアプリの基本 |

### 4.2 WinFormに残した方がよいもの ⚠️

| システム種別 | 理由 |
|-------------|------|
| **ローカルデバイス連携** | バーコードリーダー、計測機器との直接通信が必要な場合 |
| **大量データの高速グリッド操作** | 数万行のデータをExcelライクに高速編集する場合 |
| **オフライン必須** | ネットワーク接続が不安定な環境での入力 |
| **帳票印刷（複雑なレイアウト）** | 既存の帳票フォーマットへの厳密な出力 |

> **注意**: 上記も技術的にはWebで対応可能なケースが増えているが、現時点でのコスト対効果を考慮した判断。

---

## 5. サンプルアプリ仕様 — 製造管理ダッシュボード

WinFormチームに「Webアプリの実力」を体感してもらうためのデモアプリ。

### 5.1 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| UIライブラリ | Tailwind CSS + shadcn/ui |
| グラフ | Recharts |
| データ | モックデータ（JSON）※本番ではOracle DB接続 |

### 5.2 画面構成（4ページ）

#### ① ダッシュボード（トップページ）
- **KPIカード**: 本日の生産数、稼働率、不良率、目標達成率
- **生産推移グラフ**: 時間帯別の生産数（折れ線グラフ）
- **ライン別ステータス**: 稼働中 / 停止 / 段取替え をリアルタイム風に表示
- **アラート一覧**: 直近の異常・遅延通知

#### ② 在庫管理
- **在庫一覧テーブル**: 品番、品名、現在庫数、安全在庫、ステータス
- **検索・フィルタ**: 品番検索、カテゴリフィルタ、在庫状態フィルタ
- **在庫推移グラフ**: 選択した品目の在庫推移
- **入出庫登録モーダル**: 在庫の入庫/出庫を登録するフォーム

#### ③ 工程管理
- **カンバンボード表示**: 未着手 → 段取り → 加工中 → 検査 → 完了
- **ドラッグ&ドロップ**: 工程ステータスの変更（WinFormでは実現困難なUI）
- **製造指示一覧**: テーブル形式での一覧表示・フィルタ
- **進捗バー**: 各製造オーダーの進捗率を視覚的に表示

#### ④ マスタメンテナンス
- **製品マスタのCRUD**: 追加・編集・削除・検索
- **インライン編集**: テーブル上での直接編集（Excel感覚）
- **バリデーション**: リアルタイムの入力検証
- **CSVエクスポート**: データのCSV出力機能

### 5.3 共通機能

- **レスポンシブデザイン**: PC / タブレット / スマホ対応
- **サイドバーナビゲーション**: ページ間の遷移
- **ダークモード切替**: モダンWebアプリの体験
- **トースト通知**: 操作結果のフィードバック

### 5.4 プレゼンでの見せ方

1. **PC画面でダッシュボードを表示** → グラフやリアルタイム更新の美しさを見せる
2. **タブレット(またはブラウザのレスポンシブモード)に切り替え** → 同じURLで現場でも使えることを実演
3. **工程管理のドラッグ&ドロップを操作** → WinFormでは難しいインタラクティブUIを体感
4. **マスタメンテの操作** → 「これなら自分たちの業務でも使える」と思わせる
5. **開発者ツールでコードを見せる** → コードの読みやすさ、コンポーネント指向を紹介

---

## 6. 移行ロードマップ（案）

### Phase 1: パイロット（1〜2ヶ月）
- サンプルアプリをベースに、実際の1システム（マスタメンテ等）をWeb化
- チーム内でReact / Next.js の学習・ハンズオン

### Phase 2: 参照系システムの移行（3〜6ヶ月）
- ダッシュボード・レポート系のWeb化
- 在庫照会、工程進捗の可視化

### Phase 3: 業務系システムの移行（6〜12ヶ月）
- 在庫管理（入出庫）、工程管理のWeb化
- Oracle DB との API連携を本格構築

### Phase 4: 全面展開（12ヶ月〜）
- 残りの移行対象システムのWeb化
- WinForm の段階的な廃止

---

## 7. 技術的な移行パス

```
[現在]
WinForm (VB.NET) → Oracle DB (直接接続)

[移行後]
Next.js (React/TypeScript)
  ├── フロントエンド（ブラウザ）
  ├── API Routes（Node.js）
  └── Oracle DB (node-oracledb ドライバ経由)
```

- 既存のOracle DBはそのまま活用可能
- API層を挟むことで、将来的なDB移行（PostgreSQL等）も容易になる
- WinFormとWebアプリの並行稼働が可能（同じDBを参照）

---

## 8. 次のアクション

- [ ] サンプルアプリのデモ実施
- [ ] チーム内でのフィードバック収集
- [ ] パイロット対象システムの選定
- [ ] React / Next.js 学習計画の策定
- [ ] オンプレミス環境でのNode.jsサーバー構築検討

---

## 9. オフライン環境でのパッケージ管理

### 9.1 背景・制約

開発環境はコマンドプロンプト（npm, node等）からのWebアクセスが制限されている。
そのため、**インターネット接続可能な特定のPC**でnpmパッケージをダウンロードし、開発環境にはオフラインでインストールする運用が必要。

### 9.2 関連ファイル一覧

| ファイル | 用途 | 更新タイミング |
|---------|------|--------------|
| `package.json` | プロジェクトの依存関係定義 | ライブラリ追加・変更時 |
| `package-lock.json` | 依存関係の完全なバージョンロック | `npm install` 実行後に自動更新 |
| `package-urls.txt` | 全依存パッケージのダウンロードURL一覧 | `package-lock.json` 変更時に再生成 |
| `download-packages.ps1` | パッケージ一括ダウンロードスクリプト | 基本的に変更不要 |
| `install-offline.ps1` | オフラインインストールスクリプト | 基本的に変更不要 |

### 9.3 運用フロー

```
[インターネット接続可能なPC]              [開発環境PC（オフライン）]
                                          
1. package.json を編集                    
   （ライブラリ追加・削除・更新）          
                                          
2. npm install を実行                     
   → package-lock.json が更新される       
                                          
3. package-urls.txt を再生成（※後述）    
                                          
4. download-packages.ps1 を実行           
   → npm-packages/ に .tgz ファイル群     
     がダウンロードされる                 
                                          
5. 以下をUSB等で開発環境PCにコピー ───→  6. コピーしたファイルを配置
   - npm-packages/ フォルダ                  - プロジェクトルートに配置
   - package.json                         
   - package-lock.json                    7. install-offline.ps1 を実行
   - install-offline.ps1                     → node_modules/ が生成される
                                          
                                          8. npm run dev で開発開始
```

### 9.4 package-urls.txt の再生成方法

ライブラリに変更があった場合、`package-lock.json` から全依存パッケージのURLを抽出して `package-urls.txt` を更新する必要がある。

#### 方法: Node.jsスクリプトで生成

```javascript
// generate-package-urls.js
const lockfile = require('./package-lock.json');
const urls = new Set();

function extractUrls(packages) {
  for (const [name, info] of Object.entries(packages)) {
    if (info.resolved) {
      urls.add(info.resolved);
    }
    if (info.dependencies) {
      extractUrls(info.dependencies);
    }
  }
}

if (lockfile.packages) {
  // lockfileVersion 2 or 3
  for (const [path, info] of Object.entries(lockfile.packages)) {
    if (info.resolved && info.resolved.startsWith('https://')) {
      urls.add(info.resolved);
    }
  }
} else if (lockfile.dependencies) {
  // lockfileVersion 1
  extractUrls(lockfile.dependencies);
}

const sorted = [...urls].sort();
require('fs').writeFileSync('package-urls.txt', sorted.join('\n') + '\n');
console.log(`Generated package-urls.txt with ${sorted.length} URLs`);
```

実行:
```bash
node generate-package-urls.js
```

### 9.5 各スクリプトの使い方

#### download-packages.ps1（ダウンロード用PC）

```powershell
# 基本実行
powershell -ExecutionPolicy Bypass -File download-packages.ps1

# カスタムパラメータ
powershell -ExecutionPolicy Bypass -File download-packages.ps1 -urlsFile "package-urls.txt" -downloadDir "npm-packages"
```

- `package-urls.txt` と同じディレクトリで実行する
- ダウンロード済みファイルは自動スキップされる（差分ダウンロード可能）
- 失敗したURLは `failed-downloads.log` に記録される
- レート制限対策として100msのウェイトが入っている

#### install-offline.ps1（開発環境PC）

```powershell
# 基本実行
powershell -ExecutionPolicy Bypass -File install-offline.ps1

# カスタムパッケージディレクトリ指定
powershell -ExecutionPolicy Bypass -File install-offline.ps1 -packagesDir "npm-packages"
```

- `package.json`, `package-lock.json`, `npm-packages/` が同じディレクトリにある状態で実行する
- 既存の `node_modules/` は自動削除される
- npmのオフラインキャッシュ機能を利用してインストールする

### 9.6 ⚠️ ライブラリ変更時の必須手順チェックリスト

**ライブラリを追加・更新・削除するたびに、以下を必ず実施すること。**

- [ ] インターネット接続可能なPCで `npm install` を実行
- [ ] `package-lock.json` が更新されたことを確認
- [ ] `node generate-package-urls.js` を実行して `package-urls.txt` を再生成
- [ ] `download-packages.ps1` を実行して新しいパッケージをダウンロード
- [ ] 以下のファイルを開発環境PCにコピー:
  - `package.json`
  - `package-lock.json`
  - `npm-packages/` フォルダ（全 .tgz ファイル）
- [ ] 開発環境PCで `install-offline.ps1` を実行
- [ ] `npm run dev` で正常に動作することを確認

### 9.7 トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `install-offline.ps1` でエラー | `package-lock.json` と `.tgz` ファイルの不整合 | URLリストを再生成し、全パッケージを再ダウンロード |
| 一部パッケージのダウンロード失敗 | ネットワークの一時的な問題 | `download-packages.ps1` を再実行（既存ファイルはスキップされる） |
| `npm run dev` で起動しない | `node_modules/` のインストール不完全 | `node_modules/` を削除して `install-offline.ps1` を再実行 |
| 新しいパッケージが見つからない | `package-urls.txt` の更新漏れ | `generate-package-urls.js` で再生成してからダウンロード |
