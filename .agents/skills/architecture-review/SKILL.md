---
name: architecture-review
description: Use this when checking whether a change follows the official Tauri and React structure used in this repository. Apply it to command boundaries, frontend/Rust communication, component rendering, and Hook usage.
---

# Architecture Review

## Workflow

1. Read [docs/architecture-principles.md](../../../docs/architecture-principles.md).
2. Read [docs/tauri-rules.md](../../../docs/tauri-rules.md) when the change touches Rust or window APIs.
3. Read [docs/coding-standards.md](../../../docs/coding-standards.md) when the change touches React components or Hooks.
4. Check whether components are rendered through JSX, Hooks are used according to React rules, and Tauri commands follow the documented command structure.
