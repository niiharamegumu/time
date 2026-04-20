# Tauri Rules

## Commands

- Tauri provides a command system for calling Rust functions from a web app.
- Commands can accept arguments, return values, return errors, and be asynchronous.
- Command names must be unique.
- Commands in `lib.rs` should not be declared `pub`.
- Commands defined in separate modules should be declared `pub`.
- Frontend code can call commands with `invoke("command_name")`.

## Window API

- Tauri exposes `setAlwaysOnTop(alwaysOnTop)` on the current window through the JavaScript window API.

## Project Creation

- Tauri officially supports React templates through `create-tauri-app`.
- `npm create tauri-app@latest` is an official creation path.
