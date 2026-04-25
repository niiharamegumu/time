import type { WorkDay } from "./workSchedule";

export type ThemeMode = "system" | "light" | "dark";
export type DisplayMode = "standard" | "minimal" | "focus" | "ambient";

export type AppSettings = {
  schemaVersion: number;
  alwaysOnTop: boolean;
  launchAtLogin: boolean;
  showDockIcon: boolean;
  timezone: "Asia/Tokyo";
  displayMode: DisplayMode;
  workProgressEnabled: boolean;
  workStartTime: string | null;
  workEndTime: string | null;
  breakEnabled: boolean;
  breakStartTime: string | null;
  breakEndTime: string | null;
  workDays: WorkDay[];
  showSeconds: boolean;
  timeFormat: "24h";
  showWeekday: boolean;
  locale: "en-US";
  themeMode: ThemeMode;
  opacity: number;
};

export const defaultSettings: AppSettings = {
  schemaVersion: 2,
  alwaysOnTop: false,
  launchAtLogin: false,
  showDockIcon: false,
  timezone: "Asia/Tokyo",
  displayMode: "standard",
  workProgressEnabled: true,
  workStartTime: "09:00",
  workEndTime: "18:00",
  breakEnabled: true,
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  workDays: ["mon", "tue", "wed", "thu", "fri"],
  showSeconds: true,
  timeFormat: "24h",
  showWeekday: true,
  locale: "en-US",
  themeMode: "light",
  opacity: 1,
};
