import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  loadNativeSettings,
  saveNativeSettings,
} from "../lib/settings/settings.native";
import {
  loadSettings,
  normalizeSettings,
  saveSettings,
} from "../lib/settings/settings.storage";
import type { AppSettings } from "../lib/settings/settings.types";
import { canUseTauriInternals } from "../lib/tauri/canUseTauriInternals";

export function useAppSettings(): [
  AppSettings,
  Dispatch<SetStateAction<AppSettings>>,
] {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [nativeSettingsLoaded, setNativeSettingsLoaded] = useState(false);

  useEffect(() => {
    if (import.meta.env.MODE === "test" || !canUseTauriInternals()) {
      return;
    }

    let active = true;

    void loadNativeSettings()
      .then((storedSettings) => {
        if (active && storedSettings !== null) {
          setSettings(normalizeSettings(storedSettings));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setNativeSettingsLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!nativeSettingsLoaded) {
      return;
    }

    void saveNativeSettings(settings).catch(() => undefined);
  }, [nativeSettingsLoaded, settings]);

  return [settings, setSettings];
}
