import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  ALWAYS_ON_TOP_CHANGED_EVENT,
  SETTINGS_SYNC_EVENT,
  type AlwaysOnTopChangedPayload,
  type SettingsSyncPayload,
} from "../lib/settings/settings.events";
import type { AppSettings } from "../lib/settings/settings.types";

function areSettingsEqual(left: AppSettings, right: AppSettings) {
  return (
    left.alwaysOnTop === right.alwaysOnTop &&
    left.workProgressEnabled === right.workProgressEnabled &&
    left.workStartTime === right.workStartTime &&
    left.workEndTime === right.workEndTime &&
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
    if (!shouldEmitSettingsSync) {
      return;
    }

    void emit<SettingsSyncPayload>(SETTINGS_SYNC_EVENT, settings);
  }, [settings, shouldEmitSettingsSync]);

  useEffect(() => {
    if (!enableCloseToTray) {
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
      });

    return () => {
      unlistenCloseRequested?.();
    };
  }, [enableCloseToTray]);

  useEffect(() => {
    let unlistenSettingsSync: (() => void) | undefined;
    let unlistenTrayEvent: (() => void) | undefined;

    void listen<SettingsSyncPayload>(SETTINGS_SYNC_EVENT, (event) => {
      setSettings((currentSettings) =>
        areSettingsEqual(currentSettings, event.payload)
          ? currentSettings
          : event.payload,
      );
    }).then((unlisten) => {
      unlistenSettingsSync = unlisten;
    });

    void listen<AlwaysOnTopChangedPayload>(
      ALWAYS_ON_TOP_CHANGED_EVENT,
      (event) => {
        setSettings((currentSettings) => ({
          ...currentSettings,
          alwaysOnTop: event.payload.alwaysOnTop,
        }));
      },
    ).then((unlisten) => {
      unlistenTrayEvent = unlisten;
    });

    return () => {
      unlistenSettingsSync?.();
      unlistenTrayEvent?.();
    };
  }, [setSettings]);
}
