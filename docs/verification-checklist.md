# Verification Checklist

## Project Commands

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `npm run build`

## Official Tooling Notes

- Vitest can run tests using the same Vite configuration as the app.
- Vitest supports component testing and type testing.
- Tauri provides `dev` and `build` commands through its CLI.

## Reporting Rule

- If a command cannot be run because the project is not scaffolded yet, report that directly.
