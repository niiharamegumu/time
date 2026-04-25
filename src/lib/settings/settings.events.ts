import type { AppSettings } from "./settings.types";

export const SETTINGS_SYNC_EVENT = "settings:sync";
export const ALWAYS_ON_TOP_CHANGED_EVENT = "settings:always-on-top-changed";
export const DISPLAY_MODE_CHANGED_EVENT = "settings:display-mode-changed";

export type SettingsSyncPayload = AppSettings;

export type AlwaysOnTopChangedPayload = {
  alwaysOnTop: boolean;
};

export type DisplayModeChangedPayload = {
  displayMode: AppSettings["displayMode"];
};
