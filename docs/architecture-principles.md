# Architecture Principles

## Tauri

- Tauri supports using many frontend frameworks, including React, through `create-tauri-app`.
- Tauri provides commands and an event system for communication between the frontend and Rust.
- Commands may accept arguments, return values, return errors, and be asynchronous.
- Commands can live in `src-tauri/src/lib.rs` or in separate Rust modules.
- Tauri runtime authority enforces which windows can access which commands at runtime.

## React

- React is declarative: components describe what to render and React decides how to render it.
- Components should only be used in JSX.
- Hooks may only be called from React function components or custom Hooks.
- Custom Hooks are the supported way to extract reusable stateful logic.

## Window APIs

- Tauri exposes window APIs through `@tauri-apps/api/window`.
- `setAlwaysOnTop()` is part of the official window API.
