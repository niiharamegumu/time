import { type AppSettings, defaultSettings } from "./settings.types";
import {
  DEFAULT_WORK_DAYS,
  normalizeWorkSchedule,
  type WorkDay,
} from "./workSchedule";

export const APP_SETTINGS_STORAGE_KEY = "time.app.settings";
const CURRENT_SCHEMA_VERSION = 2;

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

function readWorkDays(value: unknown) {
  const validDays = new Set<WorkDay>([
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ]);

  if (!Array.isArray(value)) {
    return [...DEFAULT_WORK_DAYS];
  }

  const days = value.filter((day): day is WorkDay => validDays.has(day));

  return days.length > 0 ? days : [...DEFAULT_WORK_DAYS];
}

function readDisplayMode(
  value: Record<string, unknown>,
): AppSettings["displayMode"] {
  const displayMode = value.displayMode;

  return displayMode === "standard" ||
    displayMode === "minimal" ||
    displayMode === "focus" ||
    displayMode === "ambient"
    ? displayMode
    : defaultSettings.displayMode;
}

export function normalizeSettings(value: unknown): AppSettings {
  if (!isRecord(value)) {
    return { ...defaultSettings };
  }

  const savedSchemaVersion =
    typeof value.schemaVersion === "number" ? value.schemaVersion : 1;
  const shouldMigrateBreakDefaults = savedSchemaVersion < CURRENT_SCHEMA_VERSION;
  const normalizedWorkSchedule = normalizeWorkSchedule(
    typeof value.workStartTime === "string" ? value.workStartTime : null,
    typeof value.workEndTime === "string" ? value.workEndTime : null,
    typeof value.breakStartTime === "string"
      ? value.breakStartTime
      : defaultSettings.breakStartTime,
    typeof value.breakEndTime === "string"
      ? value.breakEndTime
      : defaultSettings.breakEndTime,
    shouldMigrateBreakDefaults
      ? defaultSettings.breakEnabled
      : readBoolean(value, "breakEnabled", defaultSettings.breakEnabled),
    readWorkDays(value.workDays),
  );
  const hasLegacyWorkSchedule =
    normalizedWorkSchedule.workStartTime !== null &&
    normalizedWorkSchedule.workEndTime !== null;
  const effectiveWorkSchedule = hasLegacyWorkSchedule
    ? normalizedWorkSchedule
    : {
        workStartTime: defaultSettings.workStartTime,
        workEndTime: defaultSettings.workEndTime,
        breakEnabled: defaultSettings.breakEnabled,
        breakStartTime: defaultSettings.breakStartTime,
        breakEndTime: defaultSettings.breakEndTime,
        workDays: [...defaultSettings.workDays],
      };

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    alwaysOnTop: readBoolean(
      value,
      "alwaysOnTop",
      defaultSettings.alwaysOnTop,
    ),
    launchAtLogin: readBoolean(
      value,
      "launchAtLogin",
      defaultSettings.launchAtLogin,
    ),
    showDockIcon: readBoolean(
      value,
      "showDockIcon",
      defaultSettings.showDockIcon,
    ),
    timezone: readString(value, "timezone", defaultSettings.timezone),
    displayMode: readDisplayMode(value),
    workProgressEnabled: readBoolean(
      value,
      "workProgressEnabled",
      hasLegacyWorkSchedule ? true : defaultSettings.workProgressEnabled,
    ),
    workStartTime: effectiveWorkSchedule.workStartTime,
    workEndTime: effectiveWorkSchedule.workEndTime,
    breakEnabled:
      effectiveWorkSchedule.breakEnabled ?? defaultSettings.breakEnabled,
    breakStartTime:
      effectiveWorkSchedule.breakStartTime ?? defaultSettings.breakStartTime,
    breakEndTime: effectiveWorkSchedule.breakEndTime ?? defaultSettings.breakEndTime,
    workDays: effectiveWorkSchedule.workDays ?? [...defaultSettings.workDays],
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
