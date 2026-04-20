# UI Principles

## React Rendering Rules

- React is declarative: component logic describes what to render and React handles rendering.
- Components should only be used in JSX.
- Hooks should not be passed around as regular values.
- Hooks should not be called conditionally, in loops, or in nested functions.

## Reusable UI Logic

- React's official mechanism for reusing stateful UI logic is a custom Hook.
- Custom Hook names start with `use`.
