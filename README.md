# Time

Time は macOS 向けのシンプルな時計アプリです。Tauri 2、React、TypeScript、Vite を使い、常時表示しやすい軽い時計 UI とメニューバー常駐を提供します。

## App Overview

- 大きな時刻表示と日付表示
- 設定画面からの常に手前表示切り替え
- メニューバー常駐
- GitHub Releases からの手動アップデート確認

## Installation

- 配布ページ: [GitHub Releases](https://github.com/niiharamegumu/time/releases)
- macOS では最新 release の asset をダウンロードしてインストールします。

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
