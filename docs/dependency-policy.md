# Dependency Policy

## Official Package Surface

- Tauri projects can be created with `npm create tauri-app@latest`.
- Tauri frontend window APIs are provided by `@tauri-apps/api/window`.
- React provides the component and Hook model used by the frontend.
- Vitest is designed to work with Vite and supports TypeScript and component testing.

## Reference Rule

- When a change depends on Tauri, React, or Vitest behavior, consult the official documentation for that package before adding code that relies on it.
