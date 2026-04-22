import { type AppSettings, defaultSettings } from "./settings.types";

export const APP_SETTINGS_STORAGE_KEY = "time.app.settings";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function getStorage(storage?: StorageLike) {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readBoolean(
  value: Record<string, unknown>,
  key: keyof AppSettings,
  fallback: boolean,
) {
  return typeof value[key] === "boolean" ? value[key] : fallback;
}

function readNumber(
  value: Record<string, unknown>,
  key: keyof AppSettings,
  fallback: number,
) {
  return typeof value[key] === "number" ? value[key] : fallback;
}

function readString<T extends string>(
  value: Record<string, unknown>,
  key: keyof AppSettings,
  fallback: T,
) {
  return typeof value[key] === "string" ? (value[key] as T) : fallback;
}

export function normalizeSettings(value: unknown): AppSettings {
  if (!isRecord(value)) {
    return { ...defaultSettings };
  }

  return {
    alwaysOnTop: readBoolean(
      value,
      "alwaysOnTop",
      defaultSettings.alwaysOnTop,
    ),
    showSeconds: readBoolean(value, "showSeconds", defaultSettings.showSeconds),
    timeFormat: readString(value, "timeFormat", defaultSettings.timeFormat),
    showWeekday: readBoolean(value, "showWeekday", defaultSettings.showWeekday),
    locale: readString(value, "locale", defaultSettings.locale),
    themeMode: readString(value, "themeMode", defaultSettings.themeMode),
    opacity: readNumber(value, "opacity", defaultSettings.opacity),
  };
}

export function loadSettings(storage?: StorageLike): AppSettings {
  const activeStorage = getStorage(storage);
  const storedValue = activeStorage?.getItem(APP_SETTINGS_STORAGE_KEY);

  if (!storedValue) {
    return { ...defaultSettings };
  }

  try {
    return normalizeSettings(JSON.parse(storedValue));
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: AppSettings, storage?: StorageLike) {
  const activeStorage = getStorage(storage);

  activeStorage?.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
