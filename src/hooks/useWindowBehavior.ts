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

export function useWindowBehavior(
  alwaysOnTop: boolean,
  setSettings: Dispatch<SetStateAction<AppSettings>>,
  enableCloseToTray: boolean,
) {
  useEffect(() => {
    void emit<SettingsSyncPayload>(SETTINGS_SYNC_EVENT, { alwaysOnTop });
  }, [alwaysOnTop]);

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
    let unlistenTrayEvent: (() => void) | undefined;

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
      unlistenTrayEvent?.();
    };
  }, [setSettings]);
}
