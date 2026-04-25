import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  ALWAYS_ON_TOP_CHANGED_EVENT,
  DISPLAY_MODE_CHANGED_EVENT,
  SETTINGS_SYNC_EVENT,
  type AlwaysOnTopChangedPayload,
  type DisplayModeChangedPayload,
  type SettingsSyncPayload,
} from "../lib/settings/settings.events";
import type { AppSettings } from "../lib/settings/settings.types";
import { canUseTauriInternals } from "../lib/tauri/canUseTauriInternals";

function areSettingsEqual(left: AppSettings, right: AppSettings) {
  return (
    left.schemaVersion === right.schemaVersion &&
    left.alwaysOnTop === right.alwaysOnTop &&
    left.launchAtLogin === right.launchAtLogin &&
    left.showDockIcon === right.showDockIcon &&
    left.timezone === right.timezone &&
    left.displayMode === right.displayMode &&
    left.workProgressEnabled === right.workProgressEnabled &&
    left.workStartTime === right.workStartTime &&
    left.workEndTime === right.workEndTime &&
    left.breakEnabled === right.breakEnabled &&
    left.breakStartTime === right.breakStartTime &&
    left.breakEndTime === right.breakEndTime &&
    left.workDays.join(",") === right.workDays.join(",") &&
    left.showSeconds === right.showSeconds &&
    left.timeFormat === right.timeFormat &&
    left.showWeekday === right.showWeekday &&
    left.locale === right.locale &&
    left.themeMode === right.themeMode &&
    left.opacity === right.opacity
  );
}

export function useWindowBehavior(
  settings: AppSettings,
  setSettings: Dispatch<SetStateAction<AppSettings>>,
  enableCloseToTray: boolean,
  shouldEmitSettingsSync = true,
) {
  useEffect(() => {
    if (!shouldEmitSettingsSync || !canUseTauriInternals()) {
      return;
    }

    void emit<SettingsSyncPayload>(SETTINGS_SYNC_EVENT, settings).catch(
      () => undefined,
    );
  }, [settings, shouldEmitSettingsSync]);

  useEffect(() => {
    if (!enableCloseToTray || !canUseTauriInternals()) {
      return undefined;
    }

    const currentWindow = getCurrentWindow();
    let unlistenCloseRequested: (() => void) | undefined;

    void currentWindow
      .onCloseRequested((event) => {
        event.preventDefault();
        void currentWindow.hide();
      })
      .then((unlisten) => {
        unlistenCloseRequested = unlisten;
      })
      .catch(() => undefined);

    return () => {
      unlistenCloseRequested?.();
    };
  }, [enableCloseToTray]);

  useEffect(() => {
    if (!canUseTauriInternals()) {
      return undefined;
    }

    let unlistenSettingsSync: (() => void) | undefined;
    let unlistenTrayEvent: (() => void) | undefined;
    let unlistenDisplayModeEvent: (() => void) | undefined;

    void listen<SettingsSyncPayload>(SETTINGS_SYNC_EVENT, (event) => {
      setSettings((currentSettings) =>
        areSettingsEqual(currentSettings, event.payload)
          ? currentSettings
          : event.payload,
      );
    }).then((unlisten) => {
      unlistenSettingsSync = unlisten;
    }).catch(() => undefined);

    void listen<AlwaysOnTopChangedPayload>(
      ALWAYS_ON_TOP_CHANGED_EVENT,
      (event) => {
        setSettings((currentSettings) =>
          currentSettings.alwaysOnTop === event.payload.alwaysOnTop
            ? currentSettings
            : {
                ...currentSettings,
                alwaysOnTop: event.payload.alwaysOnTop,
              },
        );
      },
    ).then((unlisten) => {
      unlistenTrayEvent = unlisten;
    }).catch(() => undefined);

    void listen<DisplayModeChangedPayload>(
      DISPLAY_MODE_CHANGED_EVENT,
      (event) => {
        setSettings((currentSettings) =>
          currentSettings.displayMode === event.payload.displayMode
            ? currentSettings
            : {
                ...currentSettings,
                displayMode: event.payload.displayMode,
              },
        );
      },
    ).then((unlisten) => {
      unlistenDisplayModeEvent = unlisten;
    }).catch(() => undefined);

    return () => {
      unlistenSettingsSync?.();
      unlistenTrayEvent?.();
      unlistenDisplayModeEvent?.();
    };
  }, [setSettings]);
}
