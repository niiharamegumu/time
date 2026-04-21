# Time

macOS 向けのシンプルな時計アプリです。Tauri 2、React、TypeScript、Vite で構成し、Apple / Raycast 系の静かで洗練された UI を MVP として実装しています。

## MVP

- 1ウィンドウの時計表示
- `HH:mm:ss` の時刻表示
- `YYYY-MM-DD` の日付表示
- 日本語曜日の表示
- 1秒ごとの更新
- 起動時中央表示
- 常に前面表示
- ライト / ダーク両対応

## Setup

```bash
npm install
lefthook install
```

Rust / Tauri の前提が未セットアップなら、Xcode、Rust、Node.js を先に入れてください。
`lefthook install` は初回セットアップ時だけで構いません。

## Commands

```bash
npm run tauri:dev
npm run lint
npm run typecheck
npm run test:run
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```

## Verification

フロントと Rust の検証は以下を基準にしています。

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `npm run build`

## Manual Smoke Test

- `npm run tauri:dev` でアプリが 1 ウィンドウのみ起動する
- 起動時に中央へ表示される
- 秒ごとに時刻が更新される
- 日付と曜日が正しく表示される
- 常に前面表示される
- macOS のライト / ダーク切替で見た目が破綻しない
