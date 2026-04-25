# Release Guide

## Overview

- release は [release.yml](/Users/megu/Github/time/.github/workflows/release.yml) で管理します。
- trigger は `main` への push です。
- GitHub Releases を配布元として利用します。
- Tauri updater 用の `latest.json` も同じ release に upload します。

## Version Rule

- version の正は [src-tauri/tauri.conf.json](/Users/megu/Github/time/src-tauri/tauri.conf.json) の `version` です。
- [package.json](/Users/megu/Github/time/package.json) と [src-tauri/Cargo.toml](/Users/megu/Github/time/src-tauri/Cargo.toml) の version は同じ値を維持します。
- release workflow は 3 つの version が一致しない場合に fail します。
- release 前の version 更新は `npm run version:bump -- <major|minor|patch|x.y.z>` で一元化します。

## Release Condition

- 現在の app version から `v{version}` を組み立てます。
- GitHub Releases に同じ tag が既に存在するかを確認します。
- `v{version}` が存在する場合は release を skip します。
- `v{version}` が未作成の場合だけ release を作成します。

## Required GitHub Configuration

- Secrets
  - `TAURI_SIGNING_PRIVATE_KEY`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- Variables
  - `TAURI_UPDATER_PUBKEY`

`TAURI_UPDATER_PUBKEY` は公開鍵なので secret ではなく repository variable を想定しています。

## Key Generation

```bash
npm run tauri signer generate -- -w ~/.tauri/time.key
```

- 生成された private key の内容、または key file path を `TAURI_SIGNING_PRIVATE_KEY` に設定します。
- パスフレーズを付けた場合は `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` も設定します。
- 表示される public key を `TAURI_UPDATER_PUBKEY` に登録します。

## Failure Checklist

- version が 3 ファイルで一致しているか
- `TAURI_UPDATER_PUBKEY` が設定されているか
- `TAURI_SIGNING_PRIVATE_KEY` と password が正しいか
- `tauri-action` が `latest.json` と macOS updater asset を upload できているか
- `v{version}` の release tag が既に作成済みでないか
