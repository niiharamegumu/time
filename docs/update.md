# Update Guide

## Overview

- updater は Tauri v2 の updater plugin を使います。
- endpoint は GitHub Releases の `latest.json` です。
- 現在の設定では macOS 向け release を前提にしています。

## Runtime Configuration

- [src-tauri/tauri.conf.json](/Users/megu/Github/time/src-tauri/tauri.conf.json)
  - `bundle.createUpdaterArtifacts`
  - `plugins.updater.endpoints`
  - `plugins.updater.pubkey`
- [src-tauri/capabilities/default.json](/Users/megu/Github/time/src-tauri/capabilities/default.json)
  - `updater:default`

ローカルソースでは `bundle.createUpdaterArtifacts: false` とし、`plugins.updater.pubkey` も置きません。release workflow が公開鍵を注入し、`bundle.createUpdaterArtifacts: true` に切り替えます。公開鍵がないビルドでは Rust 側で updater plugin を初期化しないため、通常の開発ビルドは維持されます。

## In-App Flow

- 設定画面で「更新をチェック」を押す
- `@tauri-apps/plugin-updater` の `check()` を呼ぶ
- 更新ありなら version と notes を表示する
- 「ダウンロードしてインストール」で `downloadAndInstall()` を呼ぶ
- 完了後は再起動案内を表示する

初期実装では起動時の自動更新チェック、beta/stable channel 切り替え、インストール後の自動再起動は入れていません。

## Keys

- private key
  - 署名に使う
  - GitHub Secrets にのみ置く
- public key
  - クライアントが update asset の署名検証に使う
  - GitHub Variable から workflow 内で config に注入する

private key を失うと既存ユーザー向けに継続 release できなくなるため、安全な保管とバックアップが必要です。

## Troubleshooting

- 設定画面で「このビルドではまだ利用できません」と出る
  - `plugins.updater.pubkey` が注入されていないか、開発ビルドです。
- `latest.json` が見つからない
  - release workflow が skip されたか、`tauri-action` の upload に失敗しています。
- 署名検証で失敗する
  - `TAURI_SIGNING_PRIVATE_KEY` と `TAURI_UPDATER_PUBKEY` が同じ鍵ペアか確認してください。
- 更新が見つからない
  - 最新 GitHub release tag と app version の関係、`latest.json` の asset 更新を確認してください。
