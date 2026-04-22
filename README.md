# Time

macOS 向けのシンプルな時計アプリです。Tauri 2、React、TypeScript、Vite で構成し、Apple / Raycast 系の静かで洗練された UI を MVP として実装しています。

## MVP

- 1ウィンドウの時計表示
- `HH:mm:ss` の時刻表示
- `YYYY-MM-DD` の日付表示
- 日本語曜日の表示
- 1秒ごとの更新
- 起動時中央表示
- 常時最前面の切替
- メニューバー常駐
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

## Icon Assets

- Web の favicon / ロゴは `public/logo.png` を使います。
- Tauri の配布アイコンは `src-tauri/icon-source.svg` を元に生成します。
- メニューバー用アイコンは `src-tauri/tray-icon-source.svg` を元に生成します。
- 再生成コマンド:

```bash
npm run tauri -- icon src-tauri/icon-source.svg -o src-tauri/icons
npm run tauri -- icon src-tauri/tray-icon-source.svg -o src-tauri/icons/tray-template
```

## Manual Smoke Test

- `npm run tauri:dev` でアプリが 1 ウィンドウのみ起動する
- 起動時に中央へ表示される
- 秒ごとに時刻が更新される
- 日付と曜日が正しく表示される
- 設定から常時最前面を切り替えられる
- 閉じる操作で終了せず、メニューバーに残る
- メニューバーから再表示と終了ができる
- macOS のライト / ダーク切替で見た目が破綻しない
