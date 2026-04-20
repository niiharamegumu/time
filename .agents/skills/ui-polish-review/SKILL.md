---
name: ui-polish-review
description: Use this when checking React UI code in this repository against the official React rules for components, Hooks, and custom Hooks.
---

# UI Polish Review

## Workflow

1. Read [docs/ui-principles.md](../../../docs/ui-principles.md).
2. Check that components are used in JSX.
3. Check that Hooks are only called from components or custom Hooks and only at the top level.
4. Check whether reusable stateful logic should live in a custom Hook.
