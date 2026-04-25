export function canUseTauriInternals() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
