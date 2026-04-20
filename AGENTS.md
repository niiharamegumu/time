# AGENTS.md

## Repo Summary

- This repository is for a macOS app built with Tauri 2, React, TypeScript, and Vite.
- Codex can be guided by `AGENTS.md` files in a repository, and OpenAI recommends clear documentation, configured development environments, and reliable test setups for best results.

## Stack

- Desktop shell: Tauri 2
- Frontend: React
- Language: TypeScript
- Build tool: Vite
- Test runner: Vitest
- Package manager: npm
- Git hooks: Lefthook

## Setup Commands

- `npm install`
- `lefthook install`

## Run / Build / Test Commands

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `npm run build`
- `npm run tauri dev`

## Official Framework Rules

- Tauri provides a command primitive for calling Rust from the frontend with type safety.
- Tauri commands can be defined in `src-tauri/src/lib.rs` or in separate modules and registered with `invoke_handler`.
- Tauri's window API supports `setAlwaysOnTop(true)` from JavaScript.
- React components should be used in JSX and should not be called directly as regular functions.
- Hooks may only be called at the top level of function components or custom Hooks.
- Custom Hooks are the React mechanism for extracting and reusing stateful logic.
- Vitest uses Vite configuration and supports TypeScript, JSX, mocking, snapshots, coverage, and component testing.

## Verification

- Run the relevant project commands after changes.
- If a command is not available yet because the project is not scaffolded, state that clearly.

## Skills

- Use `tauri-implementation` when work involves Tauri commands, Rust/frontend communication, or window APIs.
- Use `test-and-verify` when selecting and running project verification commands.
- Use `architecture-review` when checking whether code follows the official Tauri and React structure described in this repository's docs.
- Use `release-guard` when running the full verification set before a release build.
