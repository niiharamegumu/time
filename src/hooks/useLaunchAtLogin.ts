import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppSettings } from "../lib/settings/settings.types";

export function useLaunchAtLogin(
  settings: AppSettings,
  setSettings: Dispatch<SetStateAction<AppSettings>>,
  enabled: boolean,
) {
  const loadedValueRef = useRef<boolean | null>(null);
  const desiredValueRef = useRef(settings.launchAtLogin);
  desiredValueRef.current = settings.launchAtLogin;

  useEffect(() => {
    if (!enabled) {
      loadedValueRef.current = null;
      return;
    }

    let active = true;

    void isEnabled()
      .then((launchAtLogin) => {
        if (!active) {
          return;
        }

        loadedValueRef.current = launchAtLogin;
        if (desiredValueRef.current === launchAtLogin) {
          return;
        }

        setSettings((currentSettings) =>
          currentSettings.launchAtLogin === launchAtLogin
            ? currentSettings
            : {
                ...currentSettings,
                launchAtLogin,
              },
        );
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [enabled, setSettings]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (loadedValueRef.current === null) {
      return;
    }

    if (loadedValueRef.current === settings.launchAtLogin) {
      return;
    }

    void (settings.launchAtLogin ? enable() : disable())
      .then(() => {
        loadedValueRef.current = settings.launchAtLogin;
      })
      .catch(() => undefined);
  }, [enabled, settings.launchAtLogin]);
}
