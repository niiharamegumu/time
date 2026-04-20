# Coding Standards

## React

- Use components in JSX instead of calling component functions directly.
- Call Hooks only at the top level.
- Call Hooks only from React function components or custom Hooks.
- Use custom Hooks to share stateful logic between components when extraction is helpful.

## Tauri

- Define Rust commands with `#[tauri::command]`.
- Register commands with `tauri::generate_handler!`.
- When commands are defined in a separate module, they should be marked `pub`.
- Prefer async commands for heavy work so the UI does not freeze.

## Vitest

- Vitest supports using the same Vite configuration as the app.
- Vitest supports TypeScript and JSX out of the box.
- Vitest supports mocking, snapshots, coverage, and component testing.
