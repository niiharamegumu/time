# Tauri + GitHub Actions 自動リリース / 自動アップデート 実装仕様（ミニマム版）

## 目的

- `main` にマージされたら、自動でリリース処理を行う
- GitHub Releases を配布元にする
- Tauri の自動更新機能で更新を検知できるようにする
- アプリ内の設定画面から手動で更新チェックできるようにする
- README と最低限の運用ドキュメントを整理する

---

## 前提

- Tauri v2 を利用する
- GitHub Actions を利用する
- GitHub Releases を配布元にする
- Tauri Updater Plugin を利用する
- Apple App Store は使わない

---

## 実装方針

### 1. CI と Release を分離する

#### `ci.yml`

- PR 時の検証専用
- lint / test / build を実行する
- release はしない

#### `release.yml`

- `main` への push をトリガーにする
- バージョン差分がある場合のみ release を実行する
- GitHub Release に成果物を upload する

### 2. リリース判定

初期実装では、以下のルールにする。

- **アプリのバージョンが上がっているときだけ release する**
- バージョンが上がっていなければ release しない

> どのファイルをバージョンの正とするかは調査して決めること  
> 例: `package.json` / `src-tauri/tauri.conf.json` / その他

### 3. Tauri Updater を導入する

以下を満たすようにする。

- updater plugin を導入する
- updater 用成果物を生成する
- 公開鍵を設定する
- GitHub Releases の `latest.json` を参照する
- 必要な capability / permission を有効にする

> 実際の設定ファイル名、設定場所、permission の持たせ方は現状構成を調査して決めること

### 4. アプリ内の更新導線

初期実装では **自動チェックは必須にしない**。  
まずは設定画面に以下を用意する。

- 「更新をチェック」ボタン
- 更新がある場合の案内表示
- ダウンロード / インストール導線
- 更新中の状態表示
- 最新だった場合の表示

必要なら後で以下を追加できる構成にする。

- 起動時の自動更新チェック
- beta / stable チャンネル切り替え
- 更新通知の ON / OFF

### 5. GitHub Secrets

最低限、以下を GitHub Secrets で管理する。

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`（必要な場合）

> 鍵の生成方法、保管方法、ローテーション方針は調査して決めること

---

## 対象ファイル

最低限、以下を対象にする。

```txt
.github/workflows/ci.yml
.github/workflows/release.yml
src-tauri/tauri.conf.*
src-tauri/capabilities/*
README.md
docs/release.md
docs/update.md
```

---

## README / ドキュメント

### `README.md`

最低限、以下を整理する。

- アプリ概要
- インストール方法
- 配布ページへの導線
- 更新方法
- 開発方法

### `docs/release.md`

- リリースの流れ
- バージョン更新ルール
- release 実行条件
- 失敗時の確認ポイント

### `docs/update.md`

- updater の仕組み
- 公開鍵 / 秘密鍵の扱い
- 更新確認の動き
- トラブルシュート

---

## 調査して決めること

以下は実装前に確認して決めること。

- バージョン管理の正となるファイル
- 既存の build コマンド / release コマンド
- updater の設定ファイル位置
- 設定画面の実装箇所
- Windows/macOS の配布成果物の扱い
- 今後、自動更新を起動時にも行うかどうか