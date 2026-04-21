# Clock App 仕様書

## 0. 目的

macOS を前提に、**Tauri 2 + React + TypeScript + Vite** で動作するシンプルな時計アプリを実装する。

本アプリは以下を満たすことを目的とする。

- 起動すると、シンプルな時計ウィンドウが表示される
- ウィンドウ中央に、**時刻 / 日付 / 曜日 / 秒** が見やすく表示される
- **常に前面表示**を維持できる
- ログイン不要、同期不要、**ローカル完結**
- 将来的に「一言メッセージ」「時間帯テーマ」「軽いローカル知能」を追加できる
- macOS 向けに自然で、**Apple / Raycast のようなシンプルで洗練された UI** を MVP から備える
- GitHub で管理し、**CI / hooks / lint / test** を整備する

---

## 1. 技術選定

### 1.1 採用スタック

| 項目 | 採用 |
|---|---|
| デスクトップ基盤 | Tauri 2 |
| UI | React |
| 言語 | TypeScript |
| フロントビルド | Vite |
| スタイル | CSS Modules または素の CSS + design tokens |
| フロントテスト | Vitest |
| UI テスト | Testing Library |
| Rust テスト | cargo test |
| Git hooks | Lefthook |
| CI | GitHub Actions |
| パッケージ管理 | pnpm |

### 1.2 採用理由

- Tauri 2 は React / Vite などの既存 Web スタックを利用できる
- `always on top` を含むウィンドウ制御が可能
- Electron より軽量に構成しやすい
- Vite + Vitest の相性が良く、設定を共有しやすい
- GitHub Actions と GitHub Releases を前提にしたパイプラインを構築しやすい

Tauri 2 は任意のフロントエンドフレームワークを利用でき、プロジェクト作成ガイドや GitHub Actions / updater のガイドも提供されている。Vitest は Vite と統合しやすく、Vite 設定に `test` を追加する形で設定できる。 ([Tauri project creation](https://v2.tauri.app/start/create-project/?utm_source=chatgpt.com)) ([Tauri GitHub pipeline guide](https://v2.tauri.app/distribute/pipelines/github/?utm_source=chatgpt.com)) ([Vitest guide](https://vitest.dev/guide/)) ([Vitest config](https://vitest.dev/config/))

---

## 2. ローカル開発環境セットアップ

### 2.1 前提

このリポジトリでは、**Tauri / Rust 環境が未導入の macOS** でもセットアップできることを前提にする。

### 2.2 必要なソフトウェア

#### 必須

- Xcode
- Rust（rustup 経由）
- Node.js
- pnpm
- Git

Tauri の macOS 前提条件として、Xcode の導入と初回起動によるセットアップが案内されている。Rust は `rustup` による導入が標準で、Node.js はフロントエンドツールチェーンのために必要。 ([Tauri prerequisites](https://v2.tauri.app/start/prerequisites/?utm_source=chatgpt.com))

### 2.3 セットアップ手順

```bash
# 1. Xcode を App Store からインストール
# インストール後に一度起動し、初回セットアップを完了させる

# 2. Command Line Tools 確認
xcode-select --install

# 3. Rust をインストール
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 4. Node.js を導入（例: mise / fnm / nvm / Homebrew など任意）
# 例: Homebrew の場合
brew install node

# 5. pnpm を導入
corepack enable
corepack prepare pnpm@latest --activate

# 6. Lefthook を導入（Node 依存で管理する場合）
pnpm add -D lefthook

# 7. リポジトリ作成後に依存関係を導入
pnpm install

# 8. Git hooks を有効化
pnpm lefthook install
```

### 2.4 セットアップ確認コマンド

```bash
xcodebuild -version
rustc --version
cargo --version
node --version
pnpm --version
git --version
```

### 2.5 初回起動コマンド

```bash
pnpm tauri dev
```

---

## 3. プロダクト方針

### 3.1 MVP の位置づけ

MVP では以下を最優先とする。

1. 毎日起動して置いておけること
2. 見やすいこと
3. 壊れにくいこと
4. 将来拡張しやすいこと

### 3.2 MVP で入れないもの

- ログイン
- 同期
- クラウド保存
- AI 連携
- アラーム
- タイマー
- メニューバー常駐
- 自動更新の本番運用
- 通知多用

---

## 4. ロードマップ

## 4.1 MVP

### ゴール

**起動すると、前面固定された洗練された時計ウィンドウが表示され、秒まで含めて安定して見える。**

### 実装内容

- 時刻 `HH:mm:ss` 表示
- 日付 `YYYY-MM-DD` 表示
- 曜日 `月曜日` 表示
- 1 秒ごとの更新
- 起動時中央表示
- 常に前面表示
- ライト / ダーク対応
- シンプルで洗練された UI
- テスト基盤整備
- GitHub Actions チェックパイプライン整備
- Lefthook による pre-commit / pre-push 整備

## 4.2 V1

### ゴール

**毎日開いておきたくなる時計にする。**

### 追加内容

- 秒表示 ON/OFF
- 12/24 時間切替
- 曜日表示 ON/OFF
- テーマ切替（system / light / dark）
- 時間帯ごとの UI トーン変化
- 一言メッセージ表示
- 設定保存
- ウィンドウ透明度調整
- 前面固定 ON/OFF

## 4.3 V2

### ゴール

**時間を見るだけでなく、今の自分に合う軽い文脈を返す。**

### 追加内容

- 1日の流れ表示（Flow）
- 朝 / 夜の 1 行入力
- よく見る時間帯の学習
- ローカルの簡易提案ロジック
- 将来的なローカル LLM 連携の入口

---

## 5. MVP 仕様

## 5.1 機能要件

### 5.1.1 表示要件

中央に以下を縦並びで表示する。

1. 時刻
2. 日付
3. 曜日

#### 詳細

| 項目 | 仕様 |
|---|---|
| 時刻 | `HH:mm:ss` |
| 日付 | `YYYY-MM-DD` |
| 曜日 | `月曜日` |
| 配置 | ウィンドウ中央揃え |
| 更新頻度 | 1秒ごと |

### 5.1.2 ウィンドウ要件

| 項目 | 仕様 |
|---|---|
| ウィンドウ数 | 1 |
| 初期表示位置 | 画面中央 |
| 初期サイズ | 520 x 260 目安 |
| 最小サイズ | 460 x 220 |
| 前面固定 | ON |
| フレーム | MVP は標準タイトルバーありで可 |
| リサイズ | MVP は許可で可 |
| 閉じる | 通常通り可 |

### 5.1.3 非機能要件

- 起動から表示までが速い
- 数時間放置しても表示が崩れない
- CPU 使用率が低い
- ローカルのみで動作する
- ネットワーク接続がなくても利用可能

---

## 6. MVP UI / UX 仕様

## 6.1 UI 方向性

MVP から、**Apple / Raycast のようなシンプルで洗練された印象**を持たせる。

### キーワード

- ミニマル
- 静か
- 高級感
- 情報量を絞る
- コントラストが強すぎない
- 余白重視
- ガラス感は軽め
- 視認性優先

## 6.2 ビジュアル方針

### ベース

- 角丸大きめ
- 背景は薄い半透明または単色
- 軽い blur
- 薄い境界線
- 強すぎないシャドウ
- タイポグラフィ中心

### 文字組

- 時刻: 最も大きい
- 日付: 中サイズ
- 曜日: 小さめ
- 行間は広め
- 中央揃え

### ライトモード

- 白〜薄グレー基調
- 黒をベタで使いすぎない
- 境界線はごく薄く

### ダークモード

- 黒ではなく、濃いチャコール系
- 純白ではなくやや柔らかい文字色
- うっすらガラス感

## 6.3 デザイントークン例

```css
:root {
  --radius-xl: 24px;
  --radius-2xl: 28px;

  --font-time: 56px;
  --font-date: 18px;
  --font-weekday: 16px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 20px;
  --space-xl: 28px;

  --shadow-light: 0 12px 32px rgba(0, 0, 0, 0.08);
  --shadow-dark: 0 12px 32px rgba(0, 0, 0, 0.32);
}
```

## 6.4 MVP の UI 完成条件

- 一目で時刻が見える
- “開発者の試作品感” が出ない
- 主張が強すぎない
- ずっと前面にあっても邪魔に感じにくい

---

## 7. アーキテクチャ

## 7.1 ディレクトリ構成

```txt
clock-app/
  src/
    app/
      App.tsx
    components/
      ClockPanel.tsx
      TimeLine.tsx
      DateLine.tsx
      WeekdayLine.tsx
    hooks/
      useNow.ts
      useTheme.ts
    lib/
      datetime/
        formatTime.ts
        formatDate.ts
        formatWeekday.ts
      phase/
        getDayPhase.ts
      settings/
        settings.types.ts
        settings.repository.ts
    styles/
      globals.css
      tokens.css
      app.css
    test/
      setup.ts
  src-tauri/
    src/
      main.rs
      lib.rs
      commands/
    tauri.conf.json
  .github/
    workflows/
      ci.yml
  lefthook.yml
  package.json
  tsconfig.json
  vite.config.ts
```

## 7.2 責務分離

### React 側

- UI 表示
- 秒ごとの更新
- フォーマット処理
- テーマ反映
- 設定 UI

### Tauri / Rust 側

- ウィンドウ作成
- always on top 設定
- 将来のネイティブ機能の入口
- 配布 / build 設定

---

## 8. 状態・設定モデル

MVP では UI は最小限でも、設定モデルだけは先に用意する。

```ts
export type ThemeMode = 'system' | 'light' | 'dark'

export type AppSettings = {
  alwaysOnTop: boolean
  showSeconds: boolean
  timeFormat: '24h'
  showWeekday: boolean
  locale: 'ja-JP'
  themeMode: ThemeMode
  opacity: number
}
```

### MVP 初期値

```ts
export const defaultSettings: AppSettings = {
  alwaysOnTop: true,
  showSeconds: true,
  timeFormat: '24h',
  showWeekday: true,
  locale: 'ja-JP',
  themeMode: 'system',
  opacity: 1,
}
```

---

## 9. 実装詳細

## 9.1 時刻更新

### 方針

- `useNow()` hook で現在時刻を保持する
- 1秒ごとに更新する
- unmount 時に timer を解放する

### 将来拡張

- 秒境界に合わせた補正
- バックグラウンド復帰時の再同期

## 9.2 日付フォーマット

### 方針

- Date オブジェクトを直接 UI で処理しない
- `formatTime`, `formatDate`, `formatWeekday` に分離する

### 理由

- テストしやすい
- locale 変更に対応しやすい
- V1 の 12/24 時間切替に対応しやすい

## 9.3 時間帯ロジックの先行実装

V1 以降で利用する前提で、MVP から時間帯関数のみ用意してよい。

```ts
export type DayPhase = 'morning' | 'daytime' | 'evening' | 'night'
```

```ts
export function getDayPhase(date: Date): DayPhase {
  const hour = date.getHours()

  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'daytime'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}
```

---

## 10. テスト戦略

## 10.1 方針

macOS 前提では、Tauri のデスクトップ E2E を主軸に置くより、以下の組み合わせが現実的。

- フロントロジック: Vitest
- UI: Testing Library
- Rust: cargo test
- 実機確認: 手動スモークテスト

Tauri のテストガイドでは WebDriver ベースの E2E を案内しているが、macOS にはデスクトップ WebDriver クライアントがないため、macOS 向けではフロントと Rust のテストを厚くし、手動確認を組み合わせるのが堅実。 ([Tauri tests guide](https://v2.tauri.app/develop/tests/?utm_source=chatgpt.com))

## 10.2 テスト対象

### 単体テスト

- `formatTime`
- `formatDate`
- `formatWeekday`
- `getDayPhase`
- `defaultSettings`

### Hook テスト

- `useNow`
  - 1 秒ごとに更新される
  - unmount 時に interval を解除する

### UI テスト

- `ClockPanel` が時刻を表示する
- 日付が表示される
- 曜日が表示される
- テーマ class が反映される

### Rust テスト

- 設定初期値変換
- 将来 command を追加する前提のテスト基盤

## 10.3 手動スモークテスト

### 起動

- 起動時に 1 ウィンドウのみ表示される
- 画面中央に出る
- 初期サイズが適切

### 表示

- 時刻が秒ごとに更新される
- 日付 / 曜日が正しい
- フォント崩れがない

### ウィンドウ

- 常に前面表示される
- 他アプリ操作中でも見失わない
- 閉じる操作が正常

### テーマ

- macOS のライト / ダーク切替で崩れない

### 長時間確認

- 30 分以上放置で異常が出ない
- CPU 使用率が不自然に高くない

---

## 11. Git hooks 設計

Lefthook は高速な Git hooks manager として提供されており、単一バイナリで動作し、複数言語のプロジェクトで利用できる。 ([Lefthook repository](https://github.com/evilmartians/lefthook))

## 11.1 方針

### pre-commit

- staged 対象に対して軽量チェックを行う
- format / lint / type error の早期検出

### pre-push

- より重い検証を実行
- test / cargo test / build check を行う

## 11.2 `lefthook.yml` 例

```yml
pre-commit:
  parallel: true
  commands:
    format:
      glob: '*.{ts,tsx,js,jsx,json,css,md,yml,yaml}'
      run: pnpm format
    lint:
      glob: '*.{ts,tsx,js,jsx}'
      run: pnpm lint
    typecheck:
      glob: '*.{ts,tsx}'
      run: pnpm typecheck

pre-push:
  parallel: false
  commands:
    test-web:
      run: pnpm test:run
    test-rust:
      run: cargo test --manifest-path src-tauri/Cargo.toml
    build-web:
      run: pnpm build
```

## 11.3 注意

- pre-commit は重くしすぎない
- `tauri build` は pre-push では重すぎるため、CI に寄せる
- Rust が未セットアップの開発初期でも、README で導線を明記する

---

## 12. GitHub Actions 設計

Tauri の GitHub パイプラインガイドでは、`tauri-action` を使ってビルドや GitHub Release 連携を行う方法が案内されている。 ([Tauri GitHub pipeline guide](https://v2.tauri.app/distribute/pipelines/github/?utm_source=chatgpt.com))

## 12.1 MVP 時点の目的

MVP ではまず、**check 系 pipeline** を整備する。

### 実行内容

- install
- lint
- typecheck
- Vitest
- cargo test
- フロント build
- Tauri compile check 相当

## 12.2 `ci.yml` 例

```yml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  check:
    runs-on: macos-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install frontend deps
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Frontend test
        run: pnpm test:run

      - name: Rust test
        run: cargo test --manifest-path src-tauri/Cargo.toml

      - name: Frontend build
        run: pnpm build

      - name: Tauri build (check purpose)
        run: pnpm tauri build
```

## 12.3 将来拡張

### V1

- macOS ビルドアーティファクト保存
- draft release 作成

### V2

- GitHub Releases 自動作成
- updater 連携
- 必要に応じて署名 / notarization 対応

Tauri Updater は静的 JSON または GitHub Releases と連携できるが、更新パッケージには署名が必要。 ([Tauri updater](https://v2.tauri.app/plugin/updater/?utm_source=chatgpt.com))

---

## 13. スクリプト設計

`package.json` には少なくとも以下を持つ。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "prepare": "lefthook install"
  }
}
```

---

## 14. 実装タスク一覧

## 14.1 Sprint 1: 開発基盤と最小表示

- [ ] Tauri 2 + React + TypeScript + Vite プロジェクト作成
- [ ] pnpm 導入
- [ ] ESLint / Prettier / Vitest 導入
- [ ] Testing Library 導入
- [ ] Lefthook 導入
- [ ] `pnpm tauri dev` で起動確認
- [ ] ウィンドウ中央表示
- [ ] always on top 設定
- [ ] 時刻 / 日付 / 曜日表示

## 14.2 Sprint 2: UI 品質とテスト

- [ ] Apple / Raycast 風の UI 調整
- [ ] design tokens 導入
- [ ] ライト / ダーク対応
- [ ] `useNow` 実装
- [ ] formatter 分離
- [ ] Vitest 単体テスト追加
- [ ] Component test 追加
- [ ] cargo test 基盤追加

## 14.3 Sprint 3: 開発体験整備

- [ ] `lefthook.yml` 作成
- [ ] pre-commit / pre-push 運用開始
- [ ] GitHub Actions CI 作成
- [ ] README にセットアップ手順追加
- [ ] 手動スモークテスト手順を docs 化

## 14.4 V1

- [ ] 設定モデル永続化
- [ ] 秒表示 ON/OFF
- [ ] テーマ切替
- [ ] 前面固定 ON/OFF
- [ ] 一言表示
- [ ] 時間帯テーマ変化

## 14.5 V2

- [ ] 1日の flow 表示
- [ ] 朝 / 夜の 1 行入力
- [ ] ローカル提案ロジック
- [ ] ローカル LLM の検証口追加

---

## 15. 完了条件

## MVP 完了条件

以下を満たしたら MVP 完了とする。

- 起動時に時計ウィンドウが表示される
- 時刻 / 日付 / 曜日 / 秒が正しく表示される
- 常に前面表示される
- UI がシンプルで洗練されている
- フロント単体テストがある
- Rust テストがある
- GitHub Actions でチェックが回る
- Lefthook による pre-commit / pre-push が機能する
- セットアップ手順で新規 macOS 環境から起動できる

---

## 16. 次の実装候補

この仕様書の次に作るべきものは以下。

1. `README.md` 初版
2. `lefthook.yml` 実ファイル
3. `ci.yml` 実ファイル
4. `package.json` scripts
5. `vite.config.ts` の test 設定
6. `src/` の最小コード構成
7. `src-tauri/tauri.conf.json` 初版

