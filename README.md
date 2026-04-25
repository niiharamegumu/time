# Time

Time は macOS 向けのシンプルな時計アプリです。Tauri 2、React、TypeScript、Vite を使い、常時表示しやすい軽い時計 UI とメニューバー常駐を提供します。

## App Overview

- 大きな時刻表示と日付表示
- 設定画面からの常に手前表示切り替え
- メニューバー常駐
- GitHub Releases からの手動アップデート確認

## Installation

リリース済みのアプリは GitHub Releases からダウンロードできます。

1. [GitHub Releases](https://github.com/niiharamegumu/time/releases) を開きます。
2. 一番上の最新 release を開きます。
3. `Assets` から macOS 用の `.dmg` ファイルをダウンロードします。
4. ダウンロードした `.dmg` を開き、`Time.app` を `Applications` にドラッグします。
5. `Applications` から `Time` を起動します。

`latest.json`、`.tar.gz`、`.sig` はアプリ内アップデート用の asset です。通常の初回インストールでは `.dmg` を使ってください。

macOS の Gatekeeper により初回起動時に確認が出る場合があります。その場合は、Finder の `Applications` で `Time.app` を右クリックして `開く` を選び、確認ダイアログでもう一度 `開く` を選択してください。

Release からダウンロードしたアプリが「壊れているため開けません」と表示される場合は、修正済みの新しい release を使ってください。

## Updating

- 設定画面の「更新をチェック」から GitHub Releases 上の `latest.json` を参照して更新を確認します。
- 更新がある場合は、設定画面からダウンロードとインストールを開始できます。
- インストール完了後はアプリを再起動してください。

## Development Setup

```bash
npm install
lefthook install
```

Rust / Tauri の前提が未セットアップなら、Xcode、Rust、Node.js を先に入れてください。
`lefthook install` は初回セットアップ時だけで構いません。

## Development Commands

```bash
npm run tauri:dev
npm run lint
npm run typecheck
npm run test:run
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```

## Release Flow

- PR の検証は [ci.yml](/Users/megu/Github/time/.github/workflows/ci.yml) が担当します。
- `main` に push されると [release.yml](/Users/megu/Github/time/.github/workflows/release.yml) が `src-tauri/tauri.conf.json` の `version` から `v{version}` を組み立て、同じ tag の release が未作成のときだけ release を作成します。
- Tauri updater 用の `latest.json` は GitHub Release asset として同時に公開されます。

## Required Repository Configuration

- GitHub Secrets
  - `TAURI_SIGNING_PRIVATE_KEY`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- GitHub Variables
  - `TAURI_UPDATER_PUBKEY`

公開鍵は release workflow が `src-tauri/tauri.conf.json` の placeholder を置換して注入します。詳細は [docs/release.md](/Users/megu/Github/time/docs/release.md) と [docs/update.md](/Users/megu/Github/time/docs/update.md) を参照してください。

## Icon Assets

- Web の favicon / ロゴは `public/logo.png` を使います。
- Tauri の配布アイコンは `src-tauri/icon-source.svg` を元に生成します。
- メニューバー用アイコンは `src-tauri/tray-icon-source.svg` を元に生成します。
- 再生成コマンド:

```bash
npm run tauri -- icon src-tauri/icon-source.svg -o src-tauri/icons
npm run tauri -- icon src-tauri/tray-icon-source.svg -o src-tauri/icons/tray-template
```

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `npm run build`
