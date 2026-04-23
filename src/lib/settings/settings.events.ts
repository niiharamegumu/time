import type { AppSettings } from "./settings.types";

export const SETTINGS_SYNC_EVENT = "settings:sync";
export const ALWAYS_ON_TOP_CHANGED_EVENT = "settings:always-on-top-changed";

export type SettingsSyncPayload = AppSettings;

export type AlwaysOnTopChangedPayload = {
  alwaysOnTop: boolean;
};
