---
name: tauri-implementation
description: Use this when implementing or modifying Tauri and React integration in this repository. Apply it to Rust commands, invoke handling, and window APIs such as always-on-top.
---

# Tauri Implementation

## Workflow

1. Read [docs/tauri-rules.md](../../../docs/tauri-rules.md).
2. Use Tauri commands when frontend code needs to call Rust.
3. Register commands with `tauri::generate_handler!`.
4. Use the official window API when the change involves window behavior.
5. Read [docs/coding-standards.md](../../../docs/coding-standards.md) if the change also affects React components or Hooks.
