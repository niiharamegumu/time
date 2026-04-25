import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "./settings.types";

export async function loadNativeSettings() {
  return invoke<unknown | null>("load_settings");
}

export async function saveNativeSettings(settings: AppSettings) {
  await invoke("save_settings", { settings });
}

export async function openSettingsWindow() {
  await invoke("open_settings");
}

export async function hideMainWindow() {
  await invoke("hide_main_window");
}

export async function quitTime() {
  await invoke("quit_time");
}

export async function setShowDockIcon(showDockIcon: boolean) {
  await invoke("set_show_dock_icon", { showDockIcon });
}
