import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { loadSettings, saveSettings } from "../lib/settings/settings.storage";
import type { AppSettings } from "../lib/settings/settings.types";

export function useAppSettings(): [
  AppSettings,
  Dispatch<SetStateAction<AppSettings>>,
] {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  return [settings, setSettings];
}
